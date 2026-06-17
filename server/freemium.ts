/**
 * server/freemium.ts
 * ---------------------------------------------------------------------------
 * Freemium monetization gate for the expensive AI endpoints. [DeepSeek P0 fix]
 *
 *   FREE plan → FREE_DAILY_AI_LIMIT AI calls per rolling 24h day.
 *   PRO  plan → unlimited (the $4.99/mo tier; entitlement set by the Stripe
 *               webhook flipping profiles.plan = 'pro').
 *
 * `decide()` is pure (unit-tested). `checkAndCount()` persists the per-day
 * counter via the KV limiter (distributed on Cloudflare; an in-memory fake in
 * tests). Counting only happens when a call is actually allowed, so a FREE user
 * gets exactly FREE_DAILY_AI_LIMIT successful calls/day.
 * ---------------------------------------------------------------------------
 */
import { type KVNamespace, incrementCount, readCount, windowKey } from "./kvLimiter";

export type Plan = "free" | "pro";

/** Free users get this many AI interactions per day. */
export const FREE_DAILY_AI_LIMIT = 10;
const DAY_SECONDS = 24 * 60 * 60;

export interface FreemiumDecision {
  allowed: boolean;
  plan: Plan;
  /** Daily limit for the plan (Infinity for pro). */
  limit: number;
  /** How many calls have been used today (after this one, when allowed). */
  used: number;
  /** Calls left today (Infinity for pro). */
  remaining: number;
}

/**
 * Pure decision: given a plan and how many calls were already used today, is a
 * new call allowed? Used directly by the in-memory (Express) adapter, and by
 * tests.
 */
export function decide(plan: Plan, usedToday: number, freeLimit: number = FREE_DAILY_AI_LIMIT): FreemiumDecision {
  if (plan === "pro") {
    return { allowed: true, plan: "pro", limit: Infinity, used: usedToday, remaining: Infinity };
  }
  const remaining = Math.max(0, freeLimit - usedToday);
  return { allowed: usedToday < freeLimit, plan: "free", limit: freeLimit, used: usedToday, remaining };
}

/**
 * KV-backed gate. Reads today's usage for the session, and — if the FREE user
 * is still under the limit — increments and allows. PRO users always pass and
 * are never counted.
 */
export async function checkAndCount(
  kv: KVNamespace,
  sessionId: string,
  plan: Plan,
  nowMs: number = Date.now()
): Promise<FreemiumDecision> {
  if (plan === "pro") {
    return { allowed: true, plan: "pro", limit: Infinity, used: 0, remaining: Infinity };
  }
  const key = windowKey("q", sessionId, DAY_SECONDS, nowMs);
  const used = await readCount(kv, key);
  if (used >= FREE_DAILY_AI_LIMIT) {
    return { allowed: false, plan: "free", limit: FREE_DAILY_AI_LIMIT, used, remaining: 0 };
  }
  const newUsed = await incrementCount(kv, key, DAY_SECONDS);
  return {
    allowed: true,
    plan: "free",
    limit: FREE_DAILY_AI_LIMIT,
    used: newUsed,
    remaining: Math.max(0, FREE_DAILY_AI_LIMIT - newUsed),
  };
}

/** The 402 body returned to the client when a FREE user is out of calls. */
export function upgradePayload(d: FreemiumDecision, upgradeUrl: string) {
  return {
    success: false,
    error: `You've used your ${d.limit} free AI interactions for today. Upgrade to Pro for unlimited access, or come back tomorrow.`,
    code: "FREE_LIMIT_REACHED",
    plan: d.plan,
    limit: d.limit,
    used: d.used,
    upgradeUrl: upgradeUrl || null,
  };
}
