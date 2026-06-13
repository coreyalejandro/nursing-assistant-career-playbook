import React from "react";
import { HelpCircle, Shield, GraduationCap, Scale, Lock, Heart } from "lucide-react";

export default function AboutMain() {
  const methodologies = [
    {
      title: "CDC STEADI (Stopping Elderly Accidents, Deaths & Injuries)",
      desc: "An evidence-based initiative developed by the Centers for Disease Control and Prevention. Our tools integrate the STEADI 3-question screening, orthostatic gait assessments, and environmental checklists to verify home and clinical ward fall-reduction percentages.",
      icon: GraduationCap
    },
    {
      title: "CMS Quality Incentive Indicators (F-Tags)",
      desc: "CMS tracks regional quality metrics, nursing staff logs, and safety benchmarks. The 20-point self-assessment and mock audit templates in this Playbook match critical federal F-Tag audit rules (such as F-689 Free of Accident Hazards).",
      icon: Scale
    },
    {
      title: "HCAHPS & Hospital Consumer Surveys",
      desc: "Our customer satisfaction metrics align with standard Hospital Consumer Assessment of Healthcare Providers and Systems gauges. High scores in comfort rounding and active family coordination map back to CMS incentive payments.",
      icon: Heart
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-3 font-sans">
      {/* Privacy block banner */}
      <div className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-650" />
          <span className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">
            SECURE CLIENT-SIDE DATA COMPLIANCE
          </span>
        </div>

        <h2 className="font-display font-black text-xl uppercase text-slate-950">
          Methodology & HIPAA Data Privacy Assurance
        </h2>

        <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-semibold">
          This Playbook is designed for security and privacy. In compliance with Federal HIPAA (Health Insurance Portability and Accountability Act) guidelines, <span className="text-slate-900 font-bold">no personal health details or private contact directories are stored on external clouds or central databases.</span>
        </p>

        <div className="bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
          <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wide flex items-center gap-1">
            <Shield className="w-4 h-4 text-emerald-600" /> HIPAA Security Rule Alignment:
          </p>
          <ul className="list-disc pl-5 text-slate-600 space-y-1 font-medium">
            <li><strong>Zero server-side retention:</strong> Form data remains strictly encapsulated inside your local browser storage layer. Output links encode state using Base64 parameters, never writing entries to external networks.</li>
            <li><strong>Mock Contact Identifiers:</strong> We strictly avoid collecting true SSN, government board credentials, or personal mobile phone listings. We recommend users utilize proxy descriptions when using our tools for screening preparation.</li>
            <li><strong>Local Sandbox Operations:</strong> Our interactive simulators leverage offline processing routines. No audio loops, interview responses, or notes are uploaded or monitored.</li>
          </ul>
        </div>
      </div>

      {/* Sourced Data Models & Methodologies */}
      <div className="space-y-4">
        <h3 className="font-display font-black text-sm uppercase text-slate-900">
          Sourced Clinical Frameworks
        </h3>
        <p className="text-xs text-slate-500 font-sans font-semibold">
          All case studies, metrics, checklists, and feedback responses in this app are aligned directly with the following public healthcare methodologies:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {methodologies.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="border-2 border-slate-900 bg-white p-5 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2.5"
              >
                <div className="w-8 h-8 rounded-none bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                <h4 className="font-sans font-black text-[12px] text-slate-900 uppercase tracking-tight leading-snug">
                  {m.title}
                </h4>
                <p className="text-[11.5px] text-slate-600 leading-normal font-sans font-medium">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
