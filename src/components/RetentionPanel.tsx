/**
 * src/components/RetentionPanel.tsx
 * ---------------------------------------------------------------------------
 * The retention loop, assembled and mounted on the home screen:
 *   - Sign-in nudge (Google / guest) when signed out.
 *   - Progress dashboard (cert-renewal countdown + checklist).
 *   - Persistence: always to localStorage; additionally to Firestore when
 *     signed in, so progress follows the user across devices.
 *   - Reminder notifications (renewal countdown + weekly check-in).
 *
 * Works with or without Firebase fully configured: signed-out users still get
 * a working, locally-saved dashboard; signing in upgrades it to cross-device.
 * ---------------------------------------------------------------------------
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LogIn, BellRing, Bell, CheckCircle2, HardDrive } from "lucide-react";
import ProgressTracker, { ChecklistItem, DEFAULT_CHECKLIST } from "./ProgressTracker";
import { useUserProfile } from "../lib/userProfile";
import { useI18n } from "../lib/i18n";
import {
  currentPermission,
  requestReminderPermission,
  runReminderCheck,
  recordVisit,
  type Permission,
} from "../lib/notifications";

const LS_KEY = "cna_progress_v1";

interface SavedProgress {
  renewalDate: string;
  checklist: ChecklistItem[];
}

function loadLocal(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedProgress) : null;
  } catch {
    return null;
  }
}
function saveLocal(p: SavedProgress): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export default function RetentionPanel() {
  const { user, profile, signInWithGoogle, signInGuest, saveProfile, error } = useUserProfile();
  const { t } = useI18n();

  const seed = loadLocal();
  const [renewalDate, setRenewalDate] = useState<string>(seed?.renewalDate || "");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(seed?.checklist?.length ? seed.checklist : DEFAULT_CHECKLIST);
  const [perm, setPerm] = useState<Permission>(currentPermission());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Record the visit + run reminder checks on mount.
  useEffect(() => {
    recordVisit();
    if (currentPermission() === "granted") void runReminderCheck({ renewalDate: seed?.renewalDate });
  }, []);

  // When the signed-in profile loads, prefer the cloud copy.
  useEffect(() => {
    if (!profile) return;
    if (typeof profile.renewalDate === "string") setRenewalDate(profile.renewalDate);
    if (typeof profile.progressJson === "string") {
      try {
        const parsed = JSON.parse(profile.progressJson) as ChecklistItem[];
        if (Array.isArray(parsed) && parsed.length) setChecklist(parsed);
      } catch { /* ignore malformed */ }
    }
  }, [profile]);

  const persist = useCallback(
    (next: SavedProgress) => {
      saveLocal(next);
      if (user) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          void saveProfile({ renewalDate: next.renewalDate, progressJson: JSON.stringify(next.checklist) });
        }, 800); // debounce cloud writes
      }
    },
    [user, saveProfile]
  );

  const handleChange = useCallback(
    (next: { renewalDate: string; checklist: ChecklistItem[] }) => {
      setRenewalDate(next.renewalDate);
      setChecklist(next.checklist);
      persist(next);
      if (currentPermission() === "granted") void runReminderCheck({ renewalDate: next.renewalDate });
    },
    [persist]
  );

  const enableReminders = useCallback(async () => {
    const res = await requestReminderPermission();
    setPerm(res);
    if (res === "granted") await runReminderCheck({ renewalDate });
  }, [renewalDate]);

  return (
    <div className="border-2 border-slate-900 bg-white rounded-none shadow-[4px_4px_0px_0px_rgba(15,23,42,0.12)]">
      {/* Header row: title + account status + reminders */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <h3 className="font-display font-black text-sm uppercase tracking-tight text-slate-900">
          {t("progress.title")}
        </h3>
        <div className="flex items-center gap-2">
          {/* Sync status */}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            {user ? (<><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t("account.synced")}</>)
                  : (<><HardDrive className="w-3.5 h-3.5 text-slate-400" /> {t("account.savedLocal")}</>)}
          </span>
          {/* Reminders */}
          {perm === "granted" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 bg-emerald-50 px-2 py-1">
              <BellRing className="w-3.5 h-3.5" /> {t("reminders.on")}
            </span>
          ) : perm === "denied" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 px-2 py-1" title={t("reminders.blocked")}>
              <Bell className="w-3.5 h-3.5" /> {t("reminders.blocked")}
            </span>
          ) : perm === "unsupported" ? null : (
            <button
              onClick={enableReminders}
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide bg-slate-900 text-white px-2.5 py-1 hover:bg-slate-800 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" /> {t("reminders.enable")}
            </button>
          )}
        </div>
      </div>

      {/* Signed-out nudge */}
      {!user && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-5 py-3">
          <p className="text-xs font-semibold text-amber-900">{t("account.signInToSave")}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => signInWithGoogle()}
              className="inline-flex items-center gap-1.5 bg-white border-2 border-slate-900 text-slate-900 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 hover:bg-slate-50 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" /> {t("account.google")}
            </button>
            <button
              onClick={() => signInGuest()}
              className="bg-amber-500 text-slate-950 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 hover:bg-amber-400 cursor-pointer"
            >
              {t("account.guest")}
            </button>
          </div>
        </div>
      )}
      {error && !user && <p className="px-5 py-2 text-[11px] text-rose-600 font-medium">{error}</p>}

      {/* The dashboard */}
      <div className="p-4">
        <ProgressTracker
          initialRenewalDate={renewalDate}
          initialChecklist={checklist}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
