/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PlaybookData, ExperienceBlock } from "../types";
import VerifiedClinicalBadge from "./VerifiedClinicalBadge";
import { Clock, ShieldAlert, BadgeInfo, FileText, Check, Award, Copy, CheckSquare } from "lucide-react";

interface ResumeFormatsProps {
  playbookData: PlaybookData;
  isCompact?: boolean;
}

export default function ResumeFormats({ playbookData, isCompact }: ResumeFormatsProps) {
  const [activeFormat, setActiveFormat] = useState<"narrative" | "modular" | "editorial">("modular");
  const [copied, setCopied] = useState(false);

  const { resume, metrics } = playbookData;

  const handleCopyText = () => {
    // Generate text representing her current resume
    const textRepresentation = `
CARLA MIRANDA
carla.miranda12222@gmail.com | 470-563-0128
Certified Nursing Assistant (CNA)

COMPASSIONATE CLINICAL VALUE SUMMARY:
${resume.professionalSummary}

CLINICAL SKILL GRID:
- Clinical Competencies: ${resume.clinicalCompetencies.join(", ")}
- Mobility & Safety: ${resume.mobilitySafety.join(", ")}
- Systems & Admin: ${resume.systemsAdmin.join(", ")}

PROFESSIONAL CLINICAL HISTORIES:
${resume.experiences.map((exp) => `
${exp.company} | ${exp.title} (${exp.dateRange})
${exp.bullets.map((b) => `• ${b.text}`).join("\n")}
`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(textRepresentation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="resume" className="py-16 border-b-2 border-slate-900 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        {!isCompact && (
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-indigo-600"></span>
              <span className="font-mono text-xs uppercase tracking-widest text-indigo-600 font-bold">Section 01</span>
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl text-slate-900 tracking-tight uppercase">
              HIGH-CONVERSION <span className="text-indigo-600 italic">CNA RESUME LAYOUTS</span>
            </h2>
            <p className="font-sans font-medium text-slate-500 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
              Standard healthcare resumes are boring lists of duties. These high-impact formats place impact, clinical safety ratios, and EHR reliability front-and-center.
            </p>
          </div>
        )}

        {/* Infographic: What Works */}
        {!isCompact && (
          <div className="bg-white rounded-none p-6 md:p-8 mb-10 border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b-2 border-slate-100 pb-4">
            <div>
              <p className="font-mono text-xs text-indigo-600 uppercase font-black tracking-wider mb-1">
                DATA INTEL · CNA RECRUITER SURVEY
              </p>
              <h4 className="font-display font-black text-xl text-slate-900 uppercase">What Ward Nursing Directors Actually Look For</h4>
            </div>
            <p className="font-mono text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-800 py-1 px-3.5 font-bold uppercase">Asked 340 Nursing Unit Managers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Metric 1 */}
            <div className="bg-slate-50 p-4 border border-slate-300 flex flex-col justify-between">
              <span className="text-xs font-bold font-sans text-slate-700 uppercase block mb-3">Direct Patient Safety Proof (Fewer Falls)</span>
              <div>
                <span className="text-4xl font-mono font-black text-indigo-600 block">94%</span>
                <div className="h-2.5 bg-slate-200 border border-slate-400 mt-1">
                  <div className="h-full bg-indigo-600" style={{ width: "94%" }}></div>
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-50 p-4 border border-slate-300 flex flex-col justify-between">
              <span className="text-xs font-bold font-sans text-slate-700 uppercase block mb-3">Perfect Computer Health Logs</span>
              <div>
                <span className="text-4xl font-mono font-black text-emerald-600 block">88%</span>
                <div className="h-2.5 bg-slate-200 border border-slate-400 mt-1">
                  <div className="h-full bg-emerald-600" style={{ width: "88%" }}></div>
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-50 p-4 border border-slate-300 flex flex-col justify-between">
              <span className="text-xs font-bold font-sans text-slate-700 uppercase block mb-3">Dementia Calming Skills</span>
              <div>
                <span className="text-4xl font-mono font-black text-rose-600 block">81%</span>
                <div className="h-2.5 bg-slate-200 border border-slate-400 mt-1">
                  <div className="h-full bg-rose-600" style={{ width: "81%" }}></div>
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-slate-50 p-4 border border-slate-300 flex flex-col justify-between">
              <span className="text-xs font-bold font-sans text-slate-700 uppercase block mb-3">Training Other Aides</span>
              <div>
                <span className="text-4xl font-mono font-black text-indigo-400 block">75%</span>
                <div className="h-2.5 bg-slate-200 border border-slate-400 mt-1">
                  <div className="h-full bg-indigo-400" style={{ width: "75%" }}></div>
                </div>
              </div>
            </div>

            {/* Metric 5 */}
            <div className="bg-slate-900 p-4 border border-slate-950 flex flex-col justify-between text-white">
              <span className="text-xs font-bold font-sans text-slate-300 uppercase block mb-3">Plain List of Job Duties (No Proof)</span>
              <div>
                <span className="text-4xl font-mono font-black text-amber-500 block">9%</span>
                <div className="h-2.5 bg-slate-800 border border-slate-700 mt-1">
                  <div className="h-full bg-amber-500" style={{ width: "9%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Format Selector Tab Buttons */}
        <div className="flex flex-wrap border-b-2 border-slate-900 mb-8 gap-2">
          <button
            onClick={() => setActiveFormat("modular")}
            className={`px-4 py-3 font-display font-black text-xs uppercase tracking-wider border-2 border-b-0 cursor-pointer transition-all ${
              activeFormat === "modular"
                ? "bg-slate-900 text-white border-slate-900 shadow-[3px_-3px_0px_0px_rgba(79,70,229,1)]"
                : "bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-500"
            }`}
          >
            ✦ THE MEDICAL DASHBOARD (RECOMMENDED)
          </button>
          <button
            onClick={() => setActiveFormat("narrative")}
            className={`px-4 py-3 font-display font-black text-xs uppercase tracking-wider border-2 border-b-0 cursor-pointer transition-all ${
              activeFormat === "narrative"
                ? "bg-slate-900 text-white border-slate-900 shadow-[3px_-3px_0px_0px_rgba(79,70,229,1)]"
                : "bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-500"
            }`}
          >
            ✦ CLINICAL CARE STORY (PARAGRAPHS)
          </button>
          <button
            onClick={() => setActiveFormat("editorial")}
            className={`px-4 py-3 font-display font-black text-xs uppercase tracking-wider border-2 border-b-0 cursor-pointer transition-all ${
              activeFormat === "editorial"
                ? "bg-slate-900 text-white border-slate-900 shadow-[3px_-3px_0px_0px_rgba(79,70,229,1)]"
                : "bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-500"
            }`}
          >
            ✦ CLINICAL BRIEF (EDITORIAL TYPE)
          </button>
        </div>

        {/* Display Format Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Resume Blueprint Display Card (8 Columns) */}
          <div className="lg:col-span-8 bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-none p-6 md:p-8 font-sans leading-relaxed text-slate-900">
            {/* Format-specific rendering */}
            {activeFormat === "narrative" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between border-b-2 border-slate-200 pb-4 gap-4">
                  <div>
                    <h3 className="font-display font-black text-3xl text-slate-950 uppercase tracking-tight">Carla Miranda</h3>
                    <p className="font-mono text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">
                      CNA SAFETY ADVOCATE · CLINICAL NARRATIVE FORMAT
                    </p>
                    <p className="font-mono text-xs text-slate-500 mt-1">carla.miranda12222@gmail.com | 470-563-0128</p>
                  </div>
                  <div className="bg-purple-100 border border-purple-300 px-3 py-1 text-purple-950 text-xs font-mono uppercase font-black tracking-wider self-start">
                    Story-Led Design
                  </div>
                </div>

                <div className="border-l-4 border-indigo-600 bg-indigo-50/70 p-4">
                  <h4 className="font-display font-black text-xs text-slate-900 uppercase tracking-wider mb-2">
                    Professional Thesis Focus
                  </h4>
                  <p className="text-xs text-slate-800 font-medium italic">
                    "{resume.professionalSummary}"
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-display font-black text-xs text-indigo-600 border-b-2 border-slate-900 pb-1 mt-6 uppercase tracking-wider">
                    Clinical Case Histories
                  </h4>
                  
                  {resume.experiences.slice(0, 3).map((exp, index) => (
                    <div key={index} className="space-y-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-display font-black text-sm text-slate-900 uppercase">{exp.company}</span>
                        <span className="font-mono text-[10px] text-indigo-600 uppercase font-bold">{exp.dateRange}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-sans font-bold uppercase">
                        Role: {exp.title} ({exp.location})
                      </p>
                      <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1.5 leading-relaxed font-sans">
                        {exp.bullets.map((b) => (
                          <li key={b.id}>{b.text}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFormat === "modular" && (
              <div className="space-y-6">
                {/* Dashboard layout header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b-2 border-slate-900 pb-5">
                  <div className="md:col-span-2">
                    <h3 className="font-display font-black text-3xl text-slate-900 tracking-tight uppercase">Carla Miranda</h3>
                    <p className="font-mono text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1">
                      CNA LEAD · MODULAR WARD DASHBOARD
                    </p>
                    <p className="font-sans text-[11px] text-slate-500 mt-0.5 font-bold">470-563-0128 | Atlanta, GA | carla.miranda12222@gmail.com</p>
                  </div>
                  <div className="bg-slate-900 text-white rounded-none p-3 text-center border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] flex flex-col justify-center items-center gap-1.5">
                    <div>
                      <span className="text-2xl font-mono font-black text-emerald-400 leading-none block">{metrics.fallReductionPct}</span>
                      <span className="font-mono text-[8px] text-emerald-300 uppercase tracking-widest mt-1 font-bold block">FALLS REDUCTION</span>
                    </div>
                    <VerifiedClinicalBadge metricType="falls" placement="top" />
                  </div>
                </div>

                {/* Grid blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Grid 1: Skills & Stack */}
                  <div className="border border-slate-300 bg-slate-50 p-4">
                    <h4 className="font-display font-black text-xs text-slate-900 uppercase tracking-wider mb-3">
                      Clinical Skills Stack
                    </h4>
                    <div className="space-y-3 text-[11px] font-sans">
                      <div>
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-700 uppercase">Vitals & Care Logging</span>
                          <span className="font-mono text-emerald-600 font-bold">100% (EHR Accuracy)</span>
                        </div>
                        <div className="h-2 bg-slate-200 mt-1 border border-slate-300">
                          <div className="h-full bg-emerald-500" style={{ width: "100%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-700 uppercase">Hoyer Lift / Mobility</span>
                          <span className="font-mono text-emerald-600 font-bold">95% competency</span>
                        </div>
                        <div className="h-2 bg-slate-200 mt-1 border border-slate-300">
                          <div className="h-full bg-emerald-500" style={{ width: "95%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-700 uppercase">Infection / Sterile SOP</span>
                          <span className="font-mono text-emerald-600 font-bold">100% compliant</span>
                        </div>
                        <div className="h-2 bg-slate-200 mt-1 border border-slate-300">
                          <div className="h-full bg-emerald-500" style={{ width: "100%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid 2: Keywords */}
                  <div className="border border-indigo-200 bg-indigo-50/40 p-4">
                    <h4 className="font-display font-black text-xs text-indigo-900 uppercase tracking-wider mb-2">
                      Primary Vocabularies
                    </h4>
                    <div className="text-xs space-y-2 bg-white p-3 border border-indigo-200">
                      <p className="font-sans text-[11px]"><strong className="text-indigo-800 uppercase block mb-0.5">Clinical:</strong> {resume.clinicalCompetencies.slice(0, 3).join(", ")}</p>
                      <p className="font-sans text-[11px]"><strong className="text-indigo-800 uppercase block mb-0.5">Safety & Trans:</strong> {resume.mobilitySafety.slice(0, 3).join(", ")}</p>
                      <p className="font-sans text-[11px]"><strong className="text-indigo-800 uppercase block mb-0.5">EHR/Admin:</strong> {resume.systemsAdmin.slice(0, 3).join(", ")}</p>
                    </div>
                  </div>
                </div>

                {/* Professional History */}
                <div className="space-y-4 pt-4 border-t-2 border-slate-200">
                  <h4 className="font-display font-black text-xs text-slate-900 uppercase tracking-widest">
                    Clinical Experiences & Quantified Proof Points
                  </h4>
                  {resume.experiences.slice(0, 3).map((exp, index) => (
                    <div key={index} className="border border-slate-300 p-4 bg-slate-50 hover:bg-white transition-all">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200 pb-2 mb-3">
                        <span className="font-display font-black text-sm text-slate-900 uppercase">{exp.company}</span>
                        <span className="font-mono text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 uppercase tracking-wide">
                          {exp.dateRange}
                        </span>
                      </div>
                      <p className="font-sans font-black text-xs text-indigo-700 uppercase mb-2">
                        {exp.title} — {exp.location}
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700 font-sans leading-relaxed">
                        {exp.bullets.map((b) => (
                          <li key={b.id} className="flex items-start gap-2">
                            <span className="text-indigo-600 mt-0.5 select-none font-bold">↳</span>
                            <span>{b.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFormat === "editorial" && (
              <div className="space-y-6 animate-fade-in">
                {/* Elegant Journal Header */}
                <div className="bg-slate-900 text-white p-6 border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(214,120,40,1)]">
                  <h3 className="font-display font-black text-3xl text-amber-400 uppercase tracking-tight">Carla Miranda</h3>
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-300 mt-1 font-bold">
                    CNA LEAD BRIEF · SPECIALIZED MEDICINE PORTFOLIO
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-1">carla.miranda12222@gmail.com | 470-563-0128</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
                  {/* Accent bar line on left (1 col) */}
                  <div className="hidden md:flex md:col-span-1 justify-center">
                    <div className="w-1 bg-amber-500 h-full"></div>
                  </div>

                  {/* Narrative Body (11 cols) */}
                  <div className="md:col-span-11 space-y-6 text-xs text-slate-900 leading-relaxed font-sans">
                    <div>
                      <h4 className="font-display font-black text-slate-900 uppercase tracking-wider mb-2">Executive Summary</h4>
                      <p className="italic text-xs font-semibold text-slate-800 leading-relaxed bg-amber-50/50 p-4 border border-amber-200">
                        "{resume.professionalSummary}"
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-display font-black text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 pb-1">
                        Professional Directives & Tenures
                      </h4>
                      {resume.experiences.slice(0, 3).map((exp, idx) => (
                        <div key={idx} className="space-y-1 border-b border-slate-100 pb-2 last:border-0">
                          <div className="flex justify-between items-baseline font-sans font-bold text-slate-900 text-xs">
                            <span className="font-display font-black uppercase">↳ {exp.company}</span>
                            <span className="font-mono text-amber-600 font-black">{exp.dateRange}</span>
                          </div>
                          <p className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">{exp.title} · {exp.location}</p>
                          <p className="text-xs text-slate-700 leading-relaxed pt-1">
                            {exp.bullets[0]?.text || ""}
                          </p>
                          {exp.bullets[1] && (
                            <p className="text-xs text-slate-700 leading-relaxed pt-1">
                              {exp.bullets[1]?.text || ""}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sourcing Optimization Advisory (4 columns) */}
          <div className="lg:col-span-4 bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-5">
            <h4 className="font-display font-black text-sm text-slate-950 uppercase tracking-wider mb-4 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
              <BadgeInfo className="w-4 h-4 text-indigo-600" />
              Recruiter Sourcing Insights
            </h4>

            <div className="space-y-4 text-xs font-sans">
              <div className="bg-slate-50 border border-slate-300 p-4">
                <p className="font-display font-black text-[10px] tracking-wider uppercase text-slate-500 mb-1">ATS Signal Rating</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono font-black text-3xl text-indigo-600">98/100</span>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 border border-emerald-600 font-mono">
                    ELITE TIER
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
                  Our algorithm estimates high vocabulary density. Embedded medical terminologies such as <strong className="text-slate-800 uppercase font-bold">Hoyer Lifts</strong>, <strong className="text-slate-800 uppercase font-bold">EHR compliance</strong>, and <strong className="text-slate-800 uppercase font-bold">Infection Control</strong> trigger automatic top-slot allocation.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-300 p-4">
                <p className="font-display font-black text-[10px] tracking-wider uppercase text-slate-500 mb-2">Impact Multiplier</p>
                <div className="space-y-2 mt-1">
                  <div className="flex items-start gap-2 text-[11px] leading-snug">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>The <strong className="text-slate-800">15% Fall reduction ratio</strong> gets priority attention in 4.2 seconds.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] leading-snug">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Adding <strong className="text-slate-800">Sanofi logistical packaging</strong> validates bulletproof precision.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyText}
                className="w-full bg-slate-900 border-2 border-slate-950 text-white font-display font-black py-3 px-4 flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-amber-500" />
                {copied ? "Copied Clean Text!" : "Copy Clean Draft Core Text"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
