"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DriveProvider } from "@/contexts/DriveContext";
import { DriveExplorer } from "@/components/drive/DriveExplorer";
import { TbLoader3 } from "react-icons/tb";
import StartupNavigation from "@/components/StartupNavigation";
import Footer from "@/components/Footer";

export default function StartupDrivePage() {
  const { user, isLoading } = useAuth();

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

  if (!user?.startupId) {
    return (
      <div className="min-h-screen flex flex-col">
        <StartupNavigation />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold mb-4">
              No Startup Found
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be associated with a startup to access its drive.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const startupId = user.startupId;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-jeb-gradient-from to-jeb-gradient-to/50">
      <StartupNavigation />
      <DriveProvider initialStartupId={startupId}>
        <main className="flex-1 py-6">
          <div className="px-4 max-w-7xl mx-auto">
            <DriveExplorer startupId={startupId} />
          </div>
        </main>
      </DriveProvider>
      <Footer />
    </div>
  );
}
