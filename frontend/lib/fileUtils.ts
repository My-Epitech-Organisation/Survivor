/**
 * Utility functions for working with Drive files
 */

import { DriveFile } from '@/types/drive';

/**
 * Determines if a file is a text file that can be previewed and edited
 * 
 * @param file The drive file to check
 * @returns true if the file is a text file, false otherwise
 */
export const isTextFile = (file: DriveFile): boolean => {
  // List of MIME types for text files
  const textFileTypes = [
    'text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json', 
    'text/markdown', 'text/csv', 'text/xml', 'application/xml', 'text/x-python',
    'text/x-typescript', 'text/x-javascript', 'application/x-yaml', 'text/yaml',
    'application/yaml', 'text/x-properties', 'application/x-properties',
    'text/x-ini', 'text/x-config', 'application/x-toml', 'text/x-toml',
    'application/x-shellscript', 'text/x-sh'
  ];
  
  // Check if the file type is in our list
  if (textFileTypes.includes(file.file_type)) {
    return true;
  }
  
  // List of extensions for text files
  const textExtensions = [
    'txt', 'md', 'json', 'yaml', 'yml', 'xml', 'html', 'css', 'js', 
    'ts', 'py', 'sh', 'conf', 'cfg', 'ini', 'properties', 'env', 'toml', 'csv'
  ];
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  return extension ? textExtensions.includes(extension) : false;
};
