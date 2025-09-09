import api from '../lib/api';
import {
  DriveFile, DriveFolder, DriveShare, DriveActivity, StorageStats,
  DriveFilesResponse, DriveFoldersResponse, DriveSharesResponse, DriveActivitiesResponse,
  DriveFileFilters, DriveFolderFilters, FileUpload
} from '../types/drive';

const DRIVE_API = {
  FILES: '/drive/files/',
  FOLDERS: '/drive/folders/',
  SHARES: '/drive/shares/',
  ACTIVITIES: '/drive/activities/',
  STATS: '/drive/stats/',
};

export const DriveService = {
  getFiles: async (filters?: DriveFileFilters): Promise<DriveFilesResponse> => {
    if (!filters?.startup) {
      console.warn('DriveService.getFiles: No startup ID provided');
      return { count: 0, next: null, previous: null, results: [] };
    }

    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.startup) queryParams.append('startup', filters.startup.toString());
      if (filters.folder) queryParams.append('folder', filters.folder.toString());
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.archived !== undefined) queryParams.append('archived', filters.archived.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.page_size) queryParams.append('page_size', filters.page_size.toString());
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';

    try {
      const response = await api.get<DriveFile[] | DriveFilesResponse>({
        endpoint: `${DRIVE_API.FILES}${query}`
      });

      if (Array.isArray(response.data)) {
        console.log('Files API returned direct array:', response.data);
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      }

      return response.data || { count: 0, next: null, previous: null, results: [] };
    } catch (error) {
      console.error('Error fetching files:', error);
      return { count: 0, next: null, previous: null, results: [] };
    }
  },

  getFile: async (fileId: number): Promise<DriveFile | null> => {
    const response = await api.get<DriveFile>({
      endpoint: `${DRIVE_API.FILES}${fileId}/`
    });
    return response.data;
  },

  uploadFile: async (startupId: number, fileData: FileUpload): Promise<DriveFile> => {
    const formData = new FormData();
    formData.append('file', fileData.file);

    if (fileData.folder !== undefined) {
      formData.append('folder', fileData.folder ? fileData.folder.toString() : '');
    }

    if (fileData.description) {
      formData.append('description', fileData.description);
    }

    return api.postFormData<DriveFile>(`${DRIVE_API.FILES}upload/?startup=${startupId}`, formData);
  },

  updateFile: async (fileId: number, data: Partial<DriveFile>): Promise<DriveFile | null> => {
    const response = await api.patch<DriveFile>(`${DRIVE_API.FILES}${fileId}/`, data);
    return response.data;
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`${DRIVE_API.FILES}${fileId}/`);
  },

  archiveFile: async (fileId: number): Promise<void> => {
    await api.post(`${DRIVE_API.FILES}${fileId}/archive/`);
  },

  restoreFile: async (fileId: number): Promise<void> => {
    await api.post(`${DRIVE_API.FILES}${fileId}/restore/`);
  },

  getDownloadUrl: (fileId: number): string => {
    const token = localStorage.getItem('authToken');
    return `/api${DRIVE_API.FILES}${fileId}/download/?token=${token}`;
  },

  getFolders: async (filters?: DriveFolderFilters): Promise<DriveFoldersResponse> => {
    if (!filters?.startup) {
      console.warn('DriveService.getFolders: No startup ID provided');
      return { count: 0, next: null, previous: null, results: [] };
    }

    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.startup) queryParams.append('startup', filters.startup.toString());
      if (filters.parent) queryParams.append('parent', filters.parent.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.page_size) queryParams.append('page_size', filters.page_size.toString());
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';

    try {
      const response = await api.get<DriveFolder[] | DriveFoldersResponse>({
        endpoint: `${DRIVE_API.FOLDERS}${query}`
      });

      if (Array.isArray(response.data)) {
        console.log('Folders API returned direct array:', response.data);
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      }

      return response.data || { count: 0, next: null, previous: null, results: [] };
    } catch (error) {
      console.error('Error fetching folders:', error);
      return { count: 0, next: null, previous: null, results: [] };
    }
  },

  getFolder: async (folderId: number): Promise<DriveFolder | null> => {
    const response = await api.get<DriveFolder>({
      endpoint: `${DRIVE_API.FOLDERS}${folderId}/`
    });
    return response.data;
  },

  createFolder: async (startupId: number, name: string, parentId?: number): Promise<DriveFolder | null> => {
    const response = await api.post<DriveFolder>(DRIVE_API.FOLDERS, {
      startup: startupId,
      name,
      parent: parentId || null
    });
    return response.data;
  },

  updateFolder: async (folderId: number, data: Partial<DriveFolder>): Promise<DriveFolder | null> => {
    const response = await api.patch<DriveFolder>(`${DRIVE_API.FOLDERS}${folderId}/`, data);
    return response.data;
  },

  deleteFolder: async (folderId: number): Promise<void> => {
    await api.delete(`${DRIVE_API.FOLDERS}${folderId}/`);
  },

  getStorageStats: async (startupId: number): Promise<StorageStats | null> => {
    const response = await api.get<StorageStats>({
      endpoint: `${DRIVE_API.STATS}${startupId}/`
    });
    return response.data;
  },

  getActivities: async (startupId: number, page: number = 1, pageSize: number = 10): Promise<DriveActivitiesResponse> => {
    const query = `?startup=${startupId}&page=${page}&page_size=${pageSize}`;
    const response = await api.get<DriveActivitiesResponse>({
      endpoint: `${DRIVE_API.ACTIVITIES}${query}`
    });
    return response.data || { count: 0, next: null, previous: null, results: [] };
  },

  createShare: async (data: { file?: number, folder?: number, expires_at?: string }): Promise<DriveShare | null> => {
    const response = await api.post<DriveShare>(DRIVE_API.SHARES, data);
    return response.data;
  },

  getShares: async (fileId?: number, folderId?: number): Promise<DriveSharesResponse> => {
    const queryParams = new URLSearchParams();

    if (fileId) queryParams.append('file', fileId.toString());
    if (folderId) queryParams.append('folder', folderId.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await api.get<DriveSharesResponse>({
      endpoint: `${DRIVE_API.SHARES}${query}`
    });
    return response.data || { count: 0, next: null, previous: null, results: [] };
  },

  deactivateShare: async (shareId: number): Promise<DriveShare | null> => {
    const response = await api.patch<DriveShare>(`${DRIVE_API.SHARES}${shareId}/`, { is_active: false });
    return response.data;
  },

  deleteShare: async (shareId: number): Promise<void> => {
    await api.delete(`${DRIVE_API.SHARES}${shareId}/`);
  }
};
