"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DriveFile } from '@/types/drive';
import { DriveService } from '@/services/DriveService';
import { Spinner } from '@/components/ui/spinner';
import { Edit, Play, MoreVertical, RotateCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PythonFilePreviewProps {
  file: DriveFile;
  content: string;
  onClose: () => void;
  onEditRequest: (file: DriveFile) => void;
}

export function PythonFilePreview({ file, content, onClose, onEditRequest }: PythonFilePreviewProps) {
  const [activeTab, setActiveTab] = useState<string>("code");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>(content);

  const isMobile = useIsMobile();

  useEffect(() => {
    console.log("PythonFilePreview received content:", content);
    setEditedContent(content);
    setIsEdited(false);
  }, [content]);

  const handleExecute = async (useEdited = false) => {
    setIsExecuting(true);
    setOutput("");
    setError("");
    setExitCode(null);

    try {
      const result = await DriveService.executePythonFile(
        file.id,
        useEdited ? editedContent : undefined
      );

      setOutput(result.output || "");
      setError(result.error || "");
      setExitCode(result.exitCode);
      setActiveTab("output");
    } catch (err: unknown) {
      console.error('Error executing Python file:', err);
      if (err instanceof Error) {
        setError(`Execution failed: ${err.message}`);
      } else {
        setError('An unexpected error occurred during execution');
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    setIsEdited(e.target.value !== content);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-medium text-ellipsis overflow-hidden max-w-full sm:max-w-[70%]">
          {file.name}
        </h3>

        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExecute(isEdited)}>
                <Play className="h-4 w-4 mr-2" />
                Run
              </DropdownMenuItem>
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
              onClick={() => handleExecute(isEdited)}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run
            </Button>
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

      {/* Simple tabs */}
      <div className="w-full border-b border-gray-200 mb-4">
        <div className="flex">
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "code"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("code")}
          >
            Code
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "output"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("output")}
          >
            Output
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="w-full">
        {activeTab === "code" && (
          <div className="max-h-[60vh]">
            <div className="bg-muted rounded-md overflow-hidden">
              {content === '' ? (
                <div className="p-4 text-sm font-mono text-red-500">
                  No content loaded. This could be because:
                  <ul className="list-disc ml-5 mt-2">
                    <li>The file content could not be loaded from the server</li>
                    <li>The file is empty</li>
                    <li>There was an error in content processing</li>
                  </ul>
                </div>
              ) : (
                <textarea
                  className="p-4 text-sm w-full h-[50vh] sm:h-[60vh] font-mono bg-muted outline-none resize-none"
                  value={editedContent}
                  onChange={handleContentChange}
                  spellCheck={false}
                />
              )}
            </div>
            {isEdited && (
              <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                <span>
                  Code has been modified but not saved. Click the &quot;Edit&quot; button to save changes or &quot;Run&quot; to execute without saving.
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditedContent(content);
                    setIsEdited(false);
                  }}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "output" && (
          <div className="max-h-[60vh]">
            {isExecuting ? (
              <div className="h-[50vh] sm:h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <Spinner className="h-8 w-8 mb-4 mx-auto" />
                  <p>Executing Python code...</p>
                </div>
              </div>
            ) : exitCode !== null ? (
              <div className="h-[50vh] sm:h-[60vh] flex flex-col">
                {exitCode !== 0 && error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-2">
                    Execution failed with exit code {exitCode}
                  </div>
                )}

                <div className="bg-black text-white p-4 rounded-md overflow-auto flex-1 font-mono text-sm">
                  {output && (
                    <>
                      <div className="font-bold text-green-400 mb-2">Output:</div>
                      <pre className="whitespace-pre-wrap mb-4">{output}</pre>
                    </>
                  )}

                  {error && (
                    <>
                      <div className="font-bold text-red-400 mb-2">Errors:</div>
                      <pre className="whitespace-pre-wrap text-red-300">{error}</pre>
                    </>
                  )}

                  {!output && !error && (
                    <div className="text-gray-400 italic">No output was generated.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[50vh] sm:h-[60vh] flex items-center justify-center text-muted-foreground">
                Click the &quot;Run&quot; button to execute this Python file and see the output here.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
