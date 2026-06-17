/**
 * server/entitlement.ts
 * ---------------------------------------------------------------------------
 * Resolves a request's monetization plan ("free" | "pro") from the signed-in
 * user's Supabase profile. [Supports the DeepSeek P0 freemium fix]
 *
 * A signed-in request carries the user's Supabase JWT in the Authorization
 * header. We read their own profiles row (RLS lets a user read only their own),
 * and return "pro" iff profiles.plan === 'pro'. Anything missing / failing
 * degrades safely to "free" — the gate fails closed to the free tier, never
 * accidentally granting Pro.
 * ---------------------------------------------------------------------------
 */
import type { Plan } from "./freemium";

export interface SupabaseEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

/**
 * @param authHeader  The incoming `Authorization: Bearer <jwt>` header, or null.
 * @param env         Supabase URL + anon key (from Cloudflare env bindings).
 */
export async function resolvePlan(authHeader: string | null, env: SupabaseEnv): Promise<Plan> {
  const url = env.SUPABASE_URL;
  const anon = env.SUPABASE_ANON_KEY;
  if (!authHeader || !url || !anon) return "free";
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/profiles?select=plan`, {
      headers: {
        apikey: anon,
        Authorization: authHeader,
        Accept: "application/json",
      },
    });
    if (!res.ok) return "free";
    const rows = (await res.json()) as Array<{ plan?: string }>;
    const plan = Array.isArray(rows) && rows[0]?.plan;
    return plan === "pro" ? "pro" : "free";
  } catch {
    return "free";
  }
}
