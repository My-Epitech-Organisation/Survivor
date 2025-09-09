'use client';

import React from 'react';
import { DriveProvider } from '@/contexts/DriveContext';
import { DriveExplorer } from '@/components/drive/DriveExplorer';
import { useParams } from 'next/navigation';
import StartupNavigation from '@/components/StartupNavigation';

export default function StartupDrivePage() {
  const params = useParams();
  const startupId = Number(params.id);

  if (!startupId) {
    return (
      <div className="min-h-screen flex flex-col">
        <StartupNavigation />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Startup ID Required</h1>
            <p className="text-muted-foreground">
              Please select a startup to view its drive.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StartupNavigation />
      <DriveProvider initialStartupId={startupId}>
        <div className="flex-1 p-4">
          <DriveExplorer startupId={startupId} />
        </div>
      </DriveProvider>
    </div>
  );
}
