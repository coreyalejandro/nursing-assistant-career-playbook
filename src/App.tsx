import React, { Suspense } from "react";
import { PlaybookProvider, usePlaybook } from "./lib/resumeState";
import Navigation from "./components/Navigation";
import HomeDashboard from "./components/HomeDashboard";
import { Heart, Sparkles } from "lucide-react";

// Route-based code splitting: the landing view (HomeDashboard) is eager so the
// first paint is stable (no fallback→content layout shift / good CLS + LCP).
// The heavier secondary routes and the on-demand chat / feedback widgets load
// as their own chunks. [DeepSeek P1 performance fix]
const ResumeBuilderMain = React.lazy(() => import("./components/ResumeBuilderMain"));
const PlaybookMain = React.lazy(() => import("./components/PlaybookMain"));
const AuditMain = React.lazy(() => import("./components/AuditMain"));
const AboutMain = React.lazy(() => import("./components/AboutMain"));
const AdaptiveFeedback = React.lazy(() => import("./components/AdaptiveFeedback"));
const GeminiChat = React.lazy(() =>
  import("./components/GeminiChat").then((m) => ({ default: m.GeminiChat }))
);

function ViewFallback() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin" aria-hidden="true" />
    </div>
  );
}

function AppContent() {
  const { state } = usePlaybook();
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);

  // Render sub-view depending on state.activeTab path
  const renderActiveView = () => {
    switch (state.activeTab) {
      case "/":
        return <HomeDashboard />;
      case "/resume":
        return <ResumeBuilderMain />;
      case "/playbook":
        return <PlaybookMain />;
      case "/audit":
        return <AuditMain />;
      case "/about":
        return <AboutMain />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="bg-[#efedea] min-h-screen text-slate-950 font-sans selection:bg-amber-200 flex flex-col justify-between pt-16">
      {/* 1. Top accessible navigation */}
      <Navigation />

      {/* 2. Main content block wrapper */}
      <main id="main-content" className="flex-1 min-h-[85vh] max-w-6xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 outline-none">
        <Suspense fallback={<ViewFallback />}>
          {renderActiveView()}
        </Suspense>
      </main>

      {/* Adaptive Page Feedback Widget (lazy, non-critical) */}
      <Suspense fallback={null}>
        <AdaptiveFeedback
          currentUrl={`https://cna-playbook.local${state.activeTab}`}
          currentViewMode={state.activeTab === '/' ? 'home' : state.activeTab.replace(/^\//, '')}
        />
      </Suspense>

      {/* Floating App Assistant Trigger & Modal Dialog */}
      {!isAssistantOpen && (
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 p-3.5 rounded-full shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all border-2 border-slate-950 flex items-center justify-center cursor-pointer group no-print"
          title="Open AI Career Assistant"
          id="assistant-trigger"
        >
          <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-950" />
        </button>
      )}

      {isAssistantOpen && (
        <Suspense fallback={null}>
          <GeminiChat onClose={() => setIsAssistantOpen(false)} />
        </Suspense>
      )}

      {/* 3. Highly polished, professional clinical footer */}
      <footer className="bg-slate-950 text-white pt-10 pb-8 border-t-2 border-slate-900 no-print">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-display font-black text-xs text-white tracking-widest uppercase mb-2 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Certified Nursing Assistant (CNA) Career Playbook
            </h4>
            <span className="font-mono text-[9px] text-[#f59e0b] uppercase tracking-widest block mb-3 font-bold">
              Georgia Healthcare Onboarding & Compliance Engine · Edition 2026
            </span>
            <p className="font-sans font-medium text-slate-400 text-[11px] leading-relaxed max-w-sm">
              An evidence-based professional career playbook and portfolio builder aligning nursing expertise with standard CMS guidelines and CDC STEADI metrics.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-between text-xs space-y-4 md:space-y-0">
            <div className="space-y-1 md:text-right">
              <p className="font-mono text-slate-500 text-[9px] uppercase font-bold">Verified Representative Profile</p>
              <p className="font-display font-black text-[#f59e0b] text-base">CNA CARLA MIRANDA</p>
              <p className="font-mono text-slate-350 text-[10px] font-medium mt-0.5">Proxy Enlistment Mode Active</p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 border-t border-slate-900 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-mono text-slate-400 font-extrabold uppercase">
          <p>© 2026 CNA Regulatory Blueprint Group. All Rights Reserved.</p>
          <p>Typeset in Inter & Space Grotesk · Aligned with CDC STEADI Guidelines</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <PlaybookProvider>
      <AppContent />
    </PlaybookProvider>
  );
}
