import React from "react";
import { usePlaybook } from "../lib/resumeState";
import { FACILITY_SKILL_ALIGNMENTS } from "../lib/constants";
import { Award, Star, Info, ShieldAlert } from "lucide-react";

export default function FacilityTailor() {
  const { state, dispatch } = usePlaybook();

  const facilities = [
    { name: "General", desc: "Standard clinical configuration of skills and outline notes." },
    { name: "Hospital", desc: "Prioritizes clinical vitals, wound care support, and rapid responder assistance." },
    { name: "SNF", desc: "Prioritizes long-term care compliance, dementia redirection, and high-frequency Hoyer lift safety." },
    { name: "Assisted Living", desc: "Prioritizes daily ADL assistance, social engagement, and friendly medication reminders." },
    { name: "Home Health", desc: "Prioritizes high self-reliance, time coordination records, and remote client-family communication." },
    { name: "Memory Care", desc: "Prioritizes Validation therapy, Sundowning safety routines, and specialized cognitive care techniques." }
  ];

  const handleSelect = (fac: string) => {
    dispatch({ type: "SET_FACILITY_TYPE", payload: fac });
  };

  const currentAlignedSkills = FACILITY_SKILL_ALIGNMENTS[state.selectedFacilityType] || [];

  return (
    <div className="bg-white border-2 border-slate-900 p-4 sm:p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(79,70,229,0.15)] space-y-4">
      <div>
        <h4 className="font-display font-black text-sm uppercase text-slate-950 flex items-center gap-1.5">
          <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" /> Target Facility Resume Re-writer
        </h4>
        <p className="text-[11px] text-slate-500 font-sans mt-0.5">
          Select your target hiring pool. Choosing a facility type dynamically highlights matching certifications in your live resume layout!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {facilities.map((fac) => {
          const isSelected = state.selectedFacilityType === fac.name;
          return (
            <button
              key={fac.name}
              onClick={() => handleSelect(fac.name)}
              className={`text-left p-3 border-2 transition-all cursor-pointer outline-none relative hover:border-slate-900 ${
                isSelected
                  ? "border-slate-900 bg-indigo-50/50"
                  : "border-slate-200 bg-slate-50"
              } focus:ring-2 focus:ring-indigo-500`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-black uppercase text-slate-950">{fac.name}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-650"></span>}
              </div>
              <p className="text-[9px] text-slate-600 leading-tight font-sans font-medium line-clamp-2">
                {fac.desc}
              </p>
            </button>
          );
        })}
      </div>

      {state.selectedFacilityType !== "General" && (
        <div className="bg-indigo-50/80 border border-indigo-200 p-3 flex items-start gap-2 text-[10px] font-sans font-medium text-indigo-950">
          <Info className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
          <div>
            <p className="font-bold uppercase text-[9px] text-indigo-900">
              Auto-Positioning Highlight Active: {state.selectedFacilityType}
            </p>
            <p className="mt-1">
              The following skills are boosted to top relevance on your CV:{" "}
              <span className="font-mono text-indigo-700 font-bold">
                {currentAlignedSkills.join(", ")}
              </span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
