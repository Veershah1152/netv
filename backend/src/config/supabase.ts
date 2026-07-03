import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Create Supabase Admin client for secure server-side operations
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
