import { createClient } from '@supabase/supabase-js'

// Database types - following Supabase TypeScript best practices
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          clerk_id: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          clerk_id?: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          user_id: string
          title: string
          is_starred: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          is_starred?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          title?: string
          is_starred?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          role: 'user' | 'assistant'
          content: string
          thumbnail_data: string | null
          config_data: any | null
          created_at: string
        }
        Insert: {
          chat_id: string
          role: 'user' | 'assistant'
          content: string
          thumbnail_data?: string | null
          config_data?: any | null
          created_at?: string
        }
        Update: {
          chat_id?: string
          role?: 'user' | 'assistant'
          content?: string
          thumbnail_data?: string | null
          config_data?: any | null
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          default_niche: string
          default_colors: any
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          default_niche?: string
          default_colors?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          default_niche?: string
          default_colors?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Following Supabase official naming convention
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jwmmaajbkqzaxbqucnga.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client with proper TypeScript types
export const supabase = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  // Only log on client side to prevent hydration issues
  if (typeof window !== 'undefined') {
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set');
  }
  return !!supabaseAnonKey;
}
