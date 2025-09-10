"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DriveFile } from '@/types/drive';
import { DriveService } from '@/services/DriveService';
import { Spinner } from '@/components/ui/spinner';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImagePreviewProps {
  file: DriveFile;
  onClose: () => void;
}

export function ImagePreview({ file, onClose }: ImagePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    const loadImageContent = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      
      try {
        const imageData = await DriveService.previewImageFile(file.id);
        setImageUrl(imageData.imageUrl);
      } catch (err: any) {
        console.error('Error loading image:', err);
        if (err.response?.status === 404) {
          setError('Image preview endpoint not found. Please make sure the backend API is properly configured.');
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load image. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadImageContent();
  }, [file.id]);

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-ellipsis overflow-hidden">{file.name}</h3>
        <div className="flex space-x-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4 mr-2" />
            Zoom In
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4 mr-2" />
            Zoom Out
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRotate}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Rotate
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
        <div className="flex justify-center items-center bg-muted/50 rounded-md overflow-hidden" style={{ minHeight: '60vh' }}>
          <img 
            src={imageUrl} 
            alt={file.name}
            className="max-w-full max-h-[60vh] object-contain transition-all duration-200"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
