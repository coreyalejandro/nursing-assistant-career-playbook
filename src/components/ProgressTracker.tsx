/**
 * src/components/ProgressTracker.tsx
 * ---------------------------------------------------------------------------
 * Progress dashboard SCAFFOLD — the recurring-engagement surface the audit
 * flagged as missing (turns episodic career planning into a weekly return).
 *
 * Pure presentational component (no Firebase import) so it is safe to drop in
 * anywhere. Wire it to useUserProfile() (src/lib/userProfile.ts) to persist
 * the certification-renewal date and checklist per signed-in user.
 *
 * To mount: import ProgressTracker into HomeDashboard and render it, optionally
 * passing a saved renewal date from the user's profile.
 * ---------------------------------------------------------------------------
 */
import React, { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Circle } from "lucide-react";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "cert", label: "Confirm certification is active on the state registry", done: false },
  { id: "ceu", label: "Log continuing-education / in-service hours", done: false },
  { id: "resume", label: "Refresh resume with this quarter's metrics", done: false },
  { id: "bridge", label: "Research one CNA-to-LPN bridge program", done: false },
  { id: "wellness", label: "Take one concrete burnout-recovery step", done: false },
];

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function ProgressTracker({
  initialRenewalDate = "",
  initialChecklist,
  onChange,
}: {
  initialRenewalDate?: string;
  initialChecklist?: ChecklistItem[];
  onChange?: (state: { renewalDate: string; checklist: ChecklistItem[] }) => void;
}) {
  const [renewalDate, setRenewalDate] = useState(initialRenewalDate);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist && initialChecklist.length ? initialChecklist : DEFAULT_CHECKLIST);

  // Re-hydrate when saved values arrive asynchronously (e.g., profile load).
  useEffect(() => { setRenewalDate(initialRenewalDate); }, [initialRenewalDate]);
  useEffect(() => {
    if (initialChecklist && initialChecklist.length) setChecklist(initialChecklist);
  }, [initialChecklist]);

  const remaining = useMemo(() => daysUntil(renewalDate), [renewalDate]);
  const completed = checklist.filter((c) => c.done).length;
  const pct = Math.round((completed / checklist.length) * 100);

  const toggle = (id: string) => {
    const next = checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c));
    setChecklist(next);
    onChange?.({ renewalDate, checklist: next });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" aria-label="Career progress tracker">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="w-5 h-5 text-amber-600" />
        <h3 className="font-bold text-slate-900">Your progress</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <label htmlFor="renewal" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
            CNA certification renewal date
          </label>
          <input
            id="renewal"
            type="date"
            value={renewalDate}
            onChange={(e) => { setRenewalDate(e.target.value); onChange?.({ renewalDate: e.target.value, checklist }); }}
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
          />
          <p className="mt-2 text-sm font-medium" role="status">
            {remaining === null
              ? "Set your renewal date to track the 24-month cycle."
              : remaining < 0
                ? `Renewal was ${Math.abs(remaining)} days ago — verify your registry status now.`
                : `${remaining} days until renewal.`}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">This quarter</span>
            <span className="text-xs font-bold text-amber-700">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {checklist.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-2 text-left text-sm py-1.5 px-2 rounded hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-pressed={item.done}
            >
              {item.done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
              <span className={item.done ? "line-through text-slate-400" : "text-slate-700"}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
