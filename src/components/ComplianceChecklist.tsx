import React, { useState } from "react";
import { usePlaybook } from "../lib/resumeState";
import { COMPLIANCE_ITEMS } from "../lib/complianceData";
import { ClipboardCheck, Sparkles, BookOpen, AlertCircle, FileDown, CheckCircle2 } from "lucide-react";

export default function ComplianceChecklist() {
  const { state, dispatch } = usePlaybook();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const handleToggle = (id: string) => {
    dispatch({ type: "TOGGLE_COMPLIANCE_ITEM", payload: id });
  };

  const categories = ["All", "CDC STEADI", "CMS Guidelines", "Dementia Protocols", "Clinical Safety"];

  const filteredItems = activeCategory === "All"
    ? COMPLIANCE_ITEMS
    : COMPLIANCE_ITEMS.filter(item => item.category === activeCategory);

  const checkedCount = state.complianceChecked.length;
  const totalCount = COMPLIANCE_ITEMS.length;
  const scorePercent = Math.round((checkedCount / totalCount) * 100);

  const getReadinessTier = (score: number) => {
    if (score < 40) return { tier: "Emerging Helper", color: "text-rose-600 bg-rose-50 border-rose-250", desc: "Keep studying! Focus on learning basic falls prevention and validation protocols." };
    if (score < 75) return { tier: "Clinical Professional", color: "text-amber-800 bg-amber-50 border-amber-200", desc: "Good baseline. Ready to support general wards, but seek certifications in dementia care or lift leadership to maximize wages." };
    return { tier: "Board-Audit Grade Champion", color: "text-emerald-700 bg-emerald-50 border-emerald-300", desc: "Outstanding score! Your knowledge-level easily aligns with Piedmont, Emory, and Grady's elite ward criteria." };
  };

  const currentTier = getReadinessTier(scorePercent);

  // Generate personalized study plan file
  const handleExportStudyPlan = () => {
    const checkedList = COMPLIANCE_ITEMS.filter(it => state.complianceChecked.includes(it.id));
    const uncheckedList = COMPLIANCE_ITEMS.filter(it => !state.complianceChecked.includes(it.id));

    const studyText = `
==================================================
        CNA COMPLIANCE READINESS STUDY PLAN
==================================================
Date: ${new Date().toLocaleDateString()}
Current Baseline Readiness: ${scorePercent}% (${currentTier.tier})

Completed Clinical Mandates (${checkedList.length}/${totalCount}):
${checkedList.map((c, i) => `${i + 1}. [✓] ${c.category}: ${c.title}\n   - Description: ${c.description}`).join('\n\n')}

Focus Area Study Gaps Required (${uncheckedList.length}/${totalCount}):
${uncheckedList.map((u, i) => `${i + 1}. [ ] REVIEW: ${u.category} - ${u.title}\n   - Action Tip: ${u.description}\n   - Reference: ${u.rationale}`).join('\n\n')}

Suggested Academic Training Links:
* CDC STEADI Fall Training: https://www.cdc.gov/steadi/
* CMS F-Tag Quality Metrics: https://www.cms.gov/
* validation Therapy Dementia support: https://vfvalidation.org/

==================================================
             END OF CERTIFIED REPORT
==================================================
    `.trim();

    const blob = new Blob([studyText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CNA_Study_Plan_Readiness_${scorePercent}pct.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
      {/* Title */}
      <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-black text-xl uppercase text-slate-950 flex items-center gap-1.5ClassName">
            <ClipboardCheck className="w-5 h-5 text-indigo-650" /> Clinical Compliance & Self-Assessment
          </h3>
          <p className="font-sans text-slate-600 text-xs font-medium mt-1">
            Audit your experience against Georgia's top 20 CMS clinical regulatory measures. Realize your care strengths and target study training gaps.
          </p>
        </div>
        <button
          onClick={handleExportStudyPlan}
          className="self-start sm:self-center font-mono text-[10px] font-black uppercase tracking-wider bg-[#d97706] hover:bg-amber-700 text-white px-3.5 py-2 flex items-center gap-1 border border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer shrink-0"
        >
          <FileDown className="w-3.5 h-3.5" /> Export study Plan
        </button>
      </div>

      {/* Progress metrics and Readiness score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 border border-slate-200">
        <div className="md:col-span-1 text-center sm:text-left flex flex-col justify-center">
          <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400 font-extrabold leading-none mb-1">
            Readiness Score
          </span>
          <span className="font-display font-black text-4xl text-indigo-600 leading-none">
            {scorePercent}%
          </span>
          <span className="text-[10px] font-mono text-slate-500 font-bold mt-1">
            {checkedCount} / {totalCount} Compliant
          </span>
        </div>

        {/* Dynamic progress loader */}
        <div className="md:col-span-3 space-y-2.5">
          <div>
            <div className="flex justify-between text-[10px] font-mono font-bold uppercase mb-1">
              <span className="text-slate-505">Completion Track</span>
              <span className="text-indigo-655">{scorePercent}% Certified</span>
            </div>
            <div className="w-full bg-slate-200 h-3 border border-slate-405 relative overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${scorePercent}%` }}
              ></div>
            </div>
          </div>

          <div className={`p-2.5 border text-[11px] font-sans font-medium leading-relaxed ${currentTier.color}`}>
            <span className="font-bold uppercase text-[9px] block">
              Auditor Tier Level: {currentTier.tier}
            </span>
            {currentTier.desc}
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`p-1.5 px-3 font-mono text-[10px] font-bold uppercase border cursor-pointer select-none transition-all outline-none ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50 focus:ring-1 focus:ring-slate-900"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Interactive checklists table */}
      <div className="min-w-full space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredItems.map((item) => {
          const isChecked = state.complianceChecked.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-3 border-2 transition-all cursor-pointer flex items-start gap-3 select-none hover:border-slate-800 ${
                isChecked
                  ? "bg-indigo-50/40 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="pt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // toggled on container div click
                  className="h-4 w-4 text-indigo-650 border-slate-350 cursor-pointer focus:ring-0 focus:ring-offset-0"
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-x-2 leading-tight">
                  <span className="font-sans font-bold text-slate-950 text-xs">{item.title}</span>
                  <span className="bg-slate-100 text-slate-500 font-mono text-[8px] font-bold px-1 uppercase tracking-wider scale-95 border border-slate-200">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium font-sans leading-normal">
                  {item.description}
                </p>
                <p className="text-[9.5px] italic text-slate-400 font-sans font-medium">
                  Why: {item.rationale}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
