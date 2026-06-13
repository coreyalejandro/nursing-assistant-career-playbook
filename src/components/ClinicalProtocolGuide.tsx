import React, { useState, useEffect } from "react";
import { 
  X, Search, FileText, Code, Check, Copy, Download, BookOpen, 
  HardDrive, Cpu, HelpCircle, Terminal, Wifi, WifiOff, Volume2, 
  VolumeX, Smartphone, Play, Pause, ArrowRight, Lock, ShieldCheck, 
  Layers, Activity, Sparkles, UserCheck
} from "lucide-react";
import { PlaybookData } from "../types";

interface ClinicalProtocolGuideProps {
  isOpen: boolean;
  onClose: () => void;
  playbookData: PlaybookData;
}

export default function ClinicalProtocolGuide({ isOpen, onClose, playbookData }: ClinicalProtocolGuideProps) {
  // Navigation & Interactive States in the Guide Simulator
  const [activeTab, setActiveTab] = useState<"00" | "01" | "02" | "03" | "04" | "05">("00");
  const [simulatorOffline, setSimulatorOffline] = useState(false);
  const [simulatedPremium, setSimulatedPremium] = useState<number>(3.50);
  const [isSimulatedAudioPlaying, setIsSimulatedAudioPlaying] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Global key listener to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const downloadFile = (filename: string, content: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Content providers for manual exporters
  const getMarkdownContent = () => {
    return `# TECHNICAL MANUAL: CLINICAL ASSET COORDINATOR
Device ID: ${typeof window !== "undefined" ? btoa(window.navigator.userAgent).slice(0, 8) : "N/A"}
Sync State: Cached Offline (Durable)

## 01. PROTOCOL CONFIGURATION
- Base Local Rate: $22.00/hr
- Optimal CNO Verification target: $25.50/hr
- Primary Verification Protocol: CDC STEADI Handlers

## 02. CACHE MAP (INDEXED-DB)
- Core DB: cna_playbook_db
- Store: playbook_data_store (current_playbook)
- Backups: localStorage redundancy channels

## 03. READABILITY BOUNDS
- Optimized ATS score: Grade level 8.4
- Compressions: Active
- Speech engine: Browser synthesis fallbacks
`;
  };

  const getCursorRulesContent = () => {
    return `# .cursorrules - Carrier Agentic Instructions for Carla's Clinical Resume
- Ensure all metric values use active verbs ("Optimized", "Reduced", "Mitigated").
- Maintain structural single-column neo-brutalist bento cards for mobile nurse views.
- Ensure all IndexedDB cache sync timers use the 5-minute freshness interval.
`;
  };

  const getBundleOutline = () => {
    return JSON.stringify({
      protocolName: "Carla Miranda Career Playbook",
      packageType: "durable-system-bundle",
      environmentConfigs: {
        port: 3000,
        swMode: "indexedDB-primary",
        fallbackStorage: "localStorage"
      },
      cachedAssetsList: ["WageCalculator", "TaxonVignettes", "PointClickCareEHR", "DirectSMSChannel"]
    }, null, 2);
  };

  return (
    <div id="protocol-guide-overlay" className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      <div id="protocol-guide-container" className="w-full max-w-6xl h-[92vh] sm:h-[86vh] bg-slate-950 border-4 border-slate-800 flex flex-col uppercase font-mono shadow-[12px_12px_0px_0px_rgba(30,41,59,1)] text-white overflow-hidden">
        
        {/* Banner metadata header block */}
        <div id="guide-header-bar" className="border-b-4 border-slate-800 bg-slate-900 p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 text-slate-950 p-2.5 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <Terminal className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-widest text-white uppercase leading-tight">
                Playbook System Protocol v2.0
              </h2>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-wider lowercase">
                visual guide manual · interactive app simulator & overlays
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 text-[9px] font-black tracking-widest hidden sm:inline">
              LIVE APP SIMULATOR ACTIVE
            </span>
          </div>

          <button
            id="close-guide-btn-header"
            onClick={onClose}
            className="flex items-center gap-1.5 border-2 border-slate-700 hover:border-red-500 bg-slate-950 hover:bg-red-950 hover:text-red-400 text-slate-400 px-3 py-1.5 text-xs transition-colors cursor-pointer select-none"
          >
            <X className="w-4 h-4 font-black" /> Close Manual
          </button>
        </div>

        {/* Global Developer Tooling Exporters */}
        <div id="guide-exporters-bar" className="bg-slate-900/40 border-b-2 border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[9px] tracking-widest text-slate-400 font-bold">
            EXPORT SETUP & DATA FILES:
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="export-md-btn"
              onClick={() => handleCopy(getMarkdownContent(), "EXPORT_MD")}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-yellow-400 text-[9px] font-bold text-slate-300 hover:text-yellow-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedText === "EXPORT_MD" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
              EXPORT_MD
            </button>
            
            <button
              id="export-json-btn"
              onClick={() => downloadFile("playbook-technical-spec.json", JSON.stringify(playbookData, null, 2), "application/json")}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-emerald-500 text-[9px] font-bold text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT_JSON
            </button>

            <button
              id="export-cursor-btn"
              onClick={() => handleCopy(getCursorRulesContent(), "EXPORT_CURSOR")}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-pink-500 text-[9px] font-bold text-slate-300 hover:text-pink-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedText === "EXPORT_CURSOR" ? <Check className="w-3.5 h-3.5 text-pink-400" /> : <Code className="w-3.5 h-3.5" />}
              EXPORT_CURSOR
            </button>

            <button
              id="download-bundle-btn"
              onClick={() => downloadFile("system-offline-bundle.json", getBundleOutline(), "application/json")}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-sky-400 text-[9px] font-bold text-slate-300 hover:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              DOWNLOAD_BUNDLE
            </button>
          </div>
        </div>

        {/* Dual Panel Workspace: Interactive Guide Left, Mock Simulated App Right */}
        <div id="guide-body-workspace" className="flex-1 flex overflow-hidden">
          
          {/* Left Navigation & Protocol Details Column */}
          <div id="guide-sidebar-panel" className="w-full lg:w-5/12 border-r-4 border-slate-800 bg-slate-950 flex flex-col h-full overflow-hidden">
            
            {/* Nav tabs for manual chapters */}
            <div id="chapter-nav-list" className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-2 gap-1 p-2 bg-slate-900/60 border-b-2 border-slate-800">
              {[
                { id: "00", short: "Overview", icon: Cpu },
                { id: "01", short: "Offline Saving", icon: HardDrive },
                { id: "02", short: "Wage Targets", icon: Activity },
                { id: "03", short: "Resume Score", icon: ShieldCheck },
                { id: "04", short: "Voice Practice", icon: Volume2 },
                { id: "05", short: "SMS Channel", icon: Smartphone }
              ].map((tab) => {
                const IconComp = tab.icon;
                return (
                  <button
                    id={`chapter-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`p-2 border font-mono text-[9px] font-black uppercase flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-center lg:text-left cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-yellow-400 text-slate-950 border-yellow-500 shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline-block md:hidden lg:inline-block leading-tight">{tab.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanatory notes under active chapter */}
            <div id="chapter-info-container" className="flex-1 p-4 overflow-y-auto uppercase-none text-slate-300 font-sans text-xs leading-relaxed space-y-4">
              
              {activeTab === "00" && (
                <div id="chap-00-content" className="space-y-4">
                  <div className="border-b border-slate-800 pb-2 mb-2 font-mono">
                    <span className="text-yellow-400 font-black text-xs">[PLAYBOOK USER MANUAL OVERVIEW]</span>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Welcome to the <strong>Clinical Playbook Guide</strong>. The panel on your right is an <strong>Interactive App Simulator</strong> displaying a live visual preview of Carla’s Playbook application.
                  </p>
                  
                  {/* Explaining Upper Navigation & Mode Toggle */}
                  <div className="bg-slate-900 border-2 border-slate-800 p-3 space-y-2">
                    <h5 className="font-mono font-bold text-xs text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                      🌐 UPPER NAVIGATION & VIEW MODES
                    </h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      At the top of the main application window is a persistent navigation bar designed for immediate status checks and view toggling:
                    </p>
                    <ul className="list-disc pl-4 text-slate-300 text-[11px] space-y-2 mt-1">
                      <li>
                        <strong>Automatic Saving Monitor</strong>: Located on the left side of the navigation bar, this live status beacon monitors IndexedDB cached writes. It displays <span className="text-emerald-400 font-bold font-mono">Saved [Timestamp]</span> when offline states or network disconnects occur, proving absolute local-first reliability.
                      </li>
                      <li>
                        <strong>Help Guide Key</strong>: Clicking the <span className="bg-slate-900 border border-slate-700 font-mono text-[9px] px-1 text-slate-300 uppercase font-black">Help Guide</span> button opens this full system protocol guide overlay at any point.
                      </li>
                      <li>
                        <strong>Dual-View Mode Toggle</strong>:
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div className="p-2 border border-emerald-800 bg-emerald-950/20">
                            <span className="block font-bold text-emerald-400 text-[10px] font-mono mb-0.5">🟢 CARLA MODE</span>
                            <span className="text-slate-400 text-[10px]">A simplified, distraction-free view tailored for viewing on mobile devices inside high-shielding clinical wards. Emphasizes tactile resumes, easy metrics, and fast interview speech rehearsing.</span>
                          </div>
                          <div className="p-2 border border-amber-800 bg-amber-950/20">
                            <span className="block font-bold text-amber-400 text-[10px] font-mono mb-0.5">🟡 AUDITOR VIEW</span>
                            <span className="text-slate-400 text-[10px]">A thorough credentials assessment view for hospital administrators or resume auditors. Exposes background ATS compliance scores, Flesch-Kincaid readabilities, and live LLM prompt regenerating models.</span>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <p className="text-slate-400 text-xs">
                    We’ve mapped each core feature layer to an overlay highlight on the right. Look for the yellow circular highlights <span className="inline-block bg-yellow-400 text-slate-950 px-1 border border-slate-950 font-bold font-mono text-[10px]">①</span> through <span className="inline-block bg-yellow-400 text-slate-950 px-1 border border-slate-950 font-bold font-mono text-[10px]">⑤</span> to explore off-grid saving systems, the wage finder, ATS resume validation thresholds, speech rehearsal tools, and SMS exports.
                  </p>
                </div>
              )}

              {activeTab === "01" && (
                <div id="chap-01-content" className="space-y-3">
                  <div className="border-b border-slate-800 pb-2 mb-2 font-mono">
                    <span className="text-emerald-400 font-black text-xs">[① OFF-GRID AUTOMATIC SAVING]</span>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Hospital areas, heavy doors, and lead shielding can cause sudden network dropouts. This application automatically saves everything on this phone so that Carla never loses her work.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-450 text-xs mt-1">
                    <li>
                      <strong>Auto-Save Anywhere</strong>: Any updates made to the resume or wage tools are instantly saved locally to this device. No need to look for a manual "Save" button.
                    </li>
                    <li>
                      <strong>No Wi-Fi Needed</strong>: When connection drops, a friendly banner reminds you that the app is running safely in offline mode.
                    </li>
                    <li>
                      <strong>Always Ready</strong>: Even if you reboot your device inside a signal-dead zone, your playbook loads fully with all of your customized data.
                    </li>
                  </ul>
                  <div className="bg-slate-900 p-3 border border-slate-800 font-mono text-[10px] tracking-normal">
                    <span className="text-emerald-400 font-bold">Try Simulated Offline Mode:</span>
                    <p className="text-slate-300 mt-1">Click the button below to simulate cutting off the internet connection and see how the app warns the user while keeping their work safe.</p>
                    <button
                      id="toggle-network-sim"
                      onClick={() => setSimulatorOffline(!simulatorOffline)}
                      className={`mt-2 w-full px-2 py-1 text-xs font-mono font-bold uppercase border cursor-pointer ${
                        simulatorOffline ? "bg-red-950 text-red-400 border-red-700" : "bg-emerald-950 text-emerald-400 border-emerald-700"
                      }`}
                    >
                      Connection Status: {simulatorOffline ? "Simulate Offline Mode (Saved Locally)" : "Simulate Online Mode"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "02" && (
                <div id="chap-02-content" className="space-y-3">
                  <div className="border-b border-slate-800 pb-2 mb-2 font-mono">
                    <span className="text-amber-400 font-black text-xs">[② SHIFT WAGE TARGETING SYSTEM]</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    The <strong>Wage Maximizer</strong> lets you select your target hourly rate and shows you exactly which experience points to mention in your interview to justify it.
                  </p>
                  <p className="text-slate-350 text-xs">
                    As Carla aims for top-tier pay (up to $25.50/hr), she must unlock specific, verified experience talking points based on real patient-care guidelines:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
                    <li><strong>$23.00/hr (Base Level)</strong>: Unlocks experience with digital charting software (PointClickCare).</li>
                    <li><strong>$24.50/hr (Senior Grade)</strong>: Unlocks experience with dementia care talking points.</li>
                    <li><strong>$25.50/hr (Elite Grade)</strong>: Unlocks senior fall-prevention safety protocols (CDC STEADI guidelines).</li>
                  </ul>
                  <div className="bg-slate-900 p-3 border border-slate-800 font-mono text-[10px]">
                    <span className="text-amber-400 font-bold">Try Simulated Wage Targets:</span>
                    <p className="text-slate-300 mt-1">Slide the wage bar in the live preview on the right to see how different pay targets automatically update the suggested interview talking points.</p>
                  </div>
                </div>
              )}

              {activeTab === "03" && (
                <div id="chap-03-content" className="space-y-3">
                  <div className="border-b border-slate-800 pb-2 mb-2 font-mono">
                    <span className="text-[#FFF] font-black text-xs">[③ ATS RESUME READABILITY SCORE]</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Healthcare recruiting uses Applicant Tracking Systems (ATS) to filter resumes. Complex designs or academic vocabulary often prevent high scores on scanner runs.
                  </p>
                  <p className="text-slate-400 text-xs">
                    Carla's resume sections are optimized using readability algorithms to hit an ideal and readable 8.4 Grade Level target, balancing clinical precision with quick scanning:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                    <li><strong>13+ Years Credentials</strong>: Clean tabular presentation of clinical competencies.</li>
                    <li><strong>Mobility Limits</strong>: Highlighted patient-safe transit thresholds.</li>
                    <li><strong>Action Statements</strong>: Strict starting verbs paired alongside quantitative local metrics.</li>
                  </ul>
                </div>
              )}

              {activeTab === "04" && (
                <div id="chap-04-content" className="space-y-3">
                  <div className="border-b border-slate-800 pb-2 mb-2 font-mono">
                    <span className="text-yellow-400 font-black text-xs">[④ PRACTICE AUDIO REHEARSAL]</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    To make sure Carla is prepared for rapid hiring interviews, our built-in voice synthesizer dictates her core patient-care experiences aloud for audio-based practice.
                  </p>
                  <p className="text-slate-400 text-xs">
                    The verbal system injects synthetic speech breaks to replicate natural human breathing intervals. Fallback modes ensure that even if the browser blocks automatic audio playback, she can play the phrases manually with zero friction.
                  </p>
                  <div className="bg-slate-900 p-3 border border-slate-800 font-mono text-[10px]">
                    <span className="text-yellow-400 font-bold">Try Simulated Playback:</span>
                    <p className="text-slate-300 mt-1">Tap the play/pause button in our guide's interactive player panel on the right to see simulated sound-waves move as you rehearse.</p>
                    <button
                      id="sim-audio-toggle"
                      onClick={() => setIsSimulatedAudioPlaying(!isSimulatedAudioPlaying)}
                      className={`mt-2 w-full px-2 py-1 text-xs font-mono font-bold uppercase border cursor-pointer flex items-center justify-center gap-1 ${
                        isSimulatedAudioPlaying ? "bg-amber-950 text-amber-400 border-amber-700" : "bg-slate-900 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isSimulatedAudioPlaying ? <Pause className="w-3 h-3 text-amber-400 animate-pulse" /> : <Play className="w-3 h-3 text-slate-400" />}
                      {isSimulatedAudioPlaying ? "Stop Simulated Voice" : "Simulate Playback Audio"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "05" && (
                <div id="chap-05-content" className="space-y-3">
                  <div className="border-b border-slate-800 pb-2 mb-2 font-mono">
                    <span className="text-indigo-400 font-black text-xs">[⑤ RECRUITER SMS DIRECT EXPORT]</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Direct communication with recruiters is key. The <strong>Direct Launchpad</strong> provides contact buttons targeting major regional networks to bypass long job portal applications.
                  </p>
                  <p className="text-slate-400 text-xs">
                    To avoid copy-pasting manually on small phone screens, we configured an <strong>Automatic iOS/Android Messenger Link Parser</strong>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px] font-mono leading-normal">
                    <li>iOS Parser format: <code className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 border border-emerald-800">sms:&body=...</code></li>
                    <li>Android Parser format: <code className="text-indigo-400 bg-indigo-950/40 px-1 py-0.5 border border-indigo-800">sms:?body=...</code></li>
                  </ul>
                  <p className="text-slate-400 text-xs mt-2">
                    This automatically structures a beautiful, prewritten text pitch containing Carla’s verified credentials, allowing her to send it to a recruiter with a single tap.
                  </p>
                </div>
              )}

            </div>

            {/* Bottom-bar control guide indicator info */}
            <div id="guide-sidebar-footer" className="p-3 bg-slate-900 border-t-2 border-slate-800 font-mono text-[9px] text-slate-500 tracking-wider">
              PROTOCOL CHAPTER MANUAL · ACTIVE SECTIONS LOGGED
            </div>
          </div>

          {/* Right Panel: Beautiful, Custom, Fully Animated Interactive Mock App Simulator */}
          <div id="guide-simulator-panel" className="flex-1 bg-slate-900 overflow-y-auto p-4 flex flex-col justify-between relative">
            
            {/* Guide simulator floating watermark badge */}
            <div id="sim-badge" className="absolute top-2 right-2 z-10 font-mono text-[8px] font-black bg-yellow-400 text-slate-950 px-2 py-0.5 border border-slate-950 uppercase rotate-2 shadow-sm pointer-events-none">
              App Simulator Frame
            </div>

            <div id="sim-widgets-stack" className="space-y-4">
              
              {/* Widget 1: Mock Navbar & Connectivity Status (Mocks App level) */}
              <div 
                id="sim-navbar-widget" 
                className={`relative bg-slate-950 border-2 transition-all p-3 shadow-md flex items-center justify-between ${
                  activeTab === "01" ? "border-emerald-400 ring-2 ring-emerald-500/50" : "border-slate-850"
                }`}
              >
                {/* Visual indicator overlay beacon */}
                <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-yellow-400 border-2 border-slate-950 flex items-center justify-center font-mono text-[10px] font-black text-slate-950 shadow-md">
                  1
                </div>
                
                <div className="flex flex-col items-start gap-1">
                  <span className="font-display font-black text-[9px] sm:text-[10px] tracking-widest text-white uppercase">CARLA PLAYBOOK</span>
                  <div className="flex items-center gap-1 border border-slate-800 bg-slate-900 p-0.5 text-[7px] font-mono font-bold select-none scale-90 -ml-1">
                    <span className="bg-emerald-500 text-slate-950 px-1 py-0.2 uppercase text-[6px]">Carla Mode</span>
                    <span className="text-slate-400 px-1 py-0.2 uppercase text-[6px]">Auditor</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[8px] text-slate-400 border border-slate-800 px-2 py-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${simulatorOffline ? "bg-red-500 animate-pulse" : "bg-emerald-400 animate-ping"}`}></span>
                  <span className="uppercase font-bold tracking-widest text-[8px]">
                    {simulatorOffline ? "Offline" : "Saved 06:48"}
                  </span>
                </div>

                {/* Annotation bubble for Tab 01 */}
                {activeTab === "01" && (
                  <div className="absolute right-2 -bottom-24 z-20 w-56 bg-slate-950 border-2 border-emerald-500 p-2 font-sans text-[10px] text-emerald-200 shadow-lg tracking-normal">
                    <p className="font-mono font-bold text-emerald-400 uppercase text-[9px] mb-1">① OFFLINE SAVING STATUS:</p>
                    Shows you instantly that your data is saved on this device, even if your network drops or cellular service fails completely.
                  </div>
                )}
              </div>

              {/* Widget 2: Mock Online status alerts (If Simulated Offline is toggled) */}
              {simulatorOffline && (
                <div id="sim-offline-banner" className="bg-red-500 border-2 border-slate-950 p-2.5 font-mono text-slate-950 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] animate-pulse">
                  <WifiOff className="w-4 h-4 shrink-0" />
                  <div>
                    <h5 className="font-black uppercase text-[10px] leading-tight">⚠️ Device is currently Offline</h5>
                    <p className="text-[9px] font-sans font-medium">Don't worry! All information is saved to this device safely.</p>
                  </div>
                </div>
              )}

              {/* Widget 3: Mock Wage Slider Target (Mocks WageMaximizer.tsx) */}
              <div 
                id="sim-wage-maximizer-widget" 
                className={`relative bg-white border-2 border-slate-950 transition-all p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-950 ${
                  activeTab === "02" ? "border-amber-400 ring-2 ring-amber-500/50" : ""
                }`}
              >
                {/* Visual indicator overlay beacon */}
                <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-yellow-400 border-2 border-slate-950 flex items-center justify-center font-mono text-[10px] font-black text-slate-950 shadow-md">
                  2
                </div>

                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <h4 className="font-display font-black text-xs uppercase tracking-tight text-slate-950">WAGE MAXIMIZER TOOL MOCK</h4>
                  <span className="font-mono text-[10px] font-bold text-slate-500">Playbook Phase 1</span>
                </div>

                <div className="flex flex-col items-center mb-4">
                  <span className="font-display font-black text-3xl text-emerald-600">${simulatedPremium.toFixed(2)}/hr</span>
                  <input
                    id="sim-wage-range"
                    type="range"
                    min="22.00"
                    max="25.50"
                    step="0.50"
                    value={simulatedPremium}
                    onChange={(e) => setSimulatedPremium(parseFloat(e.target.value))}
                    className="w-full mt-2 cursor-pointer h-2 bg-slate-200 accent-emerald-500"
                  />
                  <div className="w-full flex justify-between text-[8px] text-slate-400 font-bold font-mono mt-1">
                    <span>BASE: $22.00</span>
                    <span>ELITE: $25.50</span>
                  </div>
                </div>

                {/* Display mock indicators dependent on simulated slider range */}
                <div className="space-y-1.5 font-mono text-[9px] uppercase">
                  <div className={`p-1.5 border flex items-center justify-between ${simulatedPremium >= 23.00 ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                    <span className="font-bold">EHR Accurate Records Check</span>
                    {simulatedPremium >= 23.00 && <span className="text-[8px] bg-emerald-400 px-1 border border-emerald-600 font-bold">Unveiled</span>}
                  </div>
                  <div className={`p-1.5 border flex items-center justify-between ${simulatedPremium >= 24.50 ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                    <span className="font-bold">Dementia De-escalation stats</span>
                    {simulatedPremium >= 24.50 && <span className="text-[8px] bg-emerald-400 px-1 border border-emerald-600 font-bold">Unveiled</span>}
                  </div>
                  <div className={`p-1.5 border flex items-center justify-between ${simulatedPremium >= 25.55 || simulatedPremium >= 25.00 ? "bg-emerald-50 border-emerald-300 text-emerald-950 border-dashed" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                    <span className="font-bold">CDC STEADI Falls reduction %</span>
                    {simulatedPremium >= 25.00 && <span className="text-[8px] bg-emerald-400 px-1 border border-emerald-600 font-bold">Unveiled</span>}
                  </div>
                </div>

                {/* Annotation bubble for Tab 02 */}
                {activeTab === "02" && (
                  <div className="absolute left-6 -bottom-16 z-20 w-64 bg-slate-950 border-2 border-amber-500 p-2 font-sans text-[10px] text-amber-200 shadow-lg tracking-normal">
                    <p className="font-mono font-bold text-amber-400 uppercase text-[9px] mb-1">② WAGE EVIDENCE VERIFICATION:</p>
                    Links specific experience proofs (like CDC fall metrics or EHR software charts) to hourly targets to justify her premium pay.
                  </div>
                )}
              </div>

              {/* Widget 4: Mock Resume Format Readability Check (Mocks ResumeFormats.tsx) */}
              <div 
                id="sim-resume-widget" 
                className={`relative bg-white border-2 border-slate-950 transition-all p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-950 ${
                  activeTab === "03" ? "border-slate-800 ring-2 ring-slate-950/50" : ""
                }`}
              >
                {/* Visual indicator overlay beacon */}
                <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-yellow-400 border-2 border-slate-950 flex items-center justify-center font-mono text-[10px] font-black text-slate-950 shadow-md">
                  3
                </div>

                <div className="flex items-center justify-between border-b pb-2 mb-2 font-mono">
                  <h4 className="font-display font-black text-xs uppercase tracking-tight text-slate-950 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Verified Clinical Resume
                  </h4>
                  <div className="bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold px-1.5 border border-emerald-300">
                    Grade level 8.4
                  </div>
                </div>

                <div className="text-[10px] space-y-2 text-slate-700 font-sans leading-normal">
                  <div className="border-l-2 border-emerald-500 pl-2 bg-slate-50 py-1 font-mono text-[9px]">
                    <strong>CNA SPECIALIST: Carla Miranda</strong>
                    <p className="text-slate-500">13+ Years Senior Acute-Care Credentials</p>
                  </div>
                  <p className="text-[9px] italic text-slate-500">
                    "Delivered high-density EHRPointClickCare tracking on heavy 40+ patient units, reducing CDC patient mobility fall ratings by 15%."
                  </p>
                </div>

                {/* Annotation bubble for Tab 03 */}
                {activeTab === "03" && (
                  <div className="absolute right-4 -top-8 z-20 w-60 bg-slate-950 border-2 border-slate-500 p-2 font-sans text-[10px] text-slate-200 shadow-lg tracking-normal">
                    <p className="font-mono font-bold text-white uppercase text-[9px] mb-1">③ ATS OPTIMIZATION SCORE:</p>
                    Formats resume descriptions so they pass automated hospital HR filters perfectly, showing measurable outcome statistics clearly.
                  </div>
                )}
              </div>

              {/* Widget 5: Mock Vignette Player with Interactive audio state (Mocks VignettePortfolio.tsx) */}
              <div 
                id="sim-vignettes-widget" 
                className={`relative bg-white border-2 border-slate-950 transition-all p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-950 ${
                  activeTab === "04" ? "border-yellow-400 ring-2 ring-yellow-500/50" : ""
                }`}
              >
                {/* Visual indicator overlay beacon */}
                <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-yellow-400 border-2 border-slate-950 flex items-center justify-center font-mono text-[10px] font-black text-slate-950 shadow-md">
                  4
                </div>

                <div className="flex items-center justify-between border-b pb-2 mb-2 font-mono">
                  <h4 className="font-display font-black text-xs uppercase tracking-tight text-slate-950 flex items-center gap-1">
                    <Volume2 className="w-4 h-4 text-emerald-500" /> Speech Vignette Playback
                  </h4>
                  <span className="text-[8px] bg-yellow-300 font-bold px-1 text-yellow-950">Web Speech SDK</span>
                </div>

                <div className="bg-slate-950 text-emerald-400 font-mono text-[9px] p-2 flex items-center justify-between border border-slate-900 leading-snug">
                  <div>
                    <span className="font-bold block text-slate-200 text-[8px] uppercase">Active Rehearsal Frame:</span>
                    <span>{isSimulatedAudioPlaying ? "Playing: Dementia validation story..." : "Awaiting user audio play action..."}</span>
                  </div>
                  <button
                    id="sim-widget-audio-btn"
                    onClick={() => setIsSimulatedAudioPlaying(!isSimulatedAudioPlaying)}
                    className="p-1 bg-slate-900 border border-slate-800 hover:border-yellow-400 text-yellow-500"
                  >
                    {isSimulatedAudioPlaying ? <Pause className="w-4 h-4 text-amber-400 animate-pulse" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>

                {isSimulatedAudioPlaying && (
                  <div className="mt-2 flex gap-1 justify-center items-center h-4 py-1">
                    <span className="w-1 bg-emerald-500 animate-bounce h-2 duration-300"></span>
                    <span className="w-1 bg-emerald-500 animate-bounce h-4 duration-500"></span>
                    <span className="w-1 bg-emerald-500 animate-bounce h-3 duration-200"></span>
                    <span className="w-1 bg-emerald-500 animate-bounce h-5 duration-750"></span>
                    <span className="w-1 bg-emerald-500 animate-bounce h-2 duration-100"></span>
                  </div>
                )}

                {/* Annotation bubble for Tab 04 */}
                {activeTab === "04" && (
                  <div className="absolute right-4 -bottom-16 z-20 w-64 bg-slate-950 border-2 border-yellow-500 p-2 font-sans text-[10px] text-yellow-200 shadow-lg tracking-normal">
                    <p className="font-mono font-bold text-yellow-400 uppercase text-[9px] mb-1">④ AUDIO SPEECH REHEARSAL:</p>
                    Adds natural voice pauses after punctuation. Gracefully falls back to manual control if the device's voice service is blocked.
                  </div>
                )}
              </div>

              {/* Widget 6: Direct Action Hand-off & SMS carrier link Widget (Mocks direct launch actions) */}
              <div 
                id="sim-launchpad-widget" 
                className={`relative bg-slate-950 border-2 transition-all p-4 shadow-md ${
                  activeTab === "05" ? "border-indigo-400 ring-2 ring-indigo-500/50" : "border-slate-850"
                }`}
              >
                {/* Visual indicator overlay beacon */}
                <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-yellow-400 border-2 border-slate-950 flex items-center justify-center font-mono text-[10px] font-black text-slate-950 shadow-md">
                  5
                </div>

                <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                  <h4 className="font-display font-black text-xs uppercase tracking-tight text-white">Direct Handoff & SMS Channel</h4>
                  <span className="text-[8px] bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold px-1.5 uppercase font-mono">SMS Router active</span>
                </div>

                <button
                  id="sim-ios-android-sms-btn"
                  onClick={() => alert("Simulation Action: On active device, this triggers your native messenger application (iOS vs Android optimized formatting) with prewritten credentials!")}
                  className="w-full bg-slate-900 border border-slate-805 hover:border-emerald-500 p-3 flex items-center justify-center gap-2 font-mono text-[10px] font-bold text-[#FFF] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  Text My Pitch: [iOS/Android parsed]
                </button>

                {/* Annotation bubble for Tab 05 */}
                {activeTab === "05" && (
                  <div className="absolute left-6 -top-24 z-20 w-64 bg-slate-950 border-2 border-indigo-505 p-2 font-sans text-[10px] text-indigo-200 shadow-lg tracking-normal">
                    <p className="font-mono font-bold text-indigo-400 uppercase text-[9px] mb-1">⑤ SMART SMS EXPORTER:</p>
                    Converts message formatting automatically between iOS and Android browsers, allowing a preformatted text code pitch to load on any phone.
                  </div>
                )}
              </div>

            </div>

            {/* Simulated Live Device Status bar details */}
            <div id="sim-status-footer" className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between font-mono text-[8px] text-slate-500">
              <span>DEVICE: SANDBOXED_LINUX_CONTAINER</span>
              <span>HOST: 0.0.0.0 · PORT: 3000</span>
            </div>

          </div>
          
        </div>

        {/* Informative Toast Feedback Banner when Action Triggered */}
        {copiedText && (
          <div id="copied-toast-banner" className="bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-bold font-mono tracking-widest text-center flex items-center justify-center gap-1.5 animate-in slide-in-from-bottom-2 duration-300 select-none">
            <Check className="w-4 h-4 text-slate-950 font-black animate-bounce" />
            SUCCESS: {copiedText} EXPLAINER IS NOW SAVED TO YOUR CLIPBOARD
          </div>
        )}

        {/* Global manual footer indicators */}
        <div id="guide-global-footer" className="bg-slate-900 border-t-2 border-slate-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-slate-400 tracking-wider">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-yellow-400 hidden sm:inline" />
            <span>PLAYBOOK PLATFORM OVERVIEW · DESIGNED TO AID COMPLIANCE AND EDUCATION PREPARATION</span>
          </div>
          <button
            id="close-guide-btn-footer"
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-950 py-1.5 px-4 border border-slate-800 hover:border-red-500 uppercase font-black tracking-widest text-slate-300 hover:text-red-400 inline-block text-center mt-2 sm:mt-0 cursor-pointer"
          >
            Dismiss Guide
          </button>
          <div className="text-slate-500 hidden lg:block">
            PRESS <kbd className="bg-slate-800 text-slate-300 px-1 rounded font-bold">ctrl</kbd>/<kbd className="bg-slate-800 text-slate-300 px-1 rounded font-bold">cmd</kbd> + <kbd className="bg-slate-800 text-slate-300 px-1 rounded font-bold">/</kbd> TO TOGGLE MANUALLY
          </div>
        </div>

      </div>
    </div>
  );
}
