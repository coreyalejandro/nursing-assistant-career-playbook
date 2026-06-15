import React, { useState, lazy, Suspense } from "react";
import { usePlaybook } from "../lib/resumeState";
import { LanguageToggle } from "../lib/i18n";

// Lazy-loaded so the Firebase chunk stays off the initial critical path.
const AccountMenu = lazy(() => import("./AccountMenu"));
import { Heart, Menu, X, Landmark, Briefcase, FileLineChart, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";

export default function Navigation() {
  const { state, dispatch } = usePlaybook();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Dashboard / Home", path: "/", icon: Sparkles },
    { label: "CNA Resume Builder", path: "/resume", icon: Briefcase },
    { label: "Playbook & Simulator", path: "/playbook", icon: Landmark },
    { label: "Compliance & STEADI", path: "/audit", icon: FileLineChart },
    { label: "Methodology & Privacy", path: "/about", icon: HelpCircle }
  ];

  const handleRoute = (path: string) => {
    window.history.pushState({}, "", path);
    dispatch({ type: "SET_ROUTE", payload: path });
    setIsOpen(false);
  };

  return (
    <>
      {/* Skip to Content Link for Keyboard Accessibility (WCAG 2.1 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:bg-[#fcfaf7] focus:px-4 focus:py-2 focus:text-slate-900 focus:border-2 focus:border-slate-950 focus:font-mono focus:text-xs focus:font-black focus:outline-none"
      >
        Skip to main content
      </a>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b-2 border-slate-900 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleRoute("/")}
            className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-950 px-1 py-0.5 rounded"
            aria-label="CNA Career Playbook Home"
          >
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-display font-black text-[10px] md:text-xs text-white tracking-wide uppercase leading-tight">
              Certified Nursing Assistant (CNA) Career Playbook
            </span>
            <span className="sm:hidden font-display font-black text-xs text-white tracking-widest uppercase">
              CNA Career Playbook
            </span>
          </button>
        </div>

        {/* Desktop Nav Items */}
        <div className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = state.activeTab === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleRoute(item.path)}
                className={`px-3 py-1.5 font-mono text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 transition-all outline-none border-b-2 cursor-pointer ${
                  isActive
                    ? "border-yellow-400 text-yellow-400 bg-slate-900"
                    : "border-transparent text-slate-300 hover:text-white hover:border-slate-500"
                } focus:ring-2 focus:ring-yellow-400 focus:bg-slate-900`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
          <LanguageToggle className="ml-2 px-3 py-1.5 font-mono text-[11px] font-extrabold uppercase tracking-widest text-slate-300 hover:text-white border-b-2 border-transparent hover:border-slate-500 transition-all cursor-pointer focus:ring-2 focus:ring-yellow-400 focus:bg-slate-900 outline-none" />
          <Suspense fallback={null}><AccountMenu /></Suspense>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <Suspense fallback={null}><AccountMenu /></Suspense>
          <LanguageToggle className="px-2.5 py-1.5 font-mono text-[11px] font-extrabold uppercase tracking-widest text-slate-200 bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer" />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-200 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 focus:ring-offset-slate-950"
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Left/Overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Slider Drawer Menu */}
          <div className="fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-slate-950 border-r-2 border-slate-900 p-6 flex flex-col justify-between z-50">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                  <span className="font-display font-black text-xs text-white uppercase tracking-widest">
                    CNA Career Playbook
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = state.activeTab === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleRoute(item.path)}
                      className={`w-full px-4 py-3 font-mono text-xs font-bold text-left uppercase flex items-center gap-3 border ${
                        isActive
                          ? "bg-yellow-400 text-slate-950 border-yellow-400"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-850"
                      } outline-none focus:ring-2 focus:ring-yellow-400`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-extrabold text-center">
                HIPAA & OSHA Compliant Carrier Blueprint
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
