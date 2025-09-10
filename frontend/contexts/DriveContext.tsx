"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { DriveFile, DriveFolder, DriveFileFilters, DriveFolderFilters } from '@/types/drive';
import { DriveService } from '@/services/DriveService';

interface DriveContextType {
  currentFolder: DriveFolder | null;
  folders: DriveFolder[];
  files: DriveFile[];
  breadcrumbs: DriveFolder[];
  isLoading: boolean;
  error: string | null;
  navigateToFolder: (folderId: number | null) => Promise<void>;
  createFolder: (startupId: number, name: string, parentId: number | null) => Promise<void>;
  uploadFile: (startupId: number, file: File, folderId: number | null, description?: string) => Promise<void>;
  deleteFile: (fileId: number) => Promise<void>;
  deleteFolder: (folderId: number) => Promise<void>;
  downloadFolder: (folderId: number, folderName: string) => Promise<void>;
  refreshCurrentFolder: () => Promise<void>;
  startupId: number | null;
  setStartupId: (id: number) => void;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export const DriveProvider: React.FC<{ children: ReactNode, initialStartupId?: number }> = ({ children, initialStartupId }) => {
  const [startupId, setStartupId] = useState<number | null>(initialStartupId || null);
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | null>(null);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<DriveFolder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFolderContents = useCallback(async (folderId: number | null) => {
    if (!startupId) {
      setError("No startup selected");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const folderFilters: DriveFolderFilters = {
        startup: startupId,
        parent: folderId === null ? 'null' : folderId
      };
      const foldersResponse = await DriveService.getFolders(folderFilters);
      setFolders(foldersResponse.results);

      const fileFilters: DriveFileFilters = {
        startup: startupId,
        folder: folderId === null ? 'null' : folderId
      };
      const filesResponse = await DriveService.getFiles(fileFilters);
      setFiles(filesResponse.results);

      if (folderId !== null) {
        const folderDetails = await DriveService.getFolder(folderId);
        setCurrentFolder(folderDetails);

        if (folderDetails) {
          const buildBreadcrumbs = async (folder: DriveFolder) => {
            const crumbs: DriveFolder[] = [folder];
            let currentParent = folder.parent;

            while (currentParent) {
              const parentFolder = await DriveService.getFolder(currentParent);
              if (parentFolder) {
                crumbs.unshift(parentFolder);
                currentParent = parentFolder.parent;
              } else {
                break;
              }
            }

            return crumbs;
          };

          const crumbs = await buildBreadcrumbs(folderDetails);
          setBreadcrumbs(crumbs);
        } else {
          setBreadcrumbs([]);
        }
      } else {
        setCurrentFolder(null);
        setBreadcrumbs([]);
      }
    } catch (err) {
      setError("Failed to fetch drive contents");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [startupId, setCurrentFolder, setFolders, setFiles, setBreadcrumbs, setIsLoading, setError]);

  const navigateToFolder = async (folderId: number | null) => {
    await fetchFolderContents(folderId);
  };

  const createFolder = async (startupId: number, name: string, parentId: number | null) => {
    setIsLoading(true);
    setError(null);
    try {
      await DriveService.createFolder(startupId, name, parentId || undefined);
      await fetchFolderContents(parentId);
    } catch (err) {
      setError("Failed to create folder");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (startupId: number, file: File, folderId: number | null, description?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await DriveService.uploadFile(startupId, {
        file,
        folder: folderId,
        description
      });
      await fetchFolderContents(folderId);
    } catch (err) {
      setError("Failed to upload file");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = async (fileId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await DriveService.deleteFile(fileId);
      await fetchFolderContents(currentFolder?.id || null);
    } catch (err) {
      setError("Failed to delete file");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFolder = async (folderId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await DriveService.deleteFolder(folderId);
      await fetchFolderContents(currentFolder?.id || null);
    } catch (err) {
      setError("Failed to delete folder");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFolder = async (folderId: number, folderName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await DriveService.downloadFolder(folderId, folderName);
    } catch (err) {
      setError("Failed to download folder");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCurrentFolder = useCallback(async () => {
    await fetchFolderContents(currentFolder?.id || null);
  }, [fetchFolderContents, currentFolder]);

  useEffect(() => {
    if (startupId) {
      console.log('DriveContext - StartupId changed, fetching root folder:', startupId);
      const loadRootFolder = async () => {
        await fetchFolderContents(null);
      };
      loadRootFolder();
    }
  }, [startupId, fetchFolderContents]);

  /*
  useEffect(() => {
    console.log('DriveContext - Current files:', files);
    console.log('DriveContext - Current startupId:', startupId);
  }, [files, startupId]);
  */

  const value = {
    currentFolder,
    folders,
    files,
    breadcrumbs,
    isLoading,
    error,
    navigateToFolder,
    createFolder,
    uploadFile,
    deleteFile,
    deleteFolder,
    downloadFolder,
    refreshCurrentFolder,
    startupId,
    setStartupId
  };

  return <DriveContext.Provider value={value}>{children}</DriveContext.Provider>;
};

export const useDrive = (): DriveContextType => {
  const context = useContext(DriveContext);
  if (context === undefined) {
    throw new Error('useDrive must be used within a DriveProvider');
  }
  return context;
};
