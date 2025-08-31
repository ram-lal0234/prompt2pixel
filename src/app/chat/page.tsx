'use client';

import { useState } from 'react';
import { Sidenav } from '@/components/chat/sidenav';
import { ChatInterface } from '@/components/chat/chat-interface';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, Loader2 } from 'lucide-react';


interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isStarred?: boolean;
}

// Mock data for demonstration
const mockChats: Chat[] = [
  {
    id: '1',
    title: 'YouTube Thumbnail Ideas',
    lastMessage: 'What are some trending thumbnail styles for tech videos?',
    timestamp: '2 hours ago',
    isStarred: true
  },
  {
    id: '2',
    title: 'AI Image Generation Tips',
    lastMessage: 'How can I improve my AI-generated thumbnails?',
    timestamp: '1 day ago'
  },
  {
    id: '3',
    title: 'Content Strategy Discussion',
    lastMessage: 'What\'s the best posting schedule for YouTube?',
    timestamp: '3 days ago'
  }
];

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading chat interface...</p>
      </div>
    </div>
  );
}

function ChatPageContent() {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showSidenav, setShowSidenav] = useState(false);

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    // Close sidenav on mobile after selecting a chat
    if (window.innerWidth < 1024) {
      setShowSidenav(false);
    }
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      lastMessage: 'Start a new conversation...',
      timestamp: 'Just now'
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    // Close sidenav on mobile after creating a new chat
    if (window.innerWidth < 1024) {
      setShowSidenav(false);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const handleStarChat = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isStarred: !chat.isStarred }
        : chat
    ));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20">
      {/* Main Content */}
      <div className="flex h-full">
        {/* Mobile Overlay */}
        {showSidenav && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSidenav(false)}
          />
        )}

        {/* Sidenav */}
        <div className={`
          fixed lg:relative lg:block
          ${showSidenav ? 'block' : 'hidden lg:block'}
          lg:w-80 w-80
          h-full
          z-50 lg:z-auto
          transition-all duration-300 ease-in-out
        `}>
          <Sidenav
            chats={chats}
            activeChatId={activeChatId || undefined}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onStarChat={handleStarChat}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile Toggle Button */}
          <div className="lg:hidden p-2 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowSidenav(!showSidenav)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 min-h-0">
            <ChatInterface
              chatId={activeChatId || undefined}
              onNewChat={handleNewChat}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthRequiredMessage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Authentication Required
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          You need to be signed in to access the chat interface. Sign in to start creating amazing thumbnails with AI.
        </p>
        <SignInButton mode="modal">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Sign In to Continue
            <ArrowRight className="ml-3 w-5 h-5" />
          </Button>
        </SignInButton>
      </div>
    </div>
  );
}

export default function ChatPage() {
  console.log('ChatPage component rendered');
  
  return (
    <>
      <SignedIn>
        <ChatPageContent />
      </SignedIn>
      <SignedOut>
        <AuthRequiredMessage />
      </SignedOut>
    </>
  );
}
