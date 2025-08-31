'use client';

import { useState, useRef } from 'react';
import { Message, MessageContent, MessageAvatar } from '@/components/message';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/conversation';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from '@/components/prompt-input';
import { cn } from '@/lib/utils';
import { Send, Bot, Eye, Download, Paperclip, X, Sparkles } from 'lucide-react';
import { ImageViewModal } from '@/components/image-view-modal';
import { ChatSkeleton } from '@/components/chat/chat-skeleton';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  thumbnailData?: string;
  referenceImageData?: string; // Base64 data for reference image used
  configData?: any; // Config data used for thumbnail generation
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string, attachedFiles?: AttachedFile[]) => void;
  isLoading?: boolean;
  isGenerating?: boolean;
  className?: string;
}

export function ChatPanel({ 
  messages, 
  onSendMessage, 
  isLoading = false,
  isGenerating = false,
  className
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((input.trim() || attachedFiles.length > 0) && !isLoading) {
      onSendMessage(input.trim(), attachedFiles);
      setInput("");
      setAttachedFiles([]);
    }
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert(
          `File size must be less than 5MB. Selected file: ${(
            file.size /
            1024 /
            1024
          ).toFixed(1)}MB`
        );
        event.target.value = "";
        return;
      }

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        event.target.value = "";
        return;
      }

      // Create a file object and add it to attached files
      const attachedFile: AttachedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
      };

      // If it's an image, create a URL for preview
      if (file.type.startsWith("image/")) {
        attachedFile.url = URL.createObjectURL(file);
      }

      setAttachedFiles((prev) => [...prev, attachedFile]);

      // Clear the input
      event.target.value = "";
    }
  };

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles((prev) => {
      const fileToRemove = prev.find(file => file.id === fileId);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter((file) => file.id !== fileId);
    });
  };

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



  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-900", className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <Conversation>
          <ConversationContent className="pb-24">
            {messages.length === 0 ? (
              isLoading ? (
                <div className="p-4 space-y-4">
                  {/* User Message Skeleton */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] space-y-2">
                      <div className="h-4 bg-blue-200 dark:bg-blue-900/30 rounded-lg animate-pulse w-32" />
                      <div className="h-4 bg-blue-200 dark:bg-blue-900/30 rounded-lg animate-pulse w-48" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 ml-auto" />
                    </div>
                  </div>

                  {/* AI Message Skeleton */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-40" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-56" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-36" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
                    </div>
                  </div>

                  {/* Thumbnail Skeleton */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-32" />
                      <div className="w-64 h-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                    Start Chatting
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    Ask questions about your generated thumbnail, request modifications, or get design suggestions
                  </p>
                </div>
              )
            ) : (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageAvatar
                    src={
                      message.role === "user"
                        ? "/user-avatar.png"
                        : "/bot-avatar.png"
                    }
                    name={message.role === "user" ? "You" : "AI Assistant"}
                  />
                  <MessageContent>
                    {message.content}

                    {/* Display reference images in user messages */}
                    {message.referenceImageData && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="relative">
                          <img
                            src={`data:image/png;base64,${message.referenceImageData}`}
                            alt="Reference image"
                            className="max-w-32 max-h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      </div>
                    )}

                    {/* Display generated thumbnail */}
                    {message.thumbnailData && (
                      <div className="mt-3">
                        <div className="relative group inline-block">
                          <img
                            src={`data:image/png;base64,${message.thumbnailData}`}
                            alt="Generated thumbnail"
                            className="max-w-64 max-h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openImageModal(message.thumbnailData!)}
                              className="bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm"
                              title="View full size"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadImage(message.thumbnailData!, `prompt2pixel-${Date.now()}.png`)}
                              className="bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm"
                              title="Download image"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </MessageContent>
                </Message>
              ))
            )}
            
            {/* Generating Indicator */}
            {isGenerating && messages.length > 0 && (
              <div className="flex justify-start p-4">
                <div className="max-w-[80%] space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Generating...
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </ConversationContent>

          <ConversationScrollButton className="bottom-28" />
        </Conversation>
      </div>

      {/* Sticky Input Area */}
      <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <PromptInput onSubmit={handleSubmit}>
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="p-3">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="relative group">
                    {file.type.startsWith("image/") && file.url ? (
                      <div className="relative">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttachedFile(file.id)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm">
                        <Paperclip className="w-4 h-4" />
                        <span className="truncate max-w-32">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachedFile(file.id)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your thumbnail, request changes, or generate a new one..."
            disabled={isGenerating}
          />

          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton
                onClick={handleAttachFile}
                disabled={isGenerating}
                title="Attach image"
              >
                <Paperclip className="w-4 h-4" />
              </PromptInputButton>
            </PromptInputTools>

            <PromptInputSubmit
              disabled={(!input.trim() && attachedFiles.length === 0) || isGenerating}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </PromptInputSubmit>
          </PromptInputToolbar>
        </PromptInput>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Image View Modal */}
      {modalImage && (
        <ImageViewModal
          imageData={modalImage}
          isOpen={isModalOpen}
          onClose={closeImageModal}
          fileName="prompt2pixel-thumbnail"
        />
      )}
    </div>
  );
}
