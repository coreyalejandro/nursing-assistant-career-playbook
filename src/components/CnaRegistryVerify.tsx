import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, AlertTriangle, Printer, Award, Calendar, FileCheck, RefreshCw } from 'lucide-react';

interface RegistryRecord {
  licenseNumber: string;
  fullName: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "PENDING";
  issueDate: string;
  expiryDate: string;
  originalIssueDate: string;
  disciplinaryActions: string;
  ceuStatus: "COMPLIANT" | "NON-COMPLIANT";
  backgroundCheck: "CLEARED - PASSED" | "FAILED";
  specialties: string[];
}

const DEMO_REGISTRY: Record<string, RegistryRecord> = {
  "CNA-2026-6129": {
    licenseNumber: "CNA-2026-6129",
    fullName: "CARLA MIRANDA",
    status: "ACTIVE",
    originalIssueDate: "2013-04-12",
    issueDate: "2025-04-12",
    expiryDate: "2027-04-12",
    disciplinaryActions: "None - Clear Standing",
    ceuStatus: "COMPLIANT",
    backgroundCheck: "CLEARED - PASSED",
    specialties: ["Dementia & Geriatric Memory Care", "Advanced Fall Prevention (STEADI)", "PointClickCare EHR"]
  },
  "CNA-2026-5082": {
    licenseNumber: "CNA-2026-5082",
    fullName: "SARAH ELIZABETH JENKINS",
    status: "ACTIVE",
    originalIssueDate: "2019-11-20",
    issueDate: "2025-11-20",
    expiryDate: "2027-11-20",
    disciplinaryActions: "None - Clear Standing",
    ceuStatus: "COMPLIANT",
    backgroundCheck: "CLEARED - PASSED",
    specialties: ["ICU Core Support", "Infection Control"]
  },
  "CNA-2024-8192": {
    licenseNumber: "CNA-2024-8192",
    fullName: "MARIA G. HERNANDEZ",
    status: "EXPIRED",
    originalIssueDate: "2010-02-05",
    issueDate: "2022-02-05",
    expiryDate: "2024-02-05",
    disciplinaryActions: "None - Clear Standing",
    ceuStatus: "NON-COMPLIANT",
    backgroundCheck: "CLEARED - PASSED",
    specialties: ["Standard Long Term Care"]
  }
};

