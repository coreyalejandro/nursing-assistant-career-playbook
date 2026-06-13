import React, { useState } from "react";
import CnaRegistryVerify from "./CnaRegistryVerify";
import { Users, Filter, Printer, HelpCircle, Download, Landmark, Award, ShieldAlert, Mail, Phone, Bell, Share2, Sparkles, FileText, Check, AlertCircle, RefreshCw, BarChart2, Briefcase, GraduationCap, ArrowRight, Zap, MessageSquare, Plus, CheckSquare, Search } from "lucide-react";

// In-app test recruiters candidates pool
interface RecruiterCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  licenseNumber: string;
  licenseStatus: "ACTIVE" | "EXPIRED" | "FAILED";
  specialtiesCount: number;
  portfolioDocs: number;
  hasResume: boolean;
  completenessPct: number;
  responseRatePct: number;
  stage: "New" | "Reviewed" | "Interview" | "Offer" | "Hired" | "Rejected";
  tags: string[];
}

const INITIAL_RECRUITER_CANDIDATES: RecruiterCandidate[] = [
  {
    id: "rc-001",
    name: "Carla Miranda",
    email: "carla.miranda12222@gmail.com",
    phone: "470-563-0128",
    experienceYears: 13,
    licenseNumber: "CNA-2026-6129",
    licenseStatus: "ACTIVE",
    specialtiesCount: 3,
    portfolioDocs: 2,
    hasResume: true,
    completenessPct: 100,
    responseRatePct: 95,
    stage: "Interview",
    tags: ["Experienced", "Dementia Certified"]
  },
  {
    id: "rc-002",
    name: "Sarah Elizabeth Jenkins",
    email: "sjenks@careconnect.org",
    phone: "404-511-9238",
    experienceYears: 6,
    licenseNumber: "CNA-2026-5082",
    licenseStatus: "ACTIVE",
    specialtiesCount: 2,
    portfolioDocs: 1,
    hasResume: true,
    completenessPct: 90,
    responseRatePct: 100,
    stage: "New",
    tags: ["Infection Control"]
  },
  {
    id: "rc-003",
    name: "Maria G. Hernandez",
    email: "maria.hernandez@hotmail.com",
    phone: "770-859-1092",
    experienceYears: 11,
    licenseNumber: "CNA-2024-8192",
    licenseStatus: "EXPIRED",
    specialtiesCount: 1,
    portfolioDocs: 0,
    hasResume: true,
    completenessPct: 75,
    responseRatePct: 80,
    stage: "New",
    tags: ["Expired Licensure"]
  }
];

// Message Templates Database
const COMM_TEMPLATES = [
  { id: "t1", label: "Registry Verification Request", body: "Hello {name},\n\nThis is the recruitment team. We are auditing candidate credentials on the Georgia State Registry. Please confirm if your current license registry number {license} is active.\n\nWarm regards." },
  { id: "t2", label: "Clinical Interview Invite", body: "Hello {name},\n\nWe reviewed your professional CNA portfolio. We would love to host a clinical verbal simulation interview next Tuesday. Please let us know if you have availability.\n\nBest, Recruiter Team." },
  { id: "t3", label: "Job Placement Offer", body: "Dear {name},\n\nWe are absolutely delighted to extend our formal healthcare job offer for acute nursing support. Your hireability index scored extremely high on nursing safety. Please review the attached contract.\n\nCheers." }
];

