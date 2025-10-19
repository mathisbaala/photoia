export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          input_image_url: string | null
          output_image_url: string | null
          prompt: string
          status: string
          created_at: string
          updated_at: string
          replicate_prediction_id: string | null
          error_message: string | null
          payment_status: string | null
          stripe_checkout_session_id: string | null
          model_id: string | null
          credits_used: number | null
        }
        Insert: {
          id?: string
          user_id: string
          input_image_url?: string | null
          output_image_url?: string | null
          prompt: string
          status?: string
          created_at?: string
          updated_at?: string
          replicate_prediction_id?: string | null
          error_message?: string | null
          payment_status?: string | null
          stripe_checkout_session_id?: string | null
          model_id?: string | null
          credits_used?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          input_image_url?: string | null
          output_image_url?: string | null
          prompt?: string
          status?: string
          created_at?: string
          updated_at?: string
          replicate_prediction_id?: string | null
          error_message?: string | null
          payment_status?: string | null
          stripe_checkout_session_id?: string | null
          model_id?: string | null
          credits_used?: number | null
        }
        Relationships: []
      }
      credits: {
        Row: {
          id: string
          user_id: string
          credits_remaining: number
          total_purchased: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credits_remaining?: number
          total_purchased?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credits_remaining?: number
          total_purchased?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          amount: number
          currency: string
          status: string
          credits_purchased: number
          payment_method: string | null
          description: string | null
          payment_type: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_intent_id: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          amount: number
          currency?: string
          status?: string
          credits_purchased?: number
          payment_method?: string | null
          description?: string | null
          payment_type?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_intent_id?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          amount?: number
          currency?: string
          status?: string
          credits_purchased?: number
          payment_method?: string | null
          description?: string | null
          payment_type?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
