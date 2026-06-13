/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PlaybookData, ResourceCard, GapCell } from "../types";
import { Landmark, Compass, Award, FileSpreadsheet, Lock, ExternalLink, Bookmark, HelpCircle, ShieldCheck } from "lucide-react";

interface GapsAndResourcesProps {
  playbookData: PlaybookData;
}

export default function GapsAndResources({ playbookData }: GapsAndResourcesProps) {
  const { resources, gaps } = playbookData;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "agency":
        return "border-2 border-slate-900 bg-purple-50 text-slate-900 shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] rounded-none";
      case "tool":
        return "border-2 border-slate-900 bg-emerald-50 text-slate-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] rounded-none";
      case "intel":
        return "border-2 border-slate-900 bg-rose-50 text-slate-900 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] rounded-none";
      default:
        return "border-2 border-slate-900 bg-amber-50 text-slate-900 shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] rounded-none";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "agency":
        return "Placement & Search Firms";
      case "tool":
        return "Competencies & Tech Stack";
      case "intel":
        return "Clinical Intelligence";
      default:
        return "Strategic Community";
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 05: GAP ANALYSIS & OPPORTUNITY MAP */}
      <section id="gaps" className="py-16 bg-slate-950 border-b-2 border-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-red-550"></span>
              <span className="font-mono text-xs uppercase tracking-widest text-red-500 font-bold">Section 04</span>
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight uppercase">
              INDUSTRY GAPS — <span className="text-red-500 italic">WHAT'S BROKEN</span>
            </h2>
            <p className="font-sans font-medium text-slate-400 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
              We mapped how healthcare hiring works today against what hospitals actually need. Here is where the real value is missing.
            </p>
          </div>

          {/* Grid list block */}
          <div className="border-2 border-slate-900 rounded-none overflow-hidden shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] bg-slate-900">
            {/* Headers */}
            <div className="hidden md:grid grid-cols-12 bg-slate-950 px-6 py-4 border-b-2 border-slate-900 text-[10px] uppercase tracking-widest font-mono text-amber-500 font-extrabold">
              <div className="col-span-3">HIRING STEP</div>
              <div className="col-span-3">WHAT HOSPITALS USE NOW</div>
              <div className="col-span-4">WHAT NURSES ACTUALLY NEED</div>
              <div className="col-span-2 text-right">MARKET VALUE</div>
            </div>

            <div className="divide-y-2 divide-slate-800">
              {gaps.map((gp, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 px-6 py-5 gap-3 md:gap-4 items-center hover:bg-slate-950 transition-colors">
                  <div className="col-span-3 font-display font-black text-sm text-white flex items-center gap-2 uppercase tracking-wide">
                    <span className="text-red-500 font-bold">✦</span> {gp.stage}
                  </div>
                  <div className="col-span-3 text-xs text-slate-300 font-sans">
                    <span className="inline-block md:hidden font-mono text-[9px] text-slate-500 uppercase block mb-1">What Exists Today:</span>
                    {gp.exists}
                  </div>
                  <div className="col-span-4 text-xs font-sans text-slate-100">
                    <span className="inline-block md:hidden font-mono text-[9px] text-amber-500 uppercase block mb-1">What's Missing:</span>
                    <span className="text-amber-100 bg-amber-950/40 border border-amber-900/30 px-2.5 py-1 inline-block">{gp.missing}</span>
                  </div>
                  <div className="col-span-2 text-left md:text-right font-mono font-black text-amber-400 text-sm">
                    <span className="inline-block md:hidden font-mono text-[9px] text-slate-500 uppercase block mr-2">Est. TAM:</span>
                    {gp.opportunitySize}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 06: CURATED RESOURCE STACK */}
      <section id="resources" className="py-16 bg-slate-50 border-b-2 border-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-indigo-600"></span>
              <span className="font-mono text-xs uppercase tracking-widest text-indigo-600 font-bold">Section 05</span>
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl text-slate-950 tracking-tight uppercase">
              THE CURATED <span className="text-indigo-600 italic">RESOURCE STACK</span>
            </h2>
            <p className="font-sans font-medium text-slate-500 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
              Vetted, ranked, and off-the-radar. The networks and registries that treat Certified Nursing Assistants with professional dignity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resources.map((res, index) => (
              <div key={index} className={`p-6 transition-all flex flex-col justify-between ${getCategoryColor(res.category)}`}>
                <div>
                  <div className="flex justify-between items-start mb-4 border-b border-slate-300 pb-2">
                    <span className="font-mono text-[10px] uppercase font-black text-indigo-900 tracking-wider">
                      {getCategoryLabel(res.category)}
                    </span>
                    <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 uppercase border-2 border-slate-950 ${
                      res.radar === "Off Radar"
                        ? "bg-rose-500 text-white"
                        : "bg-emerald-500 text-slate-950"
                    }`}>
                      {res.radar}
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                    <h4 className="font-display font-black text-lg text-slate-950 uppercase tracking-tight leading-tight">{res.name}</h4>
                    {res.url && (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-indigo-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all cursor-pointer select-none shrink-0"
                      >
                        Official site <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {res.licensingBody && (
                    <p className="font-mono text-[9px] text-indigo-700 uppercase font-black mb-3">
                      Authority: {res.licensingBody}
                    </p>
                  )}
                  <p className="font-sans text-xs text-slate-600 leading-relaxed mb-4">{res.desc}</p>
                </div>
                
                <div className="space-y-3 mt-auto">
                  <div className="bg-white border-2 border-slate-900 p-3.5 rounded-none text-xs">
                    <strong className="block text-[10px] font-mono uppercase text-indigo-700 tracking-widest mb-1.5 font-bold">
                      Value to Carla Miranda CNAs:
                    </strong>
                    <p className="font-sans italic text-slate-800 font-medium font-semibold">"{res.why}"</p>
                  </div>

                  {res.citation && (
                    <div className="bg-emerald-100/70 border-l-4 border-emerald-500 p-3 rounded-none text-xs border border-r-2 border-t-2 border-b-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-1.5 mb-1 text-emerald-900 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" fill="white" />
                        <span className="font-mono text-[9px] uppercase tracking-wider">Verified Credential Citation</span>
                      </div>
                      <p className="font-sans text-slate-850 text-[10px] leading-snug font-medium">{res.citation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 07: CAREER MANAGEMENT BLOCK */}
      <section className="py-16 bg-slate-950 text-white rounded-none p-8 md:p-12 my-8 border-2 border-slate-950 shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] max-w-6xl mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <span className="font-mono text-xs text-amber-400 uppercase tracking-widest font-bold">Section 06 · Prestige Sourcing Focus</span>
            <h3 className="font-display font-black text-2xl md:text-4xl tracking-tight mt-2 text-white uppercase">
              CNA CAREER ARCHITECTURE — <span className="text-amber-400 italic">THE MISSING LAYER</span>
            </h3>
            <p className="font-sans font-medium text-slate-400 text-xs md:text-sm mt-3 leading-relaxed">
              How elite hospital systems audit long-term caregivers. Carla combines 13+ years of validation methods with bulletproof accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t-2 border-slate-900">
            <div className="space-y-4">
              <h4 className="font-mono text-xs text-emerald-400 uppercase tracking-wider font-bold">PREMIUM CARE ATTRIBUTES</h4>
              <ul className="space-y-4 text-xs font-sans">
                <li className="flex items-start gap-3">
                  <div className="bg-emerald-500 text-slate-950 p-1.5 rounded-none border border-emerald-450 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-white text-sm uppercase">Regulatory & Audit Maturity</h5>
                    <p className="text-slate-400 mt-1">Deep grasp of OSHA protocols, infection surveillance compliance, and Joint Commission clinical record requirements.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="bg-emerald-500 text-slate-950 p-1.5 rounded-none border border-emerald-450 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-white text-sm uppercase">Dementia Validation Methodologies</h5>
                    <p className="text-slate-400 mt-1">Calming agitated residents gently, decreasing night fall risks, and ensuring dignity without mechanical restraints.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 border-2 border-slate-950 p-6 flex flex-col justify-center text-center rounded-none shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]">
              <p className="font-mono text-[10px] text-amber-500 uppercase tracking-widest mb-1 font-bold">
                Elite Ward Salary Offset
              </p>
              <h4 className="font-display font-black text-4xl text-amber-400 tracking-tight">+$3.50/hr</h4>
              <p className="text-xs text-slate-400 mt-2 font-sans px-4">
                Premium hospital networks pay a wage premium of up to $3.50/hour for CNAs with demonstrated, metric-driven fall reduction histories and PointClickCare EHR accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