export default function RecruiterPortal() {
  const [candidates, setCandidates] = useState<RecruiterCandidate[]>(INITIAL_RECRUITER_CANDIDATES);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, boolean>>({});
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [filterTag, setFilterTag] = useState("All");

  // In-app messaging state
  const [activeChatCandidate, setActiveChatCandidate] = useState<RecruiterCandidate | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messageLogs, setMessageLogs] = useState<Record<string, string[]>>({});
  const [sendingMessage, setSendingMessage] = useState(false);

  // Bulk actions parameters
  const [bulkTagToApply, setBulkTagToApply] = useState("");

  // Detailed profile model overlay
  const [activeProfileOverlay, setActiveProfileOverlay] = useState<RecruiterCandidate | null>(null);
  
  // Licence check warning modal
  const [licenceWarningMessage, setLicenceWarningMessage] = useState<string | null>(null);

  // 1. Hireability Scoring Engine Formula (Feature 5.3)
  const calculateScore = (c: RecruiterCandidate) => {
    const verifiedLicenseScore = c.licenseStatus === "ACTIVE" ? 30 : 0;
    const expScore = Math.min(c.experienceYears * 5, 15);
    const docsScore = Math.min(c.portfolioDocs * 5, 10);
    const resumeScore = c.hasResume ? 10 : 0;
    const completenessScore = c.completenessPct * 0.15; // 15% weight
    const responseScore = c.responseRatePct * 0.10; // 10% weight

    return Math.round(verifiedLicenseScore + expScore + docsScore + resumeScore + completenessScore + responseScore);
  };

  // Drag and drop Stage move handler (Features 3.2 ATS)
  const moveCandidateStage = (candId: string, targetStage: RecruiterCandidate["stage"]) => {
    const candidate = candidates.find(c => c.id === candId);
    if (!candidate) return;

    // License constraint: Warn if moving unverified/expired names to 'Hired' or 'Offer'
    if ((targetStage === "Hired" || targetStage === "Offer") && candidate.licenseStatus === "EXPIRED") {
      setLicenceWarningMessage(`SECURITY ALERT: ${candidate.name}'s Georgia State Practice Care Registry shows ${candidate.licenseStatus}. You may not extend a formal clinical contract until active state board standing is verified.`);
      return;
    }

    setCandidates(prev => prev.map(c => c.id === candId ? { ...c, stage: targetStage } : c));
  };

  // Bulk Tags
  const handleApplyBulkTag = () => {
    if (!bulkTagToApply.trim()) return;
    setCandidates(prev => prev.map(c => {
      if (selectedCandidates[c.id]) {
        return {
          ...c,
          tags: Array.from(new Set([...c.tags, bulkTagToApply]))
        };
      }
      return c;
    }));
    setBulkTagToApply("");
    setSelectedCandidates({});
  };

  // Bulk CSV Export
  const handleBulkExportCSV = () => {
    const selectedList = candidates.filter(c => selectedCandidates[c.id]);
    if (selectedList.length === 0) return;

    const headers = "ID,Name,Email,Phone,Registry_License,Registry_Status,Hireability_Score,Current_Stage,Tags\n";
    const rows = selectedList.map(c => {
      const score = calculateScore(c);
      return `"${c.id}","${c.name}","${c.email}","${c.phone}","${c.licenseNumber}","${c.licenseStatus}",${score},"${c.stage}","${c.tags.join(' | ')}"`;
    }).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `GA_CNA_Recruit_Pool_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle template insertion
  const handleTemplateSelectChange = (templateId: string, cand: RecruiterCandidate) => {
    setSelectedTemplateId(templateId);
    const selected = COMM_TEMPLATES.find(t => t.id === templateId);
    if (selected) {
      const parsedBody = selected.body
        .replace(/{name}/g, cand.name)
        .replace(/{license}/g, cand.licenseNumber);
      setMessageText(parsedBody);
    } else {
      setMessageText("");
    }
  };

  // Handle send canned message
  const handleSendMessage = (candId: string) => {
    if (!messageText.trim()) return;

    setSendingMessage(true);

    setTimeout(() => {
      setMessageLogs(prev => {
        const logs = prev[candId] || [];
        return { ...prev, [candId]: [...logs, `[Recruiter] ${messageText}`] };
      });
      setMessageText("");
      setSelectedTemplateId("");
      setSendingMessage(false);
    }, 700);
  };

  // Filter candidates lists
  const filteredCandidates = candidates.filter(c => {
    if (onlyVerified && c.licenseStatus !== "ACTIVE") return false;
    if (filterTag !== "All" && !c.tags.includes(filterTag)) return false;
    return true;
  });

  const allTags = Array.from(new Set(candidates.flatMap(c => c.tags)));

  // ATS Stage structures
  const STAGES: RecruiterCandidate["stage"][] = ["New", "Reviewed", "Interview", "Offer", "Hired", "Rejected"];

  return (
    <div className="space-y-8">
      {/* License lookup tool */}
      <CnaRegistryVerify />

      {/* 1. APPLICANT TRACKING SYSTEM PIPELINE PANEL */}
      <div id="recruiter-ats-kanban" className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1 border-b-2 border-slate-205 pb-3.5 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-display font-black text-slate-950 uppercase text-base flex items-center gap-1.5">
                <Users className="w-5 h-5 text-indigo-650" /> Applicant Tracking System (ATS) Pipeline
              </h3>
              <p className="font-sans text-slate-600 text-xs font-semibold">
                Drag or move Certified Nursing Assistant applicants through progressive clinic interviewing and contracting cycles.
              </p>
            </div>

            {/* Verification Toggles */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] font-black">
              <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 p-1.5 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded-none text-indigo-650 h-3.5 w-3.5"
                />
                VERIFIED LICENSES ONLY
              </label>

              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="bg-white border border-slate-350 p-1 text-[9px]"
              >
                <option value="All">All Applicant Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Board Layout columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
          {STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter(c => c.stage === stage);
            return (
              <div key={stage} className="border-2 border-slate-950 bg-slate-50 p-2 min-h-[180px] space-y-2">
                {/* Stage title */}
                <div className="bg-slate-900 text-white font-mono text-[9px] font-black uppercase text-center py-1">
                  {stage} ({stageCandidates.length})
                </div>

                <div className="space-y-1.5">
                  {stageCandidates.map((c) => {
                    const score = calculateScore(c);
                    return (
                      <div
                        key={c.id}
                        onClick={() => setActiveProfileOverlay(c)}
                        className="bg-white border border-slate-350 p-2 text-xs font-sans space-y-1.5 cursor-pointer hover:border-slate-800 hover:shadow-xs transition-shadow"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <strong className="text-slate-950 block text-[11px] leading-tight font-black uppercase">
                            {c.name}
                          </strong>
                          <span className="font-display font-black text-indigo-705 text-[10px] bg-indigo-50 px-1">
                            {score}
                          </span>
                        </div>

                        {/* License Status Badge indicator */}
                        <div className="flex flex-wrap items-center gap-1">
                          <span className={`text-[8px] font-mono font-bold px-1 py-0.5 border uppercase ${
                            c.licenseStatus === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-red-50 text-red-800 border-red-200"
                          }`}>
                            {c.licenseStatus === "ACTIVE" ? "GA Verified" : "Expired"}
                          </span>
                          <span className="text-[8.5px] text-slate-500 font-mono font-bold">
                            {c.experienceYears}yr Exp
                          </span>
                        </div>

                        {/* Direct Select pipeline stage trigger manual buttons (for non-drag screen) */}
                        <div className="pt-1.5 border-t border-slate-200 flex justify-between gap-1">
                          <select
                            value={c.stage}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => moveCandidateStage(c.id, e.target.value as RecruiterCandidate["stage"])}
                            className="w-full font-mono text-[8.5px] bg-slate-50 border border-slate-350 py-0.5 focus:outline-none"
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>Move to: {s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. REGISTRAR DATA GRID & BULK ACTION BAR */}
      <div id="recruiter-bulk-actions" className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1 border-b-2 border-slate-205 pb-3.5 mb-4">
          <h3 className="font-display font-black text-slate-950 uppercase text-base flex items-center gap-1.5">
            <CheckSquare className="w-5 h-5 text-indigo-650" /> Regional Candidates Registry & Bulk Command
          </h3>
          <p className="font-sans text-slate-600 text-xs font-semibold">
            Execute batch tags additions, messaging notifications, or export tabular CSV profiles from selected checked lines.
          </p>
        </div>

        {/* Bulk tools control bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 border border-slate-355 text-xs font-mono mb-4 text-slate-900">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-[9px] uppercase">Apply Tag to checked:</span>
            <input
              type="text"
              value={bulkTagToApply}
              onChange={(e) => setBulkTagToApply(e.target.value)}
              placeholder="e.g. Hospital Eligible"
              className="bg-white border border-slate-350 p-1 font-sans text-xs [clip-path:none]"
            />
            <button
              onClick={handleApplyBulkTag}
              disabled={Object.values(selectedCandidates).filter(Boolean).length === 0 || !bulkTagToApply.trim()}
              className="bg-slate-950 hover:bg-slate-850 text-white font-mono text-[9px] px-2.5 py-1 uppercase disabled:opacity-50 cursor-pointer font-black"
            >
              Add Tag
            </button>
          </div>

          <button
            onClick={handleBulkExportCSV}
            disabled={Object.values(selectedCandidates).filter(Boolean).length === 0}
            className="font-mono text-[9px] font-black uppercase text-slate-950 bg-white hover:bg-slate-100 border border-slate-400 px-3 py-1.5 disabled:opacity-50 cursor-pointer"
          >
            Export Selected Candidates CSV List
          </button>
        </div>

        {/* Row Entries Table Grid */}
        <div className="border border-slate-900 overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[9px] uppercase font-black">
                <th className="p-2 border border-slate-900 w-10 text-center">✓</th>
                <th className="p-2 border border-slate-900">Applicant Name</th>
                <th className="p-2 border border-slate-900">Georgia Registry ID</th>
                <th className="p-2 border border-slate-900">Safety Index Rating</th>
                <th className="p-2 border border-slate-900">Stage Status</th>
                <th className="p-2 border border-slate-900">Applied Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCandidates.map((c) => {
                const score = calculateScore(c);
                const isSelected = selectedCandidates[c.id] || false;
                return (
                  <tr key={c.id} className={`hover:bg-slate-50/50 ${isSelected ? "bg-indigo-50/10" : ""}`}>
                    <td className="p-2 border border-slate-200 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          setSelectedCandidates(prev => ({ ...prev, [c.id]: e.target.checked }));
                        }}
                        className="rounded-none text-indigo-650 h-3.5 w-3.5 cursor-pointer ml-1"
                      />
                    </td>
                    <td className="p-2 border border-slate-200">
                      <button
                        onClick={() => setActiveProfileOverlay(c)}
                        className="font-black text-indigo-755 hover:underline uppercase text-left tracking-tight"
                      >
                        {c.name}
                      </button>
                    </td>
                    <td className="p-2 border border-slate-200 font-mono text-[10px] font-bold text-slate-700">{c.licenseNumber}</td>
                    <td className="p-2 border border-slate-200 font-mono font-black text-indigo-700 text-center w-32">{score} / 100</td>
                    <td className="p-2 border border-slate-200 uppercase font-mono text-[9px] font-black">{c.stage}</td>
                    <td className="p-2 border border-slate-200">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((tag, i) => (
                          <span key={i} className="text-[9px] font-bold font-mono bg-slate-50 border border-slate-350 text-slate-650 px-1 py-0.2 select-all uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. IN-APP MESSAGING & CANNED COMM TEMPLATES */}
      <div id="recruiter-messages" className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1 border-b-2 border-slate-205 pb-3.5 mb-4">
          <h3 className="font-display font-black text-slate-950 uppercase text-base flex items-center gap-1.5">
            <MessageSquare className="w-5 h-5 text-indigo-650" /> Applicant Communications Center
          </h3>
          <p className="font-sans text-slate-600 text-xs font-semibold">
            Transmit templated messages or schedule clinical interview panels directly to candidates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Chat candidate picker sidebar */}
          <div className="md:col-span-4 border border-slate-300 divide-y divide-slate-150 h-[300px] overflow-y-auto">
            {candidates.map((c) => {
              const score = calculateScore(c);
              const isSelectedChat = activeChatCandidate?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => { setActiveChatCandidate(c); setMessageText(""); }}
                  className={`w-full text-left p-3 flex justify-between items-center transition-colors rounded-none cursor-pointer ${
                    isSelectedChat ? "bg-indigo-50/20 font-black border-l-4 border-l-indigo-600" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-0.5">
                    <strong className="font-sans text-xs uppercase leading-tight font-black text-slate-950 block">{c.name}</strong>
                    <span className="font-mono text-[9px] text-slate-505 block uppercase">{c.stage} status</span>
                  </div>
                  <span className="font-mono text-[10px] font-black bg-indigo-50 border border-indigo-200 text-indigo-900 px-1.5 rounded-none">
                    {score} Index
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Chat Pane */}
          <div className="md:col-span-8 border border-slate-300 p-4 h-[300px] flex flex-col justify-between bg-slate-50 relative">
            {activeChatCandidate ? (
              <div className="flex-1 flex flex-col justify-between gap-3 text-xs">
                {/* Chat header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2 bg-slate-50 text-[11px] leading-none shrink-0 font-sans font-semibold">
                  <div>
                    <span>Messaging Panel:</span>
                    <strong className="text-slate-950 font-black uppercase text-xs ml-1 block mt-0.5">{activeChatCandidate.name}</strong>
                  </div>
                  <span className="font-mono text-[9px] text-slate-450 uppercase">{activeChatCandidate.email}</span>
                </div>

                {/* Templates pre-picker insertion */}
                <div className="flex items-center gap-2 font-mono text-[9.5px] font-black text-slate-900 shrink-0 mb-1 leading-none">
                  <span>insert recruitment template:</span>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateSelectChange(e.target.value, activeChatCandidate)}
                    className="bg-white border border-slate-350 p-1 font-mono text-[9.5px]"
                  >
                    <option value="">-- Canned Templates --</option>
                    {COMM_TEMPLATES.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>{tmpl.label}</option>
                    ))}
                  </select>
                </div>

                {/* Message logs view */}
                <div className="flex-1 bg-white border border-slate-205 p-3 overflow-y-auto space-y-2 max-h-[120px]">
                  {messageLogs[activeChatCandidate.id] && messageLogs[activeChatCandidate.id].length > 0 ? (
                    messageLogs[activeChatCandidate.id].map((log, idx) => (
                      <div key={idx} className="p-2 border border-slate-100 bg-slate-50 text-slate-700 leading-relaxed font-medium">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-center font-sans font-semibold text-slate-500 py-6 text-[11px]">
                      No previous chat logs recorded on file. Type a customized templated recruitment offer below.
                    </div>
                  )}
                </div>

                {/* Input box */}
                <div className="flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter canned announcement info or scheduled days invite..."
                    className="flex-1 bg-white border border-slate-950 px-2 py-1.5 focus:outline-none placeholder:text-slate-400 font-sans text-xs"
                  />
                  <button
                    disabled={sendingMessage || !messageText.trim()}
                    onClick={() => handleSendMessage(activeChatCandidate.id)}
                    className="bg-indigo-650 hover:bg-slate-950 text-white font-mono text-[10px] px-4 py-1.5 font-black uppercase disabled:opacity-50 cursor-pointer"
                  >
                    {sendingMessage ? "Sending..." : "Transmit"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 font-sans font-semibold text-slate-550 my-auto">
                Select an applicant profile on the left sidebar to enter communications command panel.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. JOB PERFORMANCE METRICS PANEL ANALYTICS */}
      <div id="recruiter-job-analytics" className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1 border-b-2 border-slate-205 pb-3.5 mb-4">
          <h3 className="font-display font-black text-slate-950 uppercase text-base flex items-center gap-1.5">
            <BarChart2 className="w-5 h-5 text-indigo-650" /> Published Job Post Performance Telemetry
          </h3>
          <p className="font-sans text-slate-600 text-xs font-semibold">
            Audit engagement channels metrics (views, clinical conversion match percentage ratios) for Georgia acute nursing assistant positions.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* View count */}
          <div className="border border-slate-900 bg-slate-50 p-3.5 text-center font-sans space-y-1">
            <span className="font-mono text-[9px] font-black text-slate-450 uppercase block">Total Listing Views</span>
            <strong className="font-display font-black text-xl text-slate-950 block">1,850</strong>
            <span className="font-mono text-[8.5px] text-emerald-600 block">+12% over 7 days</span>
          </div>

          {/* Clicks count */}
          <div className="border border-slate-900 bg-slate-50 p-3.5 text-center font-sans space-y-1">
            <span className="font-mono text-[9px] font-black text-slate-450 uppercase block">Application Clicks</span>
            <strong className="font-display font-black text-xl text-slate-950 block">458</strong>
            <span className="font-mono text-[8.5px] text-emerald-600 block">+6% over 7 days</span>
          </div>

          {/* Rate ratio */}
          <div className="border border-slate-900 bg-slate-50 p-3.5 text-center font-sans space-y-1">
            <span className="font-mono text-[9px] font-black text-indigo-755 uppercase block">Clinical Conversion Ratio</span>
            <strong className="font-display font-black text-xl text-indigo-705 block">24.7%</strong>
            <span className="font-mono text-[8.5px] text-slate-500 block">Georgia State benchmark: 18%</span>
          </div>

          {/* Applicants Received */}
          <div className="border border-slate-900 bg-slate-50 p-3.5 text-center font-sans space-y-1">
            <span className="font-mono text-[9px] font-black text-slate-450 uppercase block">Verified Resumes Submitted</span>
            <strong className="font-display font-black text-xl text-slate-950 block">3</strong>
            <span className="font-mono text-[8.5px] text-indigo-600 block">100% Georgia certified</span>
          </div>
        </div>
      </div>

      {/* MODAL: Verification Error Warnings overlay */}
      {licenceWarningMessage && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-slate-900 p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-md w-full relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0" />
              <div>
                <strong className="font-display font-black uppercase text-sm block tracking-wide text-rose-700">REGISTRAR SYSTEM WARNING</strong>
                <p className="font-sans text-xs text-slate-700 font-semibold leading-relaxed mt-1.5">
                  {licenceWarningMessage}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
              <button
                onClick={() => setLicenceWarningMessage(null)}
                className="bg-slate-950 hover:bg-slate-850 text-white font-mono text-[10px] font-black uppercase px-4 py-2 border-2 border-slate-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer"
              >
                Acknowledge Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Detailed Applicant profile view overlay */}
      {activeProfileOverlay && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-4 border-slate-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full relative space-y-4 animate-in zoom-in-95 duration-150 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-slate-300 pb-3 mb-2">
              <div>
                <span className="font-mono text-[9px] font-black text-slate-450 block uppercase">Candidate Board Details</span>
                <strong className="font-display font-black uppercase text-base text-slate-950 tracking-tight leading-none mt-1 block">
                  {activeProfileOverlay.name}
                </strong>
              </div>

              <div className="text-right">
                <span className="font-mono text-[9px] font-black text-slate-400 block uppercase">Calculated Safety Score</span>
                <strong className="font-display font-black text-lg text-indigo-700">
                  {calculateScore(activeProfileOverlay)}
                </strong>
              </div>
            </div>

            {/* Registry lookup and specs detail grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 border border-slate-250 font-mono text-[10.5px]">
              <div>
                <span className="text-[8px] text-slate-450 block uppercase font-bold leading-none mb-1">State Registry ID</span>
                <span className="font-bold text-slate-800">{activeProfileOverlay.licenseNumber}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-450 block uppercase font-bold leading-none mb-1">Board Standing</span>
                <span className={`font-black ${activeProfileOverlay.licenseStatus === "ACTIVE" ? "text-emerald-700" : "text-rose-600"}`}>
                  ● {activeProfileOverlay.licenseStatus}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-450 block uppercase font-bold leading-none mb-1">Cert Specialties</span>
                <span className="font-bold text-slate-800">{activeProfileOverlay.specialtiesCount} Certified Specialties</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-450 block uppercase font-bold leading-none mb-1">Clinical Portfolio</span>
                <span className="font-bold text-slate-800">{activeProfileOverlay.portfolioDocs} Documents Uploaded</span>
              </div>
            </div>

            {/* Profile specifications list details */}
            <div className="space-y-2 text-slate-700">
              <span className="font-mono text-[8px] font-black text-slate-450 uppercase block">Scoring telemetry matrix:</span>
              <ul className="space-y-1 font-semibold leading-normal list-disc pl-4 text-[11px]">
                <li>Registered standing: {activeProfileOverlay.licenseStatus === "ACTIVE" ? "Licensed certified in Georgia board (+30 pts)" : "Registry standing expired / unverified (+0 pts)"}</li>
                <li>Clinical experience: Verified {activeProfileOverlay.experienceYears} continuous healthcare years (+{Math.min(activeProfileOverlay.experienceYears * 5, 15)} pts)</li>
                <li>Digital resume completion: Verified Point-of-Care EHR logs (+10 pts)</li>
                <li>Profile details completeness ratio: Calculated at {activeProfileOverlay.completenessPct}% accuracy (+{Math.round(activeProfileOverlay.completenessPct * 0.15)} pts)</li>
                <li>Direct recruiter response rating: Calculated at {activeProfileOverlay.responseRatePct}% speed check (+{Math.round(activeProfileOverlay.responseRatePct * 0.1)} pts)</li>
              </ul>
            </div>

            {/* Private Contact details and portfolio links actions */}
            <div className="border-t border-slate-200 pt-3.5 flex flex-wrap gap-2.5 justify-between items-center bg-slate-50/70 p-3">
              <div className="flex gap-4 font-mono text-[10px] text-slate-655 font-bold leading-none">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {activeProfileOverlay.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {activeProfileOverlay.phone}</span>
              </div>

              <div className="flex gap-1.5 font-mono text-[10px] leading-none">
                <button
                  onClick={() => setActiveProfileOverlay(null)}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-3 py-1.5 font-bold uppercase cursor-pointer"
                >
                  Close Profile Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
