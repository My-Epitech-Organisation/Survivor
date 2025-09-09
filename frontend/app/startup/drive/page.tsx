'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DriveProvider } from '@/contexts/DriveContext';
import { DriveExplorer } from '@/components/drive/DriveExplorer';
import { TbLoader3 } from 'react-icons/tb';
import StartupNavigation from '@/components/StartupNavigation';

export default function StartupDrivePage() {
  const { user, isLoading } = useAuth();

  // Show loading state while authentication data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StartupNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <TbLoader3 className="size-12 animate-spin text-blue-600 mb-4" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if user is not associated with a startup
  if (!user?.startupId) {
    return (
      <div className="min-h-screen flex flex-col">
        <StartupNavigation />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Startup Found</h1>
            <p className="text-gray-600 mb-6">
              You need to be associated with a startup to access its drive.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User has a startup, render the drive with the startup ID
  const startupId = user.startupId;

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
