import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from '@/lib/env';

let client: SupabaseClient | null = null;

export function getSupabaseOptional(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  if (!client) {
    client = createClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return client;
}

/** @deprecated Prefer getSupabaseOptional — avoids throws on first launch */
export function getSupabase(): SupabaseClient {
  const supabase = getSupabaseOptional();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase;
}
