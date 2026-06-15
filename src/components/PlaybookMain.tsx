import React, { useState } from "react";
import SalaryDashboard from "./SalaryDashboard";
import JobBoard from "./JobBoard";
import WageNegotiator from "./WageNegotiator";
import InterviewSimulator from "./InterviewSimulator";
import AspiringPortal from "./AspiringPortal";
import WorkingPortal from "./WorkingPortal";
import RecruiterPortal from "./RecruiterPortal";
import { MessageSquare, Landmark, Award, ShieldAlert, Users, GraduationCap, Zap } from "lucide-react";

export default function PlaybookMain() {
  const [activePersonaTab, setActivePersonaTab] = useState<"aspiring" | "working" | "employer" | "interview">("aspiring");

  return (
    <div className="space-y-8 py-3">
      {/* Title block banner */}
      <div className="border-4 border-slate-900 bg-white p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[8.5px] font-black uppercase text-indigo-700 tracking-wider bg-indigo-50 px-2 py-0.5 border border-indigo-200">
            COMPENSATION & INTERVIEW REHEARSAL LAB
          </span>
          <h2 className="font-display font-black text-xl uppercase text-slate-950 mt-1.5 font-sans">
            Playbook, Wages & Simulation Center
          </h2>
          <p className="font-sans text-slate-600 text-xs font-semibold leading-relaxed mt-0.5">
            Gauge realistic market salary rates in Georgia healthcare networks, analyze high-value certifications, and practice real regulatory interview responses.
          </p>
        </div>
      </div>

      {/* Role-Specific Navigation Tabs */}
      <div className="flex flex-wrap border-b-4 border-slate-900 bg-white shadow-xs">
        <button
          onClick={() => setActivePersonaTab("aspiring")}
          className={`flex-1 min-w-[150px] font-mono text-xs font-black uppercase py-4 px-3 text-center transition-all cursor-pointer border-r-2 border-slate-900 ${
            activePersonaTab === "aspiring"
              ? "bg-[#faf8fc] text-indigo-900 border-b-4 border-b-indigo-650"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <GraduationCap className="w-4 h-4" /> 1. Aspiring CNA Hub
          </span>
        </button>

        <button
          onClick={() => setActivePersonaTab("working")}
          className={`flex-1 min-w-[150px] font-mono text-xs font-black uppercase py-4 px-3 text-center transition-all cursor-pointer border-r-2 border-slate-900 ${
            activePersonaTab === "working"
              ? "bg-[#faf8fc] text-indigo-900 border-b-4 border-b-indigo-650"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Zap className="w-4 h-4" /> 2. Salary Growth Center
          </span>
        </button>

        <button
          onClick={() => setActivePersonaTab("employer")}
          className={`flex-1 min-w-[150px] font-mono text-xs font-black uppercase py-4 px-3 text-center transition-all cursor-pointer border-r-2 border-slate-900 ${
            activePersonaTab === "employer"
              ? "bg-[#faf8fc] text-indigo-900 border-b-4 border-b-indigo-650"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Users className="w-4 h-4" /> 3. Employer Registry Commands
          </span>
        </button>

        <button
          onClick={() => setActivePersonaTab("interview")}
          className={`flex-1 min-w-[150px] font-mono text-xs font-black uppercase py-4 px-3 text-center transition-all cursor-pointer ${
            activePersonaTab === "interview"
              ? "bg-[#faf8fc] text-indigo-900 border-b-4 border-b-indigo-650"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <MessageSquare className="w-4 h-4" /> 4. Interview Rehearsal Lab
          </span>
        </button>
      </div>

      {/* Render Selected tab flow */}
      <div className="space-y-6">
        {activePersonaTab === "aspiring" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <AspiringPortal />
          </div>
        )}

        {activePersonaTab === "working" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <WorkingPortal />
            
            {/* Standard Georgia Specific Salary & Job Board search */}
            <div className="border-t-4 border-slate-900 pt-6 space-y-6">
              <div className="bg-slate-50 border-2 border-slate-900 p-4">
                <h4 className="font-display font-black text-slate-950 uppercase text-xs">Georgia Integrated Job Searching Engine</h4>
                <p className="font-sans text-slate-600 text-[11px] font-medium leading-relaxed mt-1">
                  Connect live with active healthcare job postings across the Atlanta metro region verified with Google Search Grounding.
                </p>
              </div>
              <SalaryDashboard />
              <JobBoard />
              <WageNegotiator />
            </div>
          </div>
        )}

        {activePersonaTab === "employer" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <RecruiterPortal />
          </div>
        )}

        {activePersonaTab === "interview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <InterviewSimulator />
          </div>
        )}
      </div>
    </div>
  );
}
