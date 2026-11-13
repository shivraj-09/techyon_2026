// ============================================================================
// [DISCONNECTED SUPABASE CLIENT]
// Previously connected to Supabase Auth & PostgREST via @supabase/ssr:
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
// ============================================================================

/*
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
*/

// Offline UI Preview stub (no network or Supabase calls)
export function createClient() {
  return null;
}
