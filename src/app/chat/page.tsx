"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ClientOnly } from "@/components/client-only";
import { EnhancedLayout } from "@/components/layout/enhanced-layout";
import { useThumbnailChat } from "@/hooks/use-thumbnail-chat";
import { ThumbnailConfig } from "@/components/chat/thumbnail-config";

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">
          Loading chat interface...
        </p>
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
    loadChat: loadChatFromList,
    deleteChat,
    toggleChatStar,
  } = useChat();

  const {
    messages,
    isGenerating,
    error: chatError,
    currentChatId,
    generateThumbnail,
    sendMessage,
    loadChat,
    clearChat,
  } = useThumbnailChat();

  const [showSidenav, setShowSidenav] = useState(true);
  const [thumbnailConfig, setThumbnailConfig] = useState<ThumbnailConfig>({
    videoTitle: "",
    description: "",
    primaryColor: "#DC2626",
    secondaryColor: "#2563EB",
    defaultImage: "",
    defaultImagePreview: "",
    niche: "education",
    size: "16:9",
  });

  const handleChatSelect = async (chatId: string) => {
    await loadChat(chatId);
    // Close sidenav on mobile after selecting a chat
    if (window.innerWidth < 1024) {
      setShowSidenav(false);
    }
  };

  const handleNewChat = async () => {
    const newChat = await createChat("New Chat");
    if (newChat) {
      await loadChatFromList(newChat.id);
    }
    clearChat();
    setThumbnailConfig({
      videoTitle: "",
      description: "",
      primaryColor: "#DC2626",
      secondaryColor: "#2563EB",
      defaultImage: "",
      defaultImagePreview: "",
      niche: "education",
      size: "16:9",
    });
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

  const handleGenerateThumbnail = async () => {
    try {
      const chatId = await generateThumbnail(
        thumbnailConfig,
        currentChatId || undefined
      );

      // Update the chat list to reflect the new chat
      if (!currentChatId) {
        // This is a new chat, refresh the chat list
        // The useChat hook should handle this automatically
      }
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
    }
  };

  const handleConfigChange = (newConfig: ThumbnailConfig) => {
    setThumbnailConfig(newConfig);
  };

  const handleToggleSidenav = () => {
    setShowSidenav(!showSidenav);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20">
      <EnhancedLayout
        // Sidenav props
        chats={chats}
        activeChatId={currentChat?.id || undefined}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onStarChat={handleStarChat}
        // Chat props
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isGenerating}
        // Config props
        thumbnailConfig={thumbnailConfig}
        onConfigChange={handleConfigChange}
        onGenerate={handleGenerateThumbnail}
        isGenerating={isGenerating}
        // History props
        history={[]} // TODO: Implement history from Supabase
        onHistoryItemSelect={(item) => {
          // TODO: Load item config and regenerate
          console.log("History item selected:", item);
        }}
        onHistoryItemDelete={(itemId) => {
          // TODO: Delete from Supabase
          console.log("History item deleted:", itemId);
        }}
        // Layout state
        showSidenav={showSidenav}
        onToggleSidenav={handleToggleSidenav}
      />
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
          You need to be signed in to access the chat interface. Sign in to
          start creating amazing thumbnails with AI.
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
  console.log("ChatPage component rendered");

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
