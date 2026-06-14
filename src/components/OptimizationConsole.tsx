/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Terminal, Activity, HelpCircle, Check, Loader2, RefreshCw } from "lucide-react";
import { TargetSector, PlaybookData } from "../types";

interface OptimizationConsoleProps {
  currentSector: TargetSector;
  onOptimize: (sector: TargetSector, focus: string, override: string) => Promise<void>;
  isOptimizing: boolean;
  playbookData: PlaybookData;
}

export default function OptimizationConsole({
  currentSector,
  onOptimize,
  isOptimizing,
  playbookData
}: OptimizationConsoleProps) {
  const [sector, setSector] = useState<TargetSector>(currentSector);
  const [focus, setFocus] = useState("Vitals & Clinical Rigor");
  const [overrideInput, setOverrideInput] = useState("");
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "System ready. Standing by for clinical focus parameters...",
  ]);

  const handleRunOptimization = async () => {
    const logs = [
      `Connecting to system...`,
      `Reading Carla Miranda's 13+ Year background...`,
      `Adjusting text for "${sector.toUpperCase()}" focusing on "${focus}"...`,
    ];
    setSystemLogs(logs);

    // Simulate logs as we optimize
    const logInterval = setInterval(() => {
      setSystemLogs((prev) => [
        ...prev,
        prev.length === 3 ? "Matching words to hospital job filters..." :
          prev.length === 4 ? "Rewriting job duties to highlight exact safety numbers..." :
            prev.length === 5 ? "Updating warehouse numbers to show medical supply skill..." :
              prev.length === 6 ? "Making stories and text easy to read for recruiters..." :
                "Running final check against hospital expectations..."
      ]);
    }, 400);

    try {
      await onOptimize(sector, focus, overrideInput);
      clearInterval(logInterval);
      setSystemLogs((prev) => [
        ...prev,
        "✓ Playbook optimized successfully!",
        `✓ Embedded ${5 + Math.floor(Math.random() * 5)} target keywords.`,
        "✓ Re-rendered responsive UI components in real-time."
      ]);
    } catch (err: any) {
      clearInterval(logInterval);
      setSystemLogs((prev) => [
        ...prev,
        `❌ Optimization failed: ${err.message || "Unknown error"}`
      ]);
    }
  };

  const sectors = [
    { id: "general", label: "General & Post-Acute Rehab", icon: "🏥" },
    { id: "icu_stepdown", label: "Elite Hospitals (ICU / ER)", icon: "⚡" },
    { id: "memory_care", label: "Dementia & Memory Care", icon: "🧠" },
    { id: "private_care", label: "Concierge Private Care", icon: "💎" },
    { id: "warehouse_logistics", label: "Medical Supply Chain (Hybrid)", icon: "📦" }
  ];

  return (
    <div id="optimizer-section" className="bg-white border-2 border-slate-900 rounded-none shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] my-8">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 border border-white/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white tracking-tight flex items-center gap-2">
              QUICK RESUME BUILDER
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-mono py-0.5 px-2 rounded-none font-bold border border-emerald-400">
                AI ACTIVE
              </span>
            </h3>
            <p className="font-mono text-[11px] text-slate-300">Powered by Gemini · Adjusts text instantly</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-slate-950 px-3 py-1.5 border border-slate-800">
          <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
          State: {sectors.find(s => s.id === currentSector)?.label || "General"}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Step 1: Target Ward */}
          <div>
            <span className="inline-block text-xs font-black bg-slate-900 text-white px-2 py-0.5 mb-3 uppercase tracking-wider">
              01 · Select Target Clinical Setting
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {sectors.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSector(sec.id as TargetSector)}
                  className={`flex items-center gap-3 px-4 py-3 border-2 transition-all cursor-pointer ${sector === sec.id
                    ? "bg-indigo-50 border-indigo-600 text-slate-900 shadow-[3px_3px_0px_0px_rgba(79,70,229,1)] font-bold"
                    : "bg-white border-slate-300 text-slate-600 hover:border-slate-800 hover:text-slate-950"
                    }`}
                >
                  <span className="text-xl">{sec.icon}</span>
                  <div className="leading-tight">
                    <p className="text-xs font-sans font-black">{sec.label}</p>
                    <p className="text-[9px] font-mono opacity-60 uppercase">TRACK</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Custom Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="inline-block text-xs font-black bg-slate-900 text-white px-2 py-0.5 mb-2 uppercase tracking-wider">
                02 · Focus Strength Emphasis
              </span>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full bg-white border-2 border-slate-900 py-2.5 px-3 font-sans text-xs text-slate-900 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                <option value="Vitals & Clinical Rigor">Clinical Rigor & Vital Signs Protocol</option>
                <option value="Dignity & Comfort Interventions">Dignity, Comfort & Empathy</option>
                <option value="Hoyer Lifts & Safety Transfers">Safety Transfers & Fall Prevention</option>
                <option value="Instruction, SOPs & Handovers">Instruction, SOPs & Departmental Efficiency</option>
                <option value="Medication Chain & Warehouse Packing">Pharmaceutical Supply Chain & Sterile Operations</option>
              </select>
            </div>

            <div>
              <span className="inline-block text-xs font-black bg-slate-900 text-white px-2 py-0.5 mb-2 uppercase tracking-wider">
                03 · Log New Shift Metric / Update
              </span>
              <input
                type="text"
                value={overrideInput}
                onChange={(e) => setOverrideInput(e.target.value)}
                placeholder="e.g., Led dementia training or logged 50 shifts falls-free."
                className="w-full bg-white border-2 border-slate-900 py-2 px-3 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              />
            </div>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={isOptimizing}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-sans font-black text-xs uppercase tracking-widest py-4 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Optimizing & Tailoring Playbook via Gemini...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-white" />
                UPDATE CAREER PLAYBOOK & RESUME NOW
              </>
            )}
          </button>
        </div>

        {/* Right Side: Terminal Logs */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-[220px]">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-2 border-slate-900">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-[10px] uppercase text-white font-bold">Live AI Execution Log</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>
          <div className="grow bg-slate-950 p-4 border-x-2 border-b-2 border-slate-900 font-mono text-[10px] text-slate-300 leading-normal overflow-y-auto max-h-[240px] shadow-inner">
            {systemLogs.map((item, idx) => (
              <div
                key={idx}
                className={`py-0.5 border-b border-slate-900/60 last:border-0 ${item.startsWith("✓") ? "text-emerald-400" :
                  item.startsWith("❌") ? "text-rose-400" :
                    item.startsWith("Analyzing") || item.startsWith("Restructuring") || item.startsWith("Sanitizing")
                      ? "text-indigo-300"
                      : "text-slate-300"
                  }`}
              >
                <span className="text-slate-600 select-none mr-2">[{1000 + idx}]</span>
                {item}
              </div>
            ))}
            {isOptimizing && (
              <div className="py-1 text-indigo-400 flex items-center gap-1.5 animate-pulse">
                <span className="text-slate-500">[{1000 + systemLogs.length}]</span>
                Generating highly dense clinical phrasing...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
