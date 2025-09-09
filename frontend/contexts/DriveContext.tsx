"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // Function to fetch folder contents
  const fetchFolderContents = async (folderId: number | null) => {
    if (!startupId) {
      setError("No startup selected");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch folders in current directory
      const folderFilters: DriveFolderFilters = {
        startup: startupId,
        parent: folderId === null ? 'null' : folderId
      };
      const foldersResponse = await DriveService.getFolders(folderFilters);
      setFolders(foldersResponse.results);

      // Fetch files in current directory
      const fileFilters: DriveFileFilters = {
        startup: startupId,
        folder: folderId === null ? 'null' : folderId
      };
      const filesResponse = await DriveService.getFiles(fileFilters);
      setFiles(filesResponse.results);

      // If we're in a subfolder, fetch its details
      if (folderId !== null) {
        const folderDetails = await DriveService.getFolder(folderId);
        setCurrentFolder(folderDetails);
        
        if (folderDetails) {
          // Build breadcrumbs
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
        // Root folder
        setCurrentFolder(null);
        setBreadcrumbs([]);
      }
    } catch (err) {
      setError("Failed to fetch drive contents");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to a folder
  const navigateToFolder = async (folderId: number | null) => {
    await fetchFolderContents(folderId);
  };

  // Create a new folder
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

  // Upload a file
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

  // Delete a file
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

  // Delete a folder
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

  // Refresh current folder
  const refreshCurrentFolder = async () => {
    await fetchFolderContents(currentFolder?.id || null);
  };

  // Effect to reload when startupId changes
  useEffect(() => {
    if (startupId) {
      navigateToFolder(null);
    }
  }, [startupId]);

  // Add debug logging to monitor files array
  useEffect(() => {
    console.log('DriveContext - Current files:', files);
  }, [files]);

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
