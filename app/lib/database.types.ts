export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          created_at: string;
          input_image_url: string | null;
          output_image_url: string | null;
          prompt: string | null;
          status: string | null;
          user_id: string | null;
          payment_status: string | null;
          payment_amount: number | null;
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          input_image_url?: string | null;
          output_image_url?: string | null;
          prompt?: string | null;
          status?: string | null;
          user_id?: string | null;
          payment_status?: string | null;
          payment_amount?: number | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          input_image_url?: string | null;
          output_image_url?: string | null;
          prompt?: string | null;
          status?: string | null;
          user_id?: string | null;
          payment_status?: string | null;
          payment_amount?: number | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
