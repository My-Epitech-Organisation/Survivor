
"use client";

import { useEffect, useState, useRef } from "react";
import StartupNavigation from "@/components/StartupNavigation";
import Footer from "@/components/Footer";
import ChatComponent, { ChatComponentHandle } from "@/components/ChatComponent";
import ChatSideBar, { ChatSideBarHandle } from "@/components/ChatSideBar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TbLoader3 } from "react-icons/tb";
import { Thread } from "@/types/chat";

export default function StartupMessaging() {
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeThread, setActiveThread] = useState<Thread | null>(
    null
  );
  const chatRef = useRef<ChatComponentHandle>(null);
  const sideBarRef = useRef<ChatSideBarHandle>(null);

  useEffect(() => {
    if (activeThread) {
      chatRef.current?.clearThreadsMessages();
      chatRef.current?.refreshThreadMessages();
    }
  }, [activeThread]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <StartupNavigation />

      <main className="flex-1 flex items-center px-2 sm:px-4 lg:px-6 py-2">
        {isDataLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <TbLoader3 className="size-12 animate-spin text-blue-600 mb-4" />
            <p className="text-app-text-secondary text-lg">
              Loading messages...
            </p>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto flex-1">
            <Card className="w-full h-[85dvh] lg:h-[80vh] shadow-lg overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="h-full grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
                  {/* Sidebar desktop */}
                  <aside className="hidden lg:flex flex-col flex-1 min-h-0 h-full border-r">
                    <ChatSideBar
                      ref={sideBarRef} 
                      onSelect={(conv) => {
                        console.log('Selected conversation:', conv); // Debug
                        setActiveThread(conv);
                      }} 
                    />
                  </aside>

                  {/* Zone chat */}
                  <section className="min-w-0 flex">
                    <ChatComponent
                      ref={chatRef}
                      onNewConv={(thread) => {
                        console.log('New conversation:', thread); // Debug
                        sideBarRef.current?.refreshThreads();
                      }}
                      conv={activeThread}
                      onOpenConversations={() => setIsSidebarOpen(true)}
                    />
                  </section>
                </div>
              </CardContent>
            </Card>

            {/* Drawer mobile pour les conversations */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetContent side="left" className="p-0 w-[90vw] sm:w-[420px]">
                <SheetHeader className="p-4">
                  <SheetTitle>Conversations</SheetTitle>
                </SheetHeader>
                <div className="h-[calc(100dvh-56px)] overflow-y-auto">
                  <ChatSideBar
                    onSelect={(conv) => {
                      console.log('Mobile selected conversation:', conv); // Debug
                      setActiveThread(conv);
                      setIsSidebarOpen(false);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </main>
    </div>
  );
}