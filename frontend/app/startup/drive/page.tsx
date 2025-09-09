'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TbLoader3 } from 'react-icons/tb';
import StartupNavigation from '@/components/StartupNavigation';

export default function StartupDrivePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user?.startupId) {
      router.push(`/startup/${user.startupId}/drive`);
    }
  }, [user, router]);

  if (isLoading || !user) {
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

  if (!user.startupId) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <StartupNavigation />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <TbLoader3 className="size-12 animate-spin text-blue-600 mb-4" />
          <p className="mt-4 text-gray-600">Redirecting to your startup&apos;s drive...</p>
        </div>
      </div>
    </div>
  );
}