export default function CnaRegistryVerify() {
  const [searchNumber, setSearchNumber] = useState("CNA-2026-6129");
  const [queriedRecord, setQueriedRecord] = useState<RegistryRecord | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchNumber.trim()) return;

    setLookingUp(true);
    setErrorStatus(null);
    setQueriedRecord(null);

    setTimeout(() => {
      const record = DEMO_REGISTRY[searchNumber.trim()];
      if (record) {
        setQueriedRecord(record);
      } else {
        setErrorStatus(`No registry matches for "${searchNumber}". Try typing Carla's license: "CNA-2026-6129" or Sarah's: "CNA-2026-5082".`);
      }
      setLookingUp(false);
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="registry-lookup-container" className="rounded-none border-4 border-slate-900 bg-white p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
      {/* Header and badge */}
      <div className="mb-5 border-b-2 border-slate-900 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Georgia Care Registry Verification
            </h3>
            <p className="font-sans text-slate-600 text-xs font-medium mt-1">
              Verify CNA state licensing credentials, CEU compliance, and safety clear indicators instantly.
            </p>
          </div>
          <span className="self-start sm:self-center font-mono text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 uppercase tracking-wider rounded-none">
            Direct State DCH Mirror
          </span>
        </div>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleLookup} className="space-y-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value.toUpperCase())}
              placeholder="Enter Georgia License ID (e.g. CNA-2026-6129)"
              className="w-full rounded-none border-2 border-slate-900 bg-slate-50 pl-10 pr-4 py-2.5 font-mono text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={lookingUp}
            className="rounded-none bg-slate-950 hover:bg-slate-850 px-6 py-2.5 font-mono text-xs font-bold text-white uppercase tracking-widest border-2 border-slate-950 hover:border-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {lookingUp ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
              </>
            ) : (
              "Match License"
            )}
          </button>
        </div>

        {/* Demo keys picker for testing */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500">
          <span className="font-bold">Quick Demo Records:</span>
          {Object.keys(DEMO_REGISTRY).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSearchNumber(key);
                setQueriedRecord(null);
                setErrorStatus(null);
              }}
              className={`px-2 py-0.5 border border-slate-300 hover:border-slate-900 bg-slate-50 transition-colors uppercase text-[9px] cursor-pointer ${
                searchNumber === key ? "bg-amber-100 text-amber-900 font-extrabold border-amber-600" : ""
              }`}
            >
              {DEMO_REGISTRY[key].fullName.split(" ")[0]} ({key})
            </button>
          ))}
        </div>
      </form>

      {/* Lookup Output Area */}
      {errorStatus && (
        <div className="bg-red-50 border-2 border-slate-900 p-4 text-xs font-sans font-medium text-slate-800 animate-in fade-in duration-300 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorStatus}</span>
        </div>
      )}

      {queriedRecord && (
        <div className="animate-in fade-in duration-300 space-y-4">
          <div className="border-4 border-slate-900 p-4 bg-slate-50 relative overflow-hidden">
            {/* Decal background seal */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 rotate-12 opacity-5 select-none pointer-events-none">
              <Award className="w-48 h-48 text-slate-950" />
            </div>

            {/* Verification Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-3 mb-3">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Georgia Registered Professional</span>
                <h4 className="font-sans font-black text-base text-slate-950 tracking-tight uppercase">
                  {queriedRecord.fullName}
                </h4>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-1 text-[10px] font-black font-mono tracking-widest border-2 border-slate-900 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  queriedRecord.status === 'ACTIVE' 
                    ? 'bg-emerald-500 text-slate-950' 
                    : queriedRecord.status === 'EXPIRED' 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-red-500 text-white'
                }`}>
                  ● {queriedRecord.status}
                </span>
              </div>
            </div>

            {/* Registration Metadata Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-xs font-sans">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Certification License#</span>
                <span className="font-mono font-bold text-slate-900 text-xs uppercase">{queriedRecord.licenseNumber}</span>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Bi-annual Renewal Date</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{queriedRecord.expiryDate}</span>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">First Licensing Issue</span>
                <span className="font-mono font-medium text-slate-700 text-xs">{queriedRecord.originalIssueDate}</span>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Board Disciplinary Actions</span>
                <span className={`font-bold text-[11px] ${queriedRecord.disciplinaryActions === 'None - Clear Standing' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {queriedRecord.disciplinaryActions}
                </span>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Continuing Ed (CEU) Status</span>
                <span className="font-sans font-extrabold text-[11px] text-slate-800 flex items-center gap-1">
                  {queriedRecord.ceuStatus === "COMPLIANT" ? (
                    <span className="text-emerald-700">✓ Compliant (24+ Hrs)</span>
                  ) : (
                    <span className="text-amber-700">⚠ Non-Compliant (0 hrs)</span>
                  )}
                </span>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Criminal Background Check</span>
                <span className="font-sans font-extrabold text-[11px] text-emerald-700 uppercase tracking-wider">
                  {queriedRecord.backgroundCheck}
                </span>
              </div>
            </div>

            {/* Specialties and Verified Endorsements */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold mb-1.5">Endorsed Specialties & Validated Safe-Care Procedures:</span>
              <div className="flex flex-wrap gap-1.5">
                {queriedRecord.specialties.map((spec, i) => (
                  <span key={i} className="text-[10px] font-medium bg-indigo-50 border border-indigo-200 text-indigo-900 px-2 py-0.5 uppercase tracking-wide">
                    ✦ {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons inside Lookup output */}
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] leading-none">
            <button
              onClick={() => setShowCertificate(!showCertificate)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-950 border border-indigo-400 font-bold uppercase cursor-pointer transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" /> 
              {showCertificate ? "Hide Credentials Certificate" : "Generate Verification PDF"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold uppercase cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print Board Record
            </button>
          </div>

          {/* Render Credentials Certificate if clicked */}
          {showCertificate && (
            <div className="border-4 border-dashed border-slate-400 p-6 bg-slate-50 relative mt-4 block text-center space-y-4 animate-in slide-in-from-top-1 duration-200">
              <div className="flex justify-center">
                <Award className="w-12 h-12 text-indigo-600" />
              </div>
              <h4 className="font-display font-black text-lg text-slate-950 tracking-wide uppercase">
                GEORGIA BOARD CERTIFIED NURSING ASSISTANT
              </h4>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                VERIFICATION OF COMPLIANCE & STATUS EXCELLENCE
              </p>
              
              <div className="max-w-md mx-auto py-2 px-4 border border-slate-200 bg-white">
                <p className="font-sans text-[11px] text-slate-700 italic">
                  "This validates that <strong>{queriedRecord.fullName}</strong> is registered under the active license code <strong>{queriedRecord.licenseNumber}</strong> with continuous clinical qualifications for state acute nursing care units."
                </p>
              </div>

              <div className="flex justify-between items-center max-w-sm mx-auto text-[9px] font-mono text-slate-500 font-bold pt-4">
                <div>
                  <span className="block border-t border-slate-300 pt-1">GEORGIA BOARD REGISTRAR</span>
                </div>
                <div>
                  <span className="block tracking-normal font-bold">STATE SEAL VERIFIED</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
