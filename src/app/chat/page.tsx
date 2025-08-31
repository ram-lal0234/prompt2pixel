"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatIdFromUrl = searchParams.get('chatId');

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
    loadChats,
    clearChat,
  } = useThumbnailChat();

  const [showSidenav, setShowSidenav] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLoadingChatData, setIsLoadingChatData] = useState(false);
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
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

  // Load chat from URL if provided
  useEffect(() => {
    if (chatIdFromUrl) {
      // Check if this is a temporary chat
      if (chatIdFromUrl.startsWith('temp-')) {
        setIsTemporaryChat(true);
        setSelectedChatId(chatIdFromUrl);
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
      } else {
        setSelectedChatId(chatIdFromUrl);
        setIsLoadingChatData(true);
        handleChatSelect(chatIdFromUrl);
      }
    }
  }, [chatIdFromUrl]);

  const handleChatSelect = async (chatId: string) => {
    // Don't reload if it's the same chat
    if (currentChatId === chatId) {
      return;
    }
    
    // Set selected chat ID immediately to maintain active state
    setSelectedChatId(chatId);
    
    // Check if this is a temporary chat
    if (chatId.startsWith('temp-')) {
      setIsTemporaryChat(true);
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
      return;
    }
    
    setIsLoadingChatData(true);
    setIsTemporaryChat(false);
    try {
      await loadChat(chatId);
      await loadChatFromList(chatId);
      // Update URL to show chat ID
      router.push(`/chat?chatId=${chatId}`, { scroll: false });
    } finally {
      setIsLoadingChatData(false);
    }
    // Close sidenav on mobile after selecting a chat
    if (window.innerWidth < 1024) {
      setShowSidenav(false);
    }
  };

  const handleNewChat = async () => {
    // Create temporary chat without database call
    const tempChatId = `temp-${Date.now()}`;
    setIsTemporaryChat(true);
    setSelectedChatId(tempChatId);
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
    
    // Update URL to show temporary chat
    router.push(`/chat?chatId=${tempChatId}`, { scroll: false });
    
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
      let chatIdToUse = currentChatId;
      
      // If this is a temporary chat, we need to create a real chat
      if (isTemporaryChat) {
        // Create a new chat with the video title or "New Chat"
        const newChat = await createChat(thumbnailConfig.videoTitle || "New Chat");
        if (newChat) {
          chatIdToUse = newChat.id;
          setIsTemporaryChat(false);
          // Update URL to show real chat ID
          router.push(`/chat?chatId=${newChat.id}`, { scroll: false });
        }
      }

      const chatId = await generateThumbnail(
        thumbnailConfig,
        chatIdToUse || undefined
      );

      // Update the chat list to reflect the new chat
      if (isTemporaryChat || (!currentChatId && chatId)) {
        // This is a new chat, refresh the chat list
        await loadChats();
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
        activeChatId={isTemporaryChat ? `temp-${Date.now()}` : selectedChatId || currentChat?.id || currentChatId || undefined}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onStarChat={handleStarChat}
        isSidenavLoading={false}
        // Chat props
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isLoadingChatData}
        isGenerating={isGenerating}
        // Config props
        thumbnailConfig={thumbnailConfig}
        onConfigChange={handleConfigChange}
        onGenerate={handleGenerateThumbnail}
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
        // Memory props
        memory={messages
          .filter(msg => msg.thumbnailData && msg.role === 'assistant')
          .map(msg => {
            // Use stored config data if available, otherwise extract from message
            let config = {
              videoTitle: 'Custom Thumbnail',
              primaryColor: "#DC2626",
              secondaryColor: "#2563EB",
              niche: "entertainment",
              size: "16:9",
            };
            
            if (msg.configData) {
              // Use the stored config data
              config = {
                videoTitle: msg.configData.videoTitle,
                primaryColor: msg.configData.primaryColor,
                secondaryColor: msg.configData.secondaryColor,
                niche: msg.configData.niche,
                size: msg.configData.size,
              };
            } else {
              // Fallback: try to extract video title from message content
              const titleMatch = msg.content.match(/🎉.*?for\s*"([^"]+)".*/);
              if (titleMatch) {
                config.videoTitle = titleMatch[1];
              }
            }
            
            return {
              id: msg.id,
              title: msg.content,
              thumbnailData: msg.thumbnailData!,
              referenceImageData: msg.referenceImageData,
              timestamp: msg.timestamp,
              config
            };
          })}
        onModifyThumbnail={(item) => {
          // Load item config and open thumbnail config
          setThumbnailConfig({
            videoTitle: item.config.videoTitle,
            description: item.title,
            primaryColor: item.config.primaryColor,
            secondaryColor: item.config.secondaryColor,
            defaultImage: "",
            defaultImagePreview: item.referenceImageData ? `data:image/png;base64,${item.referenceImageData}` : "",
            niche: item.config.niche,
            size: item.config.size,
          });
        }}
        onRegenerateThumbnail={(item) => {
          // Regenerate thumbnail with item config
          const config = {
            videoTitle: item.config.videoTitle,
            description: item.title,
            primaryColor: item.config.primaryColor,
            secondaryColor: item.config.secondaryColor,
            defaultImage: "",
            defaultImagePreview: item.referenceImageData ? `data:image/png;base64,${item.referenceImageData}` : "",
            niche: item.config.niche,
            size: item.config.size,
          };
          setThumbnailConfig(config);
          
          // If this is a temporary chat, we need to create a real chat first
          if (isTemporaryChat) {
            handleGenerateThumbnail();
          } else {
            generateThumbnail(config, currentChatId || undefined);
          }
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
