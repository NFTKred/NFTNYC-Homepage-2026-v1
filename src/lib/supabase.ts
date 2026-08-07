import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zgryfbuoarrlmocavodo.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncnlmYnVvYXJybG1vY2F2b2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjA4MzEsImV4cCI6MjA5MDczNjgzMX0.xDGlhaIKm_6sArOQnU8mUIDdpeVbX3Iwh5rVDRkvD_g';

// Gracefully handle missing anon key — public pages fall back to static data
export const supabase: SupabaseClient = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient(supabaseUrl, 'placeholder-key-will-fail-gracefully');

export const isSupabaseConfigured = !!supabaseAnonKey;
