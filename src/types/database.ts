export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          user_id: string;
          job_type: string;
          jurisdiction: string;
          address: string | null;
          description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_type: string;
          jurisdiction: string;
          address?: string | null;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_type?: string;
          jurisdiction?: string;
          address?: string | null;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          job_id: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          user_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          uploaded_at?: string;
        };
      };
      requirements: {
        Row: {
          id: string;
          job_id: string;
          category: string;
          title: string;
          description: string;
          is_required: boolean;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          category: string;
          title: string;
          description: string;
          is_required?: boolean;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          category?: string;
          title?: string;
          description?: string;
          is_required?: boolean;
          status?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          business_name: string | null;
          license_number: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          business_name?: string | null;
          license_number?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          business_name?: string | null;
          license_number?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
