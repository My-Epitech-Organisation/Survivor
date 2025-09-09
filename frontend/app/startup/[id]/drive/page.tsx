'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import StartupNavigation from '@/components/StartupNavigation';

export default function StartupIdDrivePage() {
  const router = useRouter();

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
