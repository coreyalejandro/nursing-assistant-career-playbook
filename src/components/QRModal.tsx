import React from "react";
import { X, Smartphone, Globe, Clipboard, Check } from "lucide-react";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export default function QRModal({ isOpen, onClose, shareUrl }: QRModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border-4 border-slate-900 p-6 max-w-sm w-full rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-950 focus:outline-none"
          aria-label="Close QR Modal"
        >
          <X className="w-5 h-5 pointer-events-auto" />
        </button>

        <div className="text-center space-y-4">
          <div className="space-y-1">
            <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400 font-extrabold block">
              MOBILE INTERFACE SYNC
            </span>
            <h3 className="font-display font-black text-base uppercase text-slate-900 flex items-center justify-center gap-1.5">
              <Smartphone className="w-4.5 h-4.5 text-indigo-650" /> Scannable Profile QR Code
            </h3>
            <p className="text-[10px] text-slate-500 font-sans max-w-xs mx-auto">
              Scan this code with any mobile camera to instantaneously open and load your exact, custom-configured resume details.
            </p>
          </div>

          {/* QR Image Box */}
          <div className="w-[200px] h-[200px] bg-slate-100 border-2 border-slate-900 mx-auto p-1.5 flex items-center justify-center">
            <img
              src={qrImageUrl}
              alt="Scan QR Code to load shared CNA resume parameters"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Action copy button */}
          <div className="space-y-2">
            <div className="bg-slate-100 border border-slate-205 p-2 font-mono text-[9px] text-slate-700 break-all select-all font-medium leading-tight">
              {shareUrl}
            </div>

            <button
              onClick={handleCopy}
              className="w-full font-mono text-[10px] font-black uppercase text-white bg-slate-900 hover:bg-slate-800 p-2.5 flex items-center justify-center gap-1.5 border border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Copied share Url!
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4" /> Copy Shareable Path
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
