"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DriveFile } from '@/types/drive';
import { DriveService } from '@/services/DriveService';
import { Spinner } from '@/components/ui/spinner';
import { Edit, X } from 'lucide-react';

interface FilePreviewProps {
  file: DriveFile;
  onClose: () => void;
  onEditRequest: (file: DriveFile) => void;
}

export function FilePreview({ file, onClose, onEditRequest }: FilePreviewProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFileContent = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      
      try {
        const fileContent = await DriveService.previewTextFile(file.id);
        setContent(fileContent);
      } catch (err: any) {
        console.error('Error loading file content:', err);
        if (err.response?.status === 404) {
          setError('File preview endpoint not found. Please make sure the backend API is properly configured.');
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load file content. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [file.id]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-ellipsis overflow-hidden">{file.name}</h3>
        <div className="flex space-x-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEditRequest(file)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
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
          <div className="overflow-x-auto">
            <pre className="p-4 min-w-fit max-h-[60vh] text-sm whitespace-pre">
              {content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
