"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DriveFile } from '@/types/drive';
import { DriveService } from '@/services/DriveService';
import { Spinner } from '@/components/ui/spinner';
import { Save, X, Eye, MoreVertical } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileEditorProps {
  file: DriveFile;
  onClose: () => void;
  onSave: () => void;
  onPreviewRequest: (file: DriveFile) => void;
}

export function FileEditor({ file, onClose, onSave, onPreviewRequest }: FileEditorProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadFileContent = async () => {
      setIsLoading(true);
      try {
        const fileContent = await DriveService.previewTextFile(file.id);
        setContent(fileContent);
      } catch (err) {
        setError('Failed to load file content');
        console.error('Error loading file content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [file.id]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await DriveService.updateTextFileContent(file.id, content);
      onSave();
    } catch (err) {
      setError('Failed to save file content');
      console.error('Error saving file content:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-medium text-ellipsis overflow-hidden max-w-full sm:max-w-[60%]">Editing: {file.name}</h3>
        
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreviewRequest(file)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save
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
              onClick={() => onPreviewRequest(file)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              className="bg-jeb-primary text-app-white hover:bg-jeb-hover transition-colors"
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
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
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      ) : (
        <div className="relative w-full">
          <Textarea
            className="min-h-[40vh] sm:min-h-[60vh] font-mono text-sm w-full resize-y"
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            style={{ 
              maxWidth: '100%', 
              overflowX: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, monospace',
              lineHeight: '1.5',
              tabSize: '2'
            }}
            spellCheck={false}
            data-gramm="false"
          />
        </div>
      )}
    </div>
  );
}
