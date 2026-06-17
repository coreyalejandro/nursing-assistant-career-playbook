/**
 * functions/api/[[route]].ts
 * ---------------------------------------------------------------------------
 * Cloudflare Pages Functions adapter. Catches every /api/* request and
 * dispatches to the SAME framework-neutral handlers the local Express server
 * uses (server/handlers.ts). Runs on the Workers runtime with nodejs_compat.
 *
 * Adds, at the edge:
 *   - KV-backed distributed rate limiting (server/kvLimiter)        [P1 fix]
 *   - Freemium daily AI quota: 10/day free, unlimited pro (server/freemium) [P0]
 * Both degrade gracefully if the RATE_LIMIT_KV binding is absent (e.g. a
 * preview without KV), so the app never hard-fails on a missing binding.
 *
 * Secrets (OPENROUTER_API_KEY, etc.) arrive as Cloudflare env bindings on
 * `context.env`; we bridge them into process.env so the shared handlers and the
 * OpenRouter client work unchanged.
 * ---------------------------------------------------------------------------
 */
import {
  chatHandler,
  optimizeHandler,
  jobsSearchHandler,
  statesHandler,
  stateRequirementsHandler,
  quizResultHandler,
  salaryBenchmarkHandler,
  negotiationHandler,
  healthHandler,
  type ApiResult,
} from "../../server/handlers";
import { kvRateLimit, type KVNamespace } from "../../server/kvLimiter";
import { checkAndCount, upgradePayload } from "../../server/freemium";
import { resolvePlan } from "../../server/entitlement";

interface Env {
  RATE_LIMIT_KV?: KVNamespace;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  UPGRADE_URL?: string;
  VITE_UPGRADE_URL?: string;
  [key: string]: unknown;
}

interface PagesContext {
  request: Request;
  env: Env;
}

/** AI routes are metered (rate limit + freemium quota). */
const AI_ROUTES = new Set([
  "/api/chat",
  "/api/optimize",
  "/api/jobs/search",
  "/api/quiz/result",
  "/api/negotiation",
  "/api/salary-benchmark",
]);

const RATE_LIMIT_PER_MIN = 15; // burst / denial-of-wallet guard, per IP

function json(r: ApiResult, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(r.body), {
    status: r.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

async function readBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  // Bridge Cloudflare env/secrets → process.env (requires nodejs_compat).
  const g = globalThis as any;
  if (!g.process) g.process = { env: {} };
  if (!g.process.env) g.process.env = {};
  Object.assign(g.process.env, env);

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();
  const kv = env.RATE_LIMIT_KV;

  // ----- Edge guards for metered AI routes -------------------------------
  if (kv && AI_ROUTES.has(pathname)) {
    const ip = clientIp(request);

    // 1) Distributed per-IP rate limit (replaces the in-memory limiter).
    const rl = await kvRateLimit(kv, ip, RATE_LIMIT_PER_MIN, 60);
    if (!rl.allowed) {
      return json(
        { status: 429, body: { success: false, error: "Too many requests. Please wait a moment and try again." } },
        { "Retry-After": String(rl.resetSeconds), "RateLimit-Remaining": "0" }
      );
    }

    // 2) Freemium daily quota: 10/day free, unlimited pro.
    const supaUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supaAnon = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
    const plan = await resolvePlan(request.headers.get("authorization"), {
      SUPABASE_URL: supaUrl,
      SUPABASE_ANON_KEY: supaAnon,
    });
    const sessionId =
      request.headers.get("x-session-id") || (await peekSessionId(request)) || ip;
    const decision = await checkAndCount(kv, sessionId, plan);
    if (!decision.allowed) {
      const upgradeUrl = (env.UPGRADE_URL || env.VITE_UPGRADE_URL || "") as string;
      return json(
        { status: 402, body: upgradePayload(decision, upgradeUrl) },
        { "X-Freemium-Remaining": "0" }
      );
    }
  }

  try {
    if (method === "POST") {
      const body = await readBody(request);
      switch (pathname) {
        case "/api/chat":
          return json(await chatHandler(body));
        case "/api/optimize":
          return json(await optimizeHandler(body));
        case "/api/jobs/search":
          return json(await jobsSearchHandler(body));
        case "/api/quiz/result":
          return json(await quizResultHandler(body));
        case "/api/negotiation":
          return json(await negotiationHandler(body));
      }
    } else if (method === "GET") {
      switch (pathname) {
        case "/api/health":
          return json(healthHandler());
        case "/api/states":
          return json(statesHandler());
        case "/api/state-requirements":
          return json(
            stateRequirementsHandler(
              url.searchParams.get("code") || url.searchParams.get("state") || "GA"
            )
          );
        case "/api/salary-benchmark":
          return json(
            await salaryBenchmarkHandler({
              zip: url.searchParams.get("zip") || "",
              role: url.searchParams.get("role") || "",
            })
          );
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}

/** Best-effort read of a sessionId from a cloned POST body (does not consume the request). */
async function peekSessionId(request: Request): Promise<string | null> {
  if (request.method.toUpperCase() !== "POST") return null;
  try {
    const clone = request.clone();
    const b = (await clone.json()) as any;
    return b && typeof b.sessionId === "string" ? b.sessionId : null;
  } catch {
    return null;
  }
}
