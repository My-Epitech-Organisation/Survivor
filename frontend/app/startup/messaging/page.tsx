"use client";

import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import Footer from "@/components/Footer";
import StartupNavigation from "@/components/StartupNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { TbLoader3 } from "react-icons/tb";

export default function StartupMessaging() {
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    
  })

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-app-gradient-from to-app-gradient-to overflow-hidden">
      <StartupNavigation />

      <main className="flex-1 flex flex-col items-center px-2 sm:px-4 lg:px-6 py-2 min-h-[100dvh] lg:justify-center lg:items-stretch">
        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <TbLoader3 className="size-12 animate-spin text-blue-600 mb-4" />
            <p className="text-app-text-secondary text-lg">
              Loading messages...
            </p>
          </div>
        ) : (
          <div className="w-full max-w-[95vw] flex items-center justify-center h-full lg:items-start lg:justify-center">
            <Card className="h-full shadow-lg lg:h-[700px] lg:my-8">
              <CardContent className="p-4 lg:p-8 h-full">
                <div className="flex gap-4 lg:gap-8 h-full">
                  {/* Sidebar - Only visible on desktop */}
                  <div className="hidden lg:block w-80 flex-shrink-0">
                    <ChatSideBar />
                  </div>
                  {/* Separator - visible only on desktop */}
                  <div className="hidden lg:block">
                    <Separator orientation="vertical" className="h-full" />
                  </div>
                  {/* Main chat area */}
                  <div className="flex-1 min-w-0 relative">
                    <ChatComponent onOpenConversations={() => setIsSidebarOpen(true)} />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Conversations Dialog for mobile */}
            <Dialog open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <DialogContent className="max-w-sm mx-auto max-h-[70vh]">
                <DialogHeader>
                  <DialogTitle>Conversations</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[50vh]">
                  <ChatSideBar />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
}
