import React from "react";
import ComplianceChecklist from "./ComplianceChecklist";
import MetricCard from "./MetricCard";
import { ClipboardCheck, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AuditMain() {
  return (
    <div className="space-y-8 py-3">
      {/* Title banner */}
      <div className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[8.5px] font-black uppercase text-indigo-700 tracking-wider bg-indigo-50 px-2 py-0.5 border border-indigo-200">
            AUDITOR-GRADE VERIFICATION SUITE
          </span>
          <h2 className="font-display font-black text-xl uppercase text-slate-950 mt-1.5">
            20-Point Compliance & Fall Auditing
          </h2>
          <p className="font-sans text-slate-605 text-xs font-semibold leading-relaxed mt-0.5">
            Evaluate your knowledge boundaries against Georgia's standard F-Tag CMS checkpoints. Record and audit personal on-the-floor interventions.
          </p>
        </div>
      </div>

      {/* Case studies component */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <h3 className="font-display font-black text-sm uppercase text-slate-900 flex items-center gap-1.5ClassName">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Interactive Case Studies & My Contributions
          </h3>
          <p className="text-[11px] text-slate-500 font-sans font-semibold">
            Customize and record your clinical floor actions. View CDC STEADI and CMS compliance requirements for each study:
          </p>
        </div>
        <MetricCard />
      </div>

      {/* Compliance Assessment Checklist */}
      <ComplianceChecklist />
    </div>
  );
}
