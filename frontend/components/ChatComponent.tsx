import React from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Paperclip, ArrowLeft, Send, SendHorizontal } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "Alice Johnson",
    content:
      "Hi! I'm interested in your startup project. Can we discucaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaass the investment opportunity?",
    timestamp: "10:30 AM",
    isOwn: false,
  },
  {
    id: "2",
    sender: "You",
    content:
      "Absolutely! I'd lovesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss to share more details about our project.",
    timestamp: "10:32 AM",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Alice Johnson",
    content: "Great! What's your current traction and revenue model?",
    timestamp: "10:35 AM",
    isOwn: false,
  },
  {
    id: "4",
    sender: "You",
    content:
      "We're currently at 50k MAU with a SaaS model generating $25k MRR. Our growth rate is 15% MoM.",
    timestamp: "10:37 AM",
    isOwn: true,
  },
  {
    id: "5",
    sender: "Alice Johnson",
    content:
      "Impressive numbers! I'd like to schedule a call to discuss potential investment terms.",
    timestamp: "10:40 AM",
    isOwn: false,
  },
];

export default function ChatComponent({
  onOpenConversations,
}: {
  onOpenConversations?: () => void;
}) {
  const [messages, setMessages] = React.useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  const handleSend = () => {
    if (inputValue.trim() === "") return;
    setMessages((prev) => [
      ...prev,
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
    if (textareaRef.current) textareaRef.current.focus();
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  return (
    <div className="flex-1 h-full min-h-[40vh] max-h-[70vh] min-w-full sm:min-w-[60vw] md:max-w-[50vw] max-w-[95vw] mx-auto">
      {/* Chat header with avatar and name */}
      <div className="flex items-center gap-3 px-2 sm:px-4 pt-2 pb-3 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-base">Alice Johnson</div>
            <div className="text-xs text-muted-foreground">En ligne</div>
          </div>
        </div>
        {onOpenConversations && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConversations}
            className="lg:hidden ml-auto"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-col h-[calc(100%-72px)] p-0">
        <div
          className="flex-1 px-2 sm:px-4 overflow-y-auto min-h-[30vh]"
          ref={messagesContainerRef}
        >
          {/* System message at the start of a new conversation */}
          <div className="flex items-center gap-3 justify-center py-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-sm">Alice Johnson</span>
              <span className="block text-xs text-muted-foreground">
                Starting conversation with Alice Johnson
              </span>
            </div>
          </div>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {!message.isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    message.isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm break-words whitespace-pre-line">
                    {message.content}
                  </p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t p-2 sticky bottom-0 bg-background z-10">
          <div className="flex gap-2 items-end w-full">
            <Button size="icon" variant="outline" className="shrink-0 h-[48px]">
              <Paperclip className="w-5 h-5" />
            </Button>
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                placeholder="Type your message..."
                className="w-full min-h-[48px] max-h-[120px] pr-12 resize-none"
                rows={1}
                style={{ overflowY: "auto" }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-[36px] w-[36px] p-0 rounded-full bg-black text-white shadow-md group transition-transform duration-200"
                onClick={handleSend}
              >
                <SendHorizontal className="w-6 h-6 text-white transition-transform duration-200 group-hover:rotate-[-45deg] group-active:scale-[1.5] group-active:rotate-[-90deg]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
