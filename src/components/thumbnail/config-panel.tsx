"use client";

import { ThumbnailConfig } from "@/components/chat/thumbnail-config";
import { ThumbnailConfig as ThumbnailConfigType } from "@/components/chat/thumbnail-config";
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { StatusIndicator } from '@/components/ui/loading-states';

interface ConfigPanelProps {
  config: ThumbnailConfigType;
  onConfigChange: (config: ThumbnailConfigType) => void;
  onGenerate: () => void;
  onShowChat?: () => void;
  onToggleCollapse?: () => void;
  isGenerating?: boolean;
  showChatButton?: boolean;
  isCollapsed?: boolean;
  error?: string | null;
  className?: string;
}

export function ConfigPanel({
  config,
  onConfigChange,
  onGenerate,
  onShowChat,
  onToggleCollapse,
  isGenerating = false,
  showChatButton = false,
  isCollapsed = false,
  error = null,
  className,
}: ConfigPanelProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 overflow-y-auto ${className}`}>
      {isCollapsed ? (
        // Collapsed state - just show toggle button
        <div className="h-full flex items-center justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Expand settings"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      ) : (
        // Expanded state - full config panel
        <div className="p-8 max-w-4xl mx-auto">
          {/* Header with collapse button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Thumbnail Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure your thumbnail preferences
                </p>
              </div>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Collapse settings"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <ThumbnailConfig config={config} onConfigChange={onConfigChange} />

          {/* Status Messages */}
          {error && (
            <div className="mt-4">
              <StatusIndicator 
                status="error" 
                message={error}
              />
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onGenerate}
              disabled={isGenerating || !config.videoTitle.trim()}
              className="w-full px-8 py-6 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 hover:from-red-600 hover:via-red-700 hover:to-orange-600 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-4 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl relative overflow-hidden group"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                  <span className="text-lg">Generating your thumbnail...</span>
                </>
              ) : (
                <>
                  <span className="text-3xl">🎨</span>
                  <span>Generate Thumbnail</span>
                  <span className="text-2xl">✨</span>
                </>
              )}
            </button>
            
            {!config.videoTitle.trim() && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center font-medium">
                  ⚠️ Please enter a video title to generate a thumbnail
                </p>
              </div>
            )}

            {/* Mobile Chat Button - Show when thumbnail is generated */}
            {showChatButton && onShowChat && (
              <div className="lg:hidden mt-4">
                <button
                  onClick={onShowChat}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Chat with Thumbnail
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
