"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DriveFile } from '@/types/drive';
import { DriveService } from '@/services/DriveService';
import { Spinner } from '@/components/ui/spinner';
import { Edit, MoreVertical } from 'lucide-react';
import { isTextFile, isImageFile, isVideoFile, isPdfFile } from '@/lib/fileUtils';
import { ImagePreview } from './ImagePreview';
import { VideoPreview } from './VideoPreview';
import { PdfPreview } from './PdfPreview';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilePreviewProps {
  file: DriveFile;
  onClose: () => void;
  onEditRequest: (file: DriveFile) => void;
}

export function FilePreview({ file, onClose, onEditRequest }: FilePreviewProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadFileContent = async () => {
      if (!isTextFile(file)) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null); // Reset error state
      
      try {
        const fileContent = await DriveService.previewTextFile(file.id);
        setContent(fileContent);
      } catch (err: unknown) {
        console.error('Error loading file content:', err);
        // Vérifier si l'erreur est de type Error (type standard)
        if (err instanceof Error) {
          setError(err.message);
        }
        // Vérifier si l'erreur a une structure de réponse HTTP (comme axios)
        else if (typeof err === 'object' && err !== null && 'response' in err) {
          const axiosError = err as { response?: { status?: number, data?: { error?: string } } };
          if (axiosError.response?.status === 404) {
            setError('File preview endpoint not found. Please make sure the backend API is properly configured.');
          } else if (axiosError.response?.data?.error) {
            setError(axiosError.response.data.error);
          } else {
            setError('Failed to load file content. Please try again later.');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [file]);

  // Render image preview if the file is an image
  if (isImageFile(file)) {
    return <ImagePreview file={file} _onClose={onClose} />;
  }

  // Render video preview if the file is a video
  if (isVideoFile(file)) {
    return <VideoPreview file={file} _onClose={onClose} />;
  }

  // Render PDF preview if the file is a PDF
  if (isPdfFile(file)) {
    return <PdfPreview file={file} _onClose={onClose} />;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-medium text-ellipsis overflow-hidden max-w-full sm:max-w-[70%]">{file.name}</h3>
        
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditRequest(file)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex space-x-2 shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEditRequest(file)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
      ) : (
        <div className="bg-muted rounded-md overflow-hidden">
          <div className="overflow-x-auto w-full">
            <pre className="p-4 text-sm whitespace-pre-wrap max-w-full max-h-[50vh] sm:max-h-[60vh] overflow-y-auto break-words">
              {content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
