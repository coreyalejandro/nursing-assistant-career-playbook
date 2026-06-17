/**
 * src/lib/session.ts
 * Stable per-device session id, sent as `x-session-id` so the freemium daily
 * quota (and rate limiter) can attribute AI usage even for signed-out users.
 */
const KEY = "cna_session_id";

export function getSessionId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}
