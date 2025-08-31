import { supabase, isSupabaseConfigured } from "./supabase";
import type { Database } from "./supabase";

type Chat = Database["public"]["Tables"]["chats"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];
type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

export interface CreateChatData {
  userId: string;
  title: string;
}

export interface CreateMessageData {
  chatId: string;
  role: "user" | "assistant";
  content: string;
  thumbnailData?: string;
  configData?: any;
}

export class ChatService {
  private checkSupabase() {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
      );
    }
    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }
  }

  // User management
  async createUser(clerkId: string, email?: string) {
    this.checkSupabase();

    const { data, error } = await supabase!
      .from("users")
      .insert({
        clerk_id: clerkId,
        email: email || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByClerkId(clerkId: string) {
    this.checkSupabase();

    const { data, error } = await supabase!
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data;
  }

  // Chat management
  async createChat({ userId, title }: CreateChatData): Promise<Chat> {
    this.checkSupabase();

    const { data, error } = await supabase!
      .from("chats")
      .insert({
        user_id: userId,
        title,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getChats(userId: string): Promise<Chat[]> {
    this.checkSupabase();

    const { data, error } = await supabase!
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getChatWithMessages(chatId: string): Promise<ChatWithMessages | null> {
    this.checkSupabase();

    const { data: chat, error: chatError } = await supabase!
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    if (chatError) throw chatError;
    if (!chat) return null;

    const { data: messages, error: messagesError } = await supabase!
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (messagesError) throw messagesError;

    return {
      ...chat,
      messages: messages || [],
    };
  }

  async updateChat(chatId: string, updates: Partial<Chat>) {
    this.checkSupabase();

    const { data, error } = await supabase!
      .from("chats")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteChat(chatId: string) {
    this.checkSupabase();

    const { error } = await supabase!.from("chats").delete().eq("id", chatId);

    if (error) throw error;
  }

  async toggleChatStar(chatId: string, isStarred: boolean) {
    return this.updateChat(chatId, { is_starred: isStarred });
  }

  // Message management
  async createMessage(messageData: CreateMessageData): Promise<Message> {
    this.checkSupabase();

    const { data, error } = await supabase!
      .from("messages")
      .insert({
        chat_id: messageData.chatId,
        role: messageData.role,
        content: messageData.content,
        thumbnail_data: messageData.thumbnailData || null,
        config_data: messageData.configData || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update chat's updated_at timestamp
    await this.updateChat(messageData.chatId, {});

    return data;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    this.checkSupabase();

    const { data, error } = await supabase!
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    this.checkSupabase();

    const { data, error } = await supabase!
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async createUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ) {
    this.checkSupabase();

    const { data, error } = await supabase!
      .from("user_preferences")
      .insert({
        user_id: userId,
        default_niche: preferences.default_niche || "education",
        default_colors: preferences.default_colors || {
          primary: "#DC2626",
          secondary: "#2563EB",
        },
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ) {
    this.checkSupabase();

    const { data, error } = await supabase!
      .from("user_preferences")
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrCreateUserPreferences(userId: string): Promise<UserPreferences> {
    let preferences = await this.getUserPreferences(userId);

    if (!preferences) {
      preferences = await this.createUserPreferences(userId, {});
    }

    return preferences!;
  }

  // Real-time subscriptions
  subscribeToChatMessages(
    chatId: string,
    callback: (message: Message) => void
  ) {
    this.checkSupabase();

    return supabase!
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  subscribeToUserChats(userId: string, callback: (chat: Chat) => void) {
    this.checkSupabase();

    return supabase!
      .channel(`user-chats:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Chat);
        }
      )
      .subscribe();
  }
}

export const chatService = new ChatService();
