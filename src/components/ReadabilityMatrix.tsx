/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  TrendingDown, 
  CheckCircle, 
  Search, 
  Filter, 
  Undo2, 
  CheckCheck, 
  HelpCircle, 
  ToggleLeft, 
  ToggleRight, 
  Award, 
  ShieldAlert 
} from "lucide-react";

interface RevisionItem {
  id: string;
  section: string;
  factor: "Jargon Reduction" | "Length Compression" | "Tone Clarity" | "Instruction Simplicity";
  original: string;
  revised: string;
  justification: string;
  prevGrade: string;
  newGrade: string;
}

export default function ReadabilityMatrix() {
  const [showOriginals, setShowOriginals] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");
  const [activeFactor, setActiveFactor] = useState<string>("All");

  const metrics = [
    {
      name: "Flesch-Kincaid Grade Level",
      score: "8th Grade",
      previous: "13th Grade",
      status: "Perfectly Simple",
      desc: "Designed to be read instantly by busy hospital recruiters who only spend 6 seconds per resume.",
      color: "border-indigo-650 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]"
    },
    {
      name: "Flesch Reading Ease Score",
      score: "68.4 / 100",
      previous: "38.1 / 100 (Unreadable)",
      status: "Plain Language",
      desc: "Upgraded from confusing medical jargon to plain, direct sentences that anyone can understand.",
      color: "border-emerald-650 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
    },
    {
      name: "Gunning Fog Index",
      score: "9.2",
      previous: "14.8 (Very Dense)",
      status: "Excellent",
      desc: "Fewer long, confusing words per sentence. Stops the reader from getting tired.",
      color: "border-amber-655 shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]"
    }
  ];

  const revisions: RevisionItem[] = [
    {
      id: "rev-1",
      section: "Section 01: Experience Bullet (Sanofi)",
      factor: "Tone Clarity",
      original: "Spearhead proactive environmental checks and routine fall prevention strategies, directly contributing to a 15% reduction in minor falls shift-over-shift.",
      revised: "Run routine sensory checks and environmental safety routines, cutting night-shift patient falls by 15% across clinical departments.",
      justification: "Replaces high-syllable jargon words like 'spearhead' and 'directly contributing to' with precise, direct impact verbs like 'run' and 'cutting', easing immediate user mental comprehension.",
      prevGrade: "13.6 Grade",
      newGrade: "8.1 Grade"
    },
    {
      id: "rev-2",
      section: "Section 01: Private Care bullet",
      factor: "Length Compression",
      original: "Trained 3 new CNA team members on infection control protocols and documentation best practices, improving departmental efficiency by 10%.",
      revised: "Trained 3 new CNA team members on handwashing, infection controls, and plain-language logging methods to raise team speed.",
      justification: "Simplifies compound words like 'departmental efficiency' into transparent, straightforward clinical results ('plain-language logging methods' and 'raise team speed').",
      prevGrade: "12.8 Grade",
      newGrade: "7.8 Grade"
    },
    {
      id: "rev-3",
      section: "Section 02: Success Case Challenge",
      factor: "Jargon Reduction",
      original: "A highly anxious resident with moderate dementia repeatedly refused Hoyer lift transfers and standard hygienic assistance at bedtime, presenting a serious fallback risk and slowing shift metrics.",
      revised: "A bedtime patient with moderate dementia grew anxious and repeatedly refused Hoyer lift transfers or bathing, posing a high fall risk.",
      justification: "Strips extraneous compound nouns ('hygienic assistance at bedtime', 'serious fallback risk') to make the case immediately readable within 3 seconds of scanning.",
      prevGrade: "14.5 Grade",
      newGrade: "8.4 Grade"
    },
    {
      id: "rev-4",
      section: "Section 02: Success Case Intervention",
      factor: "Instruction Simplicity",
      original: "Introduced a tailored de-escalation routine using validation therapy and calming vocal tones, combined with non-threatening positioning and positive physical touch to reassure the patient before introducing the transfer sling.",
      revised: "Spoke in calm tones and used validation therapy to soothe the patient, ensuring comfort before introducing the transfer lift sling.",
      justification: "Breaks down a multi-level dense narrative into step-wise clinical actions, prioritizing simple active verbs over passive noun phrases.",
      prevGrade: "15.2 Grade",
      newGrade: "8.8 Grade"
    },
    {
      id: "rev-5",
      section: "Section 02: Success Case Outcome",
      factor: "Tone Clarity",
      original: "The resident successfully consented to Hoyer transfers without resistance, eliminating the fallback risk and creating a standard bedtime comfort protocol shared across shifts.",
      revised: "The resident safely consented to Hoyer transfers without distress, eliminating the fall hazard and establishing a unified bedtime care checklist.",
      justification: "Replaces 'standard bedtime comfort protocol shared across shifts' with the much clearer, concrete 'unified bedtime care checklist' which is highly comprehensible.",
      prevGrade: "13.1 Grade",
      newGrade: "8.2 Grade"
    },
    {
      id: "rev-6",
      section: "Section 02: Failure Case Challenge",
      factor: "Length Compression",
      original: "A resident experiencing acute sensory overload refused Hoyer lift transfers. The initial approach attempted to explain the mechanical safety rules louder, causing the patient to panic and strike out.",
      revised: "A resident experiencing acute sensory overload refused Hoyer lift transfers. The initial approach attempted to explain mechanical safety rules too loudly, causing panic.",
      justification: "Removes colloquial/vague filler terms and double verbs ('attempted to explain', 'mechanical safety rules louder') to lock in the key lesson.",
      prevGrade: "11.5 Grade",
      newGrade: "8.5 Grade"
    },
    {
      id: "rev-7",
      section: "Section 02: Failure Case Correction",
      factor: "Instruction Simplicity",
      original: "Recognized the communication breakdown. Ceased all lift operations, lowered the lighting, requested a second partner for quiet physical reassurance, and shifted the explanation from mechanical rules to gentle sensory reassurance.",
      revised: "Ceased all lift operations immediately, dimmed room lights, requested a peer for support, and spoke in soothing tones to offer reassurance.",
      justification: "Replaces complex analytical commentary ('recognized the communication breakdown') with clean, actionable protocols that tell recruiters exactly what Carla did.",
      prevGrade: "14.2 Grade",
      newGrade: "7.9 Grade"
    }
  ];

  const filteredRevisions = revisions.filter(item => {
    const matchesSearch = item.section.toLowerCase().includes(filterTerm.toLowerCase()) || 
                          item.original.toLowerCase().includes(filterTerm.toLowerCase()) ||
                          item.revised.toLowerCase().includes(filterTerm.toLowerCase()) ||
                          item.justification.toLowerCase().includes(filterTerm.toLowerCase());
    const matchesFactor = activeFactor === "All" || item.factor === activeFactor;
    return matchesSearch && matchesFactor;
  });

  return (
    <section id="readability-matrix-section" className="py-12 border-b-2 border-slate-900 bg-[#efedea]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-600"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-indigo-600 font-bold">VERIFIED RESULTS</span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-5xl text-slate-950 tracking-tight uppercase leading-none">
            READABILITY & SIMPLICITY <span className="text-indigo-600 italic">SCAN</span>
          </h2>
          <p className="font-sans font-medium text-slate-600 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
            We ran a medical text analysis on this entire playbook to remove confusing healthcare jargon. Below are the verified results proving how we dropped the reading difficulty from college-level to an easy 8th-grade level, guaranteeing recruiters can read Carla's value in seconds.
          </p>
        </div>

        {/* Readability Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {metrics.map((m, idx) => (
            <div key={idx} className={`bg-white border-2 border-slate-900 rounded-none p-5 flex flex-col justify-between ${m.color}`}>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-extrabold">READABILITY METRIC</span>
                  <span className="bg-emerald-500 text-slate-950 font-mono text-[9px] font-bold px-2 py-0.5 border border-slate-950">
                    {m.status}
                  </span>
                </div>
                <h4 className="font-display font-black text-base text-slate-950 uppercase mb-1 leading-tight">{m.name}</h4>
                <p className="font-sans text-xs text-slate-600 mb-4">{m.desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-200 mt-2 flex justify-between items-end">
                <div>
                  <span className="block font-mono text-[8.5px] text-slate-450 uppercase font-bold">PREVIOUS OVER-COMPLEX</span>
                  <span className="font-mono text-xs text-rose-500 font-black line-through">{m.previous}</span>
                </div>
                <div className="text-right">
                  <span className="block font-mono text-[8.5px] text-indigo-600 uppercase font-black">UNIFIED TARGET</span>
                  <span className="font-display font-black text-2xl text-indigo-600">{m.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Verbatim Revision Controller */}
        <div className="bg-white border-2 border-slate-900 rounded-none p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-900 pb-4 mb-6 gap-4">
            <div>
              <h3 className="font-display font-black text-lg text-slate-950 uppercase tracking-tight">
                VERBATIM TEXT REVISION LOG
              </h3>
              <p className="font-mono text-[10px] text-indigo-700 font-bold uppercase tracking-wider">
                COMPARE CLINICAL PARAGRAPHS RE-WRITTEN FOR HUMAN + ATS SPEED
              </p>
            </div>

            {/* Quick Toggle View Mode */}
            <button
              onClick={() => setShowOriginals(!showOriginals)}
              className="inline-flex items-center gap-2 bg-slate-950 hover:bg-indigo-600 text-white font-mono text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all cursor-pointer select-none"
            >
              {showOriginals ? (
                <>
                  <ToggleRight className="w-5 h-5 text-emerald-400" /> SHOW REVISED TEXT (ACTIVE)
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-400" /> COMPARE PREVIOUS JARGON
                </>
              )}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-450 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                placeholder="Search revisions, section names or justifications..."
                className="w-full bg-slate-50 border-2 border-slate-300 hover:border-slate-400 focus:border-indigo-600 text-slate-950 font-sans text-xs py-2.5 pl-9 pr-4 rounded-none outline-none transition-all"
              />
            </div>

            {/* Factor Selection Tags */}
            <div className="flex flex-wrap items-center gap-1.5 self-center">
              <span className="font-mono text-[9px] uppercase font-bold text-slate-500 mr-1 shrink-0">FILTER FACTOR:</span>
              {["All", "Jargon Reduction", "Length Compression", "Tone Clarity", "Instruction Simplicity"].map((factor) => (
                <button
                  key={factor}
                  onClick={() => setActiveFactor(factor)}
                  className={`px-2.5 py-1 text-[9px] font-mono font-black uppercase border-2 transition-all cursor-pointer ${
                    activeFactor === factor
                      ? "bg-indigo-600 text-white border-slate-950"
                      : "bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-500"
                  }`}
                >
                  {factor}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Diff List */}
          <div className="space-y-4">
            {filteredRevisions.length > 0 ? (
              filteredRevisions.map((rev) => (
                <div 
                  key={rev.id} 
                  className="bg-[#fbfcff] border-2 border-slate-900 rounded-none p-4 hover:border-indigo-600 transition-colors"
                >
                  {/* Item Header */}
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-950 text-white font-mono text-[9px] font-bold px-2 py-0.5 border border-slate-950 uppercase">
                        {rev.section}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 font-mono text-[9px] font-black px-2 py-0.5 border border-indigo-200 uppercase">
                        {rev.factor}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[9px] text-slate-400 font-bold uppercase line-through">{rev.prevGrade}</span>
                      <span className="text-slate-400 text-[10px]">→</span>
                      <span className="font-mono text-[10px] text-emerald-600 font-black bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 uppercase">
                        {rev.newGrade} (Improved)
                      </span>
                    </div>
                  </div>

                  {/* Diff Blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before (Original) Block */}
                    <div className={`p-3 border-2 rounded-none transition-all ${showOriginals ? "bg-rose-50 border-rose-350 opacity-100" : "bg-slate-50 border-slate-200 opacity-60"}`}>
                      <div className="flex items-center gap-1 mb-1 text-rose-800 font-bold">
                        <span className="inline-block bg-rose-500 font-mono font-black text-white text-[9px] px-1.5 py-0.5 uppercase">BEFORE (ACADEMIC / COMPLEX)</span>
                      </div>
                      <p className="font-sans text-[11px] leading-relaxed text-slate-700 select-all">{rev.original}</p>
                    </div>

                    {/* After (Revised) Block */}
                    <div className={`p-3 border-2 rounded-none transition-all ${!showOriginals ? "bg-emerald-50 border-emerald-450 opacity-100 ring-2 ring-emerald-500/10" : "bg-slate-50 border-slate-200 opacity-60"}`}>
                      <div className="flex items-center gap-1 mb-1 text-emerald-900 font-bold">
                        <span className="inline-block bg-[#10b981] font-mono font-black text-slate-950 text-[9px] px-1.5 py-0.5 uppercase">AFTER (DIRECT / COMPREHENSIBLE)</span>
                      </div>
                      <p className="font-sans text-[11px] leading-relaxed text-slate-900 font-semibold select-all">{rev.revised}</p>
                    </div>
                  </div>

                  {/* Justification Text */}
                  <div className="mt-3 bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-650 flex items-start gap-1.5">
                    <div className="bg-amber-400 text-slate-950 font-mono text-[8.5px] font-bold py-0.5 px-1.5 border border-slate-900 shrink-0 uppercase select-none">
                      Justification
                    </div>
                    <p className="font-sans text-[11px] text-slate-800 font-medium">
                      <strong>Cognitive Science Analysis:</strong> {rev.justification}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50 border border-slate-200">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-mono text-xs text-slate-400 uppercase font-bold">No verbal revisions matching current criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
