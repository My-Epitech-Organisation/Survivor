'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import StartupNavigation from '@/components/StartupNavigation';

// This page will be deprecated in favor of /startup/drive
export default function StartupIdDrivePage() {
  const router = useRouter();
  
  // Redirect to the main drive page
  useEffect(() => {
    router.replace('/startup/drive');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <StartupNavigation />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="mb-4" />
          <p className="text-muted-foreground">Redirecting to Drive...</p>
        </div>
      </div>
    </div>
  );
}
