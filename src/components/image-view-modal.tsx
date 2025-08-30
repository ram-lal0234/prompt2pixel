"use client";

import { X, Download } from "lucide-react";
import { useEffect } from "react";

interface ImageViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string;
  alt?: string;
  onDownload?: (imageData: string) => void;
}

export function ImageViewModal({ isOpen, onClose, imageData, alt = "Image", onDownload }: ImageViewModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 max-w-[90vw] max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            View Image
          </h3>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(imageData)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Download image"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Image Container */}
        <div className="p-4">
          <div className="flex items-center justify-center">
            <img
              src={`data:image/png;base64,${imageData}`}
              alt={alt}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
