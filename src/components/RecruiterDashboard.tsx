import React, { useState } from 'react';
import { Users, Filter, Download, ShieldCheck, Mail, Phone, Award, Search, TrendingUp, AlertCircle, Sparkles, ServerCrash } from 'lucide-react';

interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  registryStatus: "ACTIVE" | "EXPIRED" | "PENDING";
  certifiedSpecialties: string[];
  hireabilityScore: number;
  fallRateReduction: string;
  logTrackingConsistency: string;
}

const DEMO_CANDIDATES: CandidateProfile[] = [
  {
    id: "cand-001",
    name: "Carla Miranda",
    email: "carla.miranda12222@gmail.com",
    phone: "470-563-0128",
    experienceYears: 13,
    registryStatus: "ACTIVE",
    certifiedSpecialties: ["Dementia & Memory Care", "Safety Transfer Gait Support", "Electronic Health Records (EHR)"],
    hireabilityScore: 95,
    fallRateReduction: "Reduced evening fall rate by 15% using CDC STEADI program",
    logTrackingConsistency: "99% electronic chart completion across shifts"
  },
  {
    id: "cand-002",
    name: "Sarah Elizabeth Jenkins",
    email: "sjenks@careconnect.org",
    phone: "404-511-9238",
    experienceYears: 6,
    registryStatus: "ACTIVE",
    certifiedSpecialties: ["Infection Control", "ICU Core Support"],
    hireabilityScore: 88,
    fallRateReduction: "Reduced medical-surgical fall frequency by 8% (2 years validated)",
    logTrackingConsistency: "95% EHR consistency"
  },
  {
    id: "cand-003",
    name: "Maria G. Hernandez",
    email: "maria.hernandez@hotmail.com",
    phone: "770-859-1092",
    experienceYears: 11,
    registryStatus: "EXPIRED",
    certifiedSpecialties: ["Hospice Support", "Post-op transfers"],
    hireabilityScore: 72,
    fallRateReduction: "No recorded patient slippage across 6 years of night shifts",
    logTrackingConsistency: "Standard paper charting fluent, EHR transition incomplete"
  }
];

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>(DEMO_CANDIDATES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("All");

  const handleExportCsv = () => {
    // Standard CSV headers and row generation
    const headers = "id,name,email,phone,experienceYears,registryStatus,specialties,hireabilityScore,fallRateReduction\n";
    const rows = candidates
      .filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || c.registryStatus === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .map(c => 
        `"${c.id}","${c.name}","${c.email}","${c.phone}",${c.experienceYears},"${c.registryStatus}","${c.certifiedSpecialties.join(' | ')}",${c.hireabilityScore},"${c.fallRateReduction}"`
      ).join('\n');

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `GA_CNA_Candidates_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique specialties getter
  const availableSpecialties = Array.from(
    new Set(candidates.flatMap(c => c.certifiedSpecialties))
  );

  // Computed visual metrics
  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(search.toLowerCase()) ||
                          cand.certifiedSpecialties.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "All" || cand.registryStatus === statusFilter;
    const matchesSpecialty = specialtyFilter === "All" || cand.certifiedSpecialties.includes(specialtyFilter);

    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  return (
    <div id="recruiter-dashboard" className="rounded-none border-4 border-slate-900 bg-white p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
      {/* Header and status indicators */}
      <div className="mb-5 border-b-2 border-slate-900 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5ClassName">
              <Users className="w-5 h-5 text-indigo-600" /> Employer Pipeline Dashboard
            </h3>
            <p className="font-sans text-slate-600 text-xs font-medium mt-1">
              Active Talent Acquisition portal. Explore credentialed Certified Nursing Assistants in the Atlanta Metro area.
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="self-start sm:self-center font-mono text-xs font-black uppercase tracking-wider text-slate-950 bg-slate-100 hover:bg-slate-200 px-4 py-2 flex items-center gap-1.5 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none cursor-pointer transition-all shrink-0"
          >
            <Download className="w-4 h-4" /> Export CSV List
          </button>
        </div>
      </div>

      {/* Predictive hireability guide callout */}
      <div className="bg-indigo-50 border-2 border-indigo-400 p-4 mb-5 text-xs font-sans text-slate-800 leading-relaxed rounded-none">
        <h4 className="font-mono font-black text-[10px] text-indigo-700 uppercase tracking-wider flex items-center gap-1 md:gap-1.5 mb-1">
          <Sparkles className="w-4 h-4 text-indigo-600 animate-spin-slow" /> Predictive Hireability & Safety Scoring Index
        </h4>
        <p className="font-medium">
          Our scoring engine grades candidates from 0 to 100 based on verified <strong>Georgia State Registry standings</strong>, validated clinical risk reduction percentages (falls, pressure ulcer control), point-of-care EHR journaling consistency, and completed continuing education credentials.
        </p>
      </div>

      {/* Talent Filters toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 border border-slate-300 mb-5 text-xs font-sans">
        {/* Term search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name or specialty..."
            className="w-full bg-white border border-slate-400 pl-8 pr-3 py-1.5 font-sans text-xs focus:outline-none"
          />
        </div>

        {/* State License status selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9.5px] font-mono font-bold text-slate-450 uppercase shrink-0">State Registry:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-white border border-slate-400 p-1.5 font-mono text-[10px] font-bold"
          >
            <option value="All">All Licenses</option>
            <option value="ACTIVE">ACTIVE ONLY</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        {/* Specialty filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9.5px] font-mono font-bold text-slate-450 uppercase shrink-0">Sought Specialty:</span>
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="flex-1 bg-white border border-slate-400 p-1.5 font-mono text-[10px] font-bold"
          >
            <option value="All">All Specialties</option>
            {availableSpecialties.map((spec, i) => (
              <option key={i} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates output stream cards */}
      <div className="space-y-4">
        {filteredCandidates.map((cand) => (
          <div
            key={cand.id}
            className="border-2 border-slate-900 bg-white p-4 font-sans flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm"
          >
            <div className="space-y-2 flex-1">
              {/* Profile name and registry status */}
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-display font-black text-slate-950 text-base uppercase tracking-tight">
                  {cand.name}
                </h4>
                
                <span className={`px-2 py-0.5 font-mono text-[8.5px] font-bold border rounded-none uppercase ${
                  cand.registryStatus === 'ACTIVE' 
                    ? 'bg-emerald-150 text-emerald-900 border-emerald-300' 
                    : 'bg-red-100 text-red-900 border-red-300'
                }`}>
                  State Registry: {cand.registryStatus}
                </span>

                <span className="font-mono text-[9px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                  {cand.experienceYears} Years Exp
                </span>
              </div>

              {/* Contact metadata */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-medium font-mono leading-none">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {cand.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {cand.phone}</span>
              </div>

              {/* Hard clinical metrics indicators parsed for recruiters */}
              <div className="bg-slate-50 p-3.5 border border-slate-250 rounded-none space-y-1.5 text-xs font-medium">
                <div className="text-slate-700 leading-relaxed font-sans">
                  <strong>Patient Risk Outcome:</strong> {cand.fallRateReduction}
                </div>
                <div className="text-slate-700 leading-relaxed font-sans border-t border-slate-200 pt-1.5">
                  <strong>Logging Quality Check:</strong> {cand.logTrackingConsistency}
                </div>
              </div>

              {/* Specialties block */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cand.certifiedSpecialties.map((spec, i) => (
                  <span key={i} className="text-[9px] font-bold font-mono bg-indigo-50 border border-indigo-200 text-indigo-900 px-2 py-0.5 uppercase tracking-wide">
                    ✦ {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Hireability Score dial widget */}
            <div className="flex flex-row md:flex-col items-center justify-between md:justify-center p-3 bg-slate-900 border border-slate-950 text-white gap-3 shrink-0 text-center w-full md:w-32">
              <div className="text-left md:text-center">
                <span className="block font-mono text-[8px] uppercase tracking-wider text-slate-400 font-black">Hireability Rating</span>
                <span className="font-display text-2xl font-black text-yellow-400 select-none block md:mt-1">{cand.hireabilityScore}<span className="text-xs font-mono font-medium text-slate-400">/100</span></span>
              </div>
              
              <div className="text-right md:text-center w-auto md:w-full">
                <span className="inline-block bg-emerald-500 text-slate-950 text-[8px] font-mono font-black px-2 py-0.5 uppercase">
                  Highly Match
                </span>
                <span className="block text-[8px] text-slate-350 font-sans mt-1 font-medium leading-tight">Registry verified</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
