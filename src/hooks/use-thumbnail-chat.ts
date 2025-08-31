import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { ThumbnailConfig } from '@/components/chat/thumbnail-config';
import { chatService } from '@/lib/chat-service';
import { storageService } from '@/lib/storage-service';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  thumbnailData?: string;
  referenceImageData?: string; // Base64 data for reference image used
  configData?: ThumbnailConfig; // Config data used for thumbnail generation
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface UseThumbnailChatReturn {
  messages: Message[];
  isGenerating: boolean;
  error: string | null;
  currentChatId: string | null;
  generateThumbnail: (config: ThumbnailConfig, chatId?: string) => Promise<string>;
  sendMessage: (content: string, attachedFiles?: AttachedFile[], chatId?: string) => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  loadChats: () => Promise<any[]>;
  clearChat: () => void;
}

export function useThumbnailChat(): UseThumbnailChatReturn {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const generateThumbnail = useCallback(async (config: ThumbnailConfig, chatId?: string): Promise<string> => {
    if (!user) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    if (!config.videoTitle.trim()) {
      setError('Please enter a video title');
      throw new Error('Please enter a video title');
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Ensure user exists in database
      let dbUser = await chatService.getUserByClerkId(user.id);
      if (!dbUser) {
        dbUser = await chatService.createUser(user.id, user.emailAddresses[0]?.emailAddress);
      }

      if (!dbUser) {
        throw new Error('Failed to create or retrieve user');
      }

      // Create or get chat
      let chatIdToUse = chatId;
      if (!chatIdToUse || chatIdToUse.startsWith('temp-')) {
        const newChat = await chatService.createChat({
          userId: dbUser.id,
          title: config.videoTitle
        });
        chatIdToUse = newChat.id;
        setCurrentChatId(chatIdToUse);
      }

      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: `Generate a thumbnail for: ${config.videoTitle}`,
        timestamp: new Date(),
        referenceImageData: config.defaultImagePreview ? config.defaultImagePreview.split(',')[1] : undefined,
      };

      setMessages(prev => [...prev, userMessage]);

      // Save user message to Supabase
      await chatService.createMessage({
        chatId: chatIdToUse,
        role: "user",
        content: userMessage.content,
        thumbnailData: undefined,
        configData: config,
      });

      // Prepare the payload
      const payload = {
        prompt: config.videoTitle,
        config: config,
        imageData: config.defaultImagePreview ? await convertImageToBase64(config.defaultImagePreview) : undefined,
      };

      console.log("Sending payload to generate-thumbnail API:", {
        prompt: payload.prompt,
        config: payload.config,
        hasImageData: !!payload.imageData,
        imageDataLength: payload.imageData?.length || 0
      });

      // Call the API to generate thumbnail
      const response = await fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate thumbnail");
      }

      // Create AI message with the generated thumbnail
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `🎉 Your thumbnail for "${config.videoTitle}" has been generated successfully! You can ask me questions about it or request modifications.`,
        timestamp: new Date(),
        thumbnailData: result.imageData,
      };

      setMessages(prev => [...prev, aiMessage]);

              // Save AI message to Supabase
        await chatService.createMessage({
          chatId: chatIdToUse,
          role: "assistant",
          content: aiMessage.content,
          thumbnailData: result.imageData,
          configData: undefined,
        });

      return chatIdToUse;

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate thumbnail");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      // Check if it's already a data URL
      if (imageUrl.startsWith('data:')) {
        // Extract the base64 data from the data URL
        const base64Data = imageUrl.split(',')[1];
        return base64Data;
      }

      // If it's a regular URL, fetch and convert
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
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

  const loadChat = useCallback(async (chatId: string) => {
    try {
      setCurrentChatId(chatId);
      const messages = await chatService.getMessages(chatId);
                    setMessages(messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        thumbnailData: msg.thumbnail_data || undefined,
        // Only add reference image data to user messages
        referenceImageData: msg.role === 'user' && msg.config_data?.defaultImagePreview ? msg.config_data.defaultImagePreview.split(',')[1] : undefined,
      })));
    } catch (error) {
      console.error('Failed to load chat:', error);
      setError('Failed to load chat');
    }
  }, []);

  const sendMessage = useCallback(async (content: string, attachedFiles?: AttachedFile[], chatId?: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (!content.trim() && (!attachedFiles || attachedFiles.length === 0)) return;

    const chatIdToUse = chatId || currentChatId;
    if (!chatIdToUse) {
      setError('No active chat');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Ensure user exists in database
      let dbUser = await chatService.getUserByClerkId(user.id);
      if (!dbUser) {
        dbUser = await chatService.createUser(user.id, user.emailAddresses[0]?.emailAddress);
      }

      if (!dbUser) {
        throw new Error('Failed to create or retrieve user');
      }

      // Check if this is a thumbnail generation request
      const isThumbnailRequest = content.toLowerCase().includes('generate') || 
                                content.toLowerCase().includes('create') || 
                                content.toLowerCase().includes('make') ||
                                (attachedFiles && attachedFiles.length > 0);

      if (isThumbnailRequest) {
        // Generate thumbnail from chat
        let imageData: string | undefined;
        if (attachedFiles && attachedFiles.length > 0) {
          // Convert attached image to base64
          imageData = await convertImageToBase64(attachedFiles[0].url!);
        }

        // Create a basic config from the message
        const config: ThumbnailConfig = {
          videoTitle: content.replace(/generate|create|make/gi, '').trim() || 'Custom Thumbnail',
          description: content,
          primaryColor: '#DC2626',
          secondaryColor: '#2563EB',
          defaultImage: attachedFiles?.[0]?.name || '',
          defaultImagePreview: attachedFiles?.[0]?.url || '',
          niche: 'entertainment',
          size: '16:9',
        };

        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: content,
          timestamp: new Date(),
          referenceImageData: imageData, // Include the reference image in user message
        };

        setMessages(prev => [...prev, userMessage]);

        // Save user message to Supabase
        await chatService.createMessage({
          chatId: chatIdToUse,
          role: "user",
          content: content,
          thumbnailData: undefined,
          configData: config,
        });

        // Prepare the payload for chat-based generation
        const payload = {
          prompt: content,
          config: config,
          imageData: imageData,
        };

        console.log("Sending payload from chat to generate-thumbnail API:", {
          prompt: payload.prompt,
          config: payload.config,
          hasImageData: !!payload.imageData,
          imageDataLength: payload.imageData?.length || 0
        });

        // Call the API to generate thumbnail
        const response = await fetch("/api/generate-thumbnail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to generate thumbnail");
        }

        // Create AI message with the generated thumbnail
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `🎉 I've generated a thumbnail for "${config.videoTitle}"`,
          timestamp: new Date(),
          thumbnailData: result.imageData,
          configData: config, // Store the config used for generation
        };

        setMessages(prev => [...prev, aiMessage]);

        // Save AI message to Supabase
        await chatService.createMessage({
          chatId: chatIdToUse,
          role: "assistant",
          content: aiMessage.content,
          thumbnailData: result.imageData,
          configData: config, // Store the config used for generation
        });

      } else {
        // Regular chat message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: content,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);

        // Save user message to Supabase
        await chatService.createMessage({
          chatId: chatIdToUse,
          role: "user",
          content: content,
          thumbnailData: undefined,
          configData: undefined,
        });

        // Call the chat API for AI response
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                ...(messages || []),
                { role: "user", content: content }
              ]
            }),
          });

          const result = await response.json();

          if (result.success) {
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: result.message,
              timestamp: new Date(),
              thumbnailData: result.thumbnailData,
            };

            setMessages(prev => [...prev, aiMessage]);

            // Save AI message to Supabase
            await chatService.createMessage({
              chatId: chatIdToUse,
              role: "assistant",
              content: aiMessage.content,
              thumbnailData: result.thumbnailData,
              configData: undefined,
            });
          } else {
            throw new Error(result.error || "Failed to get AI response");
          }
        } catch (error) {
          console.error("Error calling chat API:", error);
          
          // Fallback response
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I'm here to help you with thumbnail creation and YouTube content strategy! What would you like to know about creating engaging thumbnails?",
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, aiMessage]);

          // Save AI message to Supabase
          await chatService.createMessage({
            chatId: chatIdToUse,
            role: "assistant",
            content: aiMessage.content,
            thumbnailData: undefined,
            configData: undefined,
          });
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process message");
    } finally {
      setIsGenerating(false);
    }
  }, [currentChatId, user]);

  const loadChats = useCallback(async () => {
    if (!user) return [];

    try {
      const dbUser = await chatService.getUserByClerkId(user.id);
      if (!dbUser) return [];

      const chats = await chatService.getChats(dbUser.id);
      return chats || [];
    } catch (err) {
      console.error('Failed to load chats:', err);
      return [];
    }
  }, [user]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isGenerating,
    error,
    currentChatId,
    generateThumbnail,
    sendMessage,
    loadChat,
    loadChats,
    clearChat,
  };
}
