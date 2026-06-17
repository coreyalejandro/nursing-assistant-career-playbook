/**
 * server/kvLimiter.ts
 * ---------------------------------------------------------------------------
 * Distributed, KV-backed fixed-window counters — the replacement for the
 * single-instance in-memory rate limiter when running on Cloudflare Pages
 * Functions (where each request may land on a different isolate, so an
 * in-process Map cannot enforce a shared limit). [DeepSeek P1 fix]
 *
 * Backed by Cloudflare Workers KV via a tiny structural `KVNamespace` interface,
 * so it is vendor-neutral and unit-testable with an in-memory fake. KV is
 * eventually consistent, so these are best-effort guards (correct for abuse /
 * denial-of-wallet cost control, not hard transactional limits).
 * ---------------------------------------------------------------------------
 */

/** The slice of the Cloudflare Workers KV API this module uses. */
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

/** Build a key that is stable within a fixed time window. */
export function windowKey(prefix: string, id: string, windowSeconds: number, nowMs: number = Date.now()): string {
  const bucket = Math.floor(nowMs / 1000 / windowSeconds);
  return `${prefix}:${id}:${bucket}`;
}

/** Read a counter without mutating it. */
export async function readCount(kv: KVNamespace, key: string): Promise<number> {
  const current = await kv.get(key);
  if (!current) return 0;
  const n = parseInt(current, 10);
  return Number.isFinite(n) ? n : 0;
}

/** Increment a counter and (re)set its TTL. Returns the new value. */
export async function incrementCount(kv: KVNamespace, key: string, ttlSeconds: number): Promise<number> {
  const next = (await readCount(kv, key)) + 1;
  // Workers KV enforces a 60-second floor on expirationTtl.
  await kv.put(key, String(next), { expirationTtl: Math.max(60, ttlSeconds) });
  return next;
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Fixed-window rate limit check. Increments the window counter for `id` and
 * reports whether it is still within `limit`.
 */
export async function kvRateLimit(
  kv: KVNamespace,
  id: string,
  limit: number,
  windowSeconds: number,
  nowMs: number = Date.now()
): Promise<RateLimitResult> {
  const key = windowKey("rl", id, windowSeconds, nowMs);
  const count = await incrementCount(kv, key, windowSeconds);
  const elapsed = Math.floor(nowMs / 1000) % windowSeconds;
  return {
    allowed: count <= limit,
    count,
    limit,
    remaining: Math.max(0, limit - count),
    resetSeconds: windowSeconds - elapsed,
  };
}
