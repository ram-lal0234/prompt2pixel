"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Download, 
  Eye, 
  Calendar, 
  Clock,
  Image as ImageIcon,
  Trash2
} from "lucide-react";

interface HistoryItem {
  id: string;
  title: string;
  thumbnailData: string;
  timestamp: Date;
  config: {
    primaryColor: string;
    secondaryColor: string;
    niche: string;
    size: string;
  };
}

interface HistoryPanelProps {
  className?: string;
  history?: HistoryItem[];
  onItemSelect?: (item: HistoryItem) => void;
  onItemDelete?: (itemId: string) => void;
}

export function HistoryPanel({
  className,
  history = [],
  onItemSelect,
  onItemDelete,
}: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const filteredHistory = history.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.config.niche.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item: HistoryItem) => {
    setSelectedItem(item.id);
    onItemSelect?.(item);
  };

  const handleItemDelete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    onItemDelete?.(itemId);
  };

  const downloadImage = (imageData: string, filename: string = 'thumbnail.png') => {
    try {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${imageData}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Generation History
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {history.length} thumbnails generated
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {/* Coming Soon Message */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            History Feature Coming Soon!
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            We're working on saving your generated thumbnails to history. 
            This feature will be available soon!
          </p>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">
              🚀 What's Coming:
            </h5>
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              <li>• Save all generated thumbnails automatically</li>
              <li>• Search and filter your history</li>
              <li>• Download thumbnails anytime</li>
              <li>• View full-size images in modal</li>
              <li>• Modify and regenerate from history</li>
            </ul>
          </div>
        </div>
      </div>


    </div>
  );
}
