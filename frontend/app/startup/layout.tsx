"use client";

import { useAuth } from '@/contexts/AuthContext';
import { TbLoader3 } from 'react-icons/tb';

export default function StartupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TbLoader3 className="size-12 animate-spin text-jeb-primary mb-4" />
          <p className="mt-4 text-app-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
