"use client"

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import api from "@/lib/api";
import { Thread } from "@/types/chat"
import { getBackendUrl } from "@/lib/config";
import { MessageCircleOff } from 'lucide-react';
import NewThreadChat from "./NewThreadChat";

export default function ChatSideBar({
  onSelect,
}: {
  onSelect?: (conv: Thread) => void;
}) {
  const [isThreadLoading, setIsThreadLoading] = useState<boolean>(false);
  const [listThreads, setListThreads] = useState<Thread[] | null>(null);


  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setIsThreadLoading(true);
        const res = await api.get<Thread[] | null>({endpoint: "/threads/"});
        setListThreads(res.data);
      } catch (error) {
        setListThreads(null);
        console.error(error);
      } finally {
        setIsThreadLoading(false);
      }
    }
    fetchThreads();
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <NewThreadChat />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto max-h-[calc(100vh-112px)]">
        <div className="p-3 space-y-2">
          {!listThreads || listThreads.length == 0 && (
            <>
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <MessageCircleOff className="w-8 h-8 mb-2" />
                <span>No threads</span>
              </div>
            </>
          )}
          {listThreads && listThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onSelect?.(thread)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 cursor-pointer transition-all duration-200 border border-transparent hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="w-10 h-10 shrink-0"> {/* Utilisé avatar input */}
                <AvatarImage
                  src={`${getBackendUrl()}${thread.participants.at(0)?.userImage}.jpg`}
                  alt={thread.participants.at(0)?.name}
                />
                <AvatarFallback>{thread.participants.at(0)?.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm truncate">{thread.participants.at(0)?.name}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {thread.last_message_at}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {thread.last_message}
                </p>
              </div>

              {Number(thread.unread_count) > 0 && (
                <Badge variant="destructive" className="ml-2 shrink-0">
                  {thread.unread_count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}