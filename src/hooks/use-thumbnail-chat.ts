import { useState, useCallback } from 'react';
import { ThumbnailConfig } from '@/components/chat/thumbnail-config';
import { chatService } from '@/lib/chat-service';
import { storageService } from '@/lib/storage-service';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  thumbnailData?: string;
}

interface UseThumbnailChatReturn {
  messages: Message[];
  isGenerating: boolean;
  error: string | null;
  currentChatId: string | null;
  generateThumbnail: (config: ThumbnailConfig, chatId?: string) => Promise<string>;
  sendMessage: (content: string, chatId?: string) => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  clearChat: () => void;
}

export function useThumbnailChat(): UseThumbnailChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const generateThumbnail = useCallback(async (config: ThumbnailConfig, chatId?: string): Promise<string> => {
    if (!config.videoTitle.trim()) {
      setError('Please enter a video title');
      throw new Error('Please enter a video title');
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create or get chat
      let chatIdToUse = chatId;
      if (!chatIdToUse) {
        const newChat = await chatService.createChat(config.videoTitle);
        chatIdToUse = newChat.id;
        setCurrentChatId(chatIdToUse);
      }

      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: `Generate a thumbnail for: ${config.videoTitle}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Save user message to Supabase
      await chatService.createMessage({
        chatId: chatIdToUse,
        role: "user",
        content: userMessage.content,
        thumbnailData: null,
        configData: config,
      });

      // Call the API to generate thumbnail
      const response = await fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: config.videoTitle,
          config: config,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate thumbnail");
      }

      // Upload thumbnail to Supabase Storage if we have a reference image
      let thumbnailUrl = result.imageData;
      if (config.defaultImagePreview) {
        try {
          // Convert base64 to file and upload
          const response = await fetch(config.defaultImagePreview);
          const blob = await response.blob();
          const file = new File([blob], 'reference-image.jpg', { type: 'image/jpeg' });
          
          thumbnailUrl = await storageService.uploadThumbnail({
            chatId: chatIdToUse,
            messageId: Date.now().toString(),
            file: file,
          });
        } catch (error) {
          console.error('Failed to upload thumbnail to storage:', error);
          // Continue with base64 data
        }
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
        thumbnailData: thumbnailUrl,
        configData: null,
      });

      return chatIdToUse;

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate thumbnail");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const loadChat = useCallback(async (chatId: string) => {
    try {
      setCurrentChatId(chatId);
      const messages = await chatService.getMessages(chatId);
      setMessages(messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        thumbnailData: msg.thumbnail_data,
      })));
    } catch (error) {
      console.error('Failed to load chat:', error);
      setError('Failed to load chat');
    }
  }, []);

  const sendMessage = useCallback(async (content: string, chatId?: string) => {
    if (!content.trim()) return;

    const chatIdToUse = chatId || currentChatId;
    if (!chatIdToUse) {
      setError('No active chat');
      return;
    }

    // Add user message
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
      thumbnailData: null,
      configData: null,
    });

    // TODO: Implement AI chat response
    // For now, just add a simple response
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "I understand your question about the thumbnail. This feature is coming soon!",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);

    // Save AI message to Supabase
    await chatService.createMessage({
      chatId: chatIdToUse,
      role: "assistant",
      content: aiMessage.content,
      thumbnailData: null,
      configData: null,
    });
  }, [currentChatId]);



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
    clearChat,
  };
}
