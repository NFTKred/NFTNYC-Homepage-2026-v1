import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zgryfbuoarrlmocavodo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Gracefully handle missing anon key — public pages fall back to static data
export const supabase: SupabaseClient = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient(supabaseUrl, 'placeholder-key-will-fail-gracefully');

export const isSupabaseConfigured = !!supabaseAnonKey;
