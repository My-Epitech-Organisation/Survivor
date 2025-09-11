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

/**
 * Determines if a file is an image file that can be previewed
 * 
 * @param file The drive file to check
 * @returns true if the file is an image file, false otherwise
 */
export const isImageFile = (file: DriveFile): boolean => {
  // List of MIME types for image files
  const imageFileTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'image/bmp', 'image/tiff', 'image/x-icon'
  ];
  
  // Check if the file type is in our list
  if (imageFileTypes.includes(file.file_type)) {
    return true;
  }
  
  // List of extensions for image files
  const imageExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'ico'
  ];
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  return extension ? imageExtensions.includes(extension) : false;
};

/**
 * Determines if a file is a video file that can be previewed
 * 
 * @param file The drive file to check
 * @returns true if the file is a video file, false otherwise
 */
export const isVideoFile = (file: DriveFile): boolean => {
  // List of MIME types for video files
  const videoFileTypes = [
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
    'video/x-matroska', 'video/3gpp', 'video/x-flv', 'video/mpeg'
  ];
  
  // Check if the file type is in our list
  if (videoFileTypes.includes(file.file_type)) {
    return true;
  }
  
  // List of extensions for video files
  const videoExtensions = [
    'mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', '3gp', 'flv', 'mpeg', 'mpg', 'm4v'
  ];
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  return extension ? videoExtensions.includes(extension) : false;
};

/**
 * Determines if a file is a PDF file that can be previewed
 * 
 * @param file The drive file to check
 * @returns true if the file is a PDF file, false otherwise
 */
export const isPdfFile = (file: DriveFile): boolean => {
  // List of MIME types for PDF files
  const pdfFileTypes = [
    'application/pdf'
  ];
  
  // Check if the file type is in our list
  if (pdfFileTypes.includes(file.file_type)) {
    return true;
  }
  
  // List of extensions for PDF files
  const pdfExtensions = [
    'pdf'
  ];
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  return extension ? pdfExtensions.includes(extension) : false;
};
