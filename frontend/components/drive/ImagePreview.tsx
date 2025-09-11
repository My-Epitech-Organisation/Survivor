"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DriveFile } from '@/types/drive';
import { DriveService } from '@/services/DriveService';
import { Spinner } from '@/components/ui/spinner';
import { ZoomIn, ZoomOut, RotateCw, Download, MoreVertical } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImagePreviewProps {
  file: DriveFile;
  _onClose: () => void;
}

export function ImagePreview({ file, _onClose }: ImagePreviewProps) {
  const isMobile = useIsMobile(); // Call the hook at the top level
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
      } catch (err: unknown) {
        console.error('Error loading image:', err);
        if (err instanceof Error) {
          setError(err.message);
        }
        else if (typeof err === 'object' && err !== null && 'response' in err) {
          const axiosError = err as { response?: { status?: number, data?: { error?: string } } };
          if (axiosError.response?.status === 404) {
            setError('Image preview endpoint not found. Please make sure the backend API is properly configured.');
          } else if (axiosError.response?.data?.error) {
            setError(axiosError.response.data.error);
          } else {
            setError('Failed to load image. Please try again later.');
          }
        } else {
          setError('An unexpected error occurred');
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

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = file.name;
      link.target = '_blank';
      link.click();
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-medium text-ellipsis overflow-hidden max-w-full sm:max-w-[60%]">{file.name}</h3>

        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom In
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4 mr-2" />
                Zoom Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRotate}>
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
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
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
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
        <div
          className="flex justify-center items-center bg-muted/50 rounded-md overflow-hidden"
          style={{
            minHeight: isMobile ? '40vh' : '60vh',
            touchAction: 'manipulation'
          }}
        >
          <div
            className="relative overflow-hidden w-full h-full flex justify-center items-center"
            style={{ contain: 'content' }}
          >
            <img
              src={imageUrl}
              alt={file.name}
              className="max-w-full object-contain transition-all duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                maxHeight: isMobile ? '40vh' : '60vh',
                height: 'auto',
                width: 'auto'
              }}
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}
