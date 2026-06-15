/**
 * src/lib/notifications.ts
 * ---------------------------------------------------------------------------
 * Reminder notifications for the retention loop.
 *
 * WORKING NOW (no backend, no keys required):
 *   - requestReminderPermission(): asks the browser for Notification permission.
 *   - runReminderCheck(): fires due reminders when the app is open —
 *       • CNA certification renewal at 60 / 30 / 7 / 0 days out
 *       • a gentle weekly check-in if it's been 7+ days since last visit
 *     De-duplicated via localStorage so users are never spammed.
 *
 * BACKGROUND PUSH (when the tab is closed) uses the standard Web Push API:
 *   - enablePushIfConfigured() is a ready hook that activates only when you set
 *     VITE_PUSH_VAPID_KEY (your VAPID public key) and wire a push subscription
 *     to a send service. The service worker already carries the push +
 *     notificationclick handlers. This is vendor-neutral (no Firebase needed).
 * ---------------------------------------------------------------------------
 */

const LS_PREFIX = "cna_reminder_";
const LAST_VISIT_KEY = "cna_last_visit";

export type Permission = "default" | "granted" | "denied" | "unsupported";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function currentPermission(): Permission {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission as Permission;
}

export async function requestReminderPermission(): Promise<Permission> {
  if (!notificationsSupported()) return "unsupported";
  try {
    const res = await Notification.requestPermission();
    return res as Permission;
  } catch {
    return currentPermission();
  }
}

async function show(title: string, body: string, tag: string): Promise<void> {
  if (currentPermission() !== "granted") return;
  const opts: NotificationOptions = {
    body,
    tag,
    icon: "/icons/icon.svg",
    badge: "/icons/icon.svg",
  };
  try {
    // Prefer the service worker registration (more reliable, allows actions).
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, opts);
        return;
      }
    }
    new Notification(title, opts);
  } catch {
    /* best-effort */
  }
}

/** Fire a reminder at most once per key per window (default 20h). */
function firedRecently(key: string, withinMs = 20 * 60 * 60 * 1000): boolean {
  try {
    const last = Number(localStorage.getItem(LS_PREFIX + key) || 0);
    return Date.now() - last < withinMs;
  } catch {
    return false;
  }
}
function markFired(key: string): void {
  try { localStorage.setItem(LS_PREFIX + key, String(Date.now())); } catch { /* ignore */ }
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

export function recordVisit(): void {
  try { localStorage.setItem(LAST_VISIT_KEY, String(Date.now())); } catch { /* ignore */ }
}

/**
 * Evaluate and fire any due reminders. Safe to call on every app load; it
 * self-throttles. Returns the list of reminder keys it fired (for testing/UX).
 */
export async function runReminderCheck(opts: { renewalDate?: string }): Promise<string[]> {
  const fired: string[] = [];
  if (currentPermission() !== "granted") return fired;

  // 1) Certification renewal countdown.
  const d = daysUntil(opts.renewalDate);
  if (d !== null) {
    const milestones: { at: number; key: string; title: string; body: string }[] = [
      { at: 60, key: "renew60", title: "CNA renewal in ~60 days", body: "Start gathering your work hours and any required in-service credits." },
      { at: 30, key: "renew30", title: "CNA renewal in ~30 days", body: "Confirm your renewal steps on your state's Nurse Aide Registry." },
      { at: 7, key: "renew7", title: "CNA renewal in ~1 week", body: "Submit your renewal soon to avoid a lapse in certification." },
      { at: 0, key: "renew0", title: "CNA renewal is due", body: "Verify your status on the registry today to stay active." },
    ];
    for (const m of milestones) {
      if (d <= m.at && d > (m.at === 0 ? -3650 : m.at - 30) && !firedRecently(m.key, 7 * 24 * 60 * 60 * 1000)) {
        await show(m.title, m.body, m.key);
        markFired(m.key);
        fired.push(m.key);
        break; // one renewal reminder per check
      }
    }
  }

  // 2) Weekly check-in.
  try {
    const last = Number(localStorage.getItem(LAST_VISIT_KEY) || 0);
    const since = Date.now() - last;
    if (last > 0 && since > 7 * 24 * 60 * 60 * 1000 && !firedRecently("weekly")) {
      await show("Your CNA Career Playbook is here when you are", "A quick check-in: one small step this week keeps your plan moving.", "weekly");
      markFired("weekly");
      fired.push("weekly");
    }
  } catch { /* ignore */ }

  return fired;
}

/**
 * Background push scaffold. No-ops unless VITE_PUSH_VAPID_KEY is set.
 * When you're ready: subscribe via the standard PushManager
 * (registration.pushManager.subscribe with your VAPID public key), register
 * the subscription with your send service, and the service worker's push
 * handler displays it. Vendor-neutral — no Firebase dependency.
 */
export async function enablePushIfConfigured(): Promise<boolean> {
  const vapid = (import.meta as any).env?.VITE_PUSH_VAPID_KEY;
  if (!vapid) return false;
  // Intentionally left as an integration point — see ENTERPRISE.md / CHANGES.md.
  return false;
}
