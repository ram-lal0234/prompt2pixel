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
import { Send, Bot, Eye, Download, Paperclip, X } from 'lucide-react';
import { ImageViewModal } from '@/components/image-view-modal';

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

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string, attachedFiles?: AttachedFile[]) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatPanel({ 
  messages, 
  onSendMessage, 
  isLoading = false,
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

                {/* Quick suggestions */}
                <div className="grid grid-cols-1 gap-3 max-w-md w-full">
                  <button
                    onClick={() => onSendMessage("How can I improve this thumbnail?")}
                    className="p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      💡 How can I improve this thumbnail?
                    </p>
                  </button>
                  <button
                    onClick={() => onSendMessage("What colors would work better?")}
                    className="p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      🎨 What colors would work better?
                    </p>
                  </button>
                  <button
                    onClick={() => onSendMessage("Can you suggest a different style?")}
                    className="p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ✨ Can you suggest a different style?
                    </p>
                  </button>
                </div>
              </div>
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

                    {/* Display generated thumbnail */}
                    {message.thumbnailData && (
                      <div className="mt-6 p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border border-red-200 dark:border-red-800 shadow-lg">
                        <h4 className="font-bold text-red-800 dark:text-red-200 mb-4 text-lg flex items-center gap-2">
                          <span className="text-xl">🎨</span>
                          Generated Thumbnail
                        </h4>
                        <div className="flex justify-center">
                          <div className="max-w-2xl w-full">
                            <div className="relative group">
                              <div className="aspect-video bg-white dark:bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-xl">
                                <img
                                  src={`data:image/png;base64,${message.thumbnailData}`}
                                  alt="Generated thumbnail"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openImageModal(message.thumbnailData!)}
                                  className="bg-gray-800/90 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm shadow-lg"
                                  title="View full size"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => downloadImage(message.thumbnailData!, `prompt2pixel-${Date.now()}.png`)}
                                  className="bg-gray-800/90 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm shadow-lg"
                                  title="Download image"
                                >
                                  <Download className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </MessageContent>
                </Message>
              ))
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
            placeholder="Ask about your thumbnail or request changes..."
            disabled={isLoading}
          />

          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton
                onClick={handleAttachFile}
                disabled={isLoading}
                title="Attach image"
              >
                <Paperclip className="w-4 h-4" />
              </PromptInputButton>
            </PromptInputTools>

            <PromptInputSubmit
              disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all"
            >
              <Send className="w-4 h-4" />
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
