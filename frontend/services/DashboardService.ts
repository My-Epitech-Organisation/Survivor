import { api } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';

// Define types for API responses
export interface TotalCountResponse {
  value: number;
}

export interface ProjectVisibilityItem {
  month: string;
  views: number;
}

export interface UsersConnectedResponse {
  rate: number;
}

export interface MonthlyStatsResponse {
  projectsLaunched: number;
  eventsCreated: number;
  activeSessions: number;
  newSignups: number;
  totalViews: number;
  avgViewsPerProject: number;
  avgSessionDuration: string;
}

export interface RecentAction {
  id: number;
  action: string;
  user: string;
  time: string;
  type: string;
}

export interface MostViewedProject {
  id: number;
  name: string;
  total_views: number;
}

// Dashboard service
export const DashboardService = {
  // Get total users count
  getTotalUsers: async (): Promise<TotalCountResponse> => {
    try {
      const { data } = await api.get<TotalCountResponse>(API_ENDPOINTS.TOTAL_USERS);
      return data || { value: 0 };
    } catch (error) {
      console.error('Error fetching total users:', error);
      return { value: 0 };
    }
  },

  // Get total startups count
  getTotalStartups: async (): Promise<TotalCountResponse> => {
    try {
      const { data } = await api.get<TotalCountResponse>(API_ENDPOINTS.TOTAL_STARTUPS);
      return data || { value: 0 };
    } catch (error) {
      console.error('Error fetching total startups:', error);
      return { value: 0 };
    }
  },

  // Get total events count
  getTotalEvents: async (): Promise<TotalCountResponse> => {
    try {
      const { data } = await api.get<TotalCountResponse>(API_ENDPOINTS.TOTAL_EVENTS);
      return data || { value: 0 };
    } catch (error) {
      console.error('Error fetching total events:', error);
      return { value: 0 };
    }
  },

  // Get new signups count
  getNewSignups: async (): Promise<TotalCountResponse> => {
    try {
      const { data } = await api.get<TotalCountResponse>(API_ENDPOINTS.NEW_SIGNUPS);
      return data || { value: 0 };
    } catch (error) {
      console.error('Error fetching new signups:', error);
      return { value: 0 };
    }
  },

  // Get project visibility data
  getProjectVisibility: async (): Promise<ProjectVisibilityItem[]> => {
    try {
      const { data } = await api.get<ProjectVisibilityItem[]>(API_ENDPOINTS.PROJECTS_VISIBILITY);
      return data || [];
    } catch (error) {
      console.error('Error fetching project visibility:', error);
      return [];
    }
  },

  // Get users connected ratio
  getUsersConnected: async (): Promise<UsersConnectedResponse> => {
    try {
      const { data } = await api.get<UsersConnectedResponse>(API_ENDPOINTS.USERS_CONNECTED);
      return data || { rate: 0 };
    } catch (error) {
      console.error('Error fetching users connected ratio:', error);
      return { rate: 0 };
    }
  },

  // Get monthly statistics
  getMonthlyStats: async (): Promise<MonthlyStatsResponse> => {
    try {
      const { data } = await api.get<MonthlyStatsResponse>(API_ENDPOINTS.MONTHLY_STATS);
      return data || {
        projectsLaunched: 0,
        eventsCreated: 0,
        activeSessions: 0,
        newSignups: 0,
        totalViews: 0,
        avgViewsPerProject: 0,
        avgSessionDuration: '0m 0s',
      };
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      return {
        projectsLaunched: 0,
        eventsCreated: 0,
        activeSessions: 0,
        newSignups: 0,
        totalViews: 0,
        avgViewsPerProject: 0,
        avgSessionDuration: '0m 0s',
      };
    }
  },

  // Get most viewed projects
  getMostViewedProjects: async (limit: number = 5): Promise<MostViewedProject[]> => {
    try {
      const { data } = await api.get<MostViewedProject[]>(`${API_ENDPOINTS.MOST_VIEWED_PROJECTS}?limit=${limit}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching most viewed projects:', error);
      return [];
    }
  },

  // Get recent actions (Note: this will use mock data as mentioned)
  getRecentActions: async (): Promise<RecentAction[]> => {
    try {
      const { data } = await api.get<RecentAction[]>(API_ENDPOINTS.RECENT_ACTIONS);
      return data || [];
    } catch (error) {
      console.error('Error fetching recent actions:', error);
      return [];
    }
  },

  // Fetch all dashboard data in parallel
  getAllDashboardData: async () => {
    try {
      const [
        totalUsers,
        totalStartups,
        totalEvents,
        newSignups,
        projectVisibility,
        usersConnected,
        monthlyStats,
        // recentActions will remain mocked
      ] = await Promise.all([
        DashboardService.getTotalUsers(),
        DashboardService.getTotalStartups(),
        DashboardService.getTotalEvents(),
        DashboardService.getNewSignups(),
        DashboardService.getProjectVisibility(),
        DashboardService.getUsersConnected(),
        DashboardService.getMonthlyStats(),
      ]);

      return {
        totalUsers,
        totalStartups,
        totalEvents,
        newSignups,
        projectVisibility,
        usersConnected,
        monthlyStats,
      };
    } catch (error) {
      console.error('Error fetching all dashboard data:', error);
      throw error;
    }
  },
};
