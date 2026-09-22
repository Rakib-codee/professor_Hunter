// Generated from the live schema via the Supabase MCP `generate_typescript_types` tool.
// Regenerate after every migration. Do not edit by hand.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      drafts: {
        Row: {
          body: string;
          completion_tokens: number | null;
          created_at: string;
          id: string;
          model: string;
          professor_id: string;
          prompt_tokens: number | null;
          student_id: string;
          subject: string;
          tone: Database['public']['Enums']['draft_tone'];
        };
        Insert: {
          body: string;
          completion_tokens?: number | null;
          created_at?: string;
          id?: string;
          model: string;
          professor_id: string;
          prompt_tokens?: number | null;
          student_id: string;
          subject: string;
          tone?: Database['public']['Enums']['draft_tone'];
        };
        Update: {
          body?: string;
          completion_tokens?: number | null;
          created_at?: string;
          id?: string;
          model?: string;
          professor_id?: string;
          prompt_tokens?: number | null;
          student_id?: string;
          subject?: string;
          tone?: Database['public']['Enums']['draft_tone'];
        };
        Relationships: [
          {
            foreignKeyName: 'drafts_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'drafts_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors_public';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'drafts_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      outreach: {
        Row: {
          created_at: string;
          draft_id: string | null;
          follow_up_on: string | null;
          id: string;
          notes: string | null;
          professor_id: string;
          reply_on: string | null;
          sent_on: string;
          status: Database['public']['Enums']['outreach_status'];
          student_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          draft_id?: string | null;
          follow_up_on?: string | null;
          id?: string;
          notes?: string | null;
          professor_id: string;
          reply_on?: string | null;
          sent_on?: string;
          status?: Database['public']['Enums']['outreach_status'];
          student_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          draft_id?: string | null;
          follow_up_on?: string | null;
          id?: string;
          notes?: string | null;
          professor_id?: string;
          reply_on?: string | null;
          sent_on?: string;
          status?: Database['public']['Enums']['outreach_status'];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'outreach_draft_id_fkey';
            columns: ['draft_id'];
            isOneToOne: false;
            referencedRelation: 'drafts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'outreach_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'outreach_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors_public';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'outreach_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      professors: {
        Row: {
          accepts_intl: Database['public']['Enums']['accepts_intl'];
          created_at: string;
          email: string | null;
          email_type: Database['public']['Enums']['email_type'];
          field: string;
          gender: string | null;
          id: string;
          last_verified: string | null;
          last_verified_on: string | null;
          name_cn: string | null;
          name_cn_inferred: boolean;
          name_en: string;
          notes: string | null;
          research_area: string | null;
          research_tags: string[];
          school: string | null;
          search_vector: unknown;
          source_url: string | null;
          status: Database['public']['Enums']['professor_status'];
          title: string | null;
          university_id: string;
          updated_at: string;
        };
        Insert: {
          accepts_intl?: Database['public']['Enums']['accepts_intl'];
          created_at?: string;
          email?: string | null;
          email_type?: Database['public']['Enums']['email_type'];
          field: string;
          gender?: string | null;
          id?: string;
          last_verified?: string | null;
          last_verified_on?: string | null;
          name_cn?: string | null;
          name_cn_inferred?: boolean;
          name_en: string;
          notes?: string | null;
          research_area?: string | null;
          research_tags?: string[];
          school?: string | null;
          search_vector?: unknown;
          source_url?: string | null;
          status?: Database['public']['Enums']['professor_status'];
          title?: string | null;
          university_id: string;
          updated_at?: string;
        };
        Update: {
          accepts_intl?: Database['public']['Enums']['accepts_intl'];
          created_at?: string;
          email?: string | null;
          email_type?: Database['public']['Enums']['email_type'];
          field?: string;
          gender?: string | null;
          id?: string;
          last_verified?: string | null;
          last_verified_on?: string | null;
          name_cn?: string | null;
          name_cn_inferred?: boolean;
          name_en?: string;
          notes?: string | null;
          research_area?: string | null;
          research_tags?: string[];
          school?: string | null;
          search_vector?: unknown;
          source_url?: string | null;
          status?: Database['public']['Enums']['professor_status'];
          title?: string | null;
          university_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'professors_university_id_fkey';
            columns: ['university_id'];
            isOneToOne: false;
            referencedRelation: 'universities';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string;
          id: string;
          message: string | null;
          professor_id: string;
          status: Database['public']['Enums']['report_status'];
          student_id: string | null;
          type: Database['public']['Enums']['report_type'];
        };
        Insert: {
          created_at?: string;
          id?: string;
          message?: string | null;
          professor_id: string;
          status?: Database['public']['Enums']['report_status'];
          student_id?: string | null;
          type: Database['public']['Enums']['report_type'];
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string | null;
          professor_id?: string;
          status?: Database['public']['Enums']['report_status'];
          student_id?: string | null;
          type?: Database['public']['Enums']['report_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'reports_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors_public';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      saved: {
        Row: {
          created_at: string;
          professor_id: string;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          professor_id: string;
          student_id: string;
        };
        Update: {
          created_at?: string;
          professor_id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors_public';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      students: {
        Row: {
          achievements: string | null;
          cgpa: number | null;
          cgpa_scale: number | null;
          created_at: string;
          cv_path: string | null;
          degree_applying: Database['public']['Enums']['degree_type'] | null;
          full_name: string | null;
          graduation_year: number | null;
          home_university: string | null;
          hsk: number | null;
          id: string;
          ielts: number | null;
          intake_year: number;
          last_viewed_professor_id: string | null;
          major: string | null;
          nationality: string | null;
          onboarding_completed_at: string | null;
          research_interests: string | null;
          research_tags: string[];
          role: Database['public']['Enums']['student_role'];
          target_field: string | null;
          toefl: number | null;
          updated_at: string;
        };
        Insert: {
          achievements?: string | null;
          cgpa?: number | null;
          cgpa_scale?: number | null;
          created_at?: string;
          cv_path?: string | null;
          degree_applying?: Database['public']['Enums']['degree_type'] | null;
          full_name?: string | null;
          graduation_year?: number | null;
          home_university?: string | null;
          hsk?: number | null;
          id: string;
          ielts?: number | null;
          intake_year?: number;
          last_viewed_professor_id?: string | null;
          major?: string | null;
          nationality?: string | null;
          onboarding_completed_at?: string | null;
          research_interests?: string | null;
          research_tags?: string[];
          role?: Database['public']['Enums']['student_role'];
          target_field?: string | null;
          toefl?: number | null;
          updated_at?: string;
        };
        Update: {
          achievements?: string | null;
          cgpa?: number | null;
          cgpa_scale?: number | null;
          created_at?: string;
          cv_path?: string | null;
          degree_applying?: Database['public']['Enums']['degree_type'] | null;
          full_name?: string | null;
          graduation_year?: number | null;
          home_university?: string | null;
          hsk?: number | null;
          id?: string;
          ielts?: number | null;
          intake_year?: number;
          last_viewed_professor_id?: string | null;
          major?: string | null;
          nationality?: string | null;
          onboarding_completed_at?: string | null;
          research_interests?: string | null;
          research_tags?: string[];
          role?: Database['public']['Enums']['student_role'];
          target_field?: string | null;
          toefl?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'students_last_viewed_professor_id_fkey';
            columns: ['last_viewed_professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'students_last_viewed_professor_id_fkey';
            columns: ['last_viewed_professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors_public';
            referencedColumns: ['id'];
          },
        ];
      };
      universities: {
        Row: {
          city: string | null;
          created_at: string;
          csc_type_b: boolean;
          id: string;
          name_cn: string | null;
          name_en: string;
          province: string | null;
          website: string | null;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          csc_type_b?: boolean;
          id?: string;
          name_cn?: string | null;
          name_en: string;
          province?: string | null;
          website?: string | null;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          csc_type_b?: boolean;
          id?: string;
          name_cn?: string | null;
          name_en?: string;
          province?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      usage_log: {
        Row: {
          action: Database['public']['Enums']['usage_action'];
          created_at: string;
          id: number;
          professor_id: string | null;
          student_id: string;
        };
        Insert: {
          action: Database['public']['Enums']['usage_action'];
          created_at?: string;
          id?: never;
          professor_id?: string | null;
          student_id: string;
        };
        Update: {
          action?: Database['public']['Enums']['usage_action'];
          created_at?: string;
          id?: never;
          professor_id?: string | null;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'usage_log_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'usage_log_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'professors_public';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'usage_log_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      professors_public: {
        Row: {
          accepts_intl: Database['public']['Enums']['accepts_intl'] | null;
          accepts_rank: number | null;
          city: string | null;
          email_type: Database['public']['Enums']['email_type'] | null;
          field: string | null;
          has_email: boolean | null;
          id: string | null;
          last_verified: string | null;
          last_verified_on: string | null;
          name_cn: string | null;
          name_en: string | null;
          province: string | null;
          research_area: string | null;
          research_tags: string[] | null;
          school: string | null;
          search_vector: unknown;
          source_url: string | null;
          status: Database['public']['Enums']['professor_status'] | null;
          title: string | null;
          university_id: string | null;
          university_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'professors_university_id_fkey';
            columns: ['university_id'];
            isOneToOne: false;
            referencedRelation: 'universities';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      admin_stats: { Args: never; Returns: Json };
      build_prefix_tsquery: { Args: { p_q: string }; Returns: unknown };
      consume_draft_quota: {
        Args: { p_professor_id: string; p_student_id: string };
        Returns: {
          allowed: boolean;
          quota: number;
          used: number;
        }[];
      };
      is_admin: { Args: never; Returns: boolean };
      major_counts: { Args: never; Returns: Json };
      professor_facets: { Args: { p_field: string }; Returns: Json };
      professor_reply_stats: {
        Args: { p_professor_id: string };
        Returns: {
          replied: number;
          total: number;
        }[];
      };
      reveal_professor_email: {
        Args: { p_professor_id: string };
        Returns: {
          out_email: string;
          out_email_type: Database['public']['Enums']['email_type'];
          reveals_limit: number;
          reveals_used: number;
        }[];
      };
      search_professors: {
        Args: {
          p_accepts?: string[];
          p_field: string;
          p_page?: number;
          p_page_size?: number;
          p_province?: string;
          p_q?: string;
          p_tags?: string[];
          p_university_email_only?: boolean;
          p_university_id?: string;
        };
        Returns: {
          row_json: Json;
          total: number;
        }[];
      };
    };
    Enums: {
      accepts_intl: 'confirmed' | 'team-reported' | 'unknown' | 'no';
      degree_type: 'master' | 'phd';
      draft_tone: 'formal' | 'concise';
      email_type: 'university' | 'personal' | 'none';
      outreach_status:
        | 'sent'
        | 'replied_positive'
        | 'replied_negative'
        | 'replied_conditional'
        | 'no_reply'
        | 'bounced';
      professor_status: 'active' | 'bounced' | 'moved' | 'retired';
      report_status: 'open' | 'resolved';
      report_type: 'wrong_email' | 'bounced' | 'moved' | 'not_accepting' | 'other';
      student_role: 'student' | 'admin';
      usage_action: 'reveal_email' | 'generate_draft';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      accepts_intl: ['confirmed', 'team-reported', 'unknown', 'no'],
      degree_type: ['master', 'phd'],
      draft_tone: ['formal', 'concise'],
      email_type: ['university', 'personal', 'none'],
      outreach_status: [
        'sent',
        'replied_positive',
        'replied_negative',
        'replied_conditional',
        'no_reply',
        'bounced',
      ],
      professor_status: ['active', 'bounced', 'moved', 'retired'],
      report_status: ['open', 'resolved'],
      report_type: ['wrong_email', 'bounced', 'moved', 'not_accepting', 'other'],
      student_role: ['student', 'admin'],
      usage_action: ['reveal_email', 'generate_draft'],
    },
  },
} as const;
