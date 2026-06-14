import React, { useState } from "react";
import { AlertCircle, ArrowRight, BookOpen, Check, Play, Volume2, VolumeX, Landmark, Award, HelpCircle, GraduationCap, ChevronDown, ChevronUp, Sparkles, Filter, RefreshCw, Layers } from "lucide-react";

// List of all 50 states + DC for state roadmap selector
const STATE_INFO_LIST = [
  { code: "GA", name: "Georgia", hours: 85, vendor: "Credentia", examUrl: "https://credentia.com/test-takers/georgia" },
  { code: "CA", name: "California", hours: 160, vendor: "Pearson VUE", examUrl: "https://home.pearsonvue.com/ca/cnas" },
  { code: "TX", name: "Texas", hours: 100, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/tx" },
  { code: "FL", name: "Florida", hours: 120, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/fl" },
  { code: "NY", name: "New York", hours: 100, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/ny" },
  { code: "AL", name: "Alabama", hours: 75, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/al" },
  { code: "AK", name: "Alaska", hours: 140, vendor: "Credentia", examUrl: "https://credentia.com/test-takers/ak" },
  { code: "AZ", name: "Arizona", hours: 120, vendor: "D&S Headmaster", examUrl: "https://az.tmutest.com" },
  { code: "AR", name: "Arkansas", hours: 90, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/ar" },
  { code: "CO", name: "Colorado", hours: 75, vendor: "Pearson VUE", examUrl: "https://home.pearsonvue.com/co/cnas" },
  { code: "CT", name: "Connecticut", hours: 100, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/ct" },
  { code: "DE", name: "Delaware", hours: 150, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/de" },
  { code: "DC", name: "District of Columbia", hours: 120, vendor: "Credentia", examUrl: "https://credentia.com/test-takers/dc" },
  { code: "HI", name: "Hawaii", hours: 100, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/hi" },
  { code: "ID", name: "Idaho", hours: 120, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/id" },
  { code: "IL", name: "Illinois", hours: 120, vendor: "Southern Illinois University", examUrl: "https://www.nurseaidetesting.com" },
  { code: "IN", name: "Indiana", hours: 105, vendor: "Ivy Tech", examUrl: "https://www.ivytech.edu/cna" },
  { code: "IA", name: "Iowa", hours: 75, vendor: "Direct State Registry", examUrl: "https://dia-hhs.iowa.gov" },
  { code: "KS", name: "Kansas", hours: 90, vendor: "KDADS", examUrl: "https://kdads.ks.gov" },
  { code: "KY", name: "Kentucky", hours: 75, vendor: "KCTCS", examUrl: "https://kctcs.edu" },
  { code: "LA", name: "Louisiana", hours: 80, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/la" },
  { code: "ME", name: "Maine", hours: 180, vendor: "Maine State Registry", examUrl: "https://www.maine.gov" },
  { code: "MD", name: "Maryland", hours: 100, vendor: "Board of Nursing", examUrl: "https://mbon.maryland.gov" },
  { code: "MA", name: "Massachusetts", hours: 100, vendor: "D&S Headmaster", examUrl: "https://ma.tmutest.com" },
  { code: "MI", name: "Michigan", hours: 75, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/mi" },
  { code: "MN", name: "Minnesota", hours: 75, vendor: "Minnesota State Univ", examUrl: "https://www.minnstate.edu" },
  { code: "MS", name: "Mississippi", hours: 75, vendor: "Credentia", examUrl: "https://credentia.com/test-takers/ms" },
  { code: "MO", name: "Missouri", hours: 175, vendor: "DHSS", examUrl: "https://health.mo.gov" },
  { code: "MT", name: "Montana", hours: 75, vendor: "D&S Headmaster", examUrl: "https://mt.tmutest.com" },
  { code: "NE", name: "Nebraska", hours: 75, vendor: "DHHS Registry", examUrl: "https://dhhs.ne.gov" },
  { code: "NV", name: "Nevada", hours: 75, vendor: "Board of Nursing", examUrl: "https://nevadanursingboard.org" },
  { code: "NH", name: "New Hampshire", hours: 100, vendor: "LNA Registry", examUrl: "https://www.oplc.nh.gov" },
  { code: "NJ", name: "New Jersey", hours: 90, vendor: "PSI Testing", examUrl: "https://www.psiexams.com" },
  { code: "NM", name: "New Mexico", hours: 75, vendor: "Prometric", examUrl: "https://www.prometric.com/nurseaide/nm" },
  { code: "NC", name: "North Carolina", hours: 75, vendor: "Credentia", examUrl: "https://credentia.com/test-takers/nc" },
  { code: "ND", name: "North Dakota", hours: 75, vendor: "D&S Headmaster", examUrl: "https://nd.tmutest.com" },
  { code: "OH", name: "Ohio", hours: 75, vendor: "D&S Headmaster", examUrl: "https://oh.tmutest.com" },
  { code: "OK", name: "Oklahoma", hours: 120, vendor: "Health Department Registry", examUrl: "https://oklahoma.gov" },
  { code: "OR", name: "Oregon", hours: 150, vendor: "OSBN Board", examUrl: "https://www.oregon.gov/osbn" },
  { code: "PA", name: "Pennsylvania", hours: 80, vendor: "Credentia", examUrl: "https://credentia.com/test-takers/pa" },
  { code: "RI", name: "Rhode Island", hours: 100, vendor: "Board of Health", examUrl: "https://health.ri.gov" },
  { code: "SC", name: "South Carolina", hours: 80, vendor: "Credentia", examUrl: "https://credentia.com/test-takers/sc" },
  { code: "SD", name: "South Dakota", hours: 75, vendor: "D&S Headmaster", examUrl: "https://sd.tmutest.com" },
  { code: "TN", name: "Tennessee", hours: 75, vendor: "D&S Headmaster", examUrl: "https://tn.tmutest.com" },
  { code: "UT", name: "Utah", hours: 80, vendor: "UNAR Board", examUrl: "https://www.utahbase.org" },
  { code: "VT", name: "Vermont", hours: 80, vendor: "Board of Nursing", examUrl: "https://sos.vermont.gov" },
  { code: "VA", name: "Virginia", hours: 120, vendor: "Credentia", examUrl: "https://credentia.com/test-takers/va" },
  { code: "WA", name: "Washington", hours: 85, vendor: "DOH Registry", examUrl: "https://www.doh.wa.gov" },
  { code: "WV", name: "West Virginia", hours: 120, vendor: "Professional Credential Services", examUrl: "https://www.pcshq.com" },
  { code: "WI", name: "Wisconsin", hours: 120, vendor: "D&S Headmaster", examUrl: "https://wi.tmutest.com" },
  { code: "WY", name: "Wyoming", hours: 75, vendor: "Board of Nursing", examUrl: "https://wsbn.wyo.gov" }
];

// Sample Program List
const PROGRAMS_DATABASE = [
  { id: "p1", name: "Atlanta Career Institute", location: "Atlanta, GA", rawCost: 1250, aidAmount: 400, wioaEligible: true, rating: "4.8" },
  { id: "p2", name: "Emory Allied Healthcare Program", location: "Decatur, GA", rawCost: 2100, aidAmount: 1100, wioaEligible: true, rating: "4.9" },
  { id: "p3", name: "Atlanta Red Cross Nursing Aide", location: "Marietta, GA", rawCost: 1600, aidAmount: 0, wioaEligible: false, rating: "4.6" },
  { id: "p4", name: "Georgia State Prep Academy", location: "Savannah, GA", rawCost: 1150, aidAmount: 250, wioaEligible: true, rating: "4.5" },
  { id: "p5", name: "Metro Augusta CNA Center", location: "Augusta, GA", rawCost: 950, aidAmount: 150, wioaEligible: true, rating: "4.3" }
];

// Shadow videos data
const SHADOW_CLIPS = [
  {
    id: "clip1",
    title: "In-facility Residents Vital Signs Log",
    desc: "First-person shadowing: Observe blood pressure cuff alignment, temperature probe verification, and PointClickCare charting protocols.",
    duration: "1:45",
    captions: [
      { time: "0:02", text: "[Narrator] First, sanitize your hands and greet Mr. Davis in Room 12." },
      { time: "0:15", text: "[Narrator] Ensure standard size blood pressure cuff is aligned 1-inch above the brachial pulse point." },
      { time: "0:45", text: "[Action] Verifying radial pulse frequency. Documenting 72 bpm in the bedside log." }
    ]
  },
  {
    id: "clip2",
    title: "Safe Patient Transfer with Gait Belt",
    desc: "Observe how to secure the waist gait belt properly, align your knees to support, and rotate safely to minimize patients' fall hazards.",
    duration: "2:10",
    captions: [
      { time: "0:05", text: "[Narrator] Inspect the patient's gait belt for any material wear or structural weakness." },
      { time: "0:25", text: "[Narrator] Apply secure buckle tight enough to pass only two finger widths." },
      { time: "1:15", text: "[Action] Bending knees, keeping back posture completely straight. Moving patient safely." }
    ]
  },
  {
    id: "clip3",
    title: "Isolation Gown & Mask PPE Protocols",
    desc: "Step-by-step CDC standard PPE sequence for working CNAs on highly sensitive infection control floors.",
    duration: "1:15",
    captions: [
      { time: "0:04", text: "[Narrator] Don clean sterile yellow gown first. Secure neck boundaries completely." },
      { time: "0:30", text: "[Narrator] Adjust surgical mask bridge securely over nose and pull bottom level under chin." },
      { time: "1:05", text: "[Action] Pulling sterile exam gloves over the knit sleeves of your isolation apparel." }
    ]
  }
];

export default function AspiringPortal() {
  // Roadmap States
  const [selectedState, setSelectedState] = useState(STATE_INFO_LIST[0]);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [showConfirmChange, setShowConfirmChange] = useState(false);
  const [pendingState, setPendingState] = useState<typeof STATE_INFO_LIST[0] | null>(null);
  const [showFundingList, setShowFundingList] = useState(false);

  // Filters State
  const [onlyAid, setOnlyAid] = useState(false);
  const [sortByLowest, setSortByLowest] = useState(false);

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any | null>(null);

  // Video State
  const [activeClip, setActiveClip] = useState(SHADOW_CLIPS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeCaption, setActiveCaption] = useState(SHADOW_CLIPS[0].captions[0].text);

  // Roadmap Step list helper
  const roadmapSteps = [
    { id: "step1", text: `Verify Approved Hours: Complete standard ${selectedState.hours} approved training hours at an accredited school.` },
    { id: "step2", text: "Registry Identification Check: Pass state fingerprint background verification check." },
    { id: "step3", text: "Validate Skills Modules: Accumulate clinical facility rotation hours logs signed off by registered supervisor." },
    { id: "step4", text: `Schedule Licensing Exam: Register for your licensing computer theory and skills test via ${selectedState.vendor}.` },
    { id: "step5", text: `Registry Credential Listing: Post board approval, find your name on the verified State Nurse Aide Registry list.` }
  ];

  // Progress calculator
  const checkedCount = Object.keys(completedSteps).filter(k => completedSteps[k]).length;
  const progressPercent = Math.round((checkedCount / roadmapSteps.length) * 100);

  const handleStateChangeRequest = (stateCode: string) => {
    const target = STATE_INFO_LIST.find(s => s.code === stateCode) || STATE_INFO_LIST[0];
    const hasProgress = Object.keys(completedSteps).some(k => completedSteps[k]);

    if (hasProgress) {
      setPendingState(target);
      setShowConfirmChange(true);
    } else {
      setSelectedState(target);
    }
  };

  const confirmStateChange = () => {
    if (pendingState) {
      setSelectedState(pendingState);
      setCompletedSteps({});
    }
    setShowConfirmChange(false);
    setPendingState(null);
  };

  // Shadow video playback simulator
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate captions sequence
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < activeClip.captions.length - 1) {
          idx++;
          setActiveCaption(activeClip.captions[idx].text);
        } else {
          clearInterval(interval);
        }
      }, 3500);
    }
  };

  const handleClipSelect = (clip: typeof SHADOW_CLIPS[0]) => {
    setActiveClip(clip);
    setIsPlaying(false);
    setActiveCaption(clip.captions[0].text);
  };

  // Fit Quiz Questions
  const QUIZ_QUESTIONS = [
    {
      q: "Have you ever shadowed or spent face-to-face hours with geriatric patients, disabled individuals, or hospital care settings?",
      options: [
        { text: "Yes, I have active clinical or volunteer hours", score: 20 },
        { text: "Minimal visual exposure, mostly shadowed or viewed videos online", score: 12 },
        { text: "No primary exposure, but am extremely keen to learn nursing flows", score: 5 }
      ]
    },
    {
      q: "CNA/clinical shifts require high-stamina physical routines (transferring 100+ lb patients, standing for 8-12 hours, rapid alerts response). How comfortable are you with this?",
      options: [
        { text: "Very fit and comfortable with routine heavy mobility procedures", score: 20 },
        { text: "Somewhat comfortable, but prefer structured mechanical lifts", score: 12 },
        { text: "I highly prefer sedentary, administrative, or non-manual healthcare support", score: 0 }
      ]
    },
    {
      q: "How many hours of professional training are you willing to allocate next month?",
      options: [
        { text: "Full-time track: 30-40 hours weekly to finish rapidly in 4-6 weeks", score: 20 },
        { text: "Part-time scheduling: 10-20 hours weekly over 2-3 months", score: 15 },
        { text: "Strictly night/weekends remote hybrid study layouts", score: 10 }
      ]
    },
    {
      q: "Are you comfortable recording exact medication labeling, pulse/fluid charts, and standard clinical logs using online computer software?",
      options: [
        { text: "Highly proficient with digital software and exact data entries", score: 20 },
        { text: "Familiar with standard smartphone apps, though new to clinical records", score: 15 },
        { text: "I prefer standard paper log sheets and clinical binders", score: 5 }
      ]
    },
    {
      q: "When a complex patient expresses acute behavioral resistance, what is your first clinical action?",
      options: [
        { text: "De-escalate patiently with therapeutic verbal validation protocols", score: 20 },
        { text: "Briefly sound the nurses' unit alerts station to request assist support", score: 15 },
        { text: "Instruct the client strictly to follow medical requirements", score: 5 }
      ]
    }
  ];

  const handleAnswerSelect = (optIndex: number, score: number) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: score }));
  };

  const calculateFinalQuiz = async () => {
    setSubmittingQuiz(true);
    let total = 0;
    Object.keys(selectedAnswers).forEach(key => {
      total += selectedAnswers[Number(key)];
    });

    try {
      const response = await fetch("/api/quiz/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: total, answers: selectedAnswers, stateCode: selectedState.code })
      });
      const data = await response.json();
      if (data.success) {
        setQuizResult(data);
      } else {
        throw new Error();
      }
    } catch {
      // Robust client-side fallback if backend fails or offline
      let path: "full_speed" | "cautious" | "explore_other" = "cautious";
      if (total >= 70) path = "full_speed";
      else if (total < 40) path = "explore_other";

      const nearestFallback = {
        name: "Atlanta Career Healthcare Institute",
        url: "https://www.google.com/search?q=Atlanta+Career+Institute+CNA",
        location: "Atlanta Metro",
        estimatedCost: "$1,150",
        fundingAvailable: true
      };

      setQuizResult({
        success: true,
        readinessScore: total,
        path,
        nearestProgram: nearestFallback,
        planSteps: path === "full_speed"
          ? [
              `Enroll in Approved Program: Join ${nearestFallback.name} (${selectedState.hours} approved curriculum hours).`,
              `Accumulate Hours: Complete state background registry check and clinical labs.`,
              `Pass Cert Exams: Sit state ${selectedState.vendor} examination.`
            ]
          : path === "cautious"
          ? ["Sample shadowing clinics online.", "Attend healthcare career informational seminars."]
          : ["Explore Medical Representative/Reception pathways.", "Examine administrative medical records billing training."],
        examVendor: selectedState.vendor,
        examLink: selectedState.examUrl,
        fundingLinks: [
          { name: "My State WIOA Local Workforce Support", url: "https://www.dol.gov/agencies/eta/wioa" }
        ]
      });
    }
    setSubmittingQuiz(false);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setQuizResult(null);
    setQuizStarted(true);
  };

  // Programs selector
  const filteredPrograms = PROGRAMS_DATABASE.filter(p => !onlyAid || p.wioaEligible)
    .sort((a, b) => {
      if (sortByLowest) {
        const costA = a.rawCost - a.aidAmount;
        const costB = b.rawCost - b.aidAmount;
        return costA - costB;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* 1. STATE DISCOVERY SECTION */}
      <div className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4 mb-4">
          <div className="space-y-1">
            <h3 className="font-display font-black text-slate-950 text-base uppercase flex items-center gap-1.5">
              <Landmark className="w-5 h-5 text-indigo-650" /> State-Specific Licensure Engine
            </h3>
            <p className="font-sans text-slate-600 text-xs font-semibold">
              Select any US state to load active vendor scheduling, mandatory class hours, and verified funding pathways.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-black text-slate-450 uppercase uppercase">Select State:</span>
            <select
              value={selectedState.code}
              onChange={(e) => handleStateChangeRequest(e.target.value)}
              className="bg-white border-2 border-slate-900 p-1.5 font-mono text-[10px] font-black uppercase text-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            >
              {STATE_INFO_LIST.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State Roadmap Checkboxes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Checkbox columns */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between bg-slate-50 p-2 border border-slate-200">
              <span className="font-mono text-[10px] font-black text-indigo-800 uppercase">
                {selectedState.name} Licensure Roadmap ({selectedState.hours} Required Hours)
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-600">
                {progressPercent}% Complete
              </span>
            </div>

            {/* Simulated Progress bar */}
            <div className="w-full bg-slate-100 border border-slate-300 h-3 rounded-none overflow-hidden p-0.5">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Checkbox item cards */}
            <div className="space-y-2">
              {roadmapSteps.map((step) => {
                const isChecked = completedSteps[step.id] || false;
                return (
                  <label
                    key={step.id}
                    className={`flex items-start gap-3 p-3 border-2 transition-colors cursor-pointer rounded-none bg-white ${
                      isChecked
                        ? "border-emerald-500 bg-emerald-50/20"
                        : "border-slate-300 hover:border-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setCompletedSteps(prev => ({ ...prev, [step.id]: e.target.checked }));
                      }}
                      className="mt-0.5 rounded-none border-2 border-slate-950 text-indigo-700 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className={`font-sans text-xs font-semibold block leading-snug ${isChecked ? "text-slate-650" : "text-slate-900"}`}>
                        {step.text}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Right sidebar quick links / state details */}
          <div className="lg:col-span-4 bg-slate-50 border-2 border-slate-900 p-4 space-y-4">
            <div className="border-b border-slate-300 pb-2">
              <span className="font-mono text-[9px] font-black text-slate-500 uppercase block">Licensing Vendor</span>
              <span className="font-display font-black text-slate-950 uppercase text-sm block tracking-tight">
                {selectedState.vendor}
              </span>
              <a
                href={selectedState.examUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[9px] font-black uppercase text-indigo-700 flex items-center gap-1.5 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 px-2 py-1 mt-1.5 w-max"
              >
                Schedule & Prep Portal <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Dynamic state hours details */}
            <div className="space-y-1">
              <span className="font-mono text-[9px] font-black text-slate-500 uppercase block">Georgia Registry Match</span>
              <p className="font-sans text-xs font-semibold text-slate-700 leading-relaxed">
                You must pass the 2-part state exam consisting of {selectedState.code === "GA" ? "a 25-minute manual skills lab with 5 dynamic skills plus 75 multiple choice scenarios." : "state-regulated skills lab assessments plus computer-adaptive knowledge modules."}
              </p>
            </div>

            {/* Collapsible Funding Links */}
            <div>
              <button
                onClick={() => setShowFundingList(!showFundingList)}
                className="w-full font-mono text-[10px] font-black uppercase text-slate-950 bg-white border border-slate-400 p-2 flex items-center justify-between cursor-pointer"
              >
                <span>State Assistance Funding</span>
                {showFundingList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showFundingList && (
                <div className="border border-t-0 border-slate-400 bg-white p-3 space-y-2.5 animate-in slide-in-from-top-1 duration-155 text-[11px] font-sans">
                  <p className="font-semibold text-slate-600 leading-relaxed">
                    Under WIOA legislation, you may transition tuition completely for state nursing certificates using local workforce boards:
                  </p>
                  <div className="space-y-1">
                    {selectedState.fundingLinks.map((flink, idx) => (
                      <a
                        key={idx}
                        href={flink.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono font-black uppercase text-indigo-700 block hover:underline"
                      >
                        ✦ {flink.name} →
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* State loss warning Modal banner */}
        {showConfirmChange && (
          <div className="bg-amber-50 border-2 border-amber-600 p-3 mt-4 text-xs font-semibold text-slate-900 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-amber-700" />
              <span>
                Your state-specific training progress checks will be reset if you switch to {pendingState?.name}. Continue?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={confirmStateChange}
                className="bg-amber-600 hover:bg-amber-700 text-white font-mono text-[10px] font-bold uppercase px-3 py-1 cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => { setShowConfirmChange(false); setPendingState(null); }}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-mono text-[10px] font-bold uppercase px-3 py-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. PROGRAM FINDER & NET COST CALCULATOR */}
      <div id="cna-program-finder" className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1 border-b-2 border-slate-205 pb-3.5 mb-4">
          <h3 className="font-display font-black text-slate-950 uppercase text-base flex items-center gap-1.5">
            <GraduationCap className="w-5 h-5 text-indigo-650" /> State-Approved Net Tuition Finder
          </h3>
          <p className="font-sans text-slate-600 text-xs font-semibold">
            Evaluate exact program listings with realistic net cost calculations reflecting active financial aid offsets.
          </p>
        </div>

        {/* Toolbar parameters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 mb-4 border border-slate-300 text-xs font-mono">
          <label className="flex items-center gap-2 font-black cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAid}
              onChange={(e) => setOnlyAid(e.target.checked)}
              className="rounded-none border-2 border-slate-950 text-indigo-700 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
            />
            ONLY ACCREDITED FINANCIAL AID / WIOA GRANTS
          </label>

          <label className="flex items-center gap-2 font-black cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sortByLowest}
              onChange={(e) => setSortByLowest(e.target.checked)}
              className="rounded-none border-2 border-slate-950 text-indigo-700 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
            />
            SORT BY LOWEST NET TUITION COST
          </label>
        </div>

        {/* Grid Programs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((prog) => {
            const netCost = prog.rawCost - prog.aidAmount;
            return (
              <div key={prog.id} className="border-2 border-slate-900 bg-white p-4 space-y-3.5 flex flex-col justify-between shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-display font-black uppercase text-xs text-slate-950 leading-tight">
                      {prog.name}
                    </span>
                    <span className="font-mono text-[9px] font-black text-slate-550 border border-slate-200 bg-slate-50 px-1">
                      ★ {prog.rating}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] font-bold text-slate-500 block">
                    {prog.location}
                  </span>
                </div>

                {/* Net pricing calculation box */}
                <div className="p-2.5 border border-slate-200 bg-slate-50 space-y-1.5 font-sans">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Sticker Tuition:</span>
                    <span>${prog.rawCost}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-rose-600">
                    <span>State Aid / Grants:</span>
                    <span>-${prog.aidAmount}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-950 text-xs">
                    <span>Estimated Net Cost:</span>
                    <span className="text-emerald-700">${netCost}</span>
                  </div>
                </div>

                <div className="flex gap-2 items-center text-[9px] font-semibold">
                  {prog.wioaEligible && (
                    <span className="font-mono font-black tracking-wide text-indigo-850 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-none uppercase">
                      WIOA Eligible
                    </span>
                  )}
                  <span className="text-slate-500">Fully State-Accredited</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PERSONALIZED CAREER FIT QUIZ */}
      <div id="cna-career-quiz" className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1 border-b-2 border-slate-210 pb-3.5 mb-4">
          <h3 className="font-display font-black text-slate-950 uppercase text-base flex items-center gap-1.5">
            <HelpCircle className="w-5 h-5 text-indigo-650" /> Clinical Suitability & Path Selector
          </h3>
          <p className="font-sans text-slate-600 text-xs font-semibold">
            Evaluate your schedule, physical threshold, and computer logging comfort to determine your specialized career course.
          </p>
        </div>

        {!quizStarted && !quizResult && (
          <div className="text-center py-6 space-y-4">
            <p className="font-sans text-slate-600 text-xs font-semibold max-w-lg mx-auto">
              Our dynamic algorithm processes clinical care limits and state guidelines to formulate a custom preparation track with verified state license links.
            </p>
            <button
              onClick={() => { setQuizStarted(true); setCurrentQIndex(0); }}
              className="font-mono text-xs font-black uppercase text-white bg-indigo-650 hover:bg-slate-950 border-2 border-slate-950 px-6 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[1px] cursor-pointer transition-colors"
            >
              Start Clinical Fit Assessment →
            </button>
          </div>
        )}

        {quizStarted && !quizResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-205 pb-2">
              <span className="font-mono text-[9px] font-black text-slate-450 uppercase">
                Scenario {currentQIndex + 1} of {QUIZ_QUESTIONS.length}
              </span>
              <span className="font-mono text-[9px] font-bold text-slate-650">
                Accreted Rating Index
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="font-sans font-black text-slate-950 text-sm leading-snug">
                {QUIZ_QUESTIONS[currentQIndex].q}
              </h4>

              <div className="space-y-2">
                {QUIZ_QUESTIONS[currentQIndex].options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQIndex] === option.score;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx, option.score)}
                      type="button"
                      className={`w-full text-left p-3 border-2 font-semibold text-xs leading-snug transition-colors rounded-none flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/20 text-indigo-950 font-black"
                          : "border-slate-300 hover:border-slate-900 bg-white hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <span className={`w-5 h-5 flex items-center justify-center border-2 rounded-none font-mono text-[10px] ${
                        isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-400 bg-slate-50"
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom quiz controls */}
            <div className="flex justify-between items-center pt-2">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => prev - 1)}
                className="font-mono text-[10px] font-bold uppercase border border-slate-300 hover:border-slate-800 px-3 py-1.5 disabled:opacity-50 cursor-pointer bg-white"
              >
                Previous Question
              </button>

              {currentQIndex < QUIZ_QUESTIONS.length - 1 ? (
                <button
                  disabled={selectedAnswers[currentQIndex] === undefined}
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                  className="font-mono text-[10px] font-bold uppercase text-white bg-slate-900 hover:bg-slate-800 px-4 py-1.5 disabled:opacity-50 cursor-pointer"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  disabled={selectedAnswers[currentQIndex] === undefined || submittingQuiz}
                  onClick={calculateFinalQuiz}
                  className="font-mono text-[10px] font-black uppercase text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                >
                  {submittingQuiz ? (
                    <>
                      <RefreshCw className="w-3 px-0.5 animate-spin" /> Matching...
                    </>
                  ) : (
                    "Submit Profile Analysis"
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {quizResult && (
          <div className="space-y-4 font-sans animate-in fade-in duration-300">
            <div className="border-2 border-slate-900 p-4 bg-indigo-50/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-indigo-200 pb-3 mb-3">
                <div>
                  <span className="font-mono text-[9px] font-black text-indigo-750 uppercase">Clinical Fit Score</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-display font-black text-slate-950 text-2xl leading-none">
                      {quizResult.readinessScore}
                    </span>
                    <span className="font-mono text-slate-500 text-[10px] font-bold">/100</span>
                  </div>
                </div>

                <span className={`px-2 py-1 font-mono text-[10px] font-black uppercase tracking-widest border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  quizResult.path === "full_speed"
                    ? "bg-emerald-500 text-slate-950"
                    : quizResult.path === "cautious"
                    ? "bg-amber-400 text-slate-950"
                    : "bg-indigo-300 text-indigo-950"
                }`}>
                  {quizResult.path === "full_speed" ? "⚡ FULL_SPEED ACCEL" : quizResult.path === "cautious" ? "⚠ CAUTIOUS EXPLORER" : "✦ SEGMENT RETARGET"}
                </span>
              </div>

              {/* Dynamic plan steps list */}
              <div className="space-y-2.5 mb-3.5">
                <span className="font-mono text-[9px] font-black text-slate-450 uppercase block">Your Action Plan Checklist:</span>
                <div className="space-y-2">
                  {quizResult.planSteps.map((step: string, idx: number) => (
                    <div key={idx} className="flex gap-2 text-xs text-slate-700 leading-normal font-semibold">
                      <span className="w-4 h-4 bg-slate-900 text-white font-mono text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam details if full speed */}
              {quizResult.path === "full_speed" && (
                <div className="bg-white p-3 border border-indigo-200 mt-2 text-xs">
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <span className="font-mono text-[9px] text-slate-400 block font-bold leading-none">Accredited State Vendor</span>
                      <strong className="font-sans text-slate-900 font-extrabold block text-xs mt-0.5">{quizResult.examVendor}</strong>
                    </div>
                    <a
                      href={quizResult.examLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[10px] font-black uppercase bg-indigo-600 text-white px-3.5 py-2 flex items-center gap-1.5 hover:bg-slate-900 shrink-0 self-start sm:self-center"
                    >
                      Classroom exam scheduling <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={resetQuiz}
              className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-950 bg-slate-100 border border-slate-400 hover:bg-slate-200 px-4 py-2 cursor-pointer"
            >
              Retake Career Fit Assessment
            </button>
          </div>
        )}
      </div>

      {/* 4. VIRTUAL SHADOWING MICRO-CLIPS */}
      <div id="cna-virtual-shadowing" className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1 border-b-2 border-slate-195 pb-3.5 mb-4">
          <h3 className="font-display font-black text-slate-950 uppercase text-base flex items-center gap-1.5">
            <Play className="w-5 h-5 text-indigo-650" /> Clinical Shadowing Micro-Clips
          </h3>
          <p className="font-sans text-slate-600 text-xs font-semibold">
            Rehearse direct point-of-care resident routines in Georgia nursing homes virtually via structured tactical videos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Gallery Sidebar selection */}
          <div className="lg:col-span-4 space-y-2">
            <span className="font-mono text-[9px] font-black text-slate-450 uppercase block">Available Clips:</span>
            {SHADOW_CLIPS.map((clip) => (
              <button
                key={clip.id}
                onClick={() => handleClipSelect(clip)}
                className={`w-full text-left p-3 border-2 transition-colors cursor-pointer rounded-none block space-y-1 ${
                  activeClip.id === clip.id
                    ? "border-indigo-600 bg-indigo-50/20"
                    : "border-slate-350 bg-white hover:border-slate-900"
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="font-display font-black text-xs uppercase leading-snug text-slate-950 block">
                    {clip.title}
                  </span>
                  <span className="font-mono text-[8px] font-bold text-slate-500 shrink-0">
                    {clip.duration}
                  </span>
                </div>
                <p className="font-sans text-slate-650 text-[10px] leading-relaxed line-clamp-2">
                  {clip.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Interactive Player Canvas */}
          <div className="lg:col-span-8 flex flex-col justify-between border-2 border-slate-900 bg-slate-950 p-4 text-white relative h-[380px]">
            {/* Top player HUD bar */}
            <div className="flex justify-between items-center bg-slate-900/80 px-2.5 py-1.5 border border-slate-800 text-[9px] font-mono leading-none">
              <span className="text-emerald-400 font-bold uppercase tracking-wider select-none">● ACTIVE POINT_OF_CARE_CAMERA</span>
              <span className="text-slate-300 font-semibold">{activeClip.duration} Muted Overview</span>
            </div>

            {/* Inner dynamic play content frame */}
            <div className="flex-1 flex flex-col items-center justify-center relative my-4 overflow-hidden border border-slate-800 bg-slate-900/50">
              {isPlaying ? (
                /* Animated overlay frame */
                <div className="text-center space-y-2.5 animate-in fade-in duration-200 w-full px-6">
                  <div className="w-10 h-10 border-4 border-t-indigo-500 border-r-indigo-500 border-b-slate-700 border-l-slate-700 rounded-full animate-spin mx-auto"></div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-indigo-400 font-bold">
                    Rendering first-person interactive viewport...
                  </p>

                  {/* Captions tray */}
                  <div className="bg-black/90 p-3 border border-slate-700 font-sans text-xs text-yellow-300 font-bold leading-normal max-w-md mx-auto rounded-md shadow-lg select-all">
                    {activeCaption}
                  </div>
                </div>
              ) : (
                /* Empty / Stopped viewport representation */
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-indigo-650 hover:bg-slate-900 text-white rounded-full flex items-center justify-center border-3 border-white mx-auto cursor-pointer shadow-md transform hover:scale-105 active:scale-95 transition-all" onClick={handlePlayToggle}>
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                      Click to enter clinical shadow module
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom timeline simulation bar & mute controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={handlePlayToggle}
                className="font-mono text-[9px] font-black uppercase bg-white hover:bg-slate-200 text-slate-950 px-3 py-1.5 transition-colors cursor-pointer"
              >
                {isPlaying ? "PAUSE STREAM" : "PLAY SHADOW CLIP"}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="font-mono text-[9px] font-black text-slate-350 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-500" /> MUTED FOR ACCREDITATION (CLICK TO TALK)
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" /> LIVE SOUND ENABLED
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
