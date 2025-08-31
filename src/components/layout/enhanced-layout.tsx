"use client";

import { useState, useEffect } from "react";
import { Sidenav } from "@/components/chat/sidenav";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ThumbnailConfig } from "@/components/chat/thumbnail-config";
import { HistoryPanel } from "@/components/chat/history-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  History,
  Palette
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  thumbnailData?: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface ThumbnailConfigType {
  videoTitle: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  defaultImage: string;
  defaultImagePreview?: string;
  niche: string;
  size: string;
}

interface EnhancedLayoutProps {
  className?: string;
  // Sidenav props
  chats?: any[];
  activeChatId?: string;
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
  onDeleteChat?: (chatId: string) => void;
  onStarChat?: (chatId: string, isStarred: boolean) => void;
  // Chat props
  messages?: Message[];
  onSendMessage?: (message: string, attachedFiles?: AttachedFile[]) => void;
  isLoading?: boolean;
  // Config props
  thumbnailConfig?: ThumbnailConfigType;
  onConfigChange?: (config: ThumbnailConfigType) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  // History props
  history?: any[];
  onHistoryItemSelect?: (item: any) => void;
  onHistoryItemDelete?: (itemId: string) => void;
  // Layout state
  showSidenav?: boolean;
  onToggleSidenav?: () => void;
}

type ThirdPanelMode = "config" | "history" | "none";

export function EnhancedLayout({
  className,
  // Sidenav props
  chats = [],
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onStarChat,
  // Chat props
  messages = [],
  onSendMessage,
  isLoading = false,
  uploadedImage,
  // Config props
  thumbnailConfig,
  onConfigChange,
  onGenerate,
  isGenerating = false,
  // History props
  history = [],
  onHistoryItemSelect,
  onHistoryItemDelete,
  // Layout state
  showSidenav = true,
  onToggleSidenav,
}: EnhancedLayoutProps) {
  const [thirdPanelMode, setThirdPanelMode] = useState<ThirdPanelMode>("config");
  const [isThirdPanelCollapsed, setIsThirdPanelCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-show config panel when no messages (initial state)
  useEffect(() => {
    if (messages.length === 0 && thirdPanelMode === "none") {
      setThirdPanelMode("config");
    }
  }, [messages.length, thirdPanelMode]);

  const handleThirdPanelToggle = () => {
    setIsThirdPanelCollapsed(!isThirdPanelCollapsed);
  };

  const handleModeChange = (mode: ThirdPanelMode) => {
    setThirdPanelMode(mode);
    setIsThirdPanelCollapsed(false);
  };

  const renderThirdPanel = () => {
    if (isThirdPanelCollapsed) {
      return (
        <div className="w-12 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-4">
          <button
            onClick={handleThirdPanelToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-4"
            title="Expand panel"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleModeChange("config")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                thirdPanelMode === "config" 
                  ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}
              title="Settings"
            >
              <Palette className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleModeChange("history")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                thirdPanelMode === "history" 
                  ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}
              title="History"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Third Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {thirdPanelMode === "config" && <Palette className="w-5 h-5 text-red-500" />}
            {thirdPanelMode === "history" && <History className="w-5 h-5 text-red-500" />}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {thirdPanelMode === "config" ? "Settings" : "History"}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleModeChange("config")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                thirdPanelMode === "config" 
                  ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}
              title="Settings"
            >
              <Palette className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleModeChange("history")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                thirdPanelMode === "history" 
                  ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}
              title="History"
            >
              <History className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleThirdPanelToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Collapse panel"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Third Panel Content */}
        <div className="flex-1 overflow-y-auto">
          {thirdPanelMode === "config" && thumbnailConfig && onConfigChange && (
            <ThumbnailConfig
              config={thumbnailConfig}
              onConfigChange={onConfigChange}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              showGenerateButton={true}
              className="h-full"
            />
          )}
          
          {thirdPanelMode === "history" && (
            <HistoryPanel
              history={history}
              onItemSelect={onHistoryItemSelect}
              onItemDelete={onHistoryItemDelete}
              className="h-full"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden", className)}>
      {/* Mobile Overlay */}
      {showSidenav && isMobile && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggleSidenav}
        />
      )}

      {/* Sidenav - Fixed */}
      <div className={cn(
        "flex-shrink-0 h-screen",
        isMobile 
          ? "fixed lg:relative z-50" 
          : "relative",
        showSidenav ? "w-80" : "w-0 lg:w-80"
      )}>
        <div className={cn(
          "h-full",
          isMobile && !showSidenav ? "hidden" : "block"
        )}>
          <Sidenav
            chats={chats}
            activeChatId={activeChatId}
            onChatSelect={onChatSelect}
            onNewChat={onNewChat}
            onDeleteChat={onDeleteChat}
            onStarChat={onStarChat}
          />
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <button
              onClick={onToggleSidenav}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Prompt2Pixel
            </h1>
            
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        )}

        {/* Chat Interface - Scrollable */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Panel - Scrollable */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <ChatPanel
              messages={messages}
              onSendMessage={onSendMessage}
              isLoading={isLoading}
              className="flex-1"
            />
          </div>

          {/* Third Panel - Desktop Only */}
          {!isMobile && renderThirdPanel()}
        </div>

        {/* Mobile Third Panel Overlay */}
        {isMobile && thirdPanelMode !== "none" && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {thirdPanelMode === "config" && <Palette className="w-5 h-5 text-red-500" />}
                  {thirdPanelMode === "history" && <History className="w-5 h-5 text-red-500" />}
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {thirdPanelMode === "config" ? "Settings" : "History"}
                  </h3>
                </div>
                
                <button
                  onClick={() => setThirdPanelMode("none")}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="h-[calc(100vh-80px)] overflow-y-auto">
                {thirdPanelMode === "config" && thumbnailConfig && onConfigChange && (
                  <ThumbnailConfig
                    config={thumbnailConfig}
                    onConfigChange={onConfigChange}
                    onGenerate={onGenerate}
                    isGenerating={isGenerating}
                    showGenerateButton={true}
                    className="h-full"
                  />
                )}
                
                {thirdPanelMode === "history" && (
                  <HistoryPanel
                    history={history}
                    onItemSelect={onHistoryItemSelect}
                    onItemDelete={onHistoryItemDelete}
                    className="h-full"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Floating Action Buttons */}
        {isMobile && (
          <div className="lg:hidden fixed bottom-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => handleModeChange("config")}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              title="Settings"
            >
              <Palette className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleModeChange("history")}
              className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg transition-colors"
              title="History"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
