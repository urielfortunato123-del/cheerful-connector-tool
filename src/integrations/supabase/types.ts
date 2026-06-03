export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_settings: {
        Row: {
          alert_name: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          notification_webhook_url: string | null
          threshold_count: number
          time_window_minutes: number
          updated_at: string | null
        }
        Insert: {
          alert_name: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_webhook_url?: string | null
          threshold_count?: number
          time_window_minutes?: number
          updated_at?: string | null
        }
        Update: {
          alert_name?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_webhook_url?: string | null
          threshold_count?: number
          time_window_minutes?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          activities: string | null
          created_at: string | null
          date: string | null
          id: string
          labor_count: number | null
          occurrences: string | null
          project_id: string | null
          updated_at: string | null
          user_id: string | null
          weather: string | null
        }
        Insert: {
          activities?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          labor_count?: number | null
          occurrences?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          weather?: string | null
        }
        Update: {
          activities?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          labor_count?: number | null
          occurrences?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          agency: string
          category: string
          content_text: string | null
          created_at: string
          file_path: string
          id: string
          metadata: Json | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agency: string
          category: string
          content_text?: string | null
          created_at?: string
          file_path: string
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agency?: string
          category?: string
          content_text?: string | null
          created_at?: string
          file_path?: string
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_records: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          project_id: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          period: string
          project_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          period: string
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          period?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          progress: number | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget?: number | null
          client?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          progress?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget?: number | null
          client?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          progress?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      purifier_models: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      pwa_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          platform: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          platform?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          platform?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          address: string
          bought_before: boolean | null
          city: string
          created_at: string
          customer_name: string
          customer_phone: string
          floor: string | null
          google_maps_link: string | null
          has_elevator: boolean | null
          has_high_pressure_tank: boolean | null
          id: string
          is_client: boolean | null
          last_maintenance: string | null
          latitude: number | null
          longitude: number | null
          media_urls: Json | null
          neighborhood: string
          observations: string | null
          other_model: string | null
          problem_description: string | null
          problem_type: string | null
          property_type: string | null
          purifier_model: string | null
          request_type: string
          status: string
          user_id: string | null
        }
        Insert: {
          address: string
          bought_before?: boolean | null
          city: string
          created_at?: string
          customer_name: string
          customer_phone: string
          floor?: string | null
          google_maps_link?: string | null
          has_elevator?: boolean | null
          has_high_pressure_tank?: boolean | null
          id?: string
          is_client?: boolean | null
          last_maintenance?: string | null
          latitude?: number | null
          longitude?: number | null
          media_urls?: Json | null
          neighborhood: string
          observations?: string | null
          other_model?: string | null
          problem_description?: string | null
          problem_type?: string | null
          property_type?: string | null
          purifier_model?: string | null
          request_type: string
          status?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          bought_before?: boolean | null
          city?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          floor?: string | null
          google_maps_link?: string | null
          has_elevator?: boolean | null
          has_high_pressure_tank?: boolean | null
          id?: string
          is_client?: boolean | null
          last_maintenance?: string | null
          latitude?: number | null
          longitude?: number | null
          media_urls?: Json | null
          neighborhood?: string
          observations?: string | null
          other_model?: string | null
          problem_description?: string | null
          problem_type?: string | null
          property_type?: string | null
          purifier_model?: string | null
          request_type?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ssr_error_notifications: {
        Row: {
          alert_id: string | null
          error_count: number
          id: string
          sent_at: string | null
          window_end: string
          window_start: string
        }
        Insert: {
          alert_id?: string | null
          error_count: number
          id?: string
          sent_at?: string | null
          window_end: string
          window_start: string
        }
        Update: {
          alert_id?: string | null
          error_count?: number
          id?: string
          sent_at?: string | null
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "ssr_error_notifications_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alert_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      ssr_errors: {
        Row: {
          context: Json | null
          created_at: string
          deployment_id: string | null
          error_message: string | null
          id: string
          method: string
          path: string
          stack_trace: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          deployment_id?: string | null
          error_message?: string | null
          id?: string
          method: string
          path: string
          stack_trace?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          deployment_id?: string | null
          error_message?: string | null
          id?: string
          method?: string
          path?: string
          stack_trace?: string | null
        }
        Relationships: []
      }
      technical_standards: {
        Row: {
          category: string | null
          code: string | null
          created_at: string | null
          id: string
          organ: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          organ?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          organ?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
