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
  avatar: string;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Alice Johnson",
    lastMessage: "I'd like to schedule a call...",
    timestamp: "10:40 AM",
    unreadCount: 1,
    avatar: "AJ",
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

export default function ChatSideBar() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {mockConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted hover:shadow-md cursor-pointer transition-all duration-200 border hover:border-gray-200"
            >
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={`/avatars/${conversation.avatar}.jpg`} />
                <AvatarFallback>{conversation.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">
                    {conversation.name}
                  </p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {conversation.timestamp}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.lastMessage}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 flex-shrink-0">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
