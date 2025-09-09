'use client';

import React, { useState } from 'react';
import { DriveFile } from '@/types/drive';
import { useDrive } from '@/contexts/DriveContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Folder, File, ChevronRight, UploadCloud, FolderPlus, 
  Trash2, Download, MoreVertical, RefreshCw, ArrowLeft
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

interface DriveExplorerProps {
  startupId: number;
}

export function DriveExplorer({ startupId }: DriveExplorerProps) {
  const { 
    currentFolder, 
    folders, 
    files, 
    breadcrumbs,
    isLoading, 
    error,
    navigateToFolder,
    createFolder,
    uploadFile,
    deleteFile,
    deleteFolder,
    refreshCurrentFolder,
    setStartupId
  } = useDrive();

  // State for new folder dialog
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);

  // State for upload dialog
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Set startup ID when component mounts and ensure it's valid
  React.useEffect(() => {
    if (startupId) {
      setStartupId(startupId);
      console.log('DriveExplorer - Setting startup ID:', startupId);
    }
  }, [startupId, setStartupId]);

  // Debug state
  React.useEffect(() => {
    console.log('DriveExplorer - Files:', files);
    console.log('DriveExplorer - Folders:', folders);
  }, [files, folders]);

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(startupId, newFolderName, currentFolder?.id || null);
      setNewFolderName('');
      setNewFolderDialogOpen(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (fileToUpload) {
      await uploadFile(startupId, fileToUpload, currentFolder?.id || null, fileDescription);
      setFileToUpload(null);
      setFileDescription('');
      setUploadDialogOpen(false);
    }
  };

  // Handle file selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  // Navigate to parent folder
  const navigateToParent = () => {
    if (currentFolder?.parent) {
      navigateToFolder(currentFolder.parent);
    } else {
      navigateToFolder(null);
    }
  };

  // Render the file type icon based on extension
  const renderFileIcon = (file: DriveFile) => {
    // Extract file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // Simple mapping of common file types to icons
    switch (extension) {
      case 'pdf':
        return <File className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <File className="text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <File className="text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <File className="text-purple-500" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {!startupId ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Spinner className="mb-4" />
          <p className="text-muted-foreground">Loading startup information...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-destructive/15 text-destructive p-4 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Drive</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={refreshCurrentFolder}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              {/* Upload File Dialog */}
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Select File</Label>
                      <Input id="file" type="file" onChange={handleFileChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input 
                        id="description" 
                        value={fileDescription} 
                        onChange={(e) => setFileDescription(e.target.value)} 
                        placeholder="Enter file description" 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleFileUpload} disabled={!fileToUpload}>Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* New Folder Dialog */}
              <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="folderName">Folder Name</Label>
                      <Input 
                        id="folderName" 
                        value={newFolderName} 
                        onChange={(e) => setNewFolderName(e.target.value)} 
                        placeholder="Enter folder name" 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Simple Breadcrumbs Navigation */}
          <div className="flex items-center space-x-2 text-sm">
            {currentFolder && (
              <Button variant="ghost" size="sm" onClick={navigateToParent}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div className="flex items-center">
              <span 
                className="hover:text-primary cursor-pointer" 
                onClick={() => navigateToFolder(null)}
              >
                Root
              </span>
              {breadcrumbs && breadcrumbs.map((folder) => (
                <React.Fragment key={folder.id}>
                  <ChevronRight className="h-4 w-4 mx-1" />
                  <span 
                    className="hover:text-primary cursor-pointer"
                    onClick={() => navigateToFolder(folder.id)}
                  >
                    {folder.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Folders */}
              {folders && folders.length > 0 ? (
                folders.map((folder) => (
                  <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div 
                        className="flex items-center space-x-2 flex-1" 
                        onClick={() => navigateToFolder(folder.id)}
                      >
                        <Folder className="h-5 w-5 text-yellow-500" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => deleteFolder(folder.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-muted-foreground">
                  {isLoading ? '' : 'No folders found in this location.'}
                </div>
              )}

              {/* Files */}
              {files && files.length > 0 ? (
                files.map((file) => (
                  <Card key={file.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2 flex-1 truncate">
                        {renderFileIcon(file)}
                        <span className="truncate">{file.name}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => window.open(file.download_url, '_blank')}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteFile(file.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-muted-foreground">
                  {isLoading ? '' : 'No files found in this location.'}
                </div>
              )}

              {folders && folders.length === 0 && files && files.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No files or folders found in this location.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
