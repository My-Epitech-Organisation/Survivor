'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};
