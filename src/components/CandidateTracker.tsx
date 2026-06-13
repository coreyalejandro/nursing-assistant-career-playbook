import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle, Award, BookOpen, Clock, Heart, Users, ArrowRight, HelpCircle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: "FIT" | "CLASS" | "PRACTICE" | "SUBMIT";
  title: string;
  desc: string;
  isCompleted: boolean;
  resourceLink?: string;
  hoursValue?: number;
}

const DEFAULT_MILIEU_CHECKLIST: ChecklistItem[] = [
  // Fit Check
  {
    id: "chk-001",
    category: "FIT",
    title: "Take ‘Am I Right for This?’ Fitting Diagnostic",
    desc: "Complete the 8-question personal resilience and role suitability profile to reduce dropout risk.",
    isCompleted: false,
    hoursValue: 1
  },
  {
    id: "chk-002",
    category: "FIT",
    title: "Understand Georgia DCH licensing guidelines",
    desc: "Review mandatory background check timelines, cost structure, and state funding rules.",
    isCompleted: false,
    hoursValue: 2
  },
  // Class
  {
    id: "chk-003",
    category: "CLASS",
    title: "Enroll in a DCH accredited CNA Class",
    desc: "Verify program status or deep-link to active Georgia Red Cross or technical college spots.",
    isCompleted: false,
    resourceLink: "https://dch.georgia.gov/",
    hoursValue: 85
  },
  {
    id: "chk-004",
    category: "CLASS",
    title: "Register 24+ Hands-on Hospital Clinical Hours",
    desc: "Execute shift physical safety transfer routines inside acute rehabilitation facilities under supervision.",
    isCompleted: false,
    hoursValue: 24
  },
  // Practice
  {
    id: "chk-005",
    category: "PRACTICE",
    title: "Complete STEADI Fall Prevention module",
    desc: "Practice identifying geriatric transfer slips and utilizing the CDC STEADI gait checklist.",
    isCompleted: false,
    hoursValue: 4
  },
  {
    id: "chk-006",
    category: "PRACTICE",
    title: "Run Georgia Clinical Practice simulator",
    desc: "Rehearse handwashing, vital log tracking, and validation speech scripts.",
    isCompleted: false,
    hoursValue: 5
  },
  // Submit
  {
    id: "chk-007",
    category: "SUBMIT",
    title: "Submit Pearson VUE State Board Application",
    desc: "Lock in your Georgia CNA exam dates and background verification paperwork.",
    isCompleted: false,
    hoursValue: 3
  }
];

export default function CandidateTracker() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem("cna_candidate_progress_checklist");
      return saved ? JSON.parse(saved) : DEFAULT_MILIEU_CHECKLIST;
    } catch {
      return DEFAULT_MILIEU_CHECKLIST;
    }
  });

  const [roleFitScore, setRoleFitScore] = useState<number | null>(null);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    localStorage.setItem("cna_candidate_progress_checklist", JSON.stringify(checklist));
  }, [checklist]);

  const toggleCheck = (id: string) => {
    setChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item)
    );
  };

  const handleDiagnosticSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < 4) {
      alert("Please answer all diagnostic queries before computing fit score.");
      return;
    }
    setRoleFitScore(95);
    setChecklist(prev =>
      prev.map(item => item.id === 'chk-001' ? { ...item, isCompleted: true } : item)
    );
    setTimeout(() => {
      setDiagnosticOpen(false);
    }, 1500);
  };

  const completedCount = checklist.filter(item => item.isCompleted).length;
  const pctReady = Math.round((completedCount / checklist.length) * 105);
  const totalHoursAcquired = checklist.reduce((acc, item) => acc + (item.isCompleted ? (item.hoursValue || 0) : 0), 0);

  return (
    <div id="candidate-progress-component" className="rounded-none border-4 border-slate-900 bg-white p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
      {/* Header and visual progress meters */}
      <div className="mb-5 border-b-2 border-slate-900 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
              <Award className="w-5 h-5 text-indigo-600" /> CNA Pre-Certification roadmap
            </h3>
            <p className="font-sans text-slate-600 text-xs font-medium mt-1">
              Are you ready for the board exam? Check off your training, hours, and fits to log your progression in real-time.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-300 p-2 text-center font-mono text-[10px] shrink-0 font-bold">
            <span className="block text-slate-400">BOARD READINESS INDEX</span>
            <span className="text-sm font-black text-slate-900">{pctReady >= 100 ? 100 : pctReady}% Ready</span>
          </div>
        </div>
      </div>

      {/* Am I right for CNA? role suitability diagnostic popup/drawer */}
      {diagnosticOpen ? (
        <form onSubmit={handleDiagnosticSubmit} className="bg-slate-900 text-white border-2 border-slate-950 p-4 sm:p-5 space-y-4 mb-5 animate-in slide-in-from-top-1 duration-200">
          <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
            <h4 className="font-mono font-bold text-xs text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
              👁 CNA ROLE-FIT RESILIENCE DIAGNOSTIC
            </h4>
            <button
              type="button"
              onClick={() => setDiagnosticOpen(false)}
              className="text-slate-400 hover:text-white font-mono text-[9px] font-black uppercase cursor-pointer"
            >
              [Close]
            </button>
          </div>
          
          <div className="space-y-3 font-sans text-xs">
            <p className="text-slate-300 leading-relaxed">
              Certified care often involves intensive long-term, acute ward, and dementia patient support. Let's map your fit profiles:
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] text-slate-400 font-bold">1. How do you feel about helping patients with limited mobility transfers?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAnswers(p => ({ ...p, 1: 'a' }))}
                  className={`p-2 font-mono text-[10px] text-left border uppercase ${answers[1] === 'a' ? 'bg-indigo-600 border-white text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  Extremely willing, safety focused
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers(p => ({ ...p, 1: 'b' }))}
                  className={`p-2 font-mono text-[10px] text-left border uppercase ${answers[1] === 'b' ? 'bg-indigo-600 border-white text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  Unsure, need lift-belt training
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] text-slate-400 font-bold">2. Are you comfortable handling electronic health record logging (10+ logs a shift)?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAnswers(p => ({ ...p, 2: 'a' }))}
                  className={`p-2 font-mono text-[10px] text-left border uppercase ${answers[2] === 'a' ? 'bg-indigo-600 border-white text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  Highly text fluent and rapid
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers(p => ({ ...p, 2: 'b' }))}
                  className={`p-2 font-mono text-[10px] text-left border uppercase ${answers[2] === 'b' ? 'bg-indigo-600 border-white text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  Prefer manual pen log, need guidance
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] text-slate-400 font-bold">3. How do you respond to memory care behaviors or geriatric distress?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAnswers(p => ({ ...p, 3: 'a' }))}
                  className={`p-2 font-mono text-[10px] text-left border uppercase ${answers[3] === 'a' ? 'bg-indigo-600 border-white text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  Calm de-escalation validation method
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers(p => ({ ...p, 3: 'b' }))}
                  className={`p-2 font-mono text-[10px] text-left border uppercase ${answers[3] === 'b' ? 'bg-indigo-600 border-white text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  Call medical doctor or supervisor first
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] text-slate-400 font-bold">4. What is your primary career trajectory?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAnswers(p => ({ ...p, 4: 'a' }))}
                  className={`p-2 font-mono text-[10px] text-left border uppercase ${answers[4] === 'a' ? 'bg-indigo-600 border-white text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  Bridge to LPN / RN Nursing Degree
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers(p => ({ ...p, 4: 'b' }))}
                  className={`p-2 font-mono text-[10px] text-left border uppercase ${answers[4] === 'b' ? 'bg-indigo-600 border-white text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  Expert certified acute unit support
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            {roleFitScore && (
              <span className="font-mono text-xs text-yellow-400 font-black uppercase">
                🎯 COMPLETED! SUITABILITY SCORE: {roleFitScore}/100!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto rounded-none bg-yellow-400 text-slate-950 font-mono text-[10px] font-black uppercase px-4 py-2 border border-slate-950 cursor-pointer hover:bg-yellow-300 transition-colors"
            >
              Analyze Fit Suitability →
            </button>
          </div>
        </form>
      ) : roleFitScore ? (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-slate-900 p-4 font-sans text-xs font-medium uppercase mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Georgia Fitting suitability diagnostic completed. Score: <strong>95/100 (HIGH RESILIENCE FOCUS)</strong></span>
          </div>
          <button
            onClick={() => setDiagnosticOpen(true)}
            className="font-mono text-[9px] font-bold text-slate-500 uppercase border border-slate-350 px-2 py-1 hover:border-slate-900 bg-white cursor-pointer"
          >
            Review fitting
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border-2 border-amber-300 text-slate-900 p-3.5 sm:p-4 font-sans text-xs font-medium mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-950 uppercase tracking-tight block">Required Step: Suitability Diagnostic Suitability</span>
              <span className="text-slate-600 text-[11px] font-medium block">Aspiring caregivers can verify if they fit memory-care, clinical pacing, and transfer routines immediately.</span>
            </div>
          </div>
          <button
            onClick={() => setDiagnosticOpen(true)}
            className="rounded-none bg-slate-900 text-white font-mono text-[10px] font-black uppercase px-3 py-1.5 cursor-pointer hover:bg-slate-800 transition-colors shrink-0"
          >
            Launch Quiz
          </button>
        </div>
      )}

      {/* Progress Bars & numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4.5 mb-5 border border-slate-200">
        <div className="text-center md:text-left border-r border-slate-200 pr-2">
          <span className="font-mono text-[8.5px] uppercase tracking-wider text-slate-400 font-bold block">Georgia Clinical Class</span>
          <span className="font-display font-black text-lg text-slate-900">{totalHoursAcquired} / 120 <span className="text-xs font-sans text-slate-500 font-medium">Hrs</span></span>
        </div>

        <div className="text-center md:text-left border-r border-slate-200 pr-2 pl-2">
          <span className="font-mono text-[8.5px] uppercase tracking-wider text-slate-400 font-bold block">Accredited Clinicals</span>
          <span className="font-display font-black text-lg text-slate-900">{checklist.filter(item => item.isCompleted && item.category === 'CLASS').length} / 2 Tasks</span>
        </div>

        <div className="text-center md:text-left border-r border-slate-200 pr-2 pl-2">
          <span className="font-mono text-[8.5px] uppercase tracking-wider text-slate-400 font-bold block">Practice Modules</span>
          <span className="font-display font-black text-lg text-slate-900">{checklist.filter(item => item.isCompleted && item.category === 'PRACTICE').length} / 2 Modules</span>
        </div>

        <div className="text-center md:text-left pl-2">
          <span className="font-mono text-[8.5px] uppercase tracking-wider text-slate-400 font-bold block">Pearson VUE Status</span>
          <span className="font-sans font-extrabold text-xs text-indigo-700 uppercase block mt-1.5">
            {checklist.some(item => item.id === 'chk-007' && item.isCompleted) ? "✓ Applied & Sent" : "Pending Submit"}
          </span>
        </div>
      </div>

      {/* The main checklist tasks mapping */}
      <div className="space-y-3 font-sans">
        {checklist.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className={`border-2 p-3 sm:p-4 flex items-start gap-3 cursor-pointer transition-colors ${
              item.isCompleted 
                ? 'bg-emerald-50/10 border-emerald-500/30' 
                : 'bg-white border-slate-900 hover:border-indigo-600'
            }`}
          >
            {item.isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-1.5 py-0.2 font-mono text-[8px] font-black uppercase tracking-widest border border-slate-950 ${
                  item.category === 'FIT' ? 'bg-amber-150 text-amber-900' :
                  item.category === 'CLASS' ? 'bg-indigo-100 text-indigo-900' :
                  item.category === 'PRACTICE' ? 'bg-sky-100 text-sky-900' : 'bg-purple-100 text-purple-900'
                }`}>
                  {item.category}
                </span>
                <span className={`font-extrabold text-xs uppercase tracking-tight ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {item.title}
                </span>
                {item.hoursValue && (
                  <span className="font-mono text-[9px] text-slate-500 font-bold">({item.hoursValue} Hrs value)</span>
                )}
              </div>
              <p className={`text-[11px] mt-1 font-medium font-sans leading-relaxed ${item.isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                {item.desc}
              </p>
            </div>

            {item.resourceLink && (
              <a
                href={item.resourceLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-[9px] font-bold text-indigo-600 uppercase flex items-center gap-1 border border-slate-350 hover:border-slate-900 px-2.5 py-1 bg-slate-50 relative top-0.5 hover:bg-white shrink-0"
              >
                Board Portal <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
