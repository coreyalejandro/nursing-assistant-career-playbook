import React, { useState, lazy, Suspense } from "react";
import { usePlaybook } from "../lib/resumeState";
import { Sparkles, Heart, ClipboardCheck, MessageSquare, Award, ArrowRight, Landmark, ThumbsUp, HelpCircle } from "lucide-react";

// Lazy-loaded so the Firebase chunk stays off the initial critical path.
const RetentionPanel = lazy(() => import("./RetentionPanel"));

export default function HomeDashboard() {
  const { state, dispatch } = usePlaybook();

  const handleRoute = (path: string) => {
    window.history.pushState({}, "", path);
    dispatch({ type: "SET_ROUTE", payload: path });
  };

  const steps = [
    { title: "Define Career Sector", desc: "Select a goal hiring network (e.g. Hospital or SNF) to align certification listings." },
    { title: "Review 20-Point Compliance Checklist", desc: "Self-assess against real state CMS mandates and falls prevention rules like STEADI." },
    { title: "Complete Behavioral Simulation", desc: "Test yourself in the simulator to polish metrics and STAR statements." },
    { title: "Deploy Live Share Link", desc: "Generate an encrypted mobile portfolio link to fast-track recruitment reviews." }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero card */}
      <div className="border-4 border-slate-900 bg-[#fdfafd] p-6 md:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-slate-900 space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
          <span className="font-mono text-[9px] font-black uppercase text-indigo-700 tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5">
            GEORGIA CLINICAL REGULATORY COMPLIANT
          </span>
        </div>

        <h1 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight leading-none">
          Accelerate your CNA career path to elite wage standards.
        </h1>

        <p className="font-sans text-xs sm:text-sm text-slate-650 max-w-3xl leading-relaxed font-semibold">
          Most nursing assistants work under static compensation frameworks because they lack the specific, audit-grade verification required by premium clinical networks. This Playbook empowers caregivers with interactive tools to map, test, and optimize an unhackable professional profile.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => handleRoute("/resume")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-black uppercase tracking-wider px-5 py-3 border border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer flex items-center gap-1"
          >
            Build Optimized Resume <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRoute("/audit")}
            className="bg-white hover:bg-slate-50 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider px-5 py-3 border border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer flex items-center gap-1"
          >
            Run Clinical Compliance Audit
          </button>
        </div>
      </div>

      {/* Retention loop: account + progress dashboard + reminders */}
      <Suspense fallback={<div className="border-2 border-slate-900 bg-white p-6 text-center font-mono text-xs text-slate-400">Loading your progress…</div>}>
        <RetentionPanel />
      </Suspense>

      {/* Georgia Stats Dashboard Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border-2 border-slate-900 bg-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="block font-mono text-[8px] uppercase tracking-wider text-slate-400 font-extrabold leading-none mb-1">
            MEDIAN GEORGIA BASE RATE
          </span>
          <span className="font-display font-black text-2xl text-slate-950">$21.75 / hr</span>
          <p className="text-[10px] text-slate-500 font-sans font-medium mt-1">
            Based on active Atlanta acute care and long-term facility schedules.
          </p>
        </div>

        <div className="border-2 border-slate-900 bg-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(79,70,229,0.15)]">
          <span className="block font-mono text-[8px] uppercase tracking-wider text-slate-400 font-extrabold leading-none mb-1">
            ELITE CERTIFICATION PREMIUM
          </span>
          <span className="font-display font-black text-2xl text-rose-500">+$2.75 / hr Bonus</span>
          <p className="text-[10px] text-slate-500 font-sans font-medium mt-1">
            Typical wage bump recorded by Certified Medication Aides (CMAs) in high-volume settings.
          </p>
        </div>

        <div className="border-2 border-slate-900 bg-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(16,185,129,0.15)]">
          <span className="block font-mono text-[8px] uppercase tracking-wider text-slate-400 font-extrabold leading-none mb-1">
            STEADI SAFETY STANDARD
          </span>
          <span className="font-display font-black text-2xl text-emerald-600">15% Less Floor Falls</span>
          <p className="text-[10px] text-slate-500 font-sans font-medium mt-1">
            Fall minimization recorded by implementing standard CDC assessments.
          </p>
        </div>
      </div>

      {/* Structured Roadmap Checklist Blocks */}
      <div className="border-2 border-slate-900 bg-white p-6 rounded-none">
        <h3 className="font-display font-black text-lg uppercase text-slate-955 border-b border-slate-100 pb-2 mb-4">
          Integrated Career Blueprint Steps
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div key={st.title} className="space-y-2 relative">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-900 text-white font-mono text-xs font-black flex items-center justify-center select-none rounded-none">
                  {idx + 1}
                </span>
                <h4 className="font-sans font-extrabold text-[12px] text-slate-900 uppercase tracking-tight">
                  {st.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal font-sans font-medium">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Route Quick-Access Portal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-2 border-slate-900 bg-white p-5 rounded-none hover:border-indigo-600 transition-all cursor-pointer" onClick={() => handleRoute("/resume")}>
          <Award className="w-8 h-8 text-indigo-600 mb-2" />
          <h4 className="font-display font-black text-sm uppercase text-slate-900 leading-tight">
            ATS-Optimized CV Builder
          </h4>
          <p className="text-[11px] text-slate-500 font-sans font-semibold mt-1">
            Complete all 8 mandatory profile fields and export to print-ready PDF formats or encrypted sharing links.
          </p>
        </div>

        <div className="border-2 border-slate-900 bg-white p-5 rounded-none hover:border-indigo-600 transition-all cursor-pointer" onClick={() => handleRoute("/playbook")}>
          <MessageSquare className="w-8 h-8 text-indigo-600 mb-2" />
          <h4 className="font-display font-black text-sm uppercase text-slate-900 leading-tight">
            Interactive SIMs & Wages
          </h4>
          <p className="text-[11px] text-slate-500 font-sans font-semibold mt-1">
            Practice Georgia-specific job scenarios or search local opening stats relative to active ZIP codes.
          </p>
        </div>

        <div className="border-2 border-slate-900 bg-white p-5 rounded-none hover:border-indigo-600 transition-all cursor-pointer" onClick={() => handleRoute("/audit")}>
          <ClipboardCheck className="w-8 h-8 text-indigo-600 mb-2" />
          <h4 className="font-display font-black text-sm uppercase text-slate-900 leading-tight">
            20-Point Compliance Suite
          </h4>
          <p className="text-[11px] text-slate-500 font-sans font-semibold mt-1">
            Assess your professional background in real-time to compute validation readiness ratings.
          </p>
        </div>
      </div>
    </div>
  );
}
