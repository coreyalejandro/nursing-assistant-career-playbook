/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PlaybookData, JourneyStage } from "../types";
import { Search, Compass, Share2, Activity, Shield, DollarSign, AlertCircle, Ban, TrendingUp, Sparkles } from "lucide-react";

interface JourneyMapProps {
  playbookData: PlaybookData;
}

export default function JourneyMap({ playbookData }: JourneyMapProps) {
  const [activeTab, setActiveTab] = useState<"works" | "broken" | "innovate">("works");
  const { journeyStages, gaps } = playbookData;

  const stageIcons: Record<string, any> = {
    "Phase 01": Search,
    "Phase 02": Compass,
    "Phase 03": Share2,
    "Phase 04": Activity,
    "Phase 05": Shield,
    "Phase 06": DollarSign,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 border border-emerald-600 font-mono font-bold uppercase select-none">Good Conversion</span>;
      case "bad":
        return <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 border border-rose-600 font-mono font-bold uppercase select-none">Broken Step</span>;
      default:
        return <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 border border-amber-600 font-mono font-bold uppercase select-none">Moderate Response</span>;
    }
  };

  return (
    <section id="journey" className="py-16 border-b-2 border-slate-900 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-600"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-indigo-600 font-bold">Section 03</span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-5xl text-slate-900 tracking-tight uppercase">
            THE JOB SEEKER <span className="text-indigo-600 italic">JOURNEY MAPPED</span>
          </h2>
          <p className="font-sans font-medium text-slate-500 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
            Three views of the Certified Nursing Assistant recruitment lifecycle: what works, what is completely broken, and where innovation is hiding.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap border-b-2 border-slate-900 mb-8 gap-2 font-sans">
          <button
            onClick={() => setActiveTab("works")}
            className={`px-5 py-3 font-display font-black text-xs uppercase tracking-widest border-2 border-b-0 cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "works"
                ? "bg-slate-900 text-white border-slate-900 shadow-[3px_-3px_0px_0px_rgba(79,70,229,1)]"
                : "bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-500"
            }`}
          >
            ✓ What Works
          </button>
          <button
            onClick={() => setActiveTab("broken")}
            className={`px-5 py-3 font-display font-black text-xs uppercase tracking-widest border-2 border-b-0 cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "broken"
                ? "bg-slate-900 text-white border-slate-900 shadow-[3px_-3px_0px_0px_rgba(239,68,68,1)]"
                : "bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-500"
            }`}
          >
            ✗ What's Broken
          </button>
          <button
            onClick={() => setActiveTab("innovate")}
            className={`px-5 py-3 font-display font-black text-xs uppercase tracking-widest border-2 border-b-0 cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "innovate"
                ? "bg-slate-900 text-white border-slate-900 shadow-[3px_-3px_0px_0px_rgba(245,158,11,1)]"
                : "bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-500"
            }`}
          >
            ⚡ Ripe for Innovation
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "works" && (
          <div className="space-y-6">
            <p className="font-mono text-xs text-indigo-600 font-bold uppercase tracking-widest mb-4">
              ✨ The High-Conversion Funnel for Professional CNAs
            </p>
            {/* Pipelines pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {journeyStages.map((stg) => {
                const IconComponent = stageIcons[stg.phase] || Compass;
                return (
                  <div key={stg.phase} className="border-2 border-slate-900 rounded-none p-5 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">{stg.phase}</span>
                        {getStatusBadge(stg.status)}
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-none">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-black text-sm text-slate-950 uppercase tracking-tight leading-tight">{stg.title}</h4>
                          <h5 className="font-mono text-[10px] text-emerald-600 font-bold uppercase mt-0.5">≡ {stg.devParallel}</h5>
                        </div>
                      </div>
                      <p className="font-sans text-xs text-slate-600 mt-3 leading-relaxed">{stg.action}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 border border-slate-300 uppercase">{stg.artifact}</span>
                      <span className="text-slate-950 font-bold bg-amber-400 border border-slate-950 px-2 py-0.5">{stg.signalStrength} Signal</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "broken" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Failures list */}
            <div className="bg-rose-50 border-2 border-rose-950 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-rose-500 text-white rounded-none border border-rose-750">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h4 className="font-display font-black text-sm text-rose-950 uppercase">The Standard Application Trap</h4>
              </div>
              <p className="font-sans text-xs text-slate-700 leading-relaxed">
                Most CNAs list boring tasks like "bathed residents, took vitals". Hospital computers instantly reject these resumes because they look like everyone else, leading to a massive drop in callbacks.
              </p>
              <p className="font-mono text-[10px] text-rose-600 font-bold uppercase mt-4">STAGE: Getting Noticed</p>
            </div>

            <div className="bg-rose-50 border-2 border-rose-950 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-rose-500 text-white rounded-none border border-rose-750">
                  <Ban className="w-4 h-4" />
                </div>
                <h4 className="font-display font-black text-sm text-rose-950 uppercase">The Hiring Agency Trap</h4>
              </div>
              <p className="font-sans text-xs text-slate-700 leading-relaxed">
                Caregivers often use temporary nursing agencies out of desperation. These agencies charge hospitals double, keep most of the money, and stop CNAs from getting benefits and pensions.
              </p>
              <p className="font-mono text-[10px] text-rose-600 font-bold uppercase mt-4">STAGE: Finding a Job</p>
            </div>

            <div className="bg-rose-50 border-2 border-rose-950 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-rose-500 text-white rounded-none border border-rose-750">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h4 className="font-display font-black text-sm text-rose-950 uppercase">The Unfair Interview Checklists</h4>
              </div>
              <p className="font-sans text-xs text-slate-700 leading-relaxed">
                Recruiters test caregivers using generic quizzes instead of asking about real nursing skills, like calming down a stressed patient. This completely ignores the 13+ years of real-life safety experience that someone like Carla has.
              </p>
              <p className="font-mono text-[10px] text-rose-600 font-bold uppercase mt-4">STAGE: Interview</p>
            </div>
          </div>
        )}

        {activeTab === "innovate" && (
          <div className="space-y-6">
            <p className="font-mono text-xs text-amber-600 font-bold uppercase tracking-widest">
              ⚡ Where the Next $2.8B in Healthcare Talent Tech Will Be Built
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gaps.map((gp, index) => (
                <div key={index} className="bg-slate-900 text-white border-2 border-slate-950 rounded-none p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(217,119,6,1)]">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-500 mb-2 block font-bold">{gp.stage} Stage</span>
                    <h4 className="font-display font-black text-base text-white mb-3 uppercase tracking-wide">{gp.stage}-First Professional Layer</h4>
                    <div className="space-y-3 mt-2 text-xs text-slate-300">
                      <p><strong className="font-display text-slate-400 text-[10px] uppercase block mb-0.5">What Exists Today:</strong> {gp.exists}</p>
                      <p><strong className="font-display text-emerald-400 text-[10px] uppercase block mb-0.5">The Missing Opportunity:</strong> {gp.missing}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center">
                    <span className="font-mono text-[10px] text-slate-500 uppercase">Addressable Market Gap</span>
                    <span className="font-mono font-black text-amber-400 text-lg uppercase tracking-tight">{gp.opportunitySize}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
