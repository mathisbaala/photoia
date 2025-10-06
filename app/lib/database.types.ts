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
        };
        Insert: {
          id?: string;
          created_at?: string;
          input_image_url?: string | null;
          output_image_url?: string | null;
          prompt?: string | null;
          status?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          input_image_url?: string | null;
          output_image_url?: string | null;
          prompt?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
