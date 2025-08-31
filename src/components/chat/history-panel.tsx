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
        {filteredHistory.length === 0 ? (
          <div className="p-6 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No results found" : "No history yet"}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Your generated thumbnails will appear here"
              }
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                  selectedItem === item.id
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                onClick={() => handleItemClick(item)}
              >
                {/* Thumbnail Preview */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={`data:image/png;base64,${item.thumbnailData}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.timestamp)}
                      </span>
                      <span className="capitalize">{item.config.niche}</span>
                      <span>{item.config.size}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement view full size
                        }}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        title="View full size"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(item.thumbnailData, `${item.title}-${Date.now()}.png`);
                        }}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleItemDelete(e, item.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {history.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{filteredHistory.length} of {history.length} items</span>
            <span>Last updated: {formatDate(new Date())}</span>
          </div>
        </div>
      )}
    </div>
  );
}
