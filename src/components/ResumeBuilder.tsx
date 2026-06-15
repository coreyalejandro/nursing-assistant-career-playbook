import React, { useState } from 'react';
import { PlaybookData, BulletPoint } from '../types';
import { Edit3, Check, FileDown, Clipboard, Printer, ListPlus, Trash2, Save } from 'lucide-react';

interface ResumeBuilderProps {
  playbookData: PlaybookData;
  onUpdatePlaybook: (updatedData: PlaybookData) => void;
}

export default function ResumeBuilder({ playbookData, onUpdatePlaybook }: ResumeBuilderProps) {
  const [summary, setSummary] = useState(playbookData.resume.professionalSummary);
  const [competencies, setCompetencies] = useState(playbookData.resume.clinicalCompetencies.join(', '));
  const [safetyPoints, setSafetyPoints] = useState(playbookData.resume.mobilitySafety.join(', '));
  const [systems, setSystems] = useState(playbookData.resume.systemsAdmin.join(', '));
  
  const [experiences, setExperiences] = useState(playbookData.resume.experiences);
  const [copiedText, setCopiedText] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  // Update original state structure
  const handleSaveChanges = () => {
    const updatedPlaybook: PlaybookData = {
      ...playbookData,
      resume: {
        professionalSummary: summary,
        clinicalCompetencies: competencies.split(',').map(s => s.trim()).filter(Boolean),
        mobilitySafety: safetyPoints.split(',').map(s => s.trim()).filter(Boolean),
        systemsAdmin: systems.split(',').map(s => s.trim()).filter(Boolean),
        experiences: experiences
      }
    };
    onUpdatePlaybook(updatedPlaybook);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const updateExperienceBullet = (expIdx: number, bulletIdx: number, newText: string) => {
    const updatedExps = [...experiences];
    updatedExps[expIdx].bullets[bulletIdx].text = newText;
    setExperiences(updatedExps);
  };

  const handleCopyPlainText = () => {
    const plainText = `
${playbookData.resume.professionalSummary}

CLINICAL COMPETENCIES
${playbookData.resume.clinicalCompetencies.join(' | ')}

MOBILITY & PATIENT SAFETY Certifications
${playbookData.resume.mobilitySafety.join(' | ')}

SYSTEMS & EHR SKILLS
${playbookData.resume.systemsAdmin.join(' | ')}

EXPERIENCE WORK HISTORY:
${experiences.map(exp => `
${exp.title} - ${exp.company} (${exp.location})
${exp.dateRange}
${exp.bullets.map(b => `- ${b.text}`).join('\n')}
`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(plainText).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CNA Profession Resume - Carla Miranda</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; }
    h1 { font-size: 28px; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; color: #0f172a; }
    .contact { font-family: monospace; font-size: 11px; margin-bottom: 25px; color: #475569; }
    h2 { font-size: 14px; font-weight: 800; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-top: 30px; text-transform: uppercase; color: #020617; }
    p { font-size: 13px; line-height: 1.6; color: #334155; }
    ul { padding-left: 20px; }
    li { font-size: 12.5px; margin-bottom: 6px; line-height: 1.5; color: #334155; }
    .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
    .job { margin-bottom: 20px; }
    .job-title { font-weight: 800; font-size: 13px; display: flex; justify-content: space-between; color: #0f172a; }
    .job-loc { font-style: italic; font-weight: normal; color: #64748b; }
  </style>
</head>
<body>
  <h1>CARLA MIRANDA, Certified Nursing Assistant</h1>
  <div class="contact">EMAIL: carla.miranda12222@gmail.com | CELL: 470-563-0128 | ATLANTA METRO AREA</div>
  
  <h2>Professional Profile</h2>
  <p>${summary}</p>

  <h2>Technical Core Focus</h2>
  <div class="skills-grid">
    <div>
      <strong>Clinical Competencies:</strong>
      <p style="font-size:12px; margin-top:4px;">${competencies}</p>
    </div>
    <div>
      <strong>Safety Protocols:</strong>
      <p style="font-size:12px; margin-top:4px;">${safetyPoints}</p>
    </div>
    <div>
      <strong>EHR & Software:</strong>
      <p style="font-size:12px; margin-top:4px;">${systems}</p>
    </div>
  </div>

  <h2>Employment History</h2>
  ${experiences.map(exp => `
    <div class="job">
      <div class="job-title">
        <span>${exp.title} &mdash; <strong>${exp.company}</strong></span>
        <span class="job-loc">${exp.location} | ${exp.dateRange}</span>
      </div>
      <ul>
        ${exp.bullets.map(b => `<li>${b.text}</li>`).join('')}
      </ul>
    </div>
  `).join('')}
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CNA_Resume_Carla_Miranda.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="resume-builder-panel" className="rounded-none border-4 border-slate-900 bg-white p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
      {/* Header Info */}
      <div className="mb-5 border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5ClassName">
            <Edit3 className="w-5 h-5 text-indigo-600" /> Professional Resume Builder
          </h3>
          <p className="font-sans text-slate-600 text-xs font-medium mt-1">
            Edit your live profile summary, clinical skills, and experiences. Any updates immediately feed into the visual templates below.
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0 self-start sm:self-center">
          <button
            onClick={handleCopyPlainText}
            className="px-2.5 py-1.5 border border-slate-900 bg-slate-50 hover:bg-slate-100 font-mono text-[10px] font-bold text-slate-800 uppercase flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Clipboard className="w-3.5 h-3.5" /> {copiedText ? "Copied!" : "Copy Text"}
          </button>
          <button
            onClick={handlePrint}
            className="px-2.5 py-1.5 border border-slate-900 bg-slate-50 hover:bg-slate-100 font-mono text-[10px] font-bold text-slate-800 uppercase flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print CV
          </button>
          <button
            onClick={handleDownloadHtml}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer border border-slate-950 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" /> Export HTML
          </button>
        </div>
      </div>

      {/* Editor Fields Block */}
      <div className="space-y-4">
        {/* Professional Summary */}
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Professional Summary (Flesch-Kincaid & Hiring Ready)
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full rounded-none border-2 border-slate-900 p-3 font-sans text-xs font-medium text-slate-850 leading-relaxed bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Skills Lists inputs in 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Clinical Competencies (Comma Separated)
            </label>
            <input
              type="text"
              value={competencies}
              onChange={(e) => setCompetencies(e.target.value)}
              className="w-full rounded-none border-2 border-slate-900 px-3 py-2 font-sans text-xs bg-slate-50 focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Mobility & Safety (Comma Separated)
            </label>
            <input
              type="text"
              value={safetyPoints}
              onChange={(e) => setSafetyPoints(e.target.value)}
              className="w-full rounded-none border-2 border-slate-900 px-3 py-2 font-sans text-xs bg-slate-50 focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Software Systems & EHR (Comma Separated)
            </label>
            <input
              type="text"
              value={systems}
              onChange={(e) => setSystems(e.target.value)}
              className="w-full rounded-none border-2 border-slate-900 px-3 py-2 font-sans text-xs bg-slate-50 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Experience Blocks Re-Writer */}
        <div className="border-t-2 border-slate-150 pt-4 mt-2">
          <label className="block font-mono text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 mb-3">
            📋 Live Experience Bullet Proofing (Georgia Acute Benchmarks)
          </label>

          <div className="space-y-4">
            {experiences.map((exp, expIdx) => (
              <div key={expIdx} className="bg-slate-50 border border-slate-300 p-3.5 rounded-none">
                <div className="flex justify-between items-center mb-2 font-display">
                  <span className="font-bold text-xs uppercase text-slate-950">{exp.title} — {exp.company}</span>
                  <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">{exp.dateRange}</span>
                </div>
                
                {/* Underlining items */}
                <div className="space-y-2">
                  {exp.bullets.map((bullet, bulletIdx) => (
                    <div key={bullet.id} className="flex gap-2">
                      <span className="text-slate-400 font-mono text-[11px] select-none pt-1">•</span>
                      <textarea
                        value={bullet.text}
                        onChange={(e) => updateExperienceBullet(expIdx, bulletIdx, e.target.value)}
                        rows={2}
                        className="w-full rounded-none border border-slate-400 bg-white p-1.5 font-sans text-[11px] leading-relaxed text-slate-800 focus:outline-none focus:border-slate-850"
                        placeholder="Resume Experience Bullet"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Action save */}
        <div className="pt-3 flex justify-end">
          <button
            onClick={handleSaveChanges}
            className="cursor-pointer font-mono text-xs font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-850 px-6 py-3.5 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            {savedStatus ? "Changes Merged & Cached!" : "Save and Sync Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}
