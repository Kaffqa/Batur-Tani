// ============================================================
// Batur Tani — Supabase Client
// Singleton instance used throughout the application
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Batur Tani] Missing Supabase environment variables. ' +
    'Copy .env.example to .env and fill in your credentials.'
  );
}

/**
 * Shared Supabase client instance.
 *
 * Uses the anon (public) key — Row Level Security on the database
 * ensures users can only access data they are authorized for.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
