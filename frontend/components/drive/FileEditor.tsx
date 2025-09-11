"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DriveFile } from '@/types/drive';
import { DriveService } from '@/services/DriveService';
import { Spinner } from '@/components/ui/spinner';
import { Save, Eye, MoreVertical } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { markdown } from '@codemirror/lang-markdown';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { lineNumbers } from '@codemirror/view';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileEditorProps {
  file: DriveFile;
  _onClose: () => void;
  onSave: () => void;
  onPreviewRequest: (file: DriveFile) => void;
}

export function FileEditor({ file, _onClose, onSave, onPreviewRequest }: FileEditorProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const getLanguage = () => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return [javascript({ jsx: true })];
      case 'json':
        return [json()];
      case 'py':
        return [python()];
      case 'html':
      case 'htm':
        return [html()];
      case 'css':
        return [css()];
      case 'md':
      case 'markdown':
        return [markdown()];
      case 'sql':
        return [sql()];
      default:
        return [];
    }
  };

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
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2 max-w-full">
        <h3 className="text-lg font-medium text-ellipsis overflow-hidden max-w-[50%] sm:max-w-[50%]">Editing: {file.name}</h3>
        
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

            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-wrap justify-end gap-1 shrink-0 max-w-[50%]">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPreviewRequest(file)}
              className="text-xs px-2 py-1 h-auto"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button 
              className="bg-jeb-primary text-app-white hover:bg-jeb-hover transition-colors text-xs px-2 py-1 h-auto"
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Spinner className="h-3 w-3 mr-1" /> : <Save className="h-3 w-3 mr-1" />}
              Save
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
        <div className="relative w-full h-full max-w-full overflow-hidden">
          <CodeMirror
            value={content}
            onChange={(value) => setContent(value)}
            height={isMobile ? "40vh" : "60vh"}
            width="100%"
            extensions={[
              lineNumbers(),
              ...getLanguage(),
              oneDark
            ]}
            theme="dark"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              autocompletion: true,
              foldGutter: true,
              tabSize: 2,
              indentOnInput: true,
              syntaxHighlighting: true,
            }}
            className="border rounded-md overflow-hidden max-w-full"
            style={{
              maxWidth: '100%',
              fontSize: isMobile ? '14px' : '16px',
            }}
          />
        </div>
      )}
    </div>
  );
}

{ }
<style jsx global>{`
  .cm-editor {
    max-width: 100% !important;
    overflow-x: auto !important;
    word-wrap: break-word;
    box-sizing: border-box !important;
  }
  
  .cm-scroller {
    overflow: auto !important;
    max-width: 100% !important;
  }
  
  .cm-content {
    word-wrap: break-word;
    white-space: pre-wrap;
    max-width: 100% !important;
  }
  
  .cm-gutters {
    min-height: 100% !important;
  }

  /* Assurer que l'éditeur ne dépasse pas du conteneur */
  .cm-editor .cm-scroller, .cm-editor .cm-content {
    max-width: calc(100vw - 40px) !important;
  }
  
  @media (max-width: 640px) {
    .cm-editor {
      font-size: 14px;
    }
    
    .cm-gutters {
      padding-right: 8px !important;
    }
  }
  
  /* Corrections pour le Dialog */
  .dialog-content {
    max-width: 100% !important;
    overflow: hidden !important;
  }
`}</style>
