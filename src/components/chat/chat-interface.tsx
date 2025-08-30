"use client";

import { useState, useRef } from "react";
import { Sidenav } from "@/components/chat/sidenav";
import { Message, MessageContent, MessageAvatar } from "@/components/message";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/conversation";
import { Image } from "@/components/image";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/prompt-input";
import { cn } from "@/lib/utils";
import { Paperclip, Send, Bot, Loader2, X, Download, Eye } from "lucide-react";
import { staticRes } from "@/lib/ai/static-res";
import { ImageViewModal } from "@/components/image-view-modal";
import { ThumbnailConfig, ThumbnailConfig as ThumbnailConfigType } from "./thumbnail-config";
import { ThumbnailPreview } from "./thumbnail-preview";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isRejection?: boolean;
  images?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  thumbnailData?: string; // Base64 data for generated thumbnails
  originalRequest?: string;
  rewrittenQuery?: string;
  originalTitle?: string;
  rewrittenTitle?: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface ChatInterfaceProps {
  className?: string;
  chatId?: string;
  onNewChat?: () => void;
}

export function ChatInterface({
  className,
  chatId,
  onNewChat,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [thumbnailConfig, setThumbnailConfig] = useState<ThumbnailConfigType>({
    videoTitle: '',
    primaryColor: '#DC2626',
    secondaryColor: '#2563EB',
    defaultImage: '',
    defaultImagePreview: '',
    niche: 'education',
    size: '16:9',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to convert image URL to base64
  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix to get just the base64 data
          const base64Data = base64String.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return "";
    }
  };

  const handleConfigChange = (newConfig: ThumbnailConfigType) => {
    setThumbnailConfig(newConfig);
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
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

  const openImageModal = (imageData: string) => {
    setModalImage(imageData);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      // Create user message with just the text input (no file info in content)
      const messageContent = input;

      // Separate images from other files
      const images = attachedFiles.filter((file) =>
        file.type.startsWith("image/")
      );
      const otherFiles = attachedFiles.filter(
        (file) => !file.type.startsWith("image/")
      );

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageContent,
        timestamp: new Date(),
        images: images.map((file) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.url || "",
        })),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setAttachedFiles([]); // Clear attached files after sending
      setIsLoading(true);
      setError(null);

      try {
        // const response = await fetch("/api/generate-thumbnail", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     prompt: messageContent,
        //     config: thumbnailConfig, // Include thumbnail configuration
        //     imageData:
        //       images.length > 0 && images[0].url
        //         ? await convertImageToBase64(images[0].url)
        //         : undefined,
        //     imageMimeType: images.length > 0 ? images[0].type : undefined,
        //   }),
        // });

        const result = staticRes;

        // if (!response.ok) {
        //   throw new Error(result.error || "Failed to get response");
        // }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Here's your generated thumbnail!",
          timestamp: new Date(),
          thumbnailData: result.imageData,
          originalTitle: result.originalTitle,
          rewrittenTitle: result.rewrittenTitle,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get response");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setAttachedFiles([]);
    setError(null);
    onNewChat?.();
  };

  const handleReload = () => {
    // TODO: Implement reload functionality
    console.log("Reload clicked");
  };

  const handleStop = () => {
    setIsLoading(false);
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
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleDownloadChat = () => {
    // TODO: Implement chat download
    console.log("Download chat clicked");
  };

  const handleShareChat = () => {
    // TODO: Implement chat sharing
    console.log("Share chat clicked");
  };

  return (
    <div className={cn("flex h-full", className)}>
              {/* Main Chat Area - Center */}
        <div className="flex-1 flex flex-col lg:mr-80">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4">
            <Conversation>
              <ConversationContent className="pb-24">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Bot className="w-16 h-16 text-blue-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Welcome to Prompt2Pixel
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                      I'm your specialized assistant for AI image generation.
                      Transform your ideas into stunning images with prompt-based
                      generation technology.
                    </p>
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
                      <MessageContent
                        className={
                          message.isRejection
                            ? "border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                            : ""
                        }
                      >
                        {message.isRejection && (
                          <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400">
                            <span className="text-sm font-medium">
                              ⚠️ Topic Outside Scope
                            </span>
                          </div>
                        )}
                        {message.content}

                        {/* Display uploaded images */}
                        {message.images && message.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.images.map((image) => (
                              <div key={image.id} className="relative">
                                <img
                                  src={image.url}
                                  alt={image.name}
                                  className="max-w-48 max-h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Display generated thumbnail */}
                        {message.thumbnailData && (
                          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                              🎨 Generated Image
                            </h4>
                            <div className="flex flex-wrap gap-4">
                              <div className="relative group">
                                <img
                                  src={`data:image/png;base64,${message.thumbnailData}`}
                                  alt="Generated image"
                                  className="max-w-64 max-h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                                <div className="absolute top-2 right-2 flex gap-1">
                                  <button
                                    onClick={() => openImageModal(message.thumbnailData!)}
                                    className="bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                    title="View image"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => downloadImage(message.thumbnailData!, `prompt2pixel-${Date.now()}.png`)}
                                    className="bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                    title="Download image"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </MessageContent>
                    </Message>
                  ))
                )}

                {error && (
                  <Message from="assistant">
                    <MessageAvatar src="/bot-avatar.png" name="AI Assistant" />
                    <MessageContent className="text-red-600 dark:text-red-400">
                      Sorry, I encountered an error: {error}
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>

              <ConversationScrollButton className="bottom-28" />
            </Conversation>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Fixed Input Area */}
        <div className="sticky bottom-0 p-4">
          <div className="max-w-4xl mx-auto">
            <PromptInput onSubmit={handleFormSubmit}>
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
                placeholder="Describe what you want to create or ask about thumbnails... "
                disabled={isLoading}
              />

              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputButton
                    onClick={handleAttachFile}
                    disabled={isLoading}
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </PromptInputButton>
                </PromptInputTools>

                <PromptInputSubmit
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </PromptInputSubmit>
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Thumbnail Configuration */}
      <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm fixed right-0 top-0 h-full overflow-y-auto">
        <div className="p-4">
          <ThumbnailConfig
            config={thumbnailConfig}
            onConfigChange={handleConfigChange}
          />
        </div>
      </div>

      {/* Image View Modal */}
      {modalImage && (
        <ImageViewModal
          isOpen={isModalOpen}
          onClose={closeImageModal}
          imageData={modalImage}
          alt="Generated image"
          onDownload={(imageData) => downloadImage(imageData, `prompt2pixel-${Date.now()}.png`)}
        />
      )}

      {/* Thumbnail Preview Modal */}
      <ThumbnailPreview
        config={thumbnailConfig}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
