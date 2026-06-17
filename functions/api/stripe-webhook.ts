/**
 * functions/api/stripe-webhook.ts
 * ---------------------------------------------------------------------------
 * Stripe webhook → grants Pro. [Completes the DeepSeek P0 freemium loop.]
 *
 * On `checkout.session.completed`, sets profiles.plan = 'pro' for the Supabase
 * user whose id was passed as the Stripe `client_reference_id` (the upgrade UI
 * appends it to the Payment Link). The signature is verified with Web Crypto
 * HMAC-SHA256 against STRIPE_WEBHOOK_SECRET — no Stripe SDK needed on Workers.
 *
 * Activate by setting these Cloudflare env vars (server secrets):
 *   STRIPE_WEBHOOK_SECRET, SUPABASE_URL (or VITE_SUPABASE_URL),
 *   SUPABASE_SERVICE_ROLE_KEY
 * Until they're set, the endpoint returns 503 (cleanly inert).
 * ---------------------------------------------------------------------------
 */
interface Env {
  STRIPE_WEBHOOK_SECRET?: string;
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  [k: string]: unknown;
}

interface Ctx {
  request: Request;
  env: Env;
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(sig);
}

/** Constant-time-ish string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verify a Stripe `Stripe-Signature` header (t=...,v1=...). */
async function verifyStripe(secret: string, rawBody: string, header: string | null): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  const expected = await hmacSha256Hex(secret, `${t}.${rawBody}`);
  return safeEqual(expected, v1);
}

export async function onRequestPost(context: Ctx): Promise<Response> {
  const { request, env } = context;
  const secret = env.STRIPE_WEBHOOK_SECRET;
  const supaUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !supaUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Webhook not configured." }), { status: 503 });
  }

  const rawBody = await request.text();
  const ok = await verifyStripe(secret, rawBody, request.headers.get("stripe-signature"));
  if (!ok) {
    return new Response(JSON.stringify({ error: "Invalid signature." }), { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Bad payload." }), { status: 400 });
  }

  if (event?.type === "checkout.session.completed") {
    const userId = event?.data?.object?.client_reference_id;
    if (userId) {
      // Service role bypasses RLS to flip the plan.
      await fetch(`${supaUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ plan: "pro" }),
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
