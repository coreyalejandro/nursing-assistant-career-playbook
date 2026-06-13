import React, { useState, useEffect } from 'react';
import WageMaximizer from './WageMaximizer';
import ResumeFormats from './ResumeFormats';
import VignettePortfolio from './VignettePortfolio';
import ResumeBuilder from './ResumeBuilder';
import { PlaybookData } from '../types';
import { ArrowRight, CheckCircle2, Smartphone, WifiOff } from 'lucide-react';

export default function CarlaSequentialPipeline({ playbookData, offlineSyncedAt }: { playbookData: PlaybookData; offlineSyncedAt?: string | null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '');
  const smsBody = encodeURIComponent("Hi, I'm Carla Miranda, a CNA with 13+ years experience. I recently reduced night-shift falls by 15% using CDC STEADI protocols. You can view my verified clinical metrics and portfolio here: [Link]");
  const smsLink = `sms:${isIOS ? '&' : '?'}body=${smsBody}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 pb-12">
      
      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <div className="bg-rose-500 border-4 border-slate-950 p-4 font-mono text-slate-950 flex flex-col sm:flex-row items-center gap-3 shadow-[6px_6px_0px_0px_rgba(244,63,94,1)] animate-bounce duration-1000">
          <WifiOff className="w-8 h-8 text-slate-950 shrink-0" />
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-black uppercase tracking-wider">⚠️ Phone is Offline</h4>
            <p className="text-xs font-sans font-medium mt-1">
              Don't worry! This playbook is fully saved on your device. You can still access all of your resume formats, career tools, and practice stories even without Wi-Fi or cellular service.
            </p>
          </div>
        </div>
      )}

      {/* Offline Saving Status Bar */}
      <div className="bg-emerald-50 border-2 border-slate-900 p-4 font-mono flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-in fade-in slide-in-from-top-1 duration-500">
        <div className="flex items-start md:items-center gap-3">
          <div className="relative flex h-3 w-3 shrink-0 mt-1 md:mt-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold text-slate-950 tracking-wider flex flex-wrap items-center gap-1.5">
              <span>Automatic Saving status:</span>
              <span className="text-emerald-950 bg-emerald-200 px-1.5 py-0.5 border border-emerald-400 text-[9px] tracking-widest font-mono font-bold uppercase">Saved to your phone</span>
            </div>
            <p className="text-[11px] font-sans text-slate-600 mt-1 font-medium leading-relaxed">
              Carla, your work is saved directly to your phone. You can access your resume, high-wage talking points, and practice stories anywhere—even inside breakrooms or hospital areas without signal.
            </p>
          </div>
        </div>
        <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500 shrink-0 text-left md:text-right border-l-0 md:border-l-2 border-slate-300 pl-0 md:pl-4 pt-2 md:pt-0">
          <span>Last Saved</span>
          <span className="block text-slate-900 mt-0.5 font-black">
            {offlineSyncedAt ? new Date(offlineSyncedAt).toLocaleTimeString() : 'Saving...'}
          </span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between rounded-none border-2 border-slate-900 bg-slate-200 p-1 text-sm font-bold font-mono tracking-widest uppercase">
        {[1, 2, 3].map((step) => (
          <div 
            key={step} 
            className={`flex h-10 w-1/3 items-center justify-center rounded-none transition-all ${
              currentStep === step 
                ? 'bg-slate-900 text-white shadow-md' 
                : currentStep > step 
                  ? 'text-slate-900 cursor-pointer hover:bg-slate-300' 
                  : 'text-slate-400'
            }`}
            onClick={() => currentStep > step && setCurrentStep(step)}
          >
            {step === 1 ? '1. Target' : step === 2 ? '2. Review' : '3. Launch'}
          </div>
        ))}
      </div>

      {/* Step 1: The Value Hook */}
      {currentStep === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <WageMaximizer />
          <button 
            onClick={() => setCurrentStep(2)}
            className="mt-6 w-full rounded-none bg-emerald-500 px-6 py-4 font-mono font-black text-slate-950 uppercase tracking-widest transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900"
          >
            Next: Review My Assets →
          </button>
        </div>
      )}

      {/* Step 2: The Resume & Vignettes */}
      {currentStep === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
          <div className="rounded-none border-4 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="mb-4 text-2xl font-black uppercase font-display text-slate-900">Your Ready Assets</h2>
            <p className="text-slate-600 font-sans">Your optimally formatted resume is listed below. You can personalize and edit experience dates, phone counts, and safety skills live, then print or export directly without crashing.</p>
          </div>
          
          <div className="space-y-6">
            <ResumeBuilder playbookData={playbookData} onUpdatePlaybook={(d) => console.log('Resume updated locally:', d)} />
            <VignettePortfolio playbookData={playbookData} />
            <ResumeFormats playbookData={playbookData} isCompact={true} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button 
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-1/3 rounded-none border-2 border-slate-300 py-4 font-bold text-slate-600 hover:border-slate-900 font-mono tracking-widest uppercase transition-colors"
            >
              ← Back
            </button>
            <button 
              onClick={() => setCurrentStep(3)}
              className="w-full sm:w-2/3 rounded-none bg-emerald-500 py-4 font-black font-mono tracking-widest uppercase text-slate-950 transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900"
            >
              Next: Apply Now →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Direct Launchpad */}
      {currentStep === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
           <div className="rounded-none border-4 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="mb-4 text-2xl font-black uppercase text-slate-900 font-display">Direct Launchpad</h2>
            <p className="mb-6 text-slate-600 font-sans">Bypass the online portal black hole. Use these direct links to regional nursing directors or export your resume via SMS to send it directly to your recruiter.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="https://www.emoryhealthcare.org/careers" target="_blank" rel="noopener noreferrer" className="block bg-white border-2 border-slate-900 p-6 flex flex-col justify-between hover:bg-slate-50 transition-colors hover:translate-y-1 hover:translate-x-1 hover:shadow-none group">
                 <div>
                    <h3 className="font-display font-black text-xl text-slate-950 uppercase mb-2">Emory Healthcare</h3>
                    <p className="font-sans text-sm text-slate-600 mb-4">Direct recruitment site for top-tier clinical network in the Atlanta region.</p>
                 </div>
                 <div className="flex items-center gap-2 font-mono text-emerald-600 font-bold uppercase text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Ready to Apply <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                 </div>
              </a>
              
              <a href="https://www.piedmont.org/careers" target="_blank" rel="noopener noreferrer" className="block bg-white border-2 border-slate-900 p-6 flex flex-col justify-between hover:bg-slate-50 transition-colors hover:translate-y-1 hover:translate-x-1 hover:shadow-none group">
                 <div>
                    <h3 className="font-display font-black text-xl text-slate-950 uppercase mb-2">Piedmont Health</h3>
                    <p className="font-sans text-sm text-slate-600 mb-4">Official candidate entry portal for Piedmont acute and specialty care units.</p>
                 </div>
                 <div className="flex items-center gap-2 font-mono text-emerald-600 font-bold uppercase text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Ready to Apply <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                 </div>
              </a>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
               <a href={smsLink} className="flex-1 bg-slate-900 text-white font-mono font-bold uppercase px-6 py-4 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-transform border-2 border-slate-900 hover:border-emerald-500">
                 <Smartphone className="w-5 h-5" /> Text Me My Resume & Pitch
               </a>
            </div>
          </div>

          <button 
            onClick={() => setCurrentStep(2)}
            className="w-full rounded-none border-2 border-slate-300 py-4 font-bold text-slate-600 hover:border-slate-900 font-mono tracking-widest uppercase transition-colors"
          >
            ← Back to Assets
          </button>
        </div>
      )}
    </div>
  );
}
