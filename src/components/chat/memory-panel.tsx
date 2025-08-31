"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Brain, 
  Download, 
  Eye, 
  RefreshCw,
  Image as ImageIcon,
  Plus
} from "lucide-react";
import { ImageViewModal } from "@/components/image-view-modal";

interface MemoryItem {
  id: string;
  title: string;
  thumbnailData: string;
  referenceImageData?: string;
  timestamp: Date;
  config: {
    videoTitle: string;
    primaryColor: string;
    secondaryColor: string;
    niche: string;
    size: string;
  };
}

interface MemoryPanelProps {
  className?: string;
  memory?: MemoryItem[];
  onModifyThumbnail?: (item: MemoryItem) => void;
  onRegenerateThumbnail?: (item: MemoryItem) => void;
}

export function MemoryPanel({
  className,
  memory = [],
  onModifyThumbnail,
  onRegenerateThumbnail,
}: MemoryPanelProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openImageModal = (imageData: string) => {
    setModalImage(imageData);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
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
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours}h ago`;
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Chat Memory
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {memory.length} thumbnails in this chat
            </p>
          </div>
        </div>
      </div>

      {/* Memory List */}
      <div className="flex-1 overflow-y-auto">
        {memory.length === 0 ? (
          <div className="p-6 text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              No thumbnails yet
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Generate thumbnails to see them here for easy reference
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                💡 Quick Actions:
              </h5>
              <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Generate thumbnails to add them here</li>
                <li>• Click on thumbnails to modify them</li>
                <li>• Regenerate with different settings</li>
                <li>• Download your favorites</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {memory.map((item) => (
              <div
                key={item.id}
                className="group relative p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-md"
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
                      {item.config.videoTitle || item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="capitalize">{item.config.niche}</span>
                      <span>•</span>
                      <span>{item.config.size}</span>
                      <span>•</span>
                      <span>{formatDate(item.timestamp)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openImageModal(item.thumbnailData)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        title="View full size"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => downloadImage(item.thumbnailData, `${item.config.videoTitle || item.title}-${Date.now()}.png`)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onModifyThumbnail?.(item)}
                        className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                        title="Modify"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRegenerateThumbnail?.(item)}
                        className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image View Modal */}
      {modalImage && (
        <ImageViewModal
          isOpen={isModalOpen}
          onClose={closeImageModal}
          imageData={modalImage}
          fileName="memory-thumbnail"
        />
      )}
    </div>
  );
}
