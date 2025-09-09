import { useEffect, useCallback, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Paperclip, ArrowLeft, SendHorizontal } from "lucide-react";
import api from "@/lib/api";
import { Thread } from "@/types/chat";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

const mockMessages: Message[] | null = [
  {
    id: "1",
    sender: "Eliott Tesnier",
    content:
      "Pourquoi tu code du devrais prompter?",
    timestamp: "10:30 AM",
    isOwn: false,
  },
  {
    id: "2",
    sender: "You",
    content:
      "Mais nan tu as raison c'est une super mauvaise idée !",
    timestamp: "10:32 AM",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Eliott Tesnier",
    content: "Tu as générer ce design ?",
    timestamp: "10:35 AM",
    isOwn: false,
  },
  {
    id: "4",
    sender: "You",
    content:
      "On va dire que je ne l'ai pas fait seul néanmoins j'ai rajotuer des fonctionalité sympa et c'est moi qui vais faire les commnication avec le back",
    timestamp: "10:37 AM",
    isOwn: true,
  },
  {
    id: "5",
    sender: "Eliott Tesnier",
    content:
      "Ok",
    timestamp: "10:40 AM",
    isOwn: false,
  },
];


interface ChatComponentProps {
  onOpenConversations?: () => void;
  conv: Thread | null;
}

export default function ChatComponent({ onOpenConversations, conv }: ChatComponentProps) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [isMessageLoading, setIsMessageLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const fetchMessages = async () => {
      if (!conv)
        return;
      try {
        setIsMessageLoading(true);
        console.debug(`/threads/${conv.id}/`);
        api.get({endpoint: `/threads/${conv.id}/`})
      } catch (error) {
        console.log(error)
      } finally {
        setIsMessageLoading(false);
      }
    }
    fetchMessages();
  }, [])

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleSend = () => {
    if (inputValue.trim() === "") return;
    setMessages((prev) => [
      ...(prev ?? []),
      {
        id: String(Date.now()),
        sender: "You",
        content: inputValue,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      },
    ]);
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
              <AvatarImage src="/placeholder-avatar.jpg" alt="Eliott Tesnier" />
              <AvatarFallback>ET</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-semibold text-base truncate">Eliott Tesnier</div>
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
              <AvatarImage src="/placeholder-avatar.jpg" alt="Eliott Tesnier" />
              <AvatarFallback>ET</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-sm">Eliott Tesnier</span>
              <span className="block text-xs text-muted-foreground">
                Starting conversation with Eliott Tesnier
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-3">
          {messages && messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {!message.isOwn && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Eliott Tesnier" />
                  <AvatarFallback>ET</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] break-words whitespace-pre-wrap ${
                  message.isOwn
                    ? "bg-blue-600 text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                }`}
              >
                <p>{message.content}</p>
                <p
                  className={`text-[10px] opacity-70 mt-1 ${
                    message.isOwn ? "text-right" : "text-left"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Composer */}
      {conv && (
        <div className="border-t p-2 bg-background sticky bottom-0 z-10 pb-[env(safe-area-inset-bottom)]">
          <div className="flex gap-2 items-end w-full">
            <Button size="icon" variant="outline" className="shrink-0 h-[44px]">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 h-[36px] w-[36px] p-0 rounded-full !bg-blue-600 text-white shadow-md group transition-transform duration-200 disabled:opacity-60"
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