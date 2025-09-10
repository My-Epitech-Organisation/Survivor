import { useEffect, useCallback, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Paperclip, ArrowLeft, SendHorizontal } from "lucide-react";
import api from "@/lib/api";
import { Thread, Message, ThreadDetails, MessageReceive, NewThread } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";
import Router from "next/router";
import { MessageCircleOff, MessageCircle } from 'lucide-react';
import { getBackendUrl } from "@/lib/config";
import { getToken } from "@/lib/api";
import { io, Socket } from 'socket.io-client';

interface ChatComponentProps {
  onOpenConversations?: () => void;
  conv: Thread | null;
  onNewConv: (NewConv: Thread) => void;
}

export interface ChatComponentHandle {
  refreshThreadMessages: () => Promise<void>;
  clearThreadsMessages: () => Promise<void>;
}

const ChatComponent = forwardRef<ChatComponentHandle, ChatComponentProps>(({ onOpenConversations, conv, onNewConv }, ref) =>  {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [isMessageLoading, setIsMessageLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const {user, isLoading} = useAuth();

  const setupSocket = useCallback(() => {
    if (!conv || !user) return;

    // Disconnect existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Create new socket connection
    const backendUrl = getBackendUrl().replace('/api', '');
    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔗 Socket.IO connected:', socket.id);
      
      // Join the thread
      socket.emit('join_thread', {
        token: getToken(),
        thread_id: conv.id
      });
    });

    socket.on('connected', (data) => {
      console.log('✅ Joined thread:', data);
    });

    socket.on('joined_thread', (data) => {
      console.log('✅ Successfully joined thread:', data.thread_id);
    });

    socket.on('new_message', (data) => {
      console.log('📨 New message received:', data);
      const newMessage: Message = {
        id: String(data.id),
        sender: data.sender_name || `User ${data.sender_id}`,
        content: data.body,
        timestamp: new Date(data.created_at).toLocaleString([], {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        userID: data.sender_id,
      };
      setMessages((prev) => [...(prev ?? []), newMessage]);
    });

    socket.on('typing', (data) => {
      console.log('⌨️ Typing event:', data);
      // Handle typing indicators here if needed
    });

    socket.on('error', (error) => {
      console.error('❌ Socket.IO error:', error);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [conv, user]);

  const refreshThreadMessages = useCallback(async () => {
    if (!conv || (conv.created == false)) return;
    try {
      setIsMessageLoading(true);
      setMessages(null);
      const response = await api.get<ThreadDetails>({
        endpoint: `/threads/${conv.id}/`,
      });
      if (response.data && Array.isArray(response.data.messages)) {
        console.log("MESSAGE FROM API", response.data.messages);
        const formattedMessages: Message[] = response.data.messages.map((msg: MessageReceive) => ({
          id: msg.id,
          sender: msg.sender.name,
          content: msg.body,
          timestamp: new Date(msg.created_at).toLocaleString([], {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          userID: msg.sender.id,
        }));
        setMessages(formattedMessages.reverse());
      }
    } catch (error) {
      console.error("Failed to refresh messages:", error);
    } finally {
      setIsMessageLoading(false);
    }
  }, [conv]);

  // Separate useEffect for Socket.IO setup - only when conv changes
  useEffect(() => {
    if (conv) {
      const cleanup = setupSocket();
      return cleanup; // Return cleanup function for useEffect
    }
  }, [conv, setupSocket]);

  // Cleanup socket on component unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const clearThreadsMessages = useCallback(async () => {
      try {
        setMessages(null);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }, [conv]);

  useImperativeHandle(ref, () => ({
    refreshThreadMessages,
    clearThreadsMessages,
  }));

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Trigger message refresh when conv or token changes
  useEffect(() => {
    if (conv) {
      refreshThreadMessages();
    }
  }, [conv, refreshThreadMessages]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 160);
    el.style.height = next + "px";
  }, []);

  useEffect(() => {
    autoResize();
  }, [inputValue, autoResize]);

  const handleSend = async () => {
    if (inputValue.trim() === "") return;
    if (!user) {
      Router.push("/login");
      return;
    }
    if (!conv)
      return false;
    const message : Message = {
        id: String(Date.now()),
        sender: user.name,
        content: inputValue,
        timestamp: new Date().toLocaleTimeString([], {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        userID: user.id,
      }
    setMessages((prev) => [
      ...(prev ?? []),
      message,
    ]);
    // Send the new message to other ! using le truc d'Eliott a la manière d'une socket
    if (conv?.created == false) {
      const participantIds = conv.participants.map(p => p.id);
      const result = await api.post<NewThread>("/threads/", { "participants": participantIds, "message": message.content });
      conv.created = true;
      console.log("result: ", result, "resultData: ",result.data)
      if (result.data) {
        console.log("New thread Created: ", result.data.thread.id);
        onNewConv({
          id: result.data.thread.id,
          participants: conv.participants,
          created: conv.created,
          created_at: result.data.thread.created_at,
          last_message_at: result.data.thread.last_message_at,
          last_message: result.data.thread.last_message,
          unread_count: result.data.thread.unread_count
        });
        
        // After creating new thread, emit the message via Socket.IO
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            token: getToken(),
            thread_id: result.data.thread.id,
            body: message.content
          });
        }
      }
    } else {
      try {
        console.log("Je vais envoyer a l'id", conv.id);
        const resp = await api.post<MessageReceive>(`/threads/${conv.id}/messages/`, {body: message.content});
        
        // Also send via Socket.IO for real-time
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            token: getToken(),
            thread_id: conv.id,
            body: message.content
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    setInputValue("");
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  return (
  <div className="flex-1 min-w-0 flex flex-col h-0">
      {/* Header du chat */}
      <div className="flex items-center gap-3 px-3 sm:px-4 py-2 border-b sticky top-0 bg-background z-10">
        {onOpenConversations && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenConversations}
            className="lg:hidden shrink-0"
            aria-label="Ouvrir la liste des conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        {conv ? (
          <>
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder-avatar.jpg" alt={`${conv.participants.at(0)?.name} Logo`} />
              <AvatarFallback>{conv.participants.at(0)?.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-semibold text-base truncate">{conv.participants.length == 1 ? conv.participants.at(0)?.name : conv.participants.map((user, index) => {return user.name + (index < conv.participants.length - 1 ? ", " : "")}).join("")}</div>
            </div>
          </>
        ) : (
          <>
            <div className="min-w-0">
              <div className="font-semibold text-base truncate">No active threads </div>
            </div>
          </>
        )}

      </div>

      {/* Zone messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-[60dvh] overflow-y-auto px-3 sm:px-4 py-4 space-y-4 overscroll-y-contain"
        aria-live="polite"
      >
        {/* Message système */}
        {conv && (
          <div className="flex items-center gap-3 justify-center py-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder-avatar.jpg" alt={conv.participants.at(0)?.name} />
              <AvatarFallback>{conv.participants.at(0)?.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-sm">{conv.participants.map((user, index) => {return user.name + (index < conv.participants.length - 1 ? ", " : "")}).join("")}</span>
              <span className="block text-xs text-muted-foreground">
                Starting conversation with {conv.participants.map((user, index) => {return user.name + (index < conv.participants.length - 1 ? ", " : "")}).join("")}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
          <div className="space-y-3">
            {conv ? (
              <>
              {messages && messages.length > 0 ? (
                messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                  message.userID == user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  {!(message.userID === user?.id) && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Eliott Tesnier" />
                    <AvatarFallback>ET</AvatarFallback>
                  </Avatar>
                  )}
                  <div
                  className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] break-words whitespace-pre-wrap ${
                    (message.userID === user?.id)
                    ? "bg-blue-600 text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                  }`}
                  >
                  <p>{message.content}</p>
                  <p
                    className={`text-[10px] opacity-70 mt-1 ${
                    (message.userID == user?.id) ? "text-right" : "text-left"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                  </div>
                </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                <MessageCircle className="w-10 h-10 mb-2" />
                <span className="text-sm">No messages yet</span>
                </div>
              )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
              <MessageCircleOff className="w-10 h-10 mb-2" />
              <span className="text-sm">No active thread </span>
              </div>
            )}
          </div>

      </div>

      {/* Composer */}
      {conv && (
        <div className="border-t p-2 bg-background sticky bottom-0 z-10 pb-[env(safe-area-inset-bottom)]">
          <div className="flex gap-2 items-end w-full">
            <Button size="icon" variant="outline" className="cursor-pointer shrink-0 h-[44px]">
              <Paperclip className="w-5 h-5" />
            </Button>
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                placeholder="Type your message..."
                className="w-full min-h-[44px] max-h-[160px] pr-12 resize-none"
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onInput={autoResize}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                style={{ overflowY: "auto" }}
              />
              <Button
                type="button"
                size="icon"
                aria-label="Envoyer"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-[36px] w-[36px] p-0 rounded-full !bg-blue-600 text-white shadow-md group transition-transform duration-200 disabled:opacity-60 disabled:cursor-none cursor-pointer"
                onClick={handleSend}
                disabled={!inputValue.trim()}
              >
                <SendHorizontal className="w-5 h-5 text-white transition-transform duration-200 group-hover:rotate-[-45deg] group-active:scale-110 group-active:rotate-[-90deg]" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
);

ChatComponent.displayName = "ChatComponent";

export default ChatComponent;