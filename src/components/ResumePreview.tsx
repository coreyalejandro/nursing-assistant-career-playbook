import React from "react";
import { usePlaybook } from "../lib/resumeState";
import { FACILITY_SKILL_ALIGNMENTS } from "../lib/constants";
import { Mail, Phone, MapPin, Award, Star, Compass, ShieldCheck, Heart } from "lucide-react";

interface ResumePreviewProps {
  template: "clinical" | "modern";
}

export default function ResumePreview({ template }: ResumePreviewProps) {
  const { state } = usePlaybook();
  const { resume, selectedFacilityType } = state;

  const currentAlignedSkills = FACILITY_SKILL_ALIGNMENTS[selectedFacilityType] || [];

  const isHighlighted = (skillName: string) => {
    return currentAlignedSkills.some(
      (s) => s.toLowerCase() === skillName.toLowerCase()
    );
  };

  // Reorder skills so that highlighted ones bubble up to the top of the array
  const sortedSkills = [...resume.clinicalSkills].sort((a, b) => {
    const aHigh = isHighlighted(a) ? 1 : 0;
    const bHigh = isHighlighted(b) ? 1 : 0;
    return bHigh - aHigh;
  });

  return (
    <div
      id="ats-printable-cv"
      className={`border-2 border-slate-900 bg-white p-6 sm:p-8 font-sans h-full transition-all ${
        template === "modern" ? "shadow-[6px_6px_0px_0px_rgba(79,70,229,1)]" : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
      }`}
    >
      {/* 1. Header block */}
      <div
        className={`border-b-2 border-slate-950 pb-5 mb-5 ${
          template === "modern" ? "text-slate-950" : "text-slate-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5">
          <h2 className="font-display font-black text-2xl tracking-tight uppercase leading-none">
            {resume.personalInfo.fullName || "[Your Name]"}
          </h2>
          <span className="font-mono text-[9px] font-extrabold text-slate-500 tracking-widest uppercase">
            {selectedFacilityType !== "General"
              ? `${selectedFacilityType} Tailored CV`
              : "Certified Nursing Assistant"}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 font-mono text-[10px] text-slate-600 font-bold">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{resume.personalInfo.cityState || "[Your City, State]"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{resume.personalInfo.email || "[Your Email]"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{resume.personalInfo.phone || "[Your Phone]"}</span>
          </div>
        </div>
      </div>

      {/* 2. Professional Summary */}
      <div className="mb-6 space-y-1.5">
        <h3 className="font-mono text-[10px] font-black uppercase text-indigo-700 tracking-wider">
          Professional Profile
        </h3>
        <p className="text-[12px] leading-relaxed text-slate-700 font-medium">
          {resume.personalInfo.professionalSummary || "[Write summary above]"}
        </p>
      </div>

      {/* 3. Skills Check Grid */}
      <div className="mb-6 space-y-2">
        <h3 className="font-mono text-[10px] font-black uppercase text-indigo-700 tracking-wider">
          Clinical Specialty Capabilities
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sortedSkills.map((sk) => {
            const hasFocus = isHighlighted(sk);
            return (
              <div
                key={sk}
                className={`p-2 border font-mono text-[10.5px] font-bold flex items-center justify-between ${
                  hasFocus
                    ? "bg-indigo-50 border-indigo-400 text-indigo-950"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <span>{sk}</span>
                {hasFocus ? (
                  <Star className="w-3 h-3 text-indigo-600 fill-indigo-600 shrink-0" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Certifications & Board Licensure */}
      <div className="mb-6 space-y-2.5">
        <h3 className="font-mono text-[10px] font-black uppercase text-indigo-700 tracking-wider">
          Board Credentials & Licensure
        </h3>
        <div className="space-y-2 text-xs">
          {resume.certifications.map((c) => (
            <div
              key={c.id}
              className="flex justify-between items-start border-l-2 border-slate-900 pl-3 leading-tight"
            >
              <div>
                <span className="font-bold text-slate-950 text-[12px] uppercase block">
                  {c.name || "[Add License Name]"}
                </span>
                <span className="font-mono text-[10px] text-slate-500 font-bold block mt-0.5">
                  ID: {c.licenseNumber || "N/A"} · {c.state || "N/A"}
                </span>
              </div>
              <div className="text-right font-mono text-[9px] text-slate-500 font-bold select-none">
                Valid: {c.issueDate || "N/A"} to {c.expirationDate || "Active"}
              </div>
            </div>
          ))}

          {resume.cprDetails.provider && (
            <div className="flex justify-between items-start border-l-2 border-amber-500 pl-3 leading-tight">
              <div>
                <span className="font-bold text-slate-900 text-[12px] uppercase block">
                  {resume.cprDetails.provider}
                </span>
                <span className="font-mono text-[10px] text-slate-500 font-bold block mt-0.5">
                  CPR / Basic Life Support (BLS) Certified
                </span>
              </div>
              <div className="text-right font-mono text-[9px] text-slate-400 font-bold">
                Exp: {resume.cprDetails.expirationDate || "N/A"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Career Experience History */}
      <div className="mb-6 space-y-4">
        <h3 className="font-mono text-[10px] font-black uppercase text-indigo-700 tracking-wider">
          Employment & Clinical Experience
        </h3>
        <div className="space-y-4">
          {resume.workHistory.map((work) => (
            <div key={work.id} className="space-y-1.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between leading-none">
                <div>
                  <span className="font-bold text-slate-950 uppercase text-[12px]">
                    {work.employer || "[Add Company Name]"}
                  </span>
                  <span className="font-mono text-[9px] font-extrabold text-slate-500 uppercase ml-2 select-none">
                    ({work.facilityType})
                  </span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 font-bold">
                  {work.dates || "Present"}
                </div>
              </div>

              <p className="text-[11.5px] leading-relaxed text-slate-600 font-medium font-sans">
                {work.responsibilities || "[Responsibilities description]"}
              </p>

              {work.quantifiedOutcome && (
                <div className="bg-emerald-50 border-l-2 border-emerald-500 p-2 font-sans text-[11px] font-medium text-emerald-950 flex items-start gap-1.5 leading-snug">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[10px] text-emerald-900 uppercase">
                      Safety Outcomes Achievements:{" "}
                    </span>
                    {work.quantifiedOutcome}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Physical Capabilities, Languages & Shift Availability mini table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mb-6 text-xs text-slate-700">
        <div className="space-y-3">
          <div>
            <h4 className="font-mono text-[9px] font-black uppercase text-indigo-700 tracking-wider mb-1.5">
              Physical & Language Spoken
            </h4>
            <div className="space-y-1 leading-relaxed">
              <p className="font-sans font-medium text-[11px]">
                <strong className="font-bold text-slate-900">Occupational limits:</strong>{" "}
                {resume.physicalCapabilities.join(", ") || "None specified"}
              </p>
              <p className="font-sans font-medium text-[11px]">
                <strong className="font-bold text-slate-900">Languages:</strong>{" "}
                {resume.languages
                  .map((l) => `${l.language} (${l.proficiency})`)
                  .join(", ") || "None"}
              </p>
            </div>
          </div>
        </div>

        {/* Shift Availability summary */}
        <div>
          <h4 className="font-mono text-[9px] font-black uppercase text-indigo-700 tracking-wider mb-1.5">
            Shift Availability Summary
          </h4>
          <div className="flex flex-wrap gap-1">
            {Object.entries(resume.availability).map(([day, shifts]) => {
              const shiftsArray = shifts as string[];
              if (shiftsArray.length === 0) return null;
              return (
                <div
                  key={day}
                  className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-none font-mono text-[8px] font-extrabold text-slate-650 flex flex-col items-center"
                >
                  <span className="text-[7.5px] uppercase text-indigo-650 font-black">{day.slice(0, 3)}</span>
                  <span>{shiftsArray.join(", ")}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Clinical References */}
      {resume.references.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <h3 className="font-mono text-[10px] font-black uppercase text-indigo-700 tracking-wider mb-2">
            Professional Referrals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            {resume.references.map((r) => (
              <div key={r.id} className="leading-tight text-[11px] font-medium text-slate-600">
                <p className="font-bold text-slate-900 uppercase">{r.name}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {r.title} &mdash; <span className="font-bold">{r.facility}</span> ({r.relationship})
                </p>
                <p className="text-[10px] font-mono font-bold mt-1 text-indigo-650">
                  Ph: {r.phone} · Em: {r.email}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
