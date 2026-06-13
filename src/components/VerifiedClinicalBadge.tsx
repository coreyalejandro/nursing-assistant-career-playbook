/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShieldCheck, HelpCircle } from "lucide-react";

interface VerifiedClinicalBadgeProps {
  metricType: "falls" | "logs" | "satisfaction";
  placement?: "top" | "bottom" | "left" | "right";
  lightTheme?: boolean;
}

export default function VerifiedClinicalBadge({ metricType, placement = "top", lightTheme = false }: VerifiedClinicalBadgeProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const data = {
    falls: {
      label: "Verified Clinical Data",
      title: "Bedtime Fall Reduction Metrics",
      source: "CDC STEADI Prevention Protocol",
      methodology: "Calculated over 180-day intervals comparing night-shift baseline fall incidents against active environmental audits. Evaluates under-bed sensor reporting, light-dimming bedtime routines, and mandatory 2-CNA Hoyer sling verification checklists.",
      authority: "Centers for Disease Control & Prevention"
    },
    logs: {
      label: "Verified Clinical Data",
      title: "EHR Timestamp Verifications",
      source: "PointClickCare / Epic EHR Audit Logs",
      methodology: "Standardized clinical logging auditing. Tracks the time from physical vital entry of 12+ parameters (blood pressure, SpO2, heart rate, temperature, food intake, and turning cycles) to live EHR transmission. Confirms 100% submission adherence.",
      authority: "CMS SNF Compliance Guidelines"
    },
    satisfaction: {
      label: "Verified Clinical Data",
      title: "Patient Experience Scoring",
      source: "Post-Discharge Discharge Surveys",
      methodology: "Aggregated monthly family and resident surveys. Evaluates response times, bedside communication clarity, and reassurance during high-anxiety geriatric bedtime de-escalation incidents.",
      authority: "DCH Quality Metrics Standards"
    }
  };

  const selected = data[metricType];

  const placementClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  return (
    <div className="relative inline-block select-none group font-sans">
      {/* Visual Badge Trigger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        onMouseLeave={() => setIsMobileOpen(false)}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider transition-all border outline-none cursor-help ${
          lightTheme
            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
            : "bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-slate-900"
        }`}
        type="button"
        title="View Verification Methodology"
        id={`metric-verify-trigger-${metricType}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill={lightTheme ? "white" : "transparent"} />
        <span>VERIFIED</span>
        <HelpCircle className="w-3 h-3 text-emerald-500 shrink-0 opacity-70" />
      </button>

      {/* Tooltip Popup container (hover or mobile tap show) */}
      <div
        id={`metric-tooltip-${metricType}`}
        className={`absolute z-[999] w-64 p-3.5 bg-slate-900 text-white border-2 border-emerald-500 shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] transition-all duration-200 text-left ${
          placementClasses[placement]
        } ${
          isMobileOpen 
            ? "opacity-100 pointer-events-auto scale-100" 
            : "opacity-0 pointer-events-none scale-95 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100"
        }`}
      >
        {/* Tooltip Header */}
        <div className="flex items-center gap-1.5 border-b border-slate-750 pb-1.5 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" fill="white" />
          <div>
            <span className="block font-mono text-[8px] uppercase tracking-wider text-emerald-400 font-extrabold">
              {selected.label}
            </span>
            <h5 className="font-display font-black text-[11px] uppercase text-white leading-tight">
              {selected.title}
            </h5>
          </div>
        </div>

        {/* Tooltip Body */}
        <div className="space-y-2 text-[10px]">
          <p className="font-sans text-slate-300 leading-relaxed font-semibold">
            {selected.methodology}
          </p>
          <div className="bg-slate-950 p-1.5 border border-slate-800 flex justify-between gap-1 items-center font-mono text-[8px] font-bold text-slate-400">
            <span>AUDIT FRAMEWORK:</span>
            <span className="text-emerald-400 uppercase tracking-widest">{selected.source}</span>
          </div>
          <div className="text-[8px] font-mono text-slate-500 text-right uppercase">
            Authority: {selected.authority}
          </div>
        </div>

        {/* Small pointer triangle */}
        <div className={`absolute w-2 h-2 bg-slate-900 border-r-2 border-b-2 border-emerald-500 rotate-45 ${
          placement === "top" ? "top-full left-1/2 -translate-x-1/2 -translate-y-1.5 border-t-0 border-l-0" :
          placement === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 translate-y-1.5 border-b-0 border-r-0 rotate-[225deg]" :
          placement === "left" ? "left-full top-1/2 -translate-y-1/2 -translate-x-1.5 border-l-0 border-y-0" :
          "right-full top-1/2 -translate-y-1/2 translate-x-1.5 border-r-0 border-y-0"
        }`}></div>
      </div>
    </div>
  );
}
