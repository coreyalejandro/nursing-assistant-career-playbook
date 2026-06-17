/**
 * src/lib/supabase.ts
 * ---------------------------------------------------------------------------
 * Supabase client (Auth + Postgres) — the replacement for src/firebase.ts.
 *
 * WHY Supabase: Postgres + Row-Level Security + built-in Auth (Google OAuth +
 * anonymous), all behind one HTTPS API. It is host-agnostic — it works the same
 * from the browser, from Cloudflare Pages Functions, or anywhere else — so it
 * does not tie the app to any single hosting vendor.
 *
 * The two public values below are safe to ship in the browser bundle: the URL
 * is public, and the ANON key is a public client key whose power is bounded by
 * the RLS policies in supabase/migrations/0001_profiles.sql. Server-only secrets
 * (the service-role key) are NEVER imported here.
 *
 * The client is created only when both values are present; otherwise `supabase`
 * is null and the app degrades to a local-only experience (the progress
 * dashboard still works via localStorage — see RetentionPanel).
 * ---------------------------------------------------------------------------
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when the build was given a Supabase URL + anon key. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // completes the OAuth redirect back from Google
      },
    })
  : null;

/**
 * The current user's Supabase access token (JWT), or null when signed out /
 * not configured. Sent as `Authorization: Bearer` on AI calls so the server
 * can resolve a Pro entitlement (unlimited) vs. the free daily quota.
 */
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}
