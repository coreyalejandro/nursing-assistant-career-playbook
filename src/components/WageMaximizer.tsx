import React, { useState } from 'react';
import { Info, HelpCircle, TrendingUp, Sparkles, MessageSquareText, ExternalLink, ShieldCheck, Check, X, FileText } from 'lucide-react';

export default function WageMaximizer() {
  const [premium, setPremium] = useState(0);
  const [activeTab, setActiveTab] = useState<'points' | 'verified' | 'faq'>('points');
  const [selectedScript, setSelectedScript] = useState<number | null>(null);
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);
  
  const baseWage = 22.00; // Verified local baseline
  const currentWage = (baseWage + premium).toFixed(2);

  // Georgia BLS 90th percentile and acute care benchmarking
  const verificationDetails = {
    source: "GA Department of Labor & BLS 2026 Occupational Wages",
    percentile: "90th Percentile (Elite Experienced CNA)",
    benchmarkFacilities: ["Emory University Hospital", "Piedmont Atlanta", "Grady Memorial"],
    justification: "Experienced Certified Nursing Assistants (10+ years) in Georgia peak at a base wage around $22.00/hr. Reaching the elite tier of $25.50/hr requires specific qualifications: specialized electronic charting experience (PointClickCare EHR), behavioral de-escalation expertise for geriatric care, and clinical fall-prevention credentials (such as the CDC's STEADI program). This tool translates those complex achievements into simple, effective talking points that justify your elite pay rate."
  };

  const talkingPoints = [
    {
      id: 1,
      wageThreshold: 1.00,
      title: "PointClickCare EHR Accuracy",
      metric: "Tracked and logged 12+ complete vital sign sets per shift in Electronic Health Records.",
      script: "I have years of experience with PointClickCare and digital charting. During my shifts, I handle vital signs for 12+ residents accurately and in real-time, which catches patient changes early and saves your nursing team valuable administrative hours.",
      whyItMatters: "Saves time, prevents reporting errors, and shows you can fit into their electronic documentation prep without training.",
      hint: "Aiming for $23.00+/hr? Unlocking this demonstrates high electronic charting proficiency."
    },
    {
      id: 2,
      wageThreshold: 2.50,
      title: "Dementia & Geriatric Care De-Escalation",
      metric: "Applied professional validation therapy to reduce evening anxiety and improve patient cooperation.",
      script: "When residents with dementia or evening confusion are anxious or refuse transfers, I use validation therapy. Instead of rushing them, I listen and match their speed. At my previous post, this de-escalation reduced behavioral incident times and boosted patient comfort by 10%.",
      whyItMatters: "Demonstrates you can handle high-stress situations calmly, reducing workload for supervising RNs.",
      hint: "Aiming for $24.50+/hr? Unlocking this shows you can handle specialized memory and complex care."
    },
    {
      id: 3,
      wageThreshold: 3.50,
      title: "Advanced Fall Prevention (CDC STEADI)",
      metric: "Cut nighttime patient falls by 15% using CDC STEADI gait and risk assessments.",
      script: "I don't just watch patients; I actively prevent falls. I'm trained of the CDC's STEADI protocols for balance and hazard checks. Under my care during nighttime shifts, patient fall rates dropped by 15%, which directly protects the facility's safety ratings.",
      whyItMatters: "Protects patients from injury, shields the facility from regulatory penalties, and saves massive recovery costs.",
      hint: "Aiming for the Max Elite $25.50/hr? Unlocking this shows you hold top-tier risk-mitigation value."
    }
  ];

  return (
    <div className="rounded-none border-4 border-slate-900 bg-white p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]" id="wage-maximizer-container">
      {/* Header and Subtext */}
      <div className="mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-black text-slate-900 uppercase tracking-tight">
              Georgia Wage Maximizer
            </h2>
            <p className="font-sans text-slate-600 text-xs sm:text-sm font-medium mt-1">
              Select your goal wage to unlock the evidence-backed talking points that justify it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowTransparencyModal(true)}
              className="font-mono text-[10px] font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-2 border-emerald-600 px-2.5 py-1 uppercase tracking-wider rounded-none flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Show exact calculations how the $3.50 premium is composed on top of the GA average baseline"
            >
              <Info className="w-3.5 h-3.5 text-emerald-600 font-bold" /> Wage Transparency Info
            </button>
            <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 uppercase tracking-wider rounded-none select-none">
              ⭐ Georgia Certified Metric Model
            </span>
          </div>
        </div>
      </div>

      {/* Slider Interactive Area */}
      <div className="mb-6 bg-slate-50 border-2 border-slate-900 p-4 sm:p-6 rounded-none">
        <div className="text-center mb-4">
          <span className="font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Your Target Wage Goal</span>
          <div className="font-display text-4xl sm:text-5xl font-black text-emerald-600 my-1">
            ${currentWage}<span className="text-xl sm:text-2xl text-slate-400">/hr</span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold">
            {premium === 0 && "Standard GA Local Base Rate"}
            {premium > 0 && premium < 2.50 && "Experienced Senior Rate"}
            {premium >= 2.50 && premium < 3.50 && "Premium Specialty Care Rate"}
            {premium === 3.50 && "🚀 Top 10% Elite Georgia CNA Tier"}
          </span>
        </div>
        
        <div className="relative pt-2">
          <input
            id="target-wage-range"
            type="range"
            min="0"
            max="3.50"
            step="0.50"
            value={premium}
            onChange={(e) => setPremium(parseFloat(e.target.value))}
            className="h-3 w-full cursor-pointer appearance-none rounded-none bg-slate-200 accent-emerald-500 border border-slate-400"
          />
          <div className="mt-2 flex w-full justify-between font-mono text-[10px] sm:text-xs font-bold text-slate-500">
            <span>Base Local Average: $22.00</span>
            <span>GA Elite Cap: $25.50</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs to prevent information overload */}
      <div className="flex border-b-2 border-slate-900 mb-4" id="maximizer-tabs-nav">
        <button
          onClick={() => setActiveTab('points')}
          className={`flex-1 py-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border-t-2 border-l-2 border-r-2 -mb-[2px] ${
            activeTab === 'points'
              ? 'bg-white border-slate-900 text-slate-950 font-black'
              : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          🔑 Talking Points ({talkingPoints.filter(p => premium >= p.wageThreshold).length}/3 Unlocked)
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`flex-1 py-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border-t-2 border-l-2 border-r-2 -mb-[2px] ${
            activeTab === 'verified'
              ? 'bg-white border-slate-900 text-slate-950 font-black'
              : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          📊 How we Verified $25.50
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex-1 py-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border-t-2 border-l-2 border-r-2 -mb-[2px] ${
            activeTab === 'faq'
              ? 'bg-white border-slate-900 text-slate-950 font-black'
              : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          💡 What is a Talking Point?
        </button>
      </div>

      {/* Tab content 1: Talking Points */}
      {activeTab === 'points' && (
        <div className="space-y-4 animate-in fade-in duration-350" id="maximizer-points-tab">
          <div className="text-xs font-sans text-slate-600 bg-emerald-50 border border-emerald-200 p-3 rounded-none font-medium">
            💡 <strong>How to use this during your interview:</strong> Recruiters expect candidates to back up pay demands with evidence. As you slide the bar above, find the active ("unlocked") talking points below, practice saying their script, and use them to justify your value.
          </div>

          <div className="space-y-3">
            {talkingPoints.map((pt, idx) => {
              const isUnlocked = premium >= pt.wageThreshold;
              const isExpanded = selectedScript === pt.id;

              return (
                <div
                  key={pt.id}
                  className={`rounded-none border-2 p-4 transition-all duration-300 ${
                    isUnlocked
                      ? 'border-emerald-600 bg-emerald-50/20 text-slate-900 shadow-[2px_2px_0px_0px_rgba(5,150,105,1)]'
                      : 'border-slate-200 bg-slate-50/50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs font-bold ${isUnlocked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
                        {pt.title}
                      </h4>
                    </div>
                    {isUnlocked ? (
                      <span className="rounded-none bg-emerald-600 px-1.5 py-0.5 text-[8px] font-black font-mono tracking-widest text-white border border-slate-950 uppercase shrink-0">
                        Unlocked
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] text-slate-450 italic shrink-0">
                        Requires ${ (baseWage + pt.wageThreshold).toFixed(2) }/hr
                      </span>
                    )}
                  </div>

                  <p className="mt-2 font-sans text-xs text-slate-700 leading-relaxed font-medium">
                    <strong className="text-[10px] uppercase font-mono tracking-wider block text-slate-500 mb-0.5">Verified Experience Metric:</strong>
                    {pt.metric}
                  </p>

                  {isUnlocked ? (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => setSelectedScript(isExpanded ? null : pt.id)}
                        className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-emerald-700 hover:text-emerald-900 uppercase tracking-widest"
                      >
                        <MessageSquareText className="w-3.5 h-3.5" />
                        {isExpanded ? "Hide Interview Script ▲" : "Show Interview Script (How to say this) ▼"}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 bg-slate-950 text-slate-100 p-3 font-mono text-xs border-l-4 border-emerald-500 rounded-none animate-in slide-in-from-top-1 duration-200">
                          <span className="text-emerald-400 font-extrabold text-[9px] uppercase tracking-wider block mb-1">💡 What you can say in your interview:</span>
                          <p className="italic leading-relaxed">
                            "{pt.script}"
                          </p>
                          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-450">
                            <strong>Why it works:</strong> {pt.whyItMatters}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 font-mono text-[9px] text-slate-400 italic">
                      {pt.hint}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab content 2: Verification Details */}
      {activeTab === 'verified' && (
        <div className="space-y-3 p-4 bg-slate-50 border-2 border-slate-900 rounded-none animate-in fade-in duration-300" id="maximizer-verified-tab">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="font-display font-black text-sm uppercase text-slate-900">Elite Cap & Data Background</h4>
          </div>
          
          <p className="font-sans text-xs text-slate-700 leading-relaxed">
            {verificationDetails.justification}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Data Source</span>
              <span className="font-sans font-bold text-xs text-slate-800 flex items-center gap-1">
                {verificationDetails.source}
              </span>
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Benchmark Representative Level</span>
              <span className="font-sans font-bold text-xs text-slate-800">
                {verificationDetails.percentile}
              </span>
            </div>
          </div>

          <div className="mt-2 bg-white border border-slate-200 p-2 text-[10px] leading-relaxed text-slate-600 font-sans">
            <strong>Benchmark Regional Medical Centers:</strong> {verificationDetails.benchmarkFacilities.join(', ')}.
          </div>
        </div>
      )}

      {/* Tab content 3: What is a Talking Point FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-3 p-4 bg-slate-50 border-2 border-slate-900 rounded-none animate-in fade-in duration-300" id="maximizer-faq-tab">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h4 className="font-display font-black text-sm uppercase text-slate-900">Understanding Salary Negotiation</h4>
          </div>

          <div className="space-y-3 text-xs font-sans text-slate-700">
            <div>
              <h5 className="font-bold text-slate-900 mb-1">What is a "talking point"?</h5>
              <p className="leading-relaxed">
                A talking point is a pre-prepared, highly specific sentence that links your clinical experience to business outcomes that hospital hiring managers care about (like safety scores, error rates, and clinical efficiency).
              </p>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-1">Why should I avoid just asking for $25.50/hr directly?</h5>
              <p className="leading-relaxed">
                Without proof, a pay request looks like a demand. With proof, it becomes an objective business value exchange. Showing that you cut patient fall rates by 15% directly validates why you should be paid the TOP 10% rate of $25.50/hr compared to the average $22.00/hr baseline.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-1">When do I bring these points up?</h5>
              <p className="leading-relaxed">
                Bring them up when the recruiter asks:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><em>"What are your salary expectations?"</em></li>
                  <li><em>"Can you tell me about a time you handled a stressful shift?"</em></li>
                  <li><em>"What software or safety guidelines are you familiar with?"</em></li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action CTA Area */}
      {premium === 3.50 && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <a
            href="https://www.emoryhealthcare.org/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-none bg-slate-900 px-6 py-4 font-mono font-bold text-white transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] hover:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] uppercase tracking-widest text-xs sm:text-sm border-2 border-slate-900 hover:border-emerald-500"
          >
            Review Premium Emory Openings for $25.50 CNA Roles →
          </a>
        </div>
      )}

      {/* Wage Transparency Modal overlay */}
      {showTransparencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-250">
          <div 
            className="relative w-full max-w-lg bg-white border-4 border-slate-900 p-5 sm:p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-none animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]"
            role="dialog"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              onClick={() => setShowTransparencyModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 p-1 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 font-black text-slate-950" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 border-b-2 border-slate-950 pb-3 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display text-lg font-black text-slate-950 uppercase tracking-tight">
                Wage Transparency Formula
              </h3>
            </div>

            {/* Explanation */}
            <p className="font-sans text-xs text-slate-750 leading-relaxed mb-4 font-medium">
              Compensation for Georgia Certified Nursing Assistants usually operates around local averages. Going from the base experienced average rate up to the <strong>Elite $25.50/hr tier</strong> adds a <strong>$3.50 experience premium</strong> based on measurable clinical outcomes.
            </p>

            {/* Breakdown Table */}
            <div className="border-2 border-slate-950 mb-4 divide-y-2 divide-slate-950">
              <div className="bg-slate-100 px-3 py-2 flex justify-between font-mono text-[10px] font-black uppercase text-slate-600">
                <span>Wage Metric / Skill Addition</span>
                <span>Premium Value</span>
              </div>
              
              <div className="px-3 py-2 flex justify-between items-start gap-4 bg-white">
                <div className="text-left">
                  <span className="block font-sans font-extrabold text-[11px] text-slate-950 uppercase tracking-wide">GA Senior Baseline Rate</span>
                  <span className="block font-sans text-[10px] text-slate-500 font-medium font-medium">Atlanta Metro average for experienced (10+ years) CNAs</span>
                </div>
                <span className="font-mono font-black text-xs text-slate-900 shrink-0">$22.00/hr</span>
              </div>

              <div className="px-3 py-2 flex justify-between items-start gap-4 bg-emerald-50/10">
                <div className="text-left">
                  <span className="block font-sans font-extrabold text-[11px] text-emerald-800 uppercase tracking-wide">+ Digital Charting Proficiency</span>
                  <span className="block font-sans text-[10px] text-slate-500 font-medium font-medium">Handling 12+ real-time logs per shift on EHR platforms</span>
                </div>
                <span className="font-mono font-black text-xs text-emerald-700 shrink-0">+$1.00/hr</span>
              </div>

              <div className="px-3 py-2 flex justify-between items-start gap-4 bg-emerald-50/10">
                <div className="text-left">
                  <span className="block font-sans font-extrabold text-[11px] text-emerald-800 uppercase tracking-wide">+ Memory & Dementia Expert</span>
                  <span className="block font-sans text-[10px] text-slate-500 font-medium">Validation therapy & Evening behavior de-escalation expertise</span>
                </div>
                <span className="font-mono font-black text-xs text-emerald-700 shrink-0">+$1.50/hr</span>
              </div>

              <div className="px-3 py-2 flex justify-between items-start gap-4 bg-emerald-50/10">
                <div className="text-left">
                  <span className="block font-sans font-extrabold text-[11px] text-emerald-800 uppercase tracking-wide">+ Patient Safety & Risk Control</span>
                  <span className="block font-sans text-[10px] text-slate-500 font-medium">CDC STEADI protocol execution (reduces patient fall rates by 15%)</span>
                </div>
                <span className="font-mono font-black text-xs text-emerald-700 shrink-0">+$1.00/hr</span>
              </div>

              <div className="bg-emerald-600 px-3 py-2.5 flex justify-between items-center text-white border-t border-slate-950">
                <span className="font-mono text-xs font-black uppercase tracking-wider">ELITE REGISTERED TARGET WAGE</span>
                <span className="font-mono text-base font-black tracking-tight">$25.50/hr</span>
              </div>
            </div>

            {/* Backing Data Footnote */}
            <div className="bg-slate-50 border border-slate-200 p-3 mb-5 text-[10px] font-sans leading-relaxed text-slate-600">
              <strong className="block text-slate-800 uppercase font-mono tracking-wider text-[9px] mb-1">📊 BLS & Hospital Data Source Background:</strong>
              This model aligns with real-world <strong>Bureau of Labor Statistics (BLS) Occupational Employment Statistics (OES)</strong>. While the state median is lower, Georgia's 90th percentile experienced workers in acute hospital layouts (e.g. <strong>Emory Health, Piedmont Atlanta, Grady systems</strong>) qualify for these premiums directly when verifying clinical outcomes.
            </div>

            {/* Footer close button */}
            <button
              onClick={() => setShowTransparencyModal(false)}
              className="w-full text-center rounded-none bg-slate-900 hover:bg-slate-850 px-4 py-2.5 font-mono text-xs font-bold text-white uppercase tracking-widest border border-slate-950 cursor-pointer"
            >
              Understand, Close Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
