import React, { useState } from "react";
import { usePlaybook, encodeResumeState } from "../lib/resumeState";
import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import FacilityTailor from "./FacilityTailor";
import QRModal from "./QRModal";
import PrintStyles from "./PrintStyles";
import { Copy, QrCode, Printer, CheckSquare, Sparkles, AlertCircle, FileText, Layout, Check, ShieldAlert } from "lucide-react";

export default function ResumeBuilderMain() {
  const { state, dispatch } = usePlaybook();
  const [activeSubTab, setActiveSubTab] = useState<"edit" | "preview">("edit");
  const [activeTemplate, setActiveTemplate] = useState<"clinical" | "modern">("clinical");
  const [quickApply, setQuickApply] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const handleCopyLink = () => {
    const compressed = encodeResumeState(state.resume);
    const origin = window.location.origin;
    const shareUrl = `${origin}/resume?share=${compressed}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getCompressedShareUrl = () => {
    const compressed = encodeResumeState(state.resume);
    return `${window.location.origin}/resume?share=${compressed}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PrintStyles />

      {/* Header toolbar summary */}
      <div className="border-4 border-slate-900 bg-white p-4 sm:p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-xl uppercase text-slate-950 flex items-center gap-1.5ClassName">
            <FileText className="w-5 h-5 text-indigo-600" /> Compliance-First Resume Engine
          </h2>
          <p className="font-sans text-slate-600 text-xs font-medium mt-1">
            Reorder and highlight specific credentials based on targeted facility requirements. Maintain strict HIPAA data boundaries.
          </p>
        </div>

        {/* Toolbar parameters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-950 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            aria-label="Print or Export PDF"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Print / Export PDF
          </button>

          {/* Share button */}
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-950 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" /> Link Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Shareable URL
              </>
            )}
          </button>

          {/* QR Button */}
          <button
            onClick={() => setIsQrOpen(true)}
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono text-[10px] font-black uppercase flex items-center gap-1 border border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
            aria-label="Open mobile shareable QR coordinates"
          >
            <QrCode className="w-4 h-4" /> Mobile QR
          </button>
        </div>
      </div>

      {/* Quick-Apply banner options */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 no-print">
        {/* Left Options controller */}
        <div className="md:col-span-4 space-y-6">
          <FacilityTailor />

          {/* Quick Apply mode */}
          <div className="bg-white border-2 border-slate-900 p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.15)] rounded-none space-y-3">
            <h4 className="font-display font-black text-sm uppercase text-slate-950 flex items-center gap-1.5">
              <CheckSquare className="w-4.5 h-4.5 text-emerald-600" /> "Hire Me" Quick-Apply Option
            </h4>
            <p className="text-[10px] text-slate-505 font-sans leading-relaxed">
              Activate the instant-enlist mode, appending a highly-visible badge at the crown of your print output indicating dynamic start readiness:
            </p>

            <label className="flex items-center gap-2 bg-emerald-50/50 p-2.5 border border-emerald-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={quickApply}
                onChange={() => setQuickApply(!quickApply)}
                className="h-4 w-4 text-emerald-650 border-slate-350 focus:ring-0 rounded-none"
              />
              <span className="text-[11px] font-sans font-bold text-slate-900 uppercase">
                READY TO START NEXT WEEK
              </span>
            </label>
          </div>

          {/* Template controls (Layout and View Selectors) */}
          <div className="bg-white border-2 border-slate-900 p-4 sm:p-5 rounded-none space-y-3">
            <h4 className="font-display font-black text-sm uppercase text-slate-905 flex items-center gap-1.5">
              <Layout className="w-4.5 h-4.5 text-indigo-650" /> Style Template
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTemplate("clinical")}
                className={`p-2 font-mono text-[9px] font-black uppercase text-center border-2 cursor-pointer ${
                  activeTemplate === "clinical"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                Clinical Standard (ATS)
              </button>
              <button
                onClick={() => setActiveTemplate("modern")}
                className={`p-2 font-mono text-[9px] font-black uppercase text-center border-2 cursor-pointer ${
                  activeTemplate === "modern"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                Modern Care (Accents)
              </button>
            </div>
          </div>
        </div>

        {/* Right Editor/Preview space */}
        <div className="md:col-span-8 space-y-4">
          {/* Mobile responsive toggle header (Section 6B) */}
          <div className="lg:hidden flex border-b border-slate-200">
            <button
              onClick={() => setActiveSubTab("edit")}
              className={`flex-1 py-3 text-center font-mono text-xs font-black uppercase cursor-pointer ${
                activeSubTab === "edit"
                  ? "border-b-2 border-slate-950 text-slate-955 bg-slate-50"
                  : "text-slate-400"
              }`}
            >
              1. Edit CV Details
            </button>
            <button
              onClick={() => setActiveSubTab("preview")}
              className={`flex-1 py-3 text-center font-mono text-xs font-black uppercase cursor-pointer ${
                activeSubTab === "preview"
                  ? "border-b-2 border-slate-950 text-slate-950 bg-slate-50"
                  : "text-slate-400"
              }`}
            >
              2. Live ATS Preview
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Column - visible on Desktop, or when mobile activeSubTab is "edit" */}
            <div className={`${activeSubTab === "edit" ? "block" : "hidden ln:block"} lg:block`}>
              <h3 className="hidden lg:block font-mono text-[10px] font-black uppercase text-slate-400 mb-2">
                CRITICAL BUILDER FIELDS
              </h3>
              <ResumeForm />
            </div>

            {/* Preview Column - visible on Desktop, or when mobile activeSubTab is "preview" */}
            <div className={`${activeSubTab === "preview" ? "block" : "hidden ln:block"} lg:block h-fit lg:sticky lg:top-20`}>
              <h3 className="hidden lg:block font-mono text-[10px] font-black uppercase text-slate-400 mb-2">
                ATS MACHINE-READABLE PREVIEW
              </h3>

              {quickApply && (
                <div className="bg-emerald-600 text-white border-2 border-slate-950 p-2.5 font-display font-black text-center text-xs uppercase tracking-widest mb-3 blink-effect animate-pulse">
                  ★★★ READY TO START NEXT WEEK ★★★
                </div>
              )}

              <ResumePreview template={activeTemplate} />
            </div>
          </div>
        </div>
      </div>

      <QRModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        shareUrl={getCompressedShareUrl()}
      />
    </div>
  );
}
