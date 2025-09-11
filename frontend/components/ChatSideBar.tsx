"use client";

import { useEffect, useState, forwardRef, useCallback, useImperativeHandle } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import api from "@/lib/api";
import { Thread } from "@/types/chat";
import { MessageCircleOff, RefreshCw, Wifi, WifiOff } from "lucide-react";
import NewThreadChat from "./NewThreadChat";
import { User } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";
import { IDAvatar } from "./ui/InputAvatar";
import { MdGroups } from "react-icons/md";
import { getThreadWebSocket, WebSocketEvent } from "@/lib/websocket";

interface ChatSideBarProps {
  variante: "investors" | "founders"
  onSelect: (conv: Thread ) => void
}
export interface ChatSideBarHandle {
  refreshThreads: () => Promise<void>;
}

const ChatSideBar = forwardRef<ChatSideBarHandle, ChatSideBarProps>(
  ({ onSelect, variante }, ref) => {
    const [isThreadLoading, setIsThreadLoading] = useState<boolean>(false);
    const [listThreads, setListThreads] = useState<Thread[] | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);
    const {user, isLoading} = useAuth();

    const fetchThreads = useCallback(async () => {
      try {
        setIsThreadLoading(true);
        const res = await api.get<Thread[] | null>({ endpoint: "/threads/" });
        const filteredThreads = res.data?.map(thread => ({
          ...thread,
          participants: thread.participants.filter((participant: User) => participant.id !== user?.id)
        }));
        setListThreads(filteredThreads ?? null);
      } catch (error) {
        setListThreads(null);
        console.error(error);
      } finally {
        setIsThreadLoading(false);
      }
    }, [user?.id]);

    const handleNewThread = async (users: User[]) => {
      try {
        setIsThreadLoading(true);
        onSelect({
          id: 0,
          participants: users,
          created_at: "now",
          created: false,
          last_message_at: "none",
          last_message: {
            id: "0",
            sender: {id: 0, name: "none", email: "none"},
            body: "",
            created_at: "",
            userID: 0,
          },
          unread_count: "0",
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsThreadLoading(false);
      }
    };

    const refreshThreads = useCallback(async () => {
      setIsRefreshing(true);
      try {
        await fetchThreads();
      } finally {
        setIsRefreshing(false);
      }
    }, [fetchThreads]);

    useImperativeHandle(ref, () => ({
      refreshThreads,
    }));

    useEffect(() => {
      fetchThreads();
    }, [fetchThreads]);

    // WebSocket connection and event handling
    useEffect(() => {
      const ws = getThreadWebSocket();

      const checkConnection = () => {
        setIsWebSocketConnected(ws.isConnected());
      };

      const connectionInterval = setInterval(checkConnection, 1000);
      checkConnection();

      const handleThreadCreated = (event: WebSocketEvent) => {
        refreshThreads();
      };

      const handleThreadUpdated = (event: WebSocketEvent) => {
        refreshThreads();
      };

      const handleMessageReceived = (event: WebSocketEvent) => {
        refreshThreads();
      };

      ws.addEventListener('thread_created', handleThreadCreated);
      ws.addEventListener('thread_updated', handleThreadUpdated);
      ws.addEventListener('message_received', handleMessageReceived);

      return () => {
        clearInterval(connectionInterval);
        ws.removeEventListener('thread_created', handleThreadCreated);
        ws.removeEventListener('thread_updated', handleThreadUpdated);
        ws.removeEventListener('message_received', handleMessageReceived);
      };
    }, [refreshThreads]);

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Conversations</h2>
              {isWebSocketConnected ? (
                <span title="WebSocket connected">
                  <Wifi className="w-4 h-4 text-green-500" />
                </span>
              ) : (
                <span title="WebSocket disconnected">
                  <WifiOff className="w-4 h-4 text-red-500" />
                </span>
              )}
              <button
                onClick={refreshThreads}
                disabled={isRefreshing}
                className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50"
                title="Refresh conversations"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <NewThreadChat variante={variante} onSumbit={handleNewThread} />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto max-h-[calc(100vh-112px)]">
          <div className="p-3 space-y-2">
            {!listThreads || listThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <MessageCircleOff className="w-8 h-8 mb-2" />
                <span>No threads</span>
              </div>
            ) : (
              listThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => onSelect?.(thread)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 cursor-pointer transition-all duration-200 border border-transparent hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {thread.participants.length === 1 ?
                  <>
                    <IDAvatar size={10} className="shrink-0" id={thread.participants.at(0)?.id ?? -1}/>
                  </>
                  :
                  <>
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback>
                        <MdGroups></MdGroups>
                      </AvatarFallback>
                    </Avatar>
                  </>
                  }
                  {/*  */}

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {thread.participants.map((user, index) => {return user.name + (index < thread.participants.length - 1 ? ", " : "")}).join("")}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(thread.last_message_at).toLocaleTimeString([], { day:'2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      <>
                        {/* {console.log("LASTMESSAGE", thread.last_message)} */}
                        {thread.last_message.body}
                      </>
                    </p>
                  </div>

                  {/* {Number(thread.unread_count) > 0 && (
                    <Badge variant="destructive" className="ml-2 shrink-0">
                      {thread.unread_count}
                    </Badge>
                  )} */}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
);

ChatSideBar.displayName = "ChatSideBar";

export default ChatSideBar;