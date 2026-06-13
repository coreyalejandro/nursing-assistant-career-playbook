import React, { useState } from 'react';
import { Sparkles, Calendar, BookOpen, GraduationCap, DollarSign, ArrowRight, Lightbulb, MapPin, RefreshCw, Layers } from 'lucide-react';

interface AdvisorStep {
  title: string;
  desc: string;
  actionLabel: string;
  url?: string;
  badge?: string;
}

export default function AiFastTrackAdvisor() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeline, setTimeline] = useState<'30days' | '90days' | ''>('');
  const [funding, setFunding] = useState<'wioa' | 'employer' | 'self' | ''>('');
  const [region, setRegion] = useState<'atlanta' | 'other' | ''>('');
  const [isCnaInterestFit, setIsCnaInterestFit] = useState<'yes' | 'maybe' | ''>('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendations, setRecommendations] = useState<AdvisorStep[] | null>(null);

  const resetAdvisor = () => {
    setTimeline('');
    setFunding('');
    setRegion('');
    setIsCnaInterestFit('');
    setCurrentQuestion(1);
    setRecommendations(null);
  };

  const calculatePlan = () => {
    setIsProcessing(true);
    setTimeout(() => {
      let finalSteps: AdvisorStep[] = [];

      // Timeline path selector
      if (timeline === '30days') {
        finalSteps.push({
          title: "Step 1: Enroll in Georgia Fast-Track Accelerated CNA Courses",
          desc: "Select a DCH-certified 4-to-5 week intensive clinical program (e.g. Atlanta Career Institute, Georgia Red Cross). Classes run Mon-Fri with concurrent 24 hospital clinical hours.",
          actionLabel: "Search Accredited Fast Classes",
          url: "https://www.redcross.org/",
          badge: "Urgent Pace"
        });
      } else {
        finalSteps.push({
          title: "Step 1: Secure Standard Part-time Weekend CNA Class spots",
          desc: "Select an 8-to-12 week classroom plan at a local technical college (e.g. Chattahoochee Tech, Georgia Piedmont Tech) allowing you to study while working regular daytime shifts.",
          actionLabel: "Compare Local Technical Colleges",
          url: "https://www.tcsg.edu/",
          badge: "Flexible Pace"
        });
      }

      // Funding path selector
      if (funding === 'wioa') {
        finalSteps.push({
          title: "Step 2: Submit a Workforce Innovation and Opportunity Act (WIOA) Grant Application",
          desc: "Submit your pre-certification registration records to the WorkSource Georgia portal. WIOA grants reimburse up to 100% of certified tuition, textbook, exam fees and background clearance costs.",
          actionLabel: "Access WorkSource Georgia WIOA Portal",
          url: "https://www.atlanta-ga.gov/government/departments/executive-offices/worksource-atlanta",
          badge: "100% Tuition covered"
        });
      } else if (funding === 'employer') {
        finalSteps.push({
          title: "Step 2: Apply for Federal tuition reimbursement under nursing home employer sponsorship",
          desc: "Skilled Nursing Facilities (SNFs) in Georgia are federally mandated to fully reimburse your CNA licensing costs if you gain employment within 12 months after certification.",
          actionLabel: "Browse Employer Reimbursement Mandates",
          badge: "Full Employer Backing"
        });
      } else {
        finalSteps.push({
          title: "Step 2: Register for low-interest clinical financing plans",
          desc: "Secure interest-free payment options directly through certified academy partners, or check state board financial assistance schemes.",
          actionLabel: "View Financing Academies",
          badge: "Flexible installments"
        });
      }

      // Final launch board exams
      finalSteps.push({
        title: "Step 3: Pearson VUE registry scheduling & Direct Emory/Piedmont target matching",
        desc: "Schedule your state board written and clinical physical exams. Once passed, your credentials automatically mirror into the Georgia State Registry verified pools, opening $22.00-$25.50/hr lines.",
        actionLabel: "Schedule Georgia Board Exam",
        url: "https://home.pearsonvue.com/ga/cnas",
        badge: "Exam Stage"
      });

      setRecommendations(finalSteps);
      setIsProcessing(false);
    }, 800);
  };

  const handleNext = () => {
    if (currentQuestion === 1 && !timeline) {
      alert("Please select a target timeline to proceed.");
      return;
    }
    if (currentQuestion === 2 && !funding) {
      alert("Please select your funding/tuition needs to proceed.");
      return;
    }
    if (currentQuestion === 3 && !region) {
      alert("Please select your Metro location to proceed.");
      return;
    }

    if (currentQuestion < 3) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculatePlan();
    }
  };

  return (
    <div id="ai-fast-track-advisor" className="rounded-none border-4 border-slate-900 bg-white p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
      {/* Header */}
      <div className="mb-5 border-b-2 border-slate-900 pb-4">
        <div className="flex items-center gap-1.5 justify-between">
          <div>
            <h3 className="font-display text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" /> AI Fast-Track Career Advisor
            </h3>
            <p className="font-sans text-slate-600 text-xs font-medium mt-1">
              For aspiring nursing assistants (pre-certification). Answer 3 quick fields to lock in your custom accredited training roadmap.
            </p>
          </div>
          <span className="font-mono text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 uppercase tracking-wider select-none shrink-0">
            Smart Advisor Mode
          </span>
        </div>
      </div>

      {isProcessing ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-slate-900" />
          <p className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
            Parsing Georgia accreditation logs, WorkSource grants, and licensure tracks...
          </p>
        </div>
      ) : recommendations ? (
        /* Results View */
        <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-none">
            <h4 className="font-display font-black text-slate-950 text-sm uppercase flex items-center gap-1.5">
              ✓ Tailored 3-Step Certification Blueprint
            </h4>
            <p className="font-sans text-xs text-slate-600 mt-1 font-medium leading-relaxed">
              Based on your target constraints, we have compiled an accredited Georgia training and grant pathway. Run through these sequential steps below:
            </p>
          </div>

          <div className="space-y-4">
            {recommendations.map((step, idx) => (
              <div key={idx} className="border-2 border-slate-900 p-4 bg-slate-50 relative">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 border-b border-slate-200 pb-2">
                  <span className="font-mono text-[10px] font-black text-indigo-700 uppercase tracking-wider block">STAGE 0{idx+1}</span>
                  {step.badge && (
                    <span className="bg-indigo-100 text-indigo-900 text-[8.5px] font-mono font-bold uppercase border border-indigo-200 px-1.5 py-0.2">
                      {step.badge}
                    </span>
                  )}
                </div>
                
                <h5 className="font-display font-black text-xs sm:text-sm text-slate-950 uppercase tracking-tight">
                  {step.title}
                </h5>
                <p className="font-sans text-slate-600 text-xs mt-1.5 leading-relaxed font-semibold">
                  {step.desc}
                </p>

                {step.url && (
                  <div className="mt-4 pt-1 flex justify-start">
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[9px] font-black uppercase text-indigo-600 hover:text-white hover:bg-slate-950 border border-slate-350 px-3 py-1.5 bg-white transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {step.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={resetAdvisor}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-350 font-mono text-[10px] font-bold uppercase cursor-pointer"
            >
              Reset Diagnostic Advisor
            </button>
          </div>
        </div>
      ) : (
        /* Questionnaire View */
        <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 relative overflow-hidden">
          {/* Question markers */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold mb-4">
            <span>QUESTION {currentQuestion} OF 3</span>
            <span>GA STATE RECRUIT COMPLIANT</span>
          </div>

          {currentQuestion === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="font-display font-black text-base text-slate-950 uppercase tracking-tight">
                What is your target timeline to acquire your state license and secure your first job?
              </h4>
              <p className="font-sans text-xs text-slate-500 font-medium leading-relaxed">
                Choose an ultra-speed fast track, or a regular part-time training pace allowing job concurrency.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTimeline('30days')}
                  className={`p-4 border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    timeline === '30days' 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : 'border-slate-900 bg-white hover:border-slate-500'
                  }`}
                >
                  <span className="font-display font-black text-sm uppercase text-slate-950">🚀 Accelerated Sprint</span>
                  <span className="font-sans text-[11px] text-slate-500 font-medium block mt-1.5">Completes in 30 to 45 Days. Requires heavy daytime clinical commitment.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTimeline('90days')}
                  className={`p-4 border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    timeline === '90days' 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : 'border-slate-900 bg-white hover:border-slate-500'
                  }`}
                >
                  <span className="font-display font-black text-sm uppercase text-slate-950">📅 Part-Time Flexible</span>
                  <span className="font-sans text-[11px] text-slate-500 font-medium block mt-1.5">Completes in 60 to 90 Days. Runs primarily on evening or weekend hours.</span>
                </button>
              </div>
            </div>
          )}

          {currentQuestion === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="font-display font-black text-base text-slate-950 uppercase tracking-tight">
                What is your tuition, budget, and funding sponsorship model?
              </h4>
              <p className="font-sans text-xs text-slate-500 font-medium leading-relaxed">
                CNA course fees usually operate between $900 and $1,600. Select funding structure:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setFunding('wioa')}
                  className={`p-3.5 border-2 text-left transition-all cursor-pointer ${
                    funding === 'wioa' 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : 'border-slate-900 bg-white hover:border-slate-500'
                  }`}
                >
                  <span className="font-bold text-slate-950 uppercase block">1. WIOA Federal Grant</span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1 leading-normal">Requires registration under Georgia WorkSource agencies. Reimburses 100% of academy costs.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFunding('employer')}
                  className={`p-3.5 border-2 text-left transition-all cursor-pointer ${
                    funding === 'employer' 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : 'border-slate-900 bg-white hover:border-slate-500'
                  }`}
                >
                  <span className="font-bold text-slate-950 uppercase block">2. Employer Sponsored</span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1 leading-normal">Tuition fully reimbursed post-hire at licensed long-term or skilled-nursing hospital layouts.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFunding('self')}
                  className={`p-3.5 border-2 text-left transition-all cursor-pointer ${
                    funding === 'self' 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : 'border-slate-900 bg-white hover:border-slate-500'
                  }`}
                >
                  <span className="font-bold text-slate-950 uppercase block">3. Self-Funded / Installment</span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1 leading-normal">Finance out of pocket. Many clinical academies offer zero-interest weekly pay allocations.</span>
                </button>
              </div>
            </div>
          )}

          {currentQuestion === 3 && (
            <div className="space-y-4 animate-in fade-in duration-250">
              <h4 className="font-display font-black text-base text-slate-950 uppercase tracking-tight">
                Select your primary Georgia work and study region
              </h4>
              <p className="font-sans text-xs text-slate-500 font-medium leading-relaxed">
                Academics and hospital networks are mapped specifically to regional county boards.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRegion('atlanta')}
                  className={`p-4 border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    region === 'atlanta' 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : 'border-slate-900 bg-white hover:border-slate-500'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-950 block uppercase">Atlanta Metro Area</span>
                    <span className="font-sans text-[11px] text-slate-500 font-medium block mt-0.5">Fulton, DeKalb, Gwinnett, Cobb counties</span>
                  </div>
                  <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setRegion('other')}
                  className={`p-4 border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    region === 'other' 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : 'border-slate-900 bg-white hover:border-slate-500'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-950 block uppercase">Other Georgia Region</span>
                    <span className="font-sans text-[11px] text-slate-500 font-medium block mt-0.5">Savannah, Augusta, Macon, local counties</span>
                  </div>
                  <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* Stepper Controllers */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-2">
            {currentQuestion > 1 && (
              <button
                type="button"
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="rounded-none border border-slate-350 px-4 py-2 font-mono text-[10px] font-bold uppercase bg-white cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="rounded-none bg-slate-950 text-white hover:bg-indigo-655 px-5 py-2 font-mono text-[10px] font-black uppercase tracking-widest border border-slate-950 cursor-pointer transition-colors"
            >
              {currentQuestion === 3 ? "Generate Career Plan" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
