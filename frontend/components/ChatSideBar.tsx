import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string; // ex: "AJ"
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Eliott Tesnier",
    lastMessage: "Pourquoi tu code du devrais prompter?",
    timestamp: "10:40 AM",
    unreadCount: 1,
    avatar: "ET",
  },
  {
    id: "2",
    name: "Bob Smith",
    lastMessage: "Thanks for the update!",
    timestamp: "Yesterday",
    unreadCount: 0,
    avatar: "BS",
  },
  {
    id: "3",
    name: "Carol Davis",
    lastMessage: "Looking forward to our meeting",
    timestamp: "2 days ago",
    unreadCount: 3,
    avatar: "CD",
  },
  {
    id: "4",
    name: "David Wilson",
    lastMessage: "Can you send me the pitch deck?",
    timestamp: "1 week ago",
    unreadCount: 0,
    avatar: "DW",
  },
];

export default function ChatSideBar({
  onSelect,
}: {
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button size="sm" variant="outline" aria-label="Nouvelle conversation">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {mockConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect?.(conversation.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 cursor-pointer transition-all duration-200 border border-transparent hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage
                  src={`/avatars/${conversation.avatar}.jpg`}
                  alt={conversation.name}
                />
                <AvatarFallback>{conversation.avatar}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm truncate">{conversation.name}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {conversation.timestamp}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.lastMessage}
                </p>
              </div>

              {conversation.unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 shrink-0">
                  {conversation.unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}