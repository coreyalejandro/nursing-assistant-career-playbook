import React from "react";
import { usePlaybook } from "../lib/resumeState";
import { SHIFT_AVAILABILITY_DAYS, SHIFT_TYPES } from "../lib/constants";
import { Plus, Trash2, ShieldCheck, Mail, Phone, MapPin, Briefcase, User, Award, ListPlus, Flame, Heart, FileCode2 } from "lucide-react";

export default function ResumeForm() {
  const { state, dispatch } = usePlaybook();
  const { resume } = state;

  const updatePersonal = (field: string, value: any) => {
    dispatch({ type: "UPDATE_PERSONAL_INFO", payload: { [field]: value } });
  };

  const updateCPR = (field: string, value: any) => {
    dispatch({ type: "UPDATE_CPR", payload: { [field]: value } });
  };

  // repeatable certifications
  const handleAddCert = () => {
    const updated = [
      ...resume.certifications,
      {
        id: `cert-${Date.now()}`,
        name: "",
        licenseNumber: "",
        state: "",
        issueDate: "",
        expirationDate: ""
      }
    ];
    dispatch({ type: "UPDATE_CERTIFICATIONS", payload: updated });
  };

  const handleUpdateCert = (index: number, field: string, value: string) => {
    const updated = [...resume.certifications];
    updated[index] = { ...updated[index], [field]: value };
    dispatch({ type: "UPDATE_CERTIFICATIONS", payload: updated });
  };

  const handleRemoveCert = (index: number) => {
    const updated = resume.certifications.filter((_, i) => i !== index);
    dispatch({ type: "UPDATE_CERTIFICATIONS", payload: updated });
  };

  // repeatable work history
  const handleAddWork = () => {
    const updated = [
      ...resume.workHistory,
      {
        id: `work-${Date.now()}`,
        employer: "",
        facilityType: "General",
        dates: "",
        shiftPattern: ["Days"],
        responsibilities: "",
        quantifiedOutcome: ""
      }
    ];
    dispatch({ type: "UPDATE_WORK_HISTORY", payload: updated });
  };

  const handleUpdateWork = (index: number, field: string, value: any) => {
    const updated = [...resume.workHistory];
    updated[index] = { ...updated[index], [field]: value };
    dispatch({ type: "UPDATE_WORK_HISTORY", payload: updated });
  };

  const handleWorkShiftToggle = (workIdx: number, shiftType: string) => {
    const work = resume.workHistory[workIdx];
    const isChecked = work.shiftPattern.includes(shiftType);
    const updatedPattern = isChecked
      ? work.shiftPattern.filter((s) => s !== shiftType)
      : [...work.shiftPattern, shiftType];
    handleUpdateWork(workIdx, "shiftPattern", updatedPattern);
  };

  const handleRemoveWork = (index: number) => {
    const updated = resume.workHistory.filter((_, i) => i !== index);
    dispatch({ type: "UPDATE_WORK_HISTORY", payload: updated });
  };

  // skill checklist
  const skillsList = [
    "Vital Signs",
    "Wound Care",
    "Hoyer Lift",
    "Transfer Assistance",
    "Dementia Care",
    "Medication Reminders",
    "Feeding Assistance",
    "Incontinence Care",
    "Infection Control",
    "EHR Documentation",
    "PointClickCare",
    "Epic Charting"
  ];

  const handleToggleSkill = (skill: string) => {
    const updated = resume.clinicalSkills.includes(skill)
      ? resume.clinicalSkills.filter((s) => s !== skill)
      : [...resume.clinicalSkills, skill];
    dispatch({ type: "UPDATE_CLINICAL_SKILLS", payload: updated });
  };

  // physical capability checklist
  const physicalOptions = [
    "Lift 50+ lbs",
    "Stand 8+ hours",
    "Frequent bending/kneeling",
    "Immune to latex (latex-safe alternative checks)"
  ];

  const handleTogglePhysical = (opt: string) => {
    const updated = resume.physicalCapabilities.includes(opt)
      ? resume.physicalCapabilities.filter((p) => p !== opt)
      : [...resume.physicalCapabilities, opt];
    dispatch({ type: "UPDATE_PHYSICAL_CAPABILITIES", payload: updated });
  };

  // Languages repeatable
  const handleAddLanguage = () => {
    const updated = [
      ...resume.languages,
      { id: `lang-${Date.now()}`, language: "", proficiency: "Conversational" }
    ];
    dispatch({ type: "UPDATE_LANGUAGES", payload: updated });
  };

  const handleUpdateLanguage = (index: number, field: string, value: string) => {
    const updated = [...resume.languages];
    updated[index] = { ...updated[index], [field]: value };
    dispatch({ type: "UPDATE_LANGUAGES", payload: updated });
  };

  const handleRemoveLanguage = (index: number) => {
    const updated = resume.languages.filter((_, i) => i !== index);
    dispatch({ type: "UPDATE_LANGUAGES", payload: updated });
  };

  // Availability
  const handleAvailabilityToggle = (day: string, shift: string) => {
    const dayShifts = resume.availability[day] || [];
    const updatedShifts = dayShifts.includes(shift)
      ? dayShifts.filter((s) => s !== shift)
      : [...dayShifts, shift];

    const updatedAvail = {
      ...resume.availability,
      [day]: updatedShifts
    };
    dispatch({ type: "UPDATE_AVAILABILITY", payload: updatedAvail });
  };

  // References repeatable
  const handleAddReference = () => {
    const updated = [
      ...resume.references,
      {
        id: `ref-${Date.now()}`,
        name: "",
        title: "",
        facility: "",
        phone: "",
        email: "",
        relationship: "Supervisor"
      }
    ];
    dispatch({ type: "UPDATE_REFERENCES", payload: updated });
  };

  const handleUpdateReference = (index: number, field: string, value: string) => {
    const updated = [...resume.references];
    updated[index] = { ...updated[index], [field]: value };
    dispatch({ type: "UPDATE_REFERENCES", payload: updated });
  };

  const handleRemoveReference = (index: number) => {
    const updated = resume.references.filter((_, i) => i !== index);
    dispatch({ type: "UPDATE_REFERENCES", payload: updated });
  };

  return (
    <div className="space-y-6">
      {/* 1. Personal Info */}
      <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-display font-black text-sm uppercase text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-1.5">
          <User className="w-4 h-4 text-indigo-600" /> 1. Personal & Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Full Name</label>
            <input
              type="text"
              value={resume.personalInfo.fullName}
              onChange={(e) => updatePersonal("fullName", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 font-sans text-xs focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
              placeholder="e.g. Carla Miranda"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">City, State</label>
            <input
              type="text"
              value={resume.personalInfo.cityState}
              onChange={(e) => updatePersonal("cityState", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 font-sans text-xs focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
              placeholder="e.g. Atlanta, GA"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Email (Hiring Proxy)</label>
            <input
              type="email"
              value={resume.personalInfo.email}
              onChange={(e) => updatePersonal("email", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 font-mono text-xs focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
              placeholder="e.g. email@provider.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Phone Number (Hiring Proxy)</label>
            <input
              type="text"
              value={resume.personalInfo.phone}
              onChange={(e) => updatePersonal("phone", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 font-mono text-xs focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
              placeholder="e.g. 555-555-5555"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">Professional Summary</label>
              <span className="text-[9px] font-mono text-slate-400 font-bold">
                {resume.personalInfo.professionalSummary.length}/500 Char Limit
              </span>
            </div>
            <textarea
              value={resume.personalInfo.professionalSummary}
              onChange={(e) => updatePersonal("professionalSummary", e.target.value.slice(0, 500))}
              rows={3}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 font-sans text-xs focus:ring-1 focus:ring-slate-900 outline-none rounded-none leading-relaxed"
              placeholder="Write a short summary under 500 characters highlighting care specialties..."
            />
          </div>
        </div>
      </div>

      {/* 2. Certifications */}
      <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h3 className="font-display font-black text-sm uppercase text-slate-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600" /> 2. Certifications & Licenses
          </h3>
          <button
            onClick={handleAddCert}
            className="px-2.5 py-1 bg-slate-900 text-white font-mono text-[9px] font-black uppercase flex items-center gap-1 hover:bg-indigo-600 rounded-none cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add License
          </button>
        </div>

        {resume.certifications.map((cert, idx) => (
          <div key={cert.id} className="bg-slate-50 border border-slate-200 p-3 relative space-y-3">
            <button
              onClick={() => handleRemoveCert(idx)}
              className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 focus:outline-none"
              aria-label="Remove certification"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <span className="font-mono text-[8px] font-extrabold text-indigo-600 uppercase">License Entry #{idx + 1}</span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Certification Name</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => handleUpdateCert(idx, "name", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-sans text-xs focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
                  placeholder="e.g. Certified Nursing Assistant (CNA)"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">License ID #</label>
                <input
                  type="text"
                  value={cert.licenseNumber}
                  onChange={(e) => handleUpdateCert(idx, "licenseNumber", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-mono text-xs focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
                  placeholder="e.g. CNA-GA-9993"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Valid State</label>
                <input
                  type="text"
                  value={cert.state}
                  onChange={(e) => handleUpdateCert(idx, "state", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-sans text-xs focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
                  placeholder="e.g. Georgia"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Issue Date</label>
                  <input
                    type="date"
                    value={cert.issueDate}
                    onChange={(e) => handleUpdateCert(idx, "issueDate", e.target.value)}
                    className="w-full bg-white border border-slate-300 p-1.5 font-mono text-[10px] outline-none rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Expiration Date</label>
                  <input
                    type="date"
                    value={cert.expirationDate}
                    onChange={(e) => handleUpdateCert(idx, "expirationDate", e.target.value)}
                    className="w-full bg-white border border-slate-300 p-1.5 font-mono text-[10px] outline-none rounded-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-slate-50 border border-slate-200 p-3.5 space-y-2.5">
          <span className="font-mono text-[8px] font-extrabold text-[#d97706] uppercase">Core CPR / BLS Credentials</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">CPR Provider</label>
              <input
                type="text"
                value={resume.cprDetails.provider}
                onChange={(e) => updateCPR("provider", e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 font-sans text-xs focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
                placeholder="e.g. American Heart Association AHA"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">CPR Expiration Date</label>
              <input
                type="date"
                value={resume.cprDetails.expirationDate}
                onChange={(e) => updateCPR("expirationDate", e.target.value)}
                className="w-full bg-white border border-slate-300 p-1.5 font-mono text-[10px] outline-none rounded-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Work History */}
      <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h3 className="font-display font-black text-sm uppercase text-slate-900 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-indigo-600" /> 3. Work History
          </h3>
          <button
            onClick={handleAddWork}
            className="px-2.5 py-1 bg-slate-900 text-white font-mono text-[9px] font-black uppercase flex items-center gap-1 hover:bg-indigo-600 rounded-none cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Experience
          </button>
        </div>

        {resume.workHistory.map((work, idx) => (
          <div key={work.id} className="bg-slate-50 border border-slate-200 p-4 relative space-y-3">
            <button
              onClick={() => handleRemoveWork(idx)}
              className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 focus:outline-none"
              aria-label="Remove work experience"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <span className="font-mono text-[8px] font-extrabold text-indigo-650 uppercase">Experience Record #{idx + 1}</span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Employer / Hospital Name</label>
                <input
                  type="text"
                  value={work.employer}
                  onChange={(e) => handleUpdateWork(idx, "employer", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-sans text-xs outline-none rounded-none"
                  placeholder="e.g. Emory Healthcare Network"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Facility Type</label>
                <select
                  value={work.facilityType}
                  onChange={(e) => handleUpdateWork(idx, "facilityType", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-sans text-xs outline-none rounded-none font-bold"
                >
                  <option value="Hospital">Hospital</option>
                  <option value="SNF">Skilled Nursing Facility (SNF)</option>
                  <option value="Assisted Living">Assisted Living</option>
                  <option value="Memory Care">Memory Care</option>
                  <option value="Home Health">Home Health</option>
                  <option value="Private Care">Private Care</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Dates Employed</label>
                <input
                  type="text"
                  value={work.dates}
                  onChange={(e) => handleUpdateWork(idx, "dates", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-sans text-xs outline-none rounded-none"
                  placeholder="e.g. Feb 2024 – Present"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">Shift Pattern</label>
                <div className="flex flex-wrap gap-2">
                  {["Days", "Evenings", "Nights", "Weekends"].map((shift) => {
                    const isChecked = work.shiftPattern.includes(shift);
                    return (
                      <button
                        type="button"
                        key={shift}
                        onClick={() => handleUpdateWork(idx, "shiftPattern", isChecked ? work.shiftPattern.filter(s => s !== shift) : [...work.shiftPattern, shift])}
                        className={`px-1.5 py-0.5 font-mono text-[8px] font-extrabold uppercase border cursor-pointer ${
                          isChecked ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"
                        }`}
                      >
                        {shift}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Key Duties & Clinical Care Actions</label>
              <textarea
                value={work.responsibilities}
                onChange={(e) => handleUpdateWork(idx, "responsibilities", e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-300 p-2 font-sans text-xs outline-none rounded-none leading-relaxed"
                placeholder="Log physical ADL, transfers, vitals tracking, and nurse assistance routines..."
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-2.5">
              <label className="block text-[9px] font-mono font-bold uppercase text-emerald-800 mb-0.5">
                Quantified Fall / Quality Safety Outcome (Mandatory Metrics)
              </label>
              <textarea
                value={work.quantifiedOutcome}
                onChange={(e) => handleUpdateWork(idx, "quantifiedOutcome", e.target.value)}
                rows={2}
                className="w-full bg-white border border-emerald-300 p-2 font-sans text-xs outline-none rounded-none text-emerald-950 focus:border-emerald-500"
                placeholder="e.g. Reduced patient falls count by 15% through meticulous daily check cycles of bed and room sensors..."
              />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Clinical Skills */}
      <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-display font-black text-sm uppercase text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-1.5">
          <ListPlus className="w-4 h-4 text-indigo-600" /> 4. Clinical Core Skills (Multi-Select)
        </h3>
        <p className="text-[10px] text-slate-500 font-sans mb-3 font-medium">Toggle all of your verified hands-on clinical capabilities to include in your resume portfolio:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {skillsList.map((skill) => {
            const isChecked = resume.clinicalSkills.includes(skill);
            return (
              <label
                key={skill}
                className={`flex items-center gap-2 p-2 px-3 border cursor-pointer select-none ${
                  isChecked ? "bg-indigo-50 border-indigo-500 font-bold" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleSkill(skill)}
                  className="h-3.5 w-3.5 rounded-none border-slate-300 text-indigo-650 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[11px] font-sans text-slate-900">{skill}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Physical Capabilities */}
      <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-display font-black text-sm uppercase text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-indigo-600" /> 5. Physical & Occupational Capabilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {physicalOptions.map((opt) => {
            const isChecked = resume.physicalCapabilities.includes(opt);
            return (
              <label
                key={opt}
                className={`flex items-center gap-2 p-2 px-3 border cursor-pointer select-none ${
                  isChecked ? "bg-indigo-50 border-indigo-500 font-bold" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleTogglePhysical(opt)}
                  className="h-3.5 w-3.5 rounded-none border-slate-300 text-indigo-650 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[11px] font-sans text-slate-900 leading-tight">
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 6. Languages */}
      <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h3 className="font-display font-black text-sm uppercase text-slate-900 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" /> 6. Languages Spoken
          </h3>
          <button
            onClick={handleAddLanguage}
            className="px-2.5 py-1 bg-slate-900 text-white font-mono text-[9px] font-black uppercase flex items-center gap-1 hover:bg-indigo-600 rounded-none cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Language
          </button>
        </div>

        {resume.languages.map((lang, idx) => (
          <div key={lang.id} className="bg-slate-50 border border-slate-200 p-3 relative flex items-center gap-3">
            <button
              onClick={() => handleRemoveLanguage(idx)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 focus:outline-none"
              aria-label="Remove language"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>

            <div className="flex-1 grid grid-cols-2 gap-3 pr-8">
              <div>
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) => handleUpdateLanguage(idx, "language", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-1.5 font-sans text-xs outline-none rounded-none"
                  placeholder="e.g. Spanish"
                />
              </div>
              <div>
                <select
                  value={lang.proficiency}
                  onChange={(e) => handleUpdateLanguage(idx, "proficiency", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-1.5 font-sans text-xs outline-none rounded-none font-bold"
                >
                  <option value="Conversational">Conversational</option>
                  <option value="Professional">Professional</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native">Native</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 7. Shift Availability Grid */}
      <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-display font-black text-sm uppercase text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" /> 7. Weekly Shift Availability
        </h3>
        <p className="text-[10px] text-slate-500 font-sans mb-3 font-medium">Verify your specific day of the week eligibility thresholds:</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-left">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 border border-slate-300 font-mono text-[9px] uppercase font-black text-slate-500">Day</th>
                {SHIFT_TYPES.map((sh) => (
                  <th key={sh} className="p-2 border border-slate-300 font-mono text-[9px] uppercase font-black text-slate-500 text-center">
                    {sh}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHIFT_AVAILABILITY_DAYS.map((day) => {
                const checkedShifts = resume.availability[day] || [];
                return (
                  <tr key={day} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 font-mono text-[10px] font-bold text-slate-900">{day}</td>
                    {SHIFT_TYPES.map((sh) => {
                      const isChecked = checkedShifts.includes(sh);
                      return (
                        <td key={sh} className="p-2 border border-slate-300 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleAvailabilityToggle(day, sh)}
                            className="h-3.5 w-3.5 text-indigo-605 border-slate-300 rounded-none focus:ring-0 cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. References */}
      <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h3 className="font-display font-black text-sm uppercase text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> 8. Clinical/Professional References
          </h3>
          <button
            onClick={handleAddReference}
            className="px-2.5 py-1 bg-slate-900 text-white font-mono text-[9px] font-black uppercase flex items-center gap-1 hover:bg-indigo-600 rounded-none cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Reference
          </button>
        </div>

        {resume.references.map((ref, idx) => (
          <div key={ref.id} className="bg-slate-50 border border-slate-200 p-3.5 relative space-y-3">
            <button
              onClick={() => handleRemoveReference(idx)}
              className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 focus:outline-none"
              aria-label="Remove reference"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <span className="font-mono text-[8px] font-extrabold text-indigo-650 uppercase">Reference #{idx + 1}</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Contact Name</label>
                <input
                  type="text"
                  value={ref.name}
                  onChange={(e) => handleUpdateReference(idx, "name", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-sans text-xs outline-none rounded-none"
                  placeholder="e.g. Dr. John Carter"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Role / Title</label>
                <input
                  type="text"
                  value={ref.title}
                  onChange={(e) => handleUpdateReference(idx, "title", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-sans text-xs outline-none rounded-none"
                  placeholder="e.g. Director of Clinical Services"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Facility Network</label>
                <input
                  type="text"
                  value={ref.facility}
                  onChange={(e) => handleUpdateReference(idx, "facility", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-sans text-xs outline-none rounded-none"
                  placeholder="e.g. Emory Acute Wing"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Contact Relationship</label>
                <select
                  value={ref.relationship}
                  onChange={(e) => handleUpdateReference(idx, "relationship", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-sans text-xs outline-none rounded-none font-bold"
                >
                  <option value="Supervisor">Supervisor / Director</option>
                  <option value="Colleague">Colleague / Peer CNA</option>
                  <option value="Charge Nurse">Charge Nurse / Lead</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Phone (Hired Proxy)</label>
                <input
                  type="text"
                  value={ref.phone}
                  onChange={(e) => handleUpdateReference(idx, "phone", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-mono text-xs outline-none rounded-none"
                  placeholder="555-555-5555"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Email (Hired Proxy)</label>
                <input
                  type="email"
                  value={ref.email}
                  onChange={(e) => handleUpdateReference(idx, "email", e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-mono text-xs outline-none rounded-none"
                  placeholder="name@facility.org"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
