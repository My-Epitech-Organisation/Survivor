"use client";

import React, { useState } from "react";
import { DriveFile, DriveFolder } from "@/types/drive";
import { useDrive } from "@/contexts/DriveContext";
import { downloadFile } from "@/lib/downloadUtils";
import { isTextFile, isImageFile, isVideoFile } from "@/lib/fileUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Folder,
  File,
  ChevronRight,
  UploadCloud,
  FolderPlus,
  Trash2,
  Download,
  MoreVertical,
  RefreshCw,
  ArrowLeft,
  Eye,
  Edit,
  Image,
  Video,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { FilePreview } from "./FilePreview";
import { FileEditor } from "./FileEditor";

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
    downloadFolder,
    refreshCurrentFolder,
    setStartupId,
  } = useDrive();

  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);

  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Preview and Edit states
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [editFile, setEditFile] = useState<DriveFile | null>(null);

  const [folderMenuOpen, setFolderMenuOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [fileMenuOpen, setFileMenuOpen] = useState<{ [key: number]: boolean }>(
    {}
  );

  const handleContextMenu = (
    e: React.MouseEvent,
    folder?: DriveFolder,
    file?: DriveFile
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Close any open menus first
    setFolderMenuOpen({});
    setFileMenuOpen({});

    if (folder) {
      setFolderMenuOpen({ [folder.id]: true });
    } else if (file) {
      setFileMenuOpen({ [file.id]: true });
    }
  };

  const handleFolderMenuOpenChange = (folderId: number, open: boolean) => {
    setFolderMenuOpen({ [folderId]: open });
  };

  const handleFileMenuOpenChange = (fileId: number, open: boolean) => {
    setFileMenuOpen({ [fileId]: open });
  };

  React.useEffect(() => {
    if (startupId) {
      setStartupId(startupId);
      console.log("DriveExplorer - Setting startup ID:", startupId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startupId]);

  React.useEffect(() => {
    if (startupId) {
      refreshCurrentFolder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startupId]);

  /*
  React.useEffect(() => {
    console.log('DriveExplorer - Files:', files);
    console.log('DriveExplorer - Folders:', folders);
  }, [files, folders]);
  */

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(startupId, newFolderName, currentFolder?.id || null);
      setNewFolderName("");
      setNewFolderDialogOpen(false);
    }
  };

  const handleFileUpload = async () => {
    if (fileToUpload) {
      await uploadFile(
        startupId,
        fileToUpload,
        currentFolder?.id || null,
        fileDescription
      );
      setFileToUpload(null);
      setFileDescription("");
      setUploadDialogOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const navigateToParent = () => {
    if (currentFolder?.parent) {
      navigateToFolder(currentFolder.parent);
    } else {
      navigateToFolder(null);
    }
  };

  const handleFileDownload = async (file: DriveFile) => {
    await downloadFile(file.id, file.name);
  };

  // Preview and Edit handlers
  const handleFilePreview = (file: DriveFile) => {
    if (isTextFile(file) || isImageFile(file) || isVideoFile(file)) {
      setPreviewFile(file);
    } else {
      handleFileDownload(file);
    }
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const handleEditRequest = (file: DriveFile) => {
    setPreviewFile(null);
    setEditFile(file);
  };

  const handleCloseEditor = () => {
    setEditFile(null);
  };

  const handleSaveFile = async () => {
    await refreshCurrentFolder();
    setEditFile(null);
  };

  const handlePreviewRequest = (file: DriveFile) => {
    setEditFile(null);
    setPreviewFile(file);
  };

  const handleFolderDownload = async (folder: DriveFolder) => {
    await downloadFolder(folder.id, folder.name);
  };

  const renderFileIcon = (file: DriveFile) => {
    // Check if it's an image file first
    if (isImageFile(file)) {
      return <Image className="h-5 w-5 text-purple-500" />;
    }

    // Check if it's a video file
    if (isVideoFile(file)) {
      return <Video className="h-5 w-5 text-blue-500" />;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <File className="h-5 w-5 text-red-500" />;
      case "doc":
      case "docx":
        return <File className="h-5 w-5 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <File className="h-5 w-5 text-green-500" />;
      case "ppt":
      case "pptx":
        return <File className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {!startupId ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Spinner className="mb-4" />
          <p className="text-muted-foreground">
            Loading startup information...
          </p>
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
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCurrentFolder}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              {/* Upload File Dialog */}
              <Dialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="bg-jeb-primary text-app-white hover:bg-jeb-hover transition-colors"
                  >
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
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description (optional)
                      </Label>
                      <Input
                        id="description"
                        value={fileDescription}
                        onChange={(e) => setFileDescription(e.target.value)}
                        placeholder="Enter file description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-jeb-primary text-app-white hover:bg-jeb-hover transition-colors"
                      onClick={handleFileUpload} 
                      disabled={!fileToUpload}
                    >
                      Upload
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* New Folder Dialog */}
              <Dialog
                open={newFolderDialogOpen}
                onOpenChange={setNewFolderDialogOpen}
              >
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
                    <Button
                      variant="outline"
                      onClick={() => setNewFolderDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-jeb-primary text-app-white hover:bg-jeb-hover transition-colors"
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim()}
                    >
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {/* Simple Breadcrumbs Navigation */}
          <div className="flex items-center space-x-2 text-sm">
            {currentFolder && (
              <Button
                variant="outline"
                size="default"
                onClick={navigateToParent}
                className="cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
            )}
            <div className="flex items-center">
              <Button
                variant="outline"
                size="default"
                onClick={() => navigateToFolder(null)}
                className="cursor-pointer"
              >
                Root
              </Button>
              {breadcrumbs &&
                breadcrumbs.map((folder) => (
                  <React.Fragment key={folder.id}>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => navigateToFolder(folder.id)}
                      className="cursor-pointer"
                    >
                      {folder.name}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
          </div>{" "}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Folders */}
              {folders && folders.length > 0 ? (
                folders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onContextMenu={(e) => handleContextMenu(e, folder)}
                    onClick={() => navigateToFolder(folder.id)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2 flex-1">
                        <Folder className="h-5 w-5 text-yellow-500" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <DropdownMenu
                        open={folderMenuOpen[folder.id] || false}
                        onOpenChange={(open) =>
                          handleFolderMenuOpenChange(folder.id, open)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleFolderDownload(folder)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteFolder(folder.id)}
                          >
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
                  {isLoading ? (
                    ""
                  ) : (
                    <div className="flex flex-col items-center py-6">
                      <Folder className="h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p>No folders found in this location.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setNewFolderDialogOpen(true)}
                      >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Create Folder
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Files */}
              {files && files.length > 0 ? (
                files.map((file) => (
                  <Card
                    key={file.id}
                    className="hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onContextMenu={(e) => handleContextMenu(e, undefined, file)}
                    onClick={() => handleFilePreview(file)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2 flex-1 truncate">
                        {renderFileIcon(file)}
                        <span className="truncate">{file.name}</span>
                      </div>
                      <DropdownMenu
                        open={fileMenuOpen[file.id] || false}
                        onOpenChange={(open) =>
                          handleFileMenuOpenChange(file.id, open)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                          {isTextFile(file) && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleFilePreview(file)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditRequest(file)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </>
                          )}
                          {isImageFile(file) && (
                            <DropdownMenuItem
                              onClick={() => handleFilePreview(file)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                          )}
                          {isVideoFile(file) && (
                            <DropdownMenuItem
                              onClick={() => handleFilePreview(file)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleFileDownload(file)}
                          >
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
                  {isLoading ? (
                    ""
                  ) : (
                    <div className="flex flex-col items-center py-6">
                      <File className="h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p>No files found in this location.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setUploadDialogOpen(true)}
                      >
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* File Preview Dialog */}
          {previewFile && (
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
              <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full">
                <DialogHeader>
                  <DialogTitle>Preview File</DialogTitle>
                </DialogHeader>
                <FilePreview 
                  file={previewFile} 
                  onClose={handleClosePreview}
                  onEditRequest={handleEditRequest}
                />
              </DialogContent>
            </Dialog>
          )}

          {/* File Editor Dialog */}
          {editFile && (
            <Dialog open={!!editFile} onOpenChange={() => setEditFile(null)}>
              <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full">
                <DialogHeader>
                  <DialogTitle>Edit File</DialogTitle>
                </DialogHeader>
                <FileEditor 
                  file={editFile} 
                  onClose={handleCloseEditor}
                  onSave={handleSaveFile}
                  onPreviewRequest={handlePreviewRequest}
                />
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}
