/**
 * src/components/AccountMenu.tsx
 * Compact sign-in / account control for the top navigation.
 * Google + guest sign-in via useUserProfile; shows account + sign-out when in.
 */
import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, LogIn, Check } from "lucide-react";
import { useUserProfile } from "../lib/userProfile";
import { useI18n } from "../lib/i18n";

export default function AccountMenu({ buttonClass = "" }: { buttonClass?: string }) {
  const { user, signInWithGoogle, signInGuest, signOutUser, error } = useUserProfile();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const label = user
    ? user.isAnonymous
      ? "Guest"
      : user.displayName || user.email || "Account"
    : t("account.signIn");

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={buttonClass || "flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] font-extrabold uppercase tracking-widest text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer outline-none focus:ring-2 focus:ring-yellow-400"}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="w-3.5 h-3.5" />
        <span className="max-w-[10ch] truncate">{label}</span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] z-[60] p-3 text-slate-900">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  {(label || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{t("progress.signedInAs")}</p>
                  <p className="text-sm font-semibold truncate">{label}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <Check className="w-3.5 h-3.5" /> {t("account.synced")}
              </div>
              <button
                onClick={() => { signOutUser(); setOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wide py-2 hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" /> {t("account.signOut")}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-600 font-medium mb-1">{t("account.signInToSave")}</p>
              <button
                onClick={() => { signInWithGoogle(); }}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-900 text-slate-900 text-xs font-bold uppercase tracking-wide py-2 hover:bg-slate-50"
              >
                <LogIn className="w-4 h-4" /> {t("account.google")}
              </button>
              <button
                onClick={() => { signInGuest(); }}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wide py-2 hover:bg-amber-400"
              >
                {t("account.guest")}
              </button>
              {error && <p className="text-[11px] text-rose-600 font-medium pt-1">{error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
