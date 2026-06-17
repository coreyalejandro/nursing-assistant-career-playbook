/**
 * src/lib/billing.ts
 * Client-side freemium constants + Stripe checkout link builder.
 *
 * The checkout URL is a Stripe Payment Link, configured at build time via
 * VITE_UPGRADE_URL (no payment backend needed). When the user is signed in we
 * append their Supabase user id as `client_reference_id`, which the Stripe
 * webhook (functions/api/stripe-webhook.ts) reads to flip profiles.plan = 'pro'.
 */
export const FREE_DAILY_AI_LIMIT = 10;
export const PRO_PRICE = "$4.99";
export const PRO_PERIOD = "month";

export function getUpgradeUrl(userId?: string | null): string {
  const base = ((import.meta as any).env?.VITE_UPGRADE_URL as string) || "";
  if (!base) return "";
  if (!userId) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}client_reference_id=${encodeURIComponent(userId)}`;
}
