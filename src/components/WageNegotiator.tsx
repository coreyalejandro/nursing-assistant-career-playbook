/**
 * src/components/WageNegotiator.tsx
 * Wage Negotiation Engine UI — collects the user's profile, calls
 * /api/negotiation, and shows a grounded target band + a personalized,
 * copy-ready negotiation script and talking points. Guidance, not a guarantee.
 */
import React, { useState } from 'react';
import { TrendingUp, Copy, Check, Loader2, Sparkles } from 'lucide-react';

interface Band { targetLow: number; targetHigh: number; stretch: number; median: number; rationale: string; }
interface Employer { name: string; wageRange?: string; }
interface NegotiationResult {
  band: Band;
  employers: Employer[];
  pitch: string;
  talkingPoints: string[];
  grounded: boolean;
}

export default function WageNegotiator() {
  const [role, setRole] = useState('Certified Nursing Assistant');
  const [location, setLocation] = useState('');
  const [years, setYears] = useState('5');
  const [currentWage, setCurrentWage] = useState('');
  const [strengths, setStrengths] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          location,
          yearsExperience: Number(years) || 0,
          currentWage: currentWage ? Number(currentWage) : undefined,
          strengths: strengths ? strengths.split(',').map((s) => s.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) setResult(data);
      else setError(data.error || 'Something went wrong. Please try again.');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyPitch = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.pitch);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const input = 'w-full border-2 border-slate-900 px-3 py-2 font-sans text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="rounded-none border-4 border-slate-900 bg-white p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
      <div className="mb-4 border-b-2 border-slate-900 pb-3 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        <div>
          <h2 className="font-display text-xl font-black text-slate-900 uppercase tracking-tight">Wage Negotiation Engine</h2>
          <p className="font-sans text-slate-600 text-xs font-medium">Get a grounded target range and a personalized pitch you can use in the conversation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">Role</span>
          <input className={input} value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">City, state or ZIP</span>
          <input className={input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Atlanta, GA or 30303" />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">Years of experience</span>
          <input className={input} type="number" min="0" max="40" value={years} onChange={(e) => setYears(e.target.value)} />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">Current wage / hr (optional)</span>
          <input className={input} type="number" min="0" step="0.25" value={currentWage} onChange={(e) => setCurrentWage(e.target.value)} placeholder="e.g., 21.50" />
        </label>
        <label className="block sm:col-span-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">Top strengths (comma-separated, optional)</span>
          <input className={input} value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="e.g., 15% fall reduction, PointClickCare EHR, dementia de-escalation" />
        </label>
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-mono text-xs font-black uppercase tracking-widest py-3 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculating…</> : <><Sparkles className="w-4 h-4" /> Build my negotiation plan</>}
      </button>

      {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}

      {result && (
        <div className="mt-5 space-y-4 animate-in fade-in duration-300">
          <div className="bg-emerald-50 border-2 border-emerald-600 p-4 rounded-none text-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800">Your defensible target</span>
            <div className="font-display text-3xl sm:text-4xl font-black text-emerald-700 my-1">
              ${result.band.targetLow.toFixed(2)} – ${result.band.targetHigh.toFixed(2)}<span className="text-lg text-slate-400">/hr</span>
            </div>
            <span className="font-mono text-[10px] text-slate-600 font-bold">Stretch ask: ${result.band.stretch.toFixed(2)}/hr · Market median: ${result.band.median.toFixed(2)}/hr</span>
            <p className="font-sans text-[11px] text-slate-600 mt-2 leading-relaxed">{result.band.rationale}</p>
          </div>

          <div className="bg-slate-950 text-slate-100 p-4 border-l-4 border-emerald-500 rounded-none">
            <div className="flex items-center justify-between mb-1">
              <span className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-widest">Your pitch</span>
              <button onClick={copyPitch} className="flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white uppercase tracking-wider cursor-pointer">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <p className="font-sans text-sm italic leading-relaxed">"{result.pitch}"</p>
          </div>

          <div>
            <h4 className="font-display font-black text-xs uppercase text-slate-900 mb-2">How to use it</h4>
            <ul className="space-y-1.5">
              {result.talkingPoints.map((tp, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-700 font-medium">
                  <span className="text-emerald-600 font-black">→</span>{tp}
                </li>
              ))}
            </ul>
          </div>

          {result.employers.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-3 text-xs">
              <strong className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Employers in range {result.grounded ? '(live)' : ''}</strong>
              {result.employers.map((e, i) => (
                <div key={i} className="text-slate-700">{e.name}{e.wageRange ? ` — ${e.wageRange}` : ''}</div>
              ))}
            </div>
          )}

          <p className="text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-2">
            Guidance only, not a guarantee. Figures are anchored to BLS data and {result.grounded ? 'live market postings' : 'regional estimates'}; verify current rates with each employer.
          </p>
        </div>
      )}
    </div>
  );
}
