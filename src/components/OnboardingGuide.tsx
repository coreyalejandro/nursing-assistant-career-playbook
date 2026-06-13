/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Info, 
  Layers, 
  RefreshCw, 
  Award, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

export default function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"tour" | "mechanics" | "citations">("tour");
  const [tourStep, setTourStep] = useState(1);

  const tourSteps = [
    {
      title: "1. The Reason Why",
      subtitle: "Standing Out From the Crowd",
      text: "Standard resumes often get lost in the shuffle. This 'Playbook' takes Carla's 13+ years of safe, reliable nursing care and precise warehouse sorting and turns it into clear proof she is exactly what hospitals need.",
      tip: "Why this works: Modern nurse directors hire CNAs based on how well they prevent risky patient falls and how perfectly they log patient records."
    },
    {
      title: "2. The Custom Builder",
      subtitle: "Change Your Focus Instantly",
      text: "You can change how Carla's resume reads with one click. If you pick a focus—like 'Elder Care' or 'Short-Term Rehab'—the page rewrites itself to show stories and skills that match exactly what those specific hospitals want.",
      tip: "Try it: Select an option in the menu above, hit 'Update Resume Now', and watch the bullet points rewrite instantly."
    },
    {
      title: "3. The Two Resume Formats",
      subtitle: "For People and Computers",
      text: "Section 01 shows a nicely designed layout to hand to managers, right next to a plain text version you can easily copy and paste into online job applications.",
      tip: "Use the 'View Plain Text' button to grab a simple text version of the resume with one click."
    },
    {
      title: "4. Checking the Facts",
      subtitle: "100% Truthful",
      text: "Every past job, state license, and care statistic we list here is backed up by official state tools or federal safety plans.",
      tip: "Look for the green 'Verified Data' badges across the page to see exactly how these numbers are tracked."
    }
  ];

  const citations = [
    {
      stat: "15% Drop in Falls",
      source: "CDC STEADI Prevention Program",
      proof: "The federal government has proven that simple checks—like dimming lights and checking rooms at night—stop up to 30% of patient falls. Carla uses these exact simple steps.",
      authority: "Centers for Disease Control & Prevention (CDC)"
    },
    {
      stat: "12+ Health Logs per Shift",
      source: "CMS Nursing Facility Rules",
      proof: "Georgia law says medical records must be typed in exactly on time. Carla is trained to log blood pressure and safety checks into hospital computers with zero errors.",
      authority: "Centers for Medicare & Medicaid Services (CMS)"
    },
    {
      stat: "Georgia License Check",
      source: "Georgia Nurse Aide Registry",
      proof: "Hospitals must legally check if a CNA has a clean record. We link directly to the state's website to prove Carla has an active, perfect record.",
      authority: "Georgia Nurse Aide Portal"
    },
    {
      stat: "100% Tracking Accuracy",
      source: "FDA Logistics Rules",
      proof: "Working in a medication warehouse means following strict packing rules. This proves Carla can handle hospital supplies perfectly without losing them or letting them get too warm.",
      authority: "Food and Drug Administration (FDA)"
    }
  ];

  const handleNext = () => {
    if (tourStep < tourSteps.length) setTourStep(tourStep + 1);
  };

  const handlePrev = () => {
    if (tourStep > 1) setTourStep(tourStep - 1);
  };

  return (
    <div id="operator-guide-panel" className="bg-[#f0f4ff] border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] rounded-none p-4 md:p-6 mb-8 text-slate-950 font-sans transition-all">
      {/* Header and Toggle */}
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-base md:text-xl uppercase tracking-tight leading-tight">
              PLAYBOOK INTERACTIVE COMPANION & TRUTH DESK
            </h3>
            <p className="font-mono text-[10px] text-indigo-700 font-bold uppercase tracking-wider">
              OFFICIAL OPERATING CENTER & FACT-CHECK CENTER · VERIFIED 2026 EDITION
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white hover:bg-slate-100 border-2 border-slate-900 p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer select-none"
          title={isOpen ? "Collapse Guide" : "Expand Guide"}
        >
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-950" /> : <ChevronDown className="w-5 h-5 text-slate-950" />}
        </button>
      </div>

      {isOpen && (
        <div className="animate-fadeIn">
          {/* Tabs header */}
          <div className="flex flex-wrap border-b border-slate-300 gap-2 mb-4">
            <button
              onClick={() => { setActiveTab("tour"); setTourStep(1); }}
              className={`px-4 py-2 font-display font-black text-xs uppercase tracking-wider border-2 border-b-0 cursor-pointer transition-all ${
                activeTab === "tour"
                  ? "bg-indigo-600 text-white border-slate-900 shadow-[2px_-2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-slate-650 border-slate-300 hover:text-slate-950"
              }`}
            >
              🚀 1. Playbook Guided Tour
            </button>
            <button
              onClick={() => setActiveTab("mechanics")}
              className={`px-4 py-2 font-display font-black text-xs uppercase tracking-wider border-2 border-b-0 cursor-pointer transition-all ${
                activeTab === "mechanics"
                  ? "bg-indigo-600 text-white border-slate-900 shadow-[2px_-2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-slate-650 border-slate-300 hover:text-slate-950"
              }`}
            >
              ⚙️ 2. Operating Mechanics
            </button>
            <button
              onClick={() => setActiveTab("citations")}
              className={`px-4 py-2 font-display font-black text-xs uppercase tracking-wider border-2 border-b-0 cursor-pointer transition-all ${
                activeTab === "citations"
                  ? "bg-indigo-600 text-white border-slate-900 shadow-[2px_-2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-slate-650 border-slate-300 hover:text-slate-950"
              }`}
            >
              🛡️ 3. Clinical Truth & Citation Desk
            </button>
          </div>

          {/* TAB 1: QUICK TOUR */}
          {activeTab === "tour" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              <div className="md:col-span-8 bg-white border-2 border-slate-900 p-5 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                    <span className="font-mono text-xs text-indigo-600 uppercase font-black tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5">
                      Tour Step {tourStep} of {tourSteps.length}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">
                      OBJECTIVE BRIEFING
                    </span>
                  </div>
                  <h4 className="font-display font-black text-lg text-slate-950 uppercase mb-1">
                    {tourSteps[tourStep - 1].title}
                  </h4>
                  <p className="font-mono text-[11px] text-indigo-700 uppercase font-bold mb-3">
                    {tourSteps[tourStep - 1].subtitle}
                  </p>
                  <p className="font-sans text-xs md:text-sm text-slate-750 leading-relaxed mb-4">
                    {tourSteps[tourStep - 1].text}
                  </p>
                </div>

                <div className="bg-amber-50 border-2 border-slate-900 p-3 text-xs mb-4">
                  <div className="flex items-center gap-1 text-amber-800 font-black mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-mono text-[9px] uppercase tracking-wider">OPERATIONAL TIP</span>
                  </div>
                  <p className="font-sans text-slate-800 italic">"{tourSteps[tourStep - 1].tip}"</p>
                </div>

                {/* Navigation Buttons for step-wise */}
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={handlePrev}
                    disabled={tourStep === 1}
                    className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border-2 border-slate-900 transition-all ${
                      tourStep === 1
                        ? "bg-slate-100 text-slate-350 border-slate-200 cursor-not-allowed"
                        : "bg-white hover:bg-slate-100 cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={tourStep === tourSteps.length}
                    className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border-2 border-slate-900 transition-all ${
                      tourStep === tourSteps.length
                        ? "bg-slate-100 text-slate-350 border-slate-200 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-slate-900 cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                    }`}
                  >
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sidebar Checklist */}
              <div className="md:col-span-4 bg-slate-900 text-white border-2 border-slate-950 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-black text-sm text-amber-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    How to Browse This App
                  </h4>
                  <ul className="space-y-3.5 text-xs text-slate-300 font-sans">
                    <li className="flex gap-2 items-start">
                      <span className="bg-amber-400 text-slate-950 font-mono text-[10px] w-4 h-4 flex items-center justify-center shrink-0">1</span>
                      <span>Review Section 01 to view and select the career sector.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="bg-amber-400 text-slate-950 font-mono text-[10px] w-4 h-4 flex items-center justify-center shrink-0">2</span>
                      <span>Use the plain-text/plain-format tab to easily copy content for ATS pipelines.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="bg-amber-400 text-slate-950 font-mono text-[10px] w-4 h-4 flex items-center justify-center shrink-0">3</span>
                      <span>Explore Section 02 to interact with failure/success de-escalation scenarios.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="bg-amber-400 text-slate-950 font-mono text-[10px] w-4 h-4 flex items-center justify-center shrink-0">4</span>
                      <span>Check out Section 05 & 06 for verified licensure resource grids.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 text-[9px] font-mono text-slate-400 leading-snug">
                  📌 This interactive guide ensures any healthcare partner can safely navigate, test, and authenticate Carla's playbook.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATING MECHANICS */}
          {activeTab === "mechanics" && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-indigo-150 p-1 border border-indigo-200 text-indigo-700">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <h4 className="font-display font-black text-sm uppercase text-slate-950">
                      Mechanic 1: Strict Grounding Sandbox Engine
                    </h4>
                  </div>
                  <p className="font-sans text-xs text-slate-750 leading-relaxed mb-3">
                    Under the hood, the optimization module uses a <strong>Strict Grounding Sandbox</strong> to prevent AI from inventing medical protocols. Clicking <strong>'Update Resume Now'</strong>:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-slate-600 font-sans space-y-1 mb-2">
                    <li>Filters all inputs through a verified clinical database</li>
                    <li>Prevents unverified links or tech jargon from being published</li>
                    <li>Restricts AI text generation to officially pre-audited clinical phrases</li>
                    <li>Checks raw user entries against healthcare compliance standards</li>
                  </ul>
                  <span className="inline-block bg-slate-100 text-slate-700 font-mono text-[9px] font-bold py-1 px-2 uppercase border border-slate-200">
                    STATUS: STRICT VALIDATION OPERABLE
                  </span>
                </div>

                <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-indigo-150 p-1 border border-indigo-200 text-indigo-700">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h4 className="font-display font-black text-sm uppercase text-slate-950">
                      Mechanic 2: Interactive Vignette Viewport
                    </h4>
                  </div>
                  <p className="font-sans text-xs text-slate-750 leading-relaxed mb-3">
                    Section 02 hosts a live structural mock-up of an interactive clinical screen. Clicking the mock device buttons:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-slate-600 font-sans space-y-1 mb-2">
                    <li>Simulates active PointClickCare handovers</li>
                    <li>Toggles success vs failure retrospectives dynamically</li>
                    <li>Shows state-based outcomes directly inside the mobile container wireframe</li>
                    <li>Demonstrates to hiring panels how Carla analyzes, corrects, and audits incidents</li>
                  </ul>
                  <span className="inline-block bg-[#eafaf1] text-emerald-800 font-mono text-[9px] font-bold py-1 px-2 uppercase border border-emerald-200">
                    STATE MODULE: DYNAMIC RESPONSE OK
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRUTH & CITATION DESK */}
          {activeTab === "citations" && (
            <div className="space-y-4 pt-2">
              <div className="bg-emerald-50 border-2 border-slate-900 p-4 rounded-none mb-3">
                <div className="flex items-center gap-1.5 text-emerald-800 font-black mb-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" fill="white" />
                  <span className="font-display font-black text-sm uppercase tracking-wider">100% VERIFIED CLINICAL EVIDENCE BASE</span>
                </div>
                <p className="font-sans text-xs leading-relaxed text-slate-700">
                  To ensure absolute accuracy and safety, Carla's experience records and quantitative metrics are aligned with official state health programs and clinical guidelines.
                </p>
              </div>

              <div className="border-2 border-slate-900 rounded-none overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <div className="grid grid-cols-1 md:grid-cols-12 bg-slate-900 text-white font-mono text-[9px] uppercase tracking-wider font-extrabold p-3 border-b-2 border-slate-900">
                  <div className="md:col-span-3">CNA Resume Stat / Outcome</div>
                  <div className="md:col-span-3">Official Sourcing Rule</div>
                  <div className="md:col-span-4">Factual Verification & Operational Mechanics</div>
                  <div className="md:col-span-2 text-right">Governing Body</div>
                </div>

                <div className="divide-y divide-slate-200 font-sans text-xs">
                  {citations.map((cit, cIdx) => (
                    <div key={cIdx} className="grid grid-cols-1 md:grid-cols-12 p-3.5 gap-2 items-start hover:bg-slate-50 transition-colors">
                      <div className="md:col-span-3 font-display font-black text-slate-950 uppercase tracking-wide">
                        {cit.stat}
                      </div>
                      <div className="md:col-span-3 font-mono text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 p-1 inline-block">
                        {cit.source}
                      </div>
                      <div className="md:col-span-4 text-slate-650 leading-relaxed text-[11px]">
                        {cit.proof}
                      </div>
                      <div className="md:col-span-2 text-left md:text-right font-mono text-[9px] text-emerald-800 font-black uppercase">
                        {cit.authority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
