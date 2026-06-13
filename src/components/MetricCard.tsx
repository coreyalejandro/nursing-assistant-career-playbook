import React, { useState } from "react";
import { usePlaybook } from "../lib/resumeState";
import { FileLineChart, ChevronDown, ChevronUp, Save, ShieldCheck, Heart } from "lucide-react";

interface CaseStudyProp {
  id: "falls" | "ehr" | "satisfaction";
  title: string;
  metricValue: string;
  beforeValue: string;
  afterValue: string;
  timePeriod: string;
  framework: string;
  authority: string;
  protocolSteps: string[];
}

export default function MetricCard() {
  const { state, dispatch } = usePlaybook();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  const caseStudies: CaseStudyProp[] = [
    {
      id: "falls",
      title: "Fall Reduction",
      metricValue: "15% Floor Reduction",
      beforeValue: "23 falls per quarter",
      afterValue: "19.5 falls per quarter",
      timePeriod: "180 days of testing",
      framework: "CDC STEADI Fall Prevention Protocol",
      authority: "Centers for Disease Control and Prevention (CDC)",
      protocolSteps: [
        "Screen residents annually for fall risk using the 3 key STEADI questions: Have you fallen in the past year? Do you feel unsteady when standing? Are you worried about falling?",
        "Assess orthostatic blood pressure changes (supine, sitting, standing) to intercept postural hypotensive alerts.",
        "Evaluate gait, balance, and leg strength protocols using the 4-Stage Balance Test (TUG).",
        "Conduct regular inspections, checking that patient rooms remain clear of rugs, extension wires, and dynamic floor clutter.",
        "Verify sensory support structures: check and document cleanliness of eyeglasses and battery levels of hearing aids."
      ]
    },
    {
      id: "ehr",
      title: "EHR Compliance",
      metricValue: "100% Timely Entries",
      beforeValue: "88% completion in 2hrs",
      afterValue: "100% compliant logs",
      timePeriod: "Ongoing shift blocks",
      framework: "CMS Direct Documentation Guidelines",
      authority: "Centers for Medicare & Medicaid Services (CMS)",
      protocolSteps: [
        "Document ADL, fluid counts, and nourishment indicators at the point-of-care, avoiding end-of-shift backlogging.",
        "Coordinate double-witness sign-offs for all mechanical lift (Hoyer) transfers in PointClickCare.",
        "Audit skin-integrity changes and pressure-area adjustments every 2 hours as per skin protection standards.",
        "Establish tight electronic reports on hydration milestones, flagging critical output exceptions immediately to the Charge Nurse."
      ]
    },
    {
      id: "satisfaction",
      title: "Family Care Satisfaction Boost",
      metricValue: "10% Score Increase",
      beforeValue: "4.1 average weekly index",
      afterValue: "4.5 average weekly index",
      timePeriod: "90-day post onboarding",
      framework: "CMS Hospital Consumer Assessment of Healthcare (HCAHPS)",
      authority: "CMS Quality Incentive Program",
      protocolSteps: [
        "Institute active dignity checks, verifying resident preference options for standard morning dressing and seating patterns.",
        "Conduct routine comfort rounds, verifying call lights are within physical grasp and bedside hydration trays are topped off.",
        "Employ Validation therapy during memory-state wandering, validation rather than corrective arguments.",
        "Proactively outline care summaries for visiting family members, instantly bridging non-clinical questions with administrative leads."
      ]
    }
  ];

  const handleSave = (id: string, text: string) => {
    dispatch({
      type: "UPDATE_USER_INTERVENTION",
      payload: { cardId: id, text }
    });
    setEditingCard(null);
    setSavedStatus((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSavedStatus((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  };

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {caseStudies.map((cs) => {
        const textValue = state.userInterventions[cs.id] || "";
        const isExpanded = expandedCard === cs.id;
        const isEditing = editingCard === cs.id;

        return (
          <div
            key={cs.id}
            className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
          >
            <div>
              {/* Header Card border */}
              <div className="border-b-2 border-dashed border-slate-900 pb-2 mb-3">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">
                  CASE STUDY METRIC
                </span>
                <h4 className="font-display font-black text-lg uppercase text-slate-900 leading-tight">
                  {cs.title}
                </h4>
                <div className="mt-1 text-emerald-700 font-sans font-black text-sm">
                  ★ VALUE: {cs.metricValue}
                </div>
              </div>

              {/* Card Details Block */}
              <div className="space-y-1.5 font-sans text-xs text-slate-705 border-b border-slate-100 pb-3 mb-3">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">BEFORE:</span>
                  <span className="font-mono text-slate-900 font-extrabold">{cs.beforeValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">AFTER:</span>
                  <span className="font-mono text-slate-900 font-extrabold">{cs.afterValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">TIME PERIOD:</span>
                  <span className="font-mono text-slate-900 font-extrabold">{cs.timePeriod}</span>
                </div>
              </div>

              {/* Editable intervention text */}
              <div className="space-y-1.5 bg-slate-50 p-2.5 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] uppercase font-bold text-slate-500">
                    My Personal Intervention:
                  </span>
                  {savedStatus[cs.id] && (
                    <span className="text-[8px] font-mono font-bold text-emerald-600 animate-pulse">
                      Saved ✓
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-1.5">
                    <textarea
                      defaultValue={textValue}
                      id={`textarea-intervene-${cs.id}`}
                      rows={3}
                      className="w-full bg-white border border-slate-400 p-1.5 font-sans text-xs outline-none"
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditingCard(null)}
                        className="px-2 py-0.5 border border-slate-300 font-mono text-[9px] text-slate-600 uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const el = document.getElementById(
                            `textarea-intervene-${cs.id}`
                          ) as HTMLTextAreaElement;
                          if (el) handleSave(cs.id, el.value);
                        }}
                        className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[9px] uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-slate-800 text-[11.5px] leading-relaxed italic font-medium font-sans">
                      "{textValue || "Click [Edit Contribution] below to record what clinical actions you performed."}"
                    </p>
                    <button
                      onClick={() => setEditingCard(cs.id)}
                      className="text-[9px] font-mono text-indigo-650 hover:text-indigo-800 hover:underline font-extrabold tracking-wider uppercase block text-left"
                    >
                      [✏ Edit My Contribution]
                    </button>
                  </div>
                )}
              </div>

              {/* Framework metadata */}
              <div className="mt-3 leading-snug">
                <span className="block font-mono text-[8px] uppercase text-slate-400 font-black">
                  CLINICAL FRAMEWORK ARCHITECTURE
                </span>
                <span className="font-sans text-[11px] font-bold text-slate-800">
                  {cs.framework}
                </span>
                <span className="block font-mono text-[8px] text-slate-400 mt-0.5">
                  AUTHORITY: {cs.authority}
                </span>
              </div>
            </div>

            {/* Accordion view steps */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={() => toggleExpand(cs.id)}
                className="w-full font-mono text-[9px] font-black uppercase text-slate-900 flex items-center justify-between hover:text-indigo-600 outline-none focus:ring-1 focus:ring-slate-950 py-1"
                aria-expanded={isExpanded}
              >
                <span>{isExpanded ? "Close Protocol Guidelines" : "View Full Protocol"}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isExpanded && (
                <div className="mt-2.5 bg-indigo-50/50 p-2.5 border border-indigo-200 text-[10px] leading-relaxed text-slate-800 font-sans space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                  <p className="font-bold text-indigo-900 uppercase text-[9px] tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" /> Authorized Safe Steps:
                  </p>
                  <ul className="list-decimal pl-4.5 space-y-1">
                    {cs.protocolSteps.map((step, idx) => (
                      <li key={idx} className="font-medium">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
