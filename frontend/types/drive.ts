// Types for the Drive feature
export interface DriveFile {
  id: number;
  name: string;
  size: number;
  human_size: string;
  file_type: string;
  uploaded_at: string;
  last_modified: string;
  description: string | null;
  is_archived: boolean;
  download_url: string;
  uploaded_by_name: string;
  folder: number | null;
  startup: number;
}

export interface DriveFolder {
  id: number;
  name: string;
  parent: number | null;
  created_at: string;
  created_by: number;
  subfolders_count: number;
  files_count: number;
  startup: number;
  path: string;
  download_url: string;
}

export interface DriveShare {
  id: number;
  file: number | null;
  folder: number | null;
  shared_item_name: string;
  shared_item_type: 'file' | 'folder';
  shared_by: number;
  shared_by_name: string;
  shared_at: string;
  access_token: string;
  expires_at: string | null;
  is_active: boolean;
  is_expired: boolean;
}

export interface DriveActivity {
  id: number;
  user: number | null;
  user_name: string | null;
  file: number | null;
  folder: number | null;
  item_name: string | null;
  item_type: 'file' | 'folder' | null;
  action: string;
  timestamp: string;
  details: Record<string, unknown> | null;
  startup: number;
}

export interface FileUpload {
  file: File;
  folder?: number | null;
  description?: string;
}

export interface StorageStats {
  startup_id: number;
  startup_name: string;
  storage: {
    total_size: number;
    human_size: string;
    file_types: {
      [key: string]: {
        count: number;
        size: number;
      }
    }
  };
  counts: {
    total_files: number;
    active_files: number;
    archived_files: number;
    total_folders: number;
  };
  recent_activities: DriveActivity[];
}

// Request & Response interfaces
export interface DriveFilesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DriveFile[];
}

export interface DriveFoldersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DriveFolder[];
}

export interface DriveSharesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DriveShare[];
}

export interface DriveActivitiesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DriveActivity[];
}

// Filter types
export interface DriveFileFilters {
  startup?: number;
  folder?: number | 'null'; // 'null' string is used to get root files
  type?: string;
  archived?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface DriveFolderFilters {
  startup?: number;
  parent?: number | 'null'; // 'null' string is used to get root folders
  search?: string;
  page?: number;
  page_size?: number;
}

// File content types
export interface TextFileContent {
  content: string;
}

export interface TextFileUpdateRequest {
  content: string;
}
