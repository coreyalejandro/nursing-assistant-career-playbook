/**
 * server/security.ts
 * ---------------------------------------------------------------------------
 * Dependency-free security middleware and helpers for the CNA Career Playbook
 * Express server. Implemented without external packages (no helmet /
 * express-rate-limit) so the production build never depends on an extra
 * `npm install` step and is guaranteed to bundle with esbuild --packages=external.
 *
 * Provides:
 *   - securityHeaders():        helmet-style hardening headers + CSP
 *   - createRateLimiter():      in-memory fixed-window IP rate limiter
 *   - createSessionQuota():     per-session daily budget for expensive AI calls
 *   - scrubForLog():            redacts PII/PHI before anything is logged
 *   - redactHighRiskPHI():      strips never-needed identifiers (SSN, card #)
 *                               from text before it reaches the model
 *   - sanitizeClientError():    safe, generic error message for HTTP responses
 *   - safeLog / safeWarn / safeError: logging wrappers that auto-scrub
 *   - TTLCache:                 tiny in-memory cache for grounding responses
 *   - getClientIp():            X-Forwarded-For aware client IP (Cloud Run)
 * ---------------------------------------------------------------------------
 */

import type { Request, Response, NextFunction } from "express";

/* -------------------------------------------------------------------------- */
/* Client IP (Cloud Run sits behind a proxy that sets X-Forwarded-For)        */
/* -------------------------------------------------------------------------- */

export function getClientIp(req: Request): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    // First hop is the real client; the rest are proxies.
    return xff.split(",")[0].trim();
  }
  if (Array.isArray(xff) && xff.length > 0) {
    return xff[0].split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

/* -------------------------------------------------------------------------- */
/* Security headers (helmet-equivalent, hand-rolled)                          */
/* -------------------------------------------------------------------------- */

export function securityHeaders() {
  // Content-Security-Policy tuned for: Vite-built bundle, Tailwind inline
  // styles, Firebase (Auth + Firestore), Google Fonts, and the same-origin
  // /api + /live (WebSocket) endpoints. Adjust connect-src if you add hosts.
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Vite output is hashed; allow same-origin scripts. 'unsafe-inline' is
    // required by the injected module preload shim in some builds.
    "script-src 'self' 'unsafe-inline'",
    // Firebase Auth/Firestore + same-origin websocket for the live voice agent.
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com wss: ws:",
    "manifest-src 'self'",
    "worker-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  return function (_req: Request, res: Response, next: NextFunction) {
    res.setHeader("Content-Security-Policy", csp);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), camera=(), microphone=(self), payment=()"
    );
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    res.removeHeader("X-Powered-By");
    next();
  };
}

/* -------------------------------------------------------------------------- */
/* In-memory fixed-window rate limiter                                         */
/* -------------------------------------------------------------------------- */

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  /** Key function; defaults to client IP. */
  keyFn?: (req: Request) => string;
}

export function createRateLimiter(opts: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();
  const { windowMs, max } = opts;
  const message =
    opts.message ||
    "Too many requests. Please slow down and try again in a moment.";

  // Periodic sweep so the Map cannot grow unbounded.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(key);
    }
  }, Math.max(windowMs, 60_000));
  // Do not keep the event loop alive solely for the sweeper.
  if (typeof sweep.unref === "function") sweep.unref();

  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    const key = (opts.keyFn ? opts.keyFn(req) : getClientIp(req)) || "unknown";
    const now = Date.now();
    let b = buckets.get(key);

    if (!b || b.resetAt <= now) {
      b = { count: 0, resetAt: now + windowMs };
      buckets.set(key, b);
    }

    b.count += 1;
    const remaining = Math.max(0, max - b.count);
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil((b.resetAt - now) / 1000)));

    if (b.count > max) {
      const retryAfter = Math.ceil((b.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({ success: false, error: message, retryAfter });
      return;
    }
    next();
  };
}

/* -------------------------------------------------------------------------- */
/* Per-session daily quota for expensive AI calls (denial-of-wallet guard)     */
/* -------------------------------------------------------------------------- */

export function createSessionQuota(maxPerDay = 200) {
  const dayMs = 24 * 60 * 60 * 1000;
  return createRateLimiter({
    windowMs: dayMs,
    max: maxPerDay,
    message:
      "Daily usage limit reached for AI features. This protects the service from abuse. Please try again tomorrow.",
    keyFn: (req) => {
      // Prefer an explicit session id, fall back to IP.
      const sid =
        (req.headers["x-session-id"] as string) ||
        (req.body && typeof req.body === "object" ? req.body.sessionId : "") ||
        "";
      return `sess:${sid || getClientIp(req)}`;
    },
  });
}

