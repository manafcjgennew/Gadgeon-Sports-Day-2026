import { createClient } from '@supabase/supabase-js';

type Database = {
  public: {
    Tables: {
      sports_day_teams: {
        Row: { id: string; name: string; points: number; updated_at: string };
        Insert: { id?: string; name: string; points?: number; updated_at?: string };
        Update: { id?: string; name?: string; points?: number; updated_at?: string };
        Relationships: [];
      };
      admin_users: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      sports_day_game_results: {
        Row: {
          game_name: string; winner_name: string | null; winner_email: string | null;
          winner_team_name: string | null; winner_business_unit: string | null;
          runner_up_name: string | null; runner_up_email: string | null;
          runner_up_team_name: string | null; runner_up_business_unit: string | null; updated_at: string;
        };
        Insert: {
          game_name: string; winner_name?: string | null; winner_email?: string | null;
          winner_team_name?: string | null; winner_business_unit?: string | null;
          runner_up_name?: string | null; runner_up_email?: string | null;
          runner_up_team_name?: string | null; runner_up_business_unit?: string | null; updated_at?: string;
        };
        Update: {
          game_name?: string; winner_name?: string | null; winner_email?: string | null;
          winner_team_name?: string | null; winner_business_unit?: string | null;
          runner_up_name?: string | null; runner_up_email?: string | null;
          runner_up_team_name?: string | null; runner_up_business_unit?: string | null; updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_sports_day_admin: { Args: Record<string, never>; Returns: boolean };
      list_sports_day_registrations: { Args: Record<string, never>; Returns: unknown };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL?.trim()
  || ''
);
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  || ''
);

export const supabaseConfigurationIssue = (() => {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)');

  if (missing.length) return { missing };

  try {
    const parsedUrl = new URL(supabaseUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { missing: ['VITE_SUPABASE_URL must be a valid HTTP or HTTPS URL'] };
    }
  } catch {
    return { missing: ['VITE_SUPABASE_URL must be a valid HTTP or HTTPS URL'] };
  }

  return null;
})();

export const isSupabaseConfigured = supabaseConfigurationIssue === null;

let client = null as ReturnType<typeof createClient<Database>> | null;
if (isSupabaseConfigured) {
  try {
    client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('[registration] Supabase client initialization failed.', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
  }
} else {
  console.warn('[registration] Supabase configuration is incomplete.', {
    missing: supabaseConfigurationIssue?.missing ?? [],
  });
}

export const supabase = client;
