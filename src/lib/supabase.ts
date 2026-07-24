import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only construct the client when both values are present. Calling createClient
// with an empty URL throws synchronously, and because this module is imported
// at app startup that throw would blank the entire page. Guarding keeps the app
// rendering and degrades only lead capture when the config is missing.
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

if (!supabase) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — lead capture is disabled.',
  );
}