/* -------------------------------------------------------------------------- */
/* PII / PHI redaction                                                         */
/* -------------------------------------------------------------------------- */

const PII_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "SSN", re: /\b\d{3}-\d{2}-\d{4}\b/g },
  { label: "CREDIT_CARD", re: /\b(?:\d[ -]*?){13,16}\b/g },
  { label: "EMAIL", re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  {
    label: "PHONE",
    re: /\b(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/g,
  },
  { label: "DOB", re: /\b(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b/g },
  // Medical record / chart number patterns like "MRN 0012345" or "MR# 12345"
  { label: "MRN", re: /\bMR(?:N|#)?\s*[:#-]?\s*\d{4,10}\b/gi },
  // Room references such as "room 4B" / "rm 212"
  { label: "ROOM", re: /\b(?:room|rm)\s*#?\s*\d{1,4}[A-Za-z]?\b/gi },
];

/** Redact PII/PHI for logs — aggressive, because logs are long-lived. */
export function scrubForLog(input: unknown): string {
  let text = typeof input === "string" ? input : safeStringify(input);
  for (const { label, re } of PII_PATTERNS) {
    text = text.replace(re, `[REDACTED:${label}]`);
  }
  // Truncate so a single log line cannot exfiltrate a huge payload.
  return text.length > 2000 ? text.slice(0, 2000) + "…[truncated]" : text;
}

/**
 * Redact only the *never-needed* high-risk identifiers (SSN, card numbers,
 * MRNs) before text reaches the model. Names / room numbers are intentionally
 * preserved so the model can still detect them and trigger its HIPAA pivot,
 * which is more helpful to the user than silent deletion.
 * Returns the cleaned text plus which categories were found.
 */
export function redactHighRiskPHI(text: string): {
  text: string;
  flagged: string[];
} {
  if (!text) return { text: "", flagged: [] };
  const flagged: string[] = [];
  let out = text;
  for (const { label, re } of PII_PATTERNS) {
    if (label === "SSN" || label === "CREDIT_CARD" || label === "MRN") {
      if (re.test(out)) {
        flagged.push(label);
        out = out.replace(re, `[REDACTED:${label}]`);
      }
    } else if (re.test(out)) {
      flagged.push(label);
    }
    re.lastIndex = 0;
  }
  return { text: out, flagged };
}

/* -------------------------------------------------------------------------- */
/* Error sanitization + safe logging                                           */
/* -------------------------------------------------------------------------- */

const GENERIC_ERROR =
  "We hit a problem completing that request. Please try again in a moment.";

/**
 * Never leak raw provider/internal error strings to the browser. Map known,
 * safe-to-surface conditions to friendly text; everything else is generic.
 */
export function sanitizeClientError(err: any): string {
  const msg = (err && (err.message || err.toString())) || "";
  if (/api[_ ]?key|GEMINI_API_KEY/i.test(msg)) {
    return "The AI service is not configured yet. Please contact the site administrator.";
  }
  if (err && (err.status === 429 || /quota|rate|429/i.test(msg))) {
    return "The AI service is busy right now. Please try again shortly.";
  }
  if (err && (err.status === 503 || /unavailable|503|overloaded/i.test(msg))) {
    return "The AI service is temporarily unavailable. Please try again shortly.";
  }
  return GENERIC_ERROR;
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export function safeLog(...args: unknown[]): void {
  console.log(...args.map((a) => scrubForLog(a)));
}
export function safeWarn(...args: unknown[]): void {
  console.warn(...args.map((a) => scrubForLog(a)));
}
export function safeError(...args: unknown[]): void {
  console.error(...args.map((a) => scrubForLog(a)));
}

/* -------------------------------------------------------------------------- */
/* Tiny TTL cache (for grounding-backed salary / job responses)                */
/* -------------------------------------------------------------------------- */

export class TTLCache<T> {
  private store = new Map<string, { value: T; expiresAt: number }>();
  constructor(private ttlMs: number, private maxEntries = 500) {}

  get(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.maxEntries) {
      // Drop the oldest entry (insertion order) to cap memory.
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
