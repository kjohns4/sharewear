export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          name: string
          date: string | null
          created_by: string
          invite_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          date?: string | null
          created_by: string
          invite_code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string | null
          created_by?: string
          invite_code?: string
          created_at?: string
        }
        Relationships: []
      }
      outfit_posts: {
        Row: {
          id: string
          event_id: string
          user_id: string
          description: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          description: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          description?: string
          image_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'outfit_posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type OutfitPost = Database['public']['Tables']['outfit_posts']['Row']
