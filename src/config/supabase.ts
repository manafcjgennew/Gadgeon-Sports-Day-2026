import { createClient } from '@supabase/supabase-js';

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

let client = null as ReturnType<typeof createClient> | null;
if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
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
