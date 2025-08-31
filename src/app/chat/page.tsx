'use client';

import { useState, useEffect } from 'react';
import { Sidenav } from '@/components/chat/sidenav';
import { ChatInterface } from '@/components/chat/chat-interface';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, Loader2 } from 'lucide-react';
import { useChat } from '@/hooks/use-chat';
import { ClientOnly } from '@/components/client-only';


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
  const {
    chats,
    currentChat,
    isLoading,
    error,
    createChat,
    loadChat,
    deleteChat,
    toggleChatStar
  } = useChat();

  const [showSidenav, setShowSidenav] = useState(false);

  const handleChatSelect = async (chatId: string) => {
    await loadChat(chatId);
    // Close sidenav on mobile after selecting a chat
    if (window.innerWidth < 1024) {
      setShowSidenav(false);
    }
  };

  const handleNewChat = async () => {
    const newChat = await createChat('New Chat');
    if (newChat) {
      await loadChat(newChat.id);
    }
    // Close sidenav on mobile after creating a new chat
    if (window.innerWidth < 1024) {
      setShowSidenav(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteChat(chatId);
  };

  const handleStarChat = async (chatId: string, isStarred: boolean) => {
    await toggleChatStar(chatId, isStarred);
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
            activeChatId={currentChat?.id || undefined}
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
              chatId={currentChat?.id || undefined}
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
        <ClientOnly fallback={<LoadingSpinner />}>
          <ChatPageContent />
        </ClientOnly>
      </SignedIn>
      <SignedOut>
        <AuthRequiredMessage />
      </SignedOut>
    </>
  );
}
