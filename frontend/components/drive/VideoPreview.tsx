"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DriveFile } from '@/types/drive';
import { DriveService } from '@/services/DriveService';
import { Spinner } from '@/components/ui/spinner';
import { X, Volume2, VolumeX, Maximize, Pause, Play, Download, MoreVertical } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPreviewProps {
  file: DriveFile;
  onClose: () => void;
}

export function VideoPreview({ file, onClose }: VideoPreviewProps) {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadVideoContent = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      
      try {
        const videoData = await DriveService.previewVideoFile(file.id);
        setVideoUrl(videoData.videoUrl);
      } catch (err: any) {
        console.error('Error loading video:', err);
        if (err.response?.status === 404) {
          setError('Video preview endpoint not found. Please make sure the backend API is properly configured.');
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load video. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadVideoContent();
  }, [file.id]);

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = file.name;
      link.target = '_blank';
      link.click();
    }
  };

  const handlePictureInPicture = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.error('Picture-in-Picture failed:', error);
      }
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
              <DropdownMenuItem onClick={handleTogglePlay}>
                {isPlaying ? (
                  <><Pause className="h-4 w-4 mr-2" /> Pause</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Play</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleMute}>
                {isMuted ? (
                  <><VolumeX className="h-4 w-4 mr-2" /> Unmute</>
                ) : (
                  <><Volume2 className="h-4 w-4 mr-2" /> Mute</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFullscreen}>
                <Maximize className="h-4 w-4 mr-2" />
                Fullscreen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePictureInPicture}>
                <Maximize className="h-4 w-4 mr-2" />
                Picture-in-Picture
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTogglePlay}
            >
              {isPlaying ? (
                <><Pause className="h-4 w-4 mr-2" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Play</>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToggleMute}
            >
              {isMuted ? (
                <><VolumeX className="h-4 w-4 mr-2" /> Unmute</>
              ) : (
                <><Volume2 className="h-4 w-4 mr-2" /> Mute</>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFullscreen}
            >
              <Maximize className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
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
            maxHeight: isMobile ? '50vh' : '70vh' 
          }}
        >
          <div className="w-full h-full flex justify-center items-center">
            <video 
              ref={videoRef}
              src={videoUrl} 
              className="max-w-full w-full h-auto object-contain"
              style={{
                maxHeight: isMobile ? '40vh' : '60vh',
              }}
              controls={isMobile} // Show native controls on mobile for better UX
              controlsList="nodownload"
              preload="metadata"
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              playsInline // Better mobile experience
            />
          </div>
        </div>
      )}
    </div>
  );
}
