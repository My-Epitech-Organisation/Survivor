"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  refreshUserInfo: () => Promise<User | null>;
}

// Nombre maximum de tentatives de récupération des infos de startup
const MAX_STARTUP_INFO_RETRIES = 3;
// Délai entre les tentatives (en ms)
const RETRY_DELAY = 2000;
// Clé de stockage local pour les données utilisateur enrichies
const USER_STORAGE_KEY = 'userDataEnriched';
// Durée de validité du cache (en ms) - 1 heure
const CACHE_VALIDITY_PERIOD = 60 * 60 * 1000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startupInfoRetries, setStartupInfoRetries] = useState(0);

  /**
   * Tente de récupérer les informations de startup pour un utilisateur fondateur
   * @param currentUser L'utilisateur actuel
   * @param retryCount Nombre de tentatives déjà effectuées
   * @returns L'utilisateur enrichi avec les informations de startup ou l'utilisateur original
   */
  const getUserStartupInfo = async (
    currentUser: User,
    retryCount = 0
  ): Promise<User> => {
    // Si l'utilisateur n'est pas un fondateur ou a déjà un startupId, on retourne l'utilisateur tel quel
    if (currentUser.role !== "founder" || currentUser.startupId) {
      console.log("getUserStartupInfo: User already has startupId or is not a founder", currentUser);
      return currentUser;
    }

    try {
      // Si l'utilisateur est un fondateur mais n'a pas de founderId, essayer de récupérer ses données complètes
      if (!currentUser.founderId) {
        console.log("getUserStartupInfo: User is a founder but has no founderId, fetching complete user data");

        // Tenter de récupérer les données utilisateur complètes qui pourraient contenir le founderId
        const userResponse = await api.get<User>({
          endpoint: "/user"
        });

        if (userResponse.data && userResponse.data.founderId) {
          console.log("getUserStartupInfo: Got founderId from user endpoint", userResponse.data.founderId);
          currentUser = {
            ...currentUser,
            founderId: userResponse.data.founderId
          };
        } else {
          console.log("getUserStartupInfo: Still no founderId after fetching user data");
        }
      }

      // Si nous avons un founderId, essayer de récupérer les informations de startup
      if (currentUser.founderId) {
        console.log(`getUserStartupInfo: Attempting to fetch startup info (attempt ${retryCount + 1}/${MAX_STARTUP_INFO_RETRIES})`);

        const response = await api.get<{ FounderStartupID: number, FounderName: string }>({
          endpoint: `/founders/${currentUser.founderId}/`
        });

        if (response.data && response.data.FounderStartupID) {
          const enrichedUser = {
            ...currentUser,
            startupId: response.data.FounderStartupID
          };

          // Stockage des données enrichies avec un timestamp
          const storageData = {
            user: enrichedUser,
            timestamp: Date.now()
          };
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storageData));

          console.log("getUserStartupInfo: Successfully retrieved startup info", enrichedUser);
          return enrichedUser;
        }
      } else {
        console.log("getUserStartupInfo: User is a founder but has no founderId");
      }

      throw new Error("Invalid response format or missing founderId");
    } catch (error) {
      console.error("getUserStartupInfo: Error fetching startup info", error);

      // Stratégie de retry si le nombre maximum de tentatives n'est pas atteint
      if (retryCount < MAX_STARTUP_INFO_RETRIES - 1) {
        console.log(`getUserStartupInfo: Retrying in ${RETRY_DELAY}ms...`);
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return getUserStartupInfo(currentUser, retryCount + 1);
      }

      // Fallback: utiliser un ID par défaut pour les fondateurs
      console.warn("getUserStartupInfo: Maximum retries reached, using fallback startupId (1)");

      // Si l'utilisateur a un founderId mais que nous n'avons pas pu récupérer le startupId,
      // on utilise le founderId comme startupId par défaut
      const fallbackId = currentUser.founderId || 1;

      const fallbackUser = {
        ...currentUser,
        startupId: fallbackId
      };

      // Stockage des données avec fallback
      const storageData = {
        user: fallbackUser,
        timestamp: Date.now(),
        isFallback: true
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storageData));

      return fallbackUser;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          // Vérifier si des données utilisateur enrichies sont en cache
          const cachedDataStr = localStorage.getItem(USER_STORAGE_KEY);
          if (cachedDataStr) {
            try {
              const cachedData = JSON.parse(cachedDataStr);
              const now = Date.now();

              // Vérifier si les données en cache sont encore valides
              if (cachedData.timestamp &&
                  (now - cachedData.timestamp < CACHE_VALIDITY_PERIOD) &&
                  cachedData.user) {
                console.log('Using cached user data', cachedData.user);
                setUser(cachedData.user);
                setIsLoading(false);

                // Même avec des données en cache valides, si c'est un fallback,
                // essayer de rafraîchir les données en arrière-plan
                if (cachedData.isFallback) {
                  console.log('Cached data is fallback, trying to refresh in background');
                  refreshUserInfo().catch(e => console.warn('Background refresh failed:', e));
                }
                return;
              } else {
                console.log('Cached user data expired, fetching fresh data');
              }
            } catch (e) {
              console.error('Error parsing cached user data', e);
              localStorage.removeItem(USER_STORAGE_KEY);
            }
          }

          // Récupérer les données utilisateur depuis l'API
          const resp = await api.get<User>({endpoint:"/user"});
          if (!resp.data) {
            throw new Error('Invalid user data received');
          }

          // Si l'utilisateur est un fondateur et n'a pas de startupId, enrichir les données
          if (resp.data.role === 'founder' && !resp.data.startupId) {
            console.log('User is a founder without startupId, enriching data');
            // Enrichir les données utilisateur avec les informations de startup
            const enrichedUser = await getUserStartupInfo(resp.data);
            setUser(enrichedUser);
          } else {
            // Sinon, utiliser les données telles quelles
            setUser(resp.data);
          }
        } catch (error) {
          console.error("Authentication error:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;

    // Si les données utilisateur contiennent déjà un startupId, les utiliser directement
    if (userData.startupId) {
      console.log("login: User already has startupId", userData);
      setUser(userData);
      return;
    }

    // Pour les fondateurs, essayer de récupérer les informations de startup
    if (userData.role === 'founder') {
      try {
        // Si l'utilisateur est un fondateur mais n'a pas de founderId, essayer de récupérer ses données complètes
        if (!userData.founderId) {
          console.log("login: User is a founder but has no founderId, fetching complete user data first");
          // Récupérer d'abord les données utilisateur complètes qui pourraient contenir le founderId
          const userResponse = await api.get<User>({
            endpoint: "/user"
          });

          if (userResponse.data && userResponse.data.founderId) {
            console.log("login: Got founderId from user endpoint", userResponse.data.founderId);
            userData = {
              ...userData,
              founderId: userResponse.data.founderId
            };
          }
        }

        // Enrichir les données utilisateur
        const enrichedUser = await getUserStartupInfo(userData);
        setUser(enrichedUser);
      } catch (error) {
        console.error('Error enriching user data during login:', error);
        setUser(userData);
      }
    } else {
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem(USER_STORAGE_KEY);
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
  };

  const getToken = () => {
    if (typeof window !== "undefined") {
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];
      return cookieValue || null;
    }
    return null;
  };

  /**
   * Rafraîchit les informations utilisateur, y compris les informations de startup
   * Utile pour forcer un rechargement des données utilisateur après l'authentification
   */
  const refreshUserInfo = async (): Promise<User | null> => {
    const token = getToken();
    if (!token) {
      console.log('refreshUserInfo: No token found');
      return null;
    }

    setIsLoading(true);
    try {
      // Récupérer les informations utilisateur depuis l'API
      const response = await api.get<User>({endpoint:"/user"});

      if (!response.data) {
        throw new Error('Invalid user data');
      }

      // Si l'utilisateur est un fondateur et n'a pas de startupId, enrichir les données
      let enrichedUser = response.data;
      if (response.data.role === 'founder' && !response.data.startupId) {
        // Récupérer les informations de startup si nécessaire
        enrichedUser = await getUserStartupInfo(response.data);
      }

      setUser(enrichedUser);
      console.log('refreshUserInfo: User info refreshed successfully', enrichedUser);
      return enrichedUser;
    } catch (error) {
      console.error('refreshUserInfo: Failed to refresh user info', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getToken,
    refreshUserInfo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
