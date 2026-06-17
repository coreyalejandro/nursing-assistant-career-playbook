/**
 * src/components/UpgradeModal.tsx
 * Freemium paywall / pricing modal. Shown when a free user hits the daily AI
 * limit (HTTP 402) or taps "Upgrade". Accessible: role=dialog, aria-modal,
 * labelled heading, Escape to close, focus moved to the dialog on open.
 */
import React, { useEffect, useRef } from "react";
import { X, Check, Sparkles } from "lucide-react";

// Display constants kept inline (no import.meta) so this component renders in
// the jsdom test environment for axe checks.
const DEFAULT_FREE_LIMIT = 10;
const PRO_PRICE = "$4.99";
const PRO_PERIOD = "month";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  /** Prebuilt Stripe checkout URL (caller resolves it via lib/billing). */
  upgradeUrl?: string;
  used?: number;
  limit?: number;
}

export default function UpgradeModal({ open, onClose, upgradeUrl = "", used, limit = DEFAULT_FREE_LIMIT }: UpgradeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        aria-describedby="upgrade-desc"
        tabIndex={-1}
        className="w-full max-w-md bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-slate-950 px-5 py-3">
          <h2 id="upgrade-title" className="flex items-center gap-2 font-display font-black uppercase tracking-wide text-amber-400 text-sm">
            <Sparkles className="w-4 h-4" /> Upgrade to Pro
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close upgrade dialog"
            className="text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 text-slate-900">
          <p id="upgrade-desc" className="text-sm text-slate-700 mb-4">
            {typeof used === "number"
              ? `You've used your ${limit} free AI interactions for today.`
              : `Free includes ${limit} AI interactions per day.`}{" "}
            Go unlimited with Pro.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="border-2 border-slate-300 p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">Free</p>
              <p className="font-display font-black text-2xl">$0</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /> {limit} AI chats/day</li>
                <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /> 50-state guidance</li>
                <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /> Offline + crisis line</li>
              </ul>
            </div>
            <div className="border-2 border-amber-500 p-3 bg-amber-50">
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-700 font-bold">Pro</p>
              <p className="font-display font-black text-2xl">{PRO_PRICE}<span className="text-xs font-bold text-slate-500">/{PRO_PERIOD}</span></p>
              <ul className="mt-2 space-y-1 text-xs text-slate-700">
                <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /> Unlimited AI coaching</li>
                <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /> Mock interviews + résumé AI</li>
                <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /> Job-match alerts</li>
              </ul>
            </div>
          </div>

          {upgradeUrl ? (
            <a
              href={upgradeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-widest text-xs py-3 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
            >
              Upgrade to Pro — {PRO_PRICE}/{PRO_PERIOD}
            </a>
          ) : (
            <p className="text-center text-xs text-slate-500 border-2 border-dashed border-slate-300 py-3">
              Checkout link not configured yet. Come back tomorrow for more free interactions.
            </p>
          )}
          <button type="button" onClick={onClose} className="mt-3 block w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
