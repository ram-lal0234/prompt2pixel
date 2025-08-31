"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Search,
  MessageSquare,
  Plus,
  Trash2,
  MoreVertical,
  Star,
  User,
  Home,
  Image,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SidenavSkeleton } from "@/components/chat/sidenav-skeleton";

import type { Database } from '@/lib/supabase'

type Chat = Database['public']['Tables']['chats']['Row']

interface SidenavProps {
  className?: string;
  chats?: Chat[];
  activeChatId?: string;
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
  onDeleteChat?: (chatId: string) => void;
  onStarChat?: (chatId: string, isStarred: boolean) => void;
  isLoading?: boolean;
}

export function Sidenav({
  className,
  chats = [],
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onStarChat,
  isLoading = false,
}: SidenavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { user } = useUser();

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div
      className={cn(
        "sticky top-0 h-screen flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
        className
      )}
    >
      {/* Navigation Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center">
          <img src="/Prompt2Pixel_logo.png" alt="Thumb AI" className="w-full h-16" />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="flex-shrink-0 p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? "No chats found" : "No chats yet"}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={() => onChatSelect?.(chat.id)}
                onDelete={() => onDeleteChat?.(chat.id)}
                onStar={() => onStarChat?.(chat.id, !chat.is_starred)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} alt={user?.firstName || "User"} />
            <AvatarFallback className="bg-red-100 text-red-600">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onStar: () => void;
}

function ChatItem({
  chat,
  isActive,
  onSelect,
  onDelete,
  onStar,
}: ChatItemProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isActive
          ? "bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-100"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm truncate">{chat.title}</h3>
          {chat.is_starred && (
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onStar();
            }}
          >
            <Star
              className={cn(
                "w-3 h-3",
                chat.is_starred
                  ? "text-yellow-500 fill-current"
                  : "text-gray-400"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
