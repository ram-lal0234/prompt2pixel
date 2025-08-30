import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastMessage: string;
  timestamp: string;
  isStarred?: boolean;
}

interface ChatStore {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createChat: (title?: string) => string;
  deleteChat: (chatId: string) => void;
  starChat: (chatId: string) => void;
  setActiveChat: (chatId: string | null) => void;
  addMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  clearChats: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      isLoading: false,
      error: null,

      createChat: (title = 'New Chat') => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title,
          messages: [],
          lastMessage: 'Start a new conversation...',
          timestamp: 'Just now'
        };

        set(state => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id
        }));

        return newChat.id;
      },

      deleteChat: (chatId: string) => {
        set(state => {
          const newChats = state.chats.filter(chat => chat.id !== chatId);
          const newActiveChatId = state.activeChatId === chatId 
            ? (newChats.length > 0 ? newChats[0].id : null)
            : state.activeChatId;

          return {
            chats: newChats,
            activeChatId: newActiveChatId
          };
        });
      },

      starChat: (chatId: string) => {
        set(state => ({
          chats: state.chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, isStarred: !chat.isStarred }
              : chat
          )
        }));
      },

      setActiveChat: (chatId: string | null) => {
        set({ activeChatId: chatId });
      },

      addMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date()
        };

        set(state => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              const updatedMessages = [...chat.messages, newMessage];
              return {
                ...chat,
                messages: updatedMessages,
                lastMessage: message.content,
                timestamp: new Date().toLocaleString()
              };
            }
            return chat;
          })
        }));
      },

      updateChatTitle: (chatId: string, title: string) => {
        set(state => ({
          chats: state.chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, title }
              : chat
          )
        }));
      },

      clearChats: () => {
        set({ chats: [], activeChatId: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        chats: state.chats,
        activeChatId: state.activeChatId
      })
    }
  )
); 