import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

/**
 * Lazy singleton for Supabase Admin client.
 * createClient() is deferred to first use so it is never called
 * in global scope (which Cloudflare Workers disallows).
 */
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return _supabase;
}

// Keep named export for backward-compat — resolved lazily on first property access
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});
