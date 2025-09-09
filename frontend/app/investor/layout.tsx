"use client";

import { useAuth } from '@/contexts/AuthContext';
import { TbLoader3 } from 'react-icons/tb';

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TbLoader3 className="size-12 animate-spin text-blue-600 mb-4" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
