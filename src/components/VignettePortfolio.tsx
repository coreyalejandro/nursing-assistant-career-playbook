/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PlaybookData, CaseStudy } from "../types";
import VerifiedClinicalBadge from "./VerifiedClinicalBadge";
import { Shield, BookOpen, AlertOctagon, HelpCircle, UserCheck, Smartphone, Check, HelpCircle as HelpIcon, Sparkles, Volume2, Square } from "lucide-react";

interface VignettePortfolioProps {
  playbookData: PlaybookData;
}

export default function VignettePortfolio({ playbookData }: VignettePortfolioProps) {
  const [activeFeature, setActiveFeature] = useState<"vignette" | "failure" | "warehouse" | "essay" | "recruiter">("vignette");
  const [isPlaying, setIsPlaying] = useState(false);
  const { caseStudies, metrics, editorialBrief } = playbookData;

  const handleTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => {
            setIsPlaying(false);
            alert("Audio playback was blocked or interrupted by your browser.");
          };
          // Filter out newlines so reading is smoother
          utterance.text = text.replace(/\n/g, ". ");
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        } catch (e) {
          console.error("TTS Error:", e);
          alert("Text-to-speech is unavailable in this browser environment.");
        }
      }
    } else {
      alert("Text-to-speech is not supported by your browser.");
    }
  };

  const features = [
    {
      id: "vignette" as const,
      num: "01 · CLINICAL VIGNETTE",
      title: "Interactive Dementia Case Study",
      desc: "Anonymized real clinical walkthroughs demonstrating expert de-escalation techniques, preserving patient dignity during transfers, and boosting unit satisfaction."
    },
    {
      id: "failure" as const,
      num: "02 · CLINICAL RETROSPECTIVE",
      title: "Clinical Quality & Risk Mitigation Retrospective",
      desc: "Senior ward managers respect maturity. This section outlines a complex transfer refusal, the initial communication failure, her quick pivot, and the updated ward protocol."
    },
    {
      id: "warehouse" as const,
      num: "03 · CROSSOVER PROOF",
      title: "Sanofi Logistics Crossover Artifact",
      desc: "Evidence proving high-intensity sorting of 500+ medications with 100% margin of safety, demonstrating rare precision with sterile inventory."
    },
    {
      id: "essay" as const,
      num: "04 · CARE THINKING",
      title: "Clinical Practice Essays",
      desc: "Original long-form intellectual perspectives on geriatric fall prevention and nursing collaboration patterns."
    },
    {
      id: "recruiter" as const,
      num: "05 · RECRUITER UX",
      title: "One-Click Quick-Scan Mode",
      desc: "Converts her entire advanced digital care portfolio into a single-pane, 10-second summary tailored to busy hospital unit managers."
    }
  ];

  return (
    <section id="portfolio" className="py-16 bg-white text-slate-900 border-b-2 border-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-red-600"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-red-600 font-bold">Section 02</span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-5xl text-slate-950 tracking-tight uppercase">
            THE DIGITAL <span className="text-red-600 italic">CNA CARE PROFILE</span>
          </h2>
          <p className="font-sans font-medium text-slate-500 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
            Who says CNAs cannot have a digital portfolio? Presenting patient care case studies and regulatory compliance maturity sets a completely new industry standard.
          </p>
        </div>

        {/* Feature Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Feature List (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {features.map((feat) => (
              <button
                key={feat.id}
                onClick={() => setActiveFeature(feat.id)}
                className={`text-left p-4 rounded-none border-2 transition-all cursor-pointer ${activeFeature === feat.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
                    : "bg-slate-50 border-slate-300 hover:border-slate-800 hover:bg-white text-slate-800"
                  }`}
              >
                <div className={`font-mono text-[10px] font-bold mb-1 ${activeFeature === feat.id ? "text-amber-400" : "text-red-600"}`}>
                  {feat.num}
                </div>
                <div className="font-display font-black text-sm uppercase tracking-tight mb-1">{feat.title}</div>
                <div className="font-sans text-xs opacity-80 leading-relaxed">{feat.desc}</div>
              </button>
            ))}
          </div>

          {/* Interactive Screen Preview Mockup (7 columns) */}
          <div className="lg:col-span-7 bg-slate-900 text-white border-2 border-slate-950 rounded-none shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col">
            {/* Browser top-bar */}
            <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-900 flex items-center gap-4">
              <div className="flex gap-1.5 flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex-1 bg-slate-900 rounded-none border border-slate-800 px-3 py-1 text-center text-slate-400 font-mono text-[10px] select-none truncate">
                carla-miranda.cna.portfolio · secure_host
              </div>
            </div>

            {/* Dynamic Content Frame */}
            <div className="p-6 md:p-8 min-h-[420px] flex flex-col bg-slate-900/60 font-sans">

              {activeFeature === "vignette" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 font-mono font-bold px-2.5 py-1 rounded-none uppercase tracking-widest border border-emerald-400">
                        SUCCESS CASE VIGNETTE
                      </span>
                      <h4 className="font-display font-black text-base text-white tracking-tight mt-3 uppercase">{caseStudies[0]?.title}</h4>
                    </div>
                    <button onClick={() => handleTTS(`${caseStudies[0]?.title}. ${caseStudies[0]?.challenge} ${caseStudies[0]?.action} ${caseStudies[0]?.outcome}`)} className="text-emerald-400 hover:text-emerald-300 p-2 border border-slate-700 bg-slate-800 transition-colors">
                      {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="text-xs space-y-4 leading-relaxed text-slate-300 mt-2">
                    <div>
                      <span className="font-mono text-[10px] text-amber-500 block font-normal tracking-wider uppercase mb-1">
                        01 · The Challenge / Diagnostic Context:
                      </span>
                      <p className="font-sans text-slate-200">{caseStudies[0]?.challenge}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-amber-500 block font-normal tracking-wider uppercase mb-1">
                        02 · The Human Clinical Action:
                      </span>
                      <p className="font-sans text-slate-200">{caseStudies[0]?.action}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-amber-500 block font-normal tracking-wider uppercase mb-1">
                        03 · The Resolution & Outcomes:
                      </span>
                      <p className="font-sans text-slate-200">{caseStudies[0]?.outcome}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 text-emerald-400 px-4 py-3 rounded-none border-l-2 border-emerald-400 text-xs flex justify-between items-center font-mono mt-4">
                    <span>Clinical Impact Margin:</span>
                    <strong className="font-black">{caseStudies[0]?.metrics || "100% Patient safety"}</strong>
                  </div>
                </div>
              )}

              {activeFeature === "failure" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] bg-rose-600 text-white font-mono font-bold px-2.5 py-1 rounded-none uppercase tracking-widest border border-rose-500">
                        CLINICAL QUALITY RETROSPECTIVE
                      </span>
                      <h4 className="font-display font-black text-base text-white tracking-tight mt-3 uppercase">{caseStudies[1]?.title}</h4>
                    </div>
                    <button onClick={() => handleTTS(`${caseStudies[1]?.title}. ${caseStudies[1]?.challenge} ${caseStudies[1]?.action} ${caseStudies[1]?.outcome}`)} className="text-rose-400 hover:text-rose-300 p-2 border border-slate-700 bg-slate-800 transition-colors">
                      {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="text-xs space-y-4 leading-relaxed text-slate-300 mt-2">
                    <div>
                      <span className="font-mono text-[10px] text-amber-500 block font-normal tracking-wider uppercase mb-1">
                        Scenario:
                      </span>
                      <p className="font-sans text-slate-200">{caseStudies[1]?.challenge}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-amber-500 block font-normal tracking-wider uppercase mb-1">
                        Initial Failure:
                      </span>
                      <p className="font-sans text-slate-200">{caseStudies[1]?.action}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-amber-500 block font-normal tracking-wider uppercase mb-1">
                        Pivot & Resolution:
                      </span>
                      <p className="font-sans text-slate-200">{caseStudies[1]?.outcome}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-amber-500 block font-normal tracking-wider uppercase mb-1">
                        Systemic Optimization:
                      </span>
                      <p className="font-sans text-slate-200">{caseStudies[1]?.metrics}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 text-rose-400 px-4 py-3 rounded-none border-l-2 border-rose-400 text-xs flex justify-between items-center font-mono mt-4">
                    <span>Safety / Compliance Rating:</span>
                    <strong className="font-black">Zero Re-occurrences</strong>
                  </div>
                </div>
              )}

              {activeFeature === "warehouse" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] bg-indigo-600 text-white font-mono font-bold px-2.5 py-1 rounded-none uppercase tracking-widest border border-indigo-500">
                        SANOFI GENERAL WAREHOUSE CROSSOVER
                      </span>
                      <h4 className="font-display font-black text-sm md:text-base text-white tracking-tight mt-3 uppercase">
                        Pharmaceutical Quality Control & Sterile Sorting Protocol
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 border border-slate-800 rounded-none text-xs leading-relaxed text-slate-300">
                    <p className="mb-2">
                      <strong className="text-amber-400 font-mono">[PREV TENURE]</strong> Carla sorted and packaged <strong className="text-white">500+ medications weekly</strong> for top hospitals and pharmacy chains.
                    </p>
                    <p className="mb-2 text-slate-200">
                      <span className="text-emerald-400 font-bold uppercase mr-1">[Rare Superpower]</span> Why does this matter for bedside nursing? It translates to a bulletproof, near-zero error compliance rate in pharmacy inventory management, complex equipment tracking, and rigorous infection-free labeling.
                    </p>
                    <p className="font-mono text-[10px] text-slate-500 border-t border-slate-900 pt-2 mt-2">
                      SKU Accuracy: 100% · Sterile Chain Custody: Compliant · Audits: 0 failures
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mt-4 font-mono text-[10px]">
                    <div className="bg-slate-950 border border-slate-800 p-2">
                      <span className="block text-amber-400 text-xl font-bold font-display">500+</span>
                      <span className="text-slate-500 uppercase tracking-wider text-[9px]">SKUs Weekly</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-2">
                      <span className="block text-amber-400 text-xl font-bold font-display">100%</span>
                      <span className="text-slate-500 uppercase tracking-wider text-[9px]">Accuracy</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-2">
                      <span className="block text-amber-400 text-xl font-bold font-display">0</span>
                      <span className="text-slate-500 uppercase tracking-wider text-[9px]">Audit Errors</span>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === "essay" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-[10px] bg-blue-600 text-white font-mono font-bold px-2.5 py-1 rounded-none uppercase tracking-widest border border-blue-500">
                      CARE PRACTICE JOURNAL SIGNALS
                    </span>
                    <h4 className="font-display font-black text-base text-white tracking-tight mt-3 uppercase">
                      The Ergonomic Horizon: Proactive Geriatric Care
                    </h4>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-200 pt-1 font-medium font-sans">
                    "True fall prevention isn't reactive restraint. It is structural environmental telemetry. By logging early clinical drifts—such as subtle shifts in gait during bedtime transfers—and auditing dry floor coordinates, a Certified Nursing Assistant can proactively eliminate senior falls by 15% before they ever begin."
                  </p>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-none flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div className="font-sans leading-tight">
                      <p className="font-bold text-xs text-slate-300">Read: Patient Dignity & Validation Methods</p>
                      <p className="text-[10px] font-mono text-slate-500">600 words · Adopted by Decatur nursing panel</p>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === "recruiter" && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 border border-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                      <div>
                        <h4 className="font-display font-black text-sm text-amber-400 tracking-tight uppercase">Carla Miranda</h4>
                        <p className="font-mono text-[9px] text-slate-400 uppercase">CNA Lead / Geriatrics specialist</p>
                      </div>
                      <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-none uppercase font-mono border border-emerald-400">
                        IMPACT CONFIRMED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] font-sans text-slate-300">
                      <div>
                        <p className="text-slate-500 uppercase text-[9px] font-mono">Location</p>
                        <p className="font-bold text-white">Atlanta, GA</p>
                      </div>
                      <div>
                        <p className="text-slate-500 uppercase text-[9px] font-mono">Mobile</p>
                        <p className="font-bold text-amber-400 font-mono">470-563-0128</p>
                      </div>
                      <div>
                        <p className="text-slate-500 uppercase text-[9px] font-mono">Certifications</p>
                        <p className="font-bold text-white">CNA (Nurse Builders Academy)</p>
                      </div>
                      <div>
                        <p className="text-slate-500 uppercase text-[9px] font-mono">Core Specialties</p>
                        <p className="font-bold text-white">Hoyer lift, Foley care, Dementia validation</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 mt-3 flex justify-around text-center gap-1">
                      <div className="flex flex-col items-center gap-1">
                        <div>
                          <span className="block text-lg font-bold text-white font-mono leading-none">{metrics.fallReductionPct}</span>
                          <span className="text-[7.5px] text-slate-400 uppercase font-mono block mt-0.5">Falls Avoided</span>
                        </div>
                        <VerifiedClinicalBadge metricType="falls" placement="top" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div>
                          <span className="block text-lg font-bold text-white font-mono leading-none">{metrics.vitalSignsCount}</span>
                          <span className="text-[7.5px] text-slate-400 uppercase font-mono block mt-0.5">Logs/Shift</span>
                        </div>
                        <VerifiedClinicalBadge metricType="logs" placement="top" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div>
                          <span className="block text-lg font-bold text-white font-mono leading-none">{metrics.satisfactionIncreasePct}</span>
                          <span className="text-[7.5px] text-slate-400 uppercase font-mono block mt-0.5">Satis. Boost</span>
                        </div>
                        <VerifiedClinicalBadge metricType="satisfaction" placement="top" />
                      </div>
                    </div>
                  </div>

                  <a
                    href="mailto:carla.miranda12222@gmail.com"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black font-display text-xs uppercase tracking-widest text-center py-3 block border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-px transition-all"
                  >
                    Direct Email Sourcing Channel
                  </a>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* HIPAA Disclaimer Banner */}
        <div className="mt-8 bg-slate-100 border border-slate-300 p-4 text-[10px] sm:text-xs font-sans text-slate-500 leading-relaxed max-w-4xl mx-auto flex gap-3">
          <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Notice:</strong> All clinical scenarios, metrics, and case studies showcased within this playbook are fully anonymized, aggregated, and stripped of Protected Health Information (PHI) to maintain strict compliance with HIPAA privacy rules and facility non-disclosure agreements.
          </p>
        </div>
      </div>
    </section>
  );
}
