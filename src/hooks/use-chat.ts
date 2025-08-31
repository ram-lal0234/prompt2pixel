import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { chatService, type ChatWithMessages, type CreateMessageData } from '@/lib/chat-service'
import type { Database } from '@/lib/supabase'

type Chat = Database['public']['Tables']['chats']['Row']
type Message = Database['public']['Tables']['messages']['Row']

export function useChat() {
  const { user } = useUser()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<ChatWithMessages | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user's chats
  const loadChats = useCallback(async () => {
    if (!user || !isClient) return

    try {
      setIsLoading(true)
      setError(null)

      // Ensure user exists in database
      let dbUser = await chatService.getUserByClerkId(user.id)
      if (!dbUser) {
        dbUser = await chatService.createUser(user.id, user.emailAddresses[0]?.emailAddress)
      }

      if (!dbUser) {
        throw new Error('Failed to create or retrieve user')
      }

      const userChats = await chatService.getChats(dbUser.id)
      setChats(userChats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats')
      console.error('Error loading chats:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user, isClient])

  // Create new chat
  const createChat = useCallback(async (title: string = 'New Chat') => {
    if (!user || !isClient) return null

    try {
      setError(null)

      // Ensure user exists in database
      let dbUser = await chatService.getUserByClerkId(user.id)
      if (!dbUser) {
        dbUser = await chatService.createUser(user.id, user.emailAddresses[0]?.emailAddress)
      }

      const newChat = await chatService.createChat({
        userId: dbUser.id,
        title
      })

      setChats(prev => [newChat, ...prev])
      return newChat
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat')
      console.error('Error creating chat:', err)
      return null
    }
  }, [user, isClient])

  // Load specific chat with messages
  const loadChat = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const chatWithMessages = await chatService.getChatWithMessages(chatId)
      if (chatWithMessages) {
        setCurrentChat(chatWithMessages)
        setMessages(chatWithMessages.messages)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat')
      console.error('Error loading chat:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Add message to current chat
  const addMessage = useCallback(async (messageData: Omit<CreateMessageData, 'chatId'>) => {
    if (!currentChat) return null

    try {
      setError(null)

      const newMessage = await chatService.createMessage({
        ...messageData,
        chatId: currentChat.id
      })

      setMessages(prev => [...prev, newMessage])
      return newMessage
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add message')
      console.error('Error adding message:', err)
      return null
    }
  }, [currentChat])

  // Update chat title
  const updateChatTitle = useCallback(async (chatId: string, title: string) => {
    try {
      setError(null)

      const updatedChat = await chatService.updateChat(chatId, { title })
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? updatedChat : chat
      ))

      if (currentChat?.id === chatId) {
        setCurrentChat(prev => prev ? { ...prev, title } : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chat title')
      console.error('Error updating chat title:', err)
    }
  }, [currentChat])

  // Delete chat
  const deleteChat = useCallback(async (chatId: string) => {
    try {
      setError(null)

      await chatService.deleteChat(chatId)
      setChats(prev => prev.filter(chat => chat.id !== chatId))

      if (currentChat?.id === chatId) {
        setCurrentChat(null)
        setMessages([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat')
      console.error('Error deleting chat:', err)
    }
  }, [currentChat])

  // Toggle chat star
  const toggleChatStar = useCallback(async (chatId: string, isStarred: boolean) => {
    try {
      setError(null)

      const updatedChat = await chatService.toggleChatStar(chatId, isStarred)
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? updatedChat : chat
      ))

      if (currentChat?.id === chatId) {
        setCurrentChat(prev => prev ? { ...prev, is_starred: isStarred } : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle chat star')
      console.error('Error toggling chat star:', err)
    }
  }, [currentChat])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user || !isClient) return

    // Subscribe to user's chats
    const subscription = chatService.subscribeToUserChats(user.id, (updatedChat) => {
      setChats(prev => {
        const existingIndex = prev.findIndex(chat => chat.id === updatedChat.id)
        if (existingIndex >= 0) {
          // Update existing chat
          const newChats = [...prev]
          newChats[existingIndex] = updatedChat
          return newChats
        } else {
          // Add new chat
          return [updatedChat, ...prev]
        }
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user, isClient])

  // Subscribe to current chat messages
  useEffect(() => {
    if (!currentChat || !isClient) return

    const subscription = chatService.subscribeToChatMessages(currentChat.id, (newMessage) => {
      setMessages(prev => [...prev, newMessage])
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [currentChat, isClient])

  // Load chats on mount
  useEffect(() => {
    if (isClient) {
      loadChats()
    }
  }, [loadChats, isClient])

  return {
    // State
    chats,
    currentChat,
    messages,
    isLoading,
    error,

    // Actions
    loadChats,
    createChat,
    loadChat,
    addMessage,
    updateChatTitle,
    deleteChat,
    toggleChatStar,

    // Utilities
    clearError: () => setError(null)
  }
}
