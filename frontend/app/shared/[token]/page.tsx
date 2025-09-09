'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, Download, ExternalLink } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { DriveFile, DriveFolder } from '@/types/drive';

export default function SharedFilePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState<{
    file?: DriveFile;
    folder?: DriveFolder;
    type: 'file' | 'folder';
    name: string;
  } | null>(null);

  useEffect(() => {
    const fetchSharedItem = async () => {
      try {
        setLoading(true);
        // This endpoint would need to be implemented on the backend
        const response = await fetch(`/api/drive/shares/access/${token}`);

        if (!response.ok) {
          throw new Error('This shared link is invalid or has expired');
        }

        const data = await response.json();

        if (data.file) {
          setShared({
            file: data.file,
            type: 'file',
            name: data.file.name
          });
        } else if (data.folder) {
          setShared({
            folder: data.folder,
            type: 'folder',
            name: data.folder.name
          });
        } else {
          throw new Error('Invalid shared item');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared item');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedItem();
    }
  }, [token]);

  const renderFileIcon = (fileName: string) => {
    // Extract file extension
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Simple mapping of common file types to colors
    const extensionColors: {[key: string]: string} = {
      'pdf': 'text-red-500',
      'doc': 'text-blue-500',
      'docx': 'text-blue-500',
      'xls': 'text-green-500',
      'xlsx': 'text-green-500',
      'ppt': 'text-orange-500',
      'pptx': 'text-orange-500',
      'jpg': 'text-purple-500',
      'jpeg': 'text-purple-500',
      'png': 'text-purple-500',
      'gif': 'text-purple-500',
    };

    const color = extension ? extensionColors[extension] || 'text-gray-500' : 'text-gray-500';

    return <File className={`h-16 w-16 ${color}`} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <ExternalLink className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Shared Link Error</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shared) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="mb-4">
            {shared.type === 'file' && renderFileIcon(shared.name)}
            {shared.type === 'folder' && <File className="h-16 w-16 text-yellow-500 mx-auto" />}
          </div>
          <h2 className="text-2xl font-bold mb-1">{shared.name}</h2>
          <p className="text-gray-500 mb-6">
            {shared.type === 'file' ? 'Shared file' : 'Shared folder'}
          </p>

          {shared.type === 'file' && shared.file && (
            <Button
              className="w-full"
              onClick={() => window.open(shared.file?.download_url, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          )}

          {shared.type === 'folder' && shared.folder && (
            <Button
              className="w-full"
              onClick={() => window.location.href = `/drive/folder/${shared.folder?.id}`}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Folder
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
