/**
 * src/lib/i18n.tsx
 * ---------------------------------------------------------------------------
 * Lightweight bilingual (English / Spanish) i18n framework.
 *
 * WHY: ~1 in 3 U.S. direct-care workers speak Spanish at home, and the audit
 * flagged the lack of Spanish support as non-negotiable. This provides a real,
 * working translation layer (context + t() + persisted language + toggle).
 *
 * SCOPE: The highest-value, safety-critical strings (crisis line, HIPAA notice,
 * assistant greeting, primary navigation) are translated now. Remaining UI
 * strings fall back to English automatically, so the app is fully functional
 * while translation coverage is expanded incrementally. To translate a new
 * string: add a key to BOTH dictionaries and call t('your.key') in the
 * component. The server's Gemini coach already replies in the user's language.
 * ---------------------------------------------------------------------------
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "es";

type Dict = Record<string, string>;

const EN: Dict = {
  "nav.home": "Home",
  "nav.resume": "Resume",
  "nav.playbook": "Playbook",
  "nav.audit": "Audit",
  "nav.about": "About",
  "nav.skipToContent": "Skip to main content",
  "lang.toggle": "Español",
  "lang.current": "English",
  "assistant.greeting": "Hi! I'm your AI career assistant. Ask me questions or use the buttons to search the web or get mapping information!",
  "assistant.title": "Gemini Assistant",
  "assistant.placeholder": "Ask anything...",
  "assistant.clear": "Clear chat history",
  "hipaa.title": "HIPAA / Privacy Security Notice",
  "hipaa.body": "Do not enter patient names, resident details, or specific Protected Health Information (PHI) in this chat workspace.",
  "chat.burnout": "Feeling Burned Out",
  "chat.mockInterview": "Mock Interview",
  "chat.reciprocity": "State Reciprocity",
  "chat.search": "Search",
  "chat.maps": "Maps",
  "chat.fast": "Fast",
  "crisis.line": "988 Suicide & Crisis Lifeline",
  "crisis.body": "If you're exhausted, hopeless, or in crisis, you can call or text 988 — 24/7, free, and confidential. You matter.",
  "account.signIn": "Sign in",
  "account.google": "Continue with Google",
  "account.guest": "Continue as guest",
  "account.signOut": "Sign out",
  "account.signInToSave": "Sign in to save your progress across devices.",
  "account.synced": "Synced to your account",
  "account.savedLocal": "Saved on this device",
  "reminders.enable": "Turn on reminders",
  "reminders.on": "Reminders on",
  "reminders.blocked": "Reminders blocked in browser settings",
  "progress.title": "Your progress",
  "progress.signedInAs": "Signed in",
};

const ES: Dict = {
  "nav.home": "Inicio",
  "nav.resume": "Currículum",
  "nav.playbook": "Guía",
  "nav.audit": "Auditoría",
  "nav.about": "Acerca de",
  "nav.skipToContent": "Saltar al contenido principal",
  "lang.toggle": "English",
  "lang.current": "Español",
  "assistant.greeting": "¡Hola! Soy tu asistente de carrera con IA. Hazme preguntas o usa los botones para buscar en la web u obtener información de mapas.",
  "assistant.title": "Asistente Gemini",
  "assistant.placeholder": "Pregúntame lo que quieras...",
  "assistant.clear": "Borrar historial de chat",
  "hipaa.title": "Aviso de privacidad y seguridad (HIPAA)",
  "hipaa.body": "No ingreses nombres de pacientes, datos de residentes ni información médica protegida (PHI) en este chat.",
  "chat.burnout": "Me siento agotada/o",
  "chat.mockInterview": "Entrevista de práctica",
  "chat.reciprocity": "Reciprocidad estatal",
  "chat.search": "Buscar",
  "chat.maps": "Mapas",
  "chat.fast": "Rápido",
  "crisis.line": "988 Línea de Prevención del Suicidio y Crisis",
  "crisis.body": "Si te sientes agotada/o, sin esperanza o en crisis, puedes llamar o enviar un mensaje al 988 — 24/7, gratis y confidencial. Tú importas.",
  "account.signIn": "Iniciar sesión",
  "account.google": "Continuar con Google",
  "account.guest": "Continuar como invitada/o",
  "account.signOut": "Cerrar sesión",
  "account.signInToSave": "Inicia sesión para guardar tu progreso en todos tus dispositivos.",
  "account.synced": "Sincronizado con tu cuenta",
  "account.savedLocal": "Guardado en este dispositivo",
  "reminders.enable": "Activar recordatorios",
  "reminders.on": "Recordatorios activados",
  "reminders.blocked": "Recordatorios bloqueados en el navegador",
  "progress.title": "Tu progreso",
  "progress.signedInAs": "Sesión iniciada",
};

const DICTS: Record<Lang, Dict> = { en: EN, es: ES };

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem("cna_lang");
    if (saved === "en" || saved === "es") return saved;
  } catch { /* ignore */ }
  try {
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("es")) return "es";
  } catch { /* ignore */ }
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  useEffect(() => {
    try { localStorage.setItem("cna_lang", lang); } catch { /* ignore */ }
    try { document.documentElement.lang = lang; } catch { /* ignore */ }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(() => setLangState((p) => (p === "en" ? "es" : "en")), []);
  const t = useCallback(
    (key: string, fallback?: string) =>
      DICTS[lang][key] ?? EN[key] ?? fallback ?? key,
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  // Safe fallback if a component renders outside the provider (keeps app alive).
  if (!ctx) {
    return {
      lang: "en",
      setLang: () => {},
      toggle: () => {},
      t: (key: string, fallback?: string) => EN[key] ?? fallback ?? key,
    };
  }
  return ctx;
}

/** Small EN/ES toggle button for the navigation bar. */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { toggle, t } = useI18n();
  return (
    <button
      type="button"
      onClick={toggle}
      className={className}
      aria-label={t("lang.toggle")}
      title={t("lang.toggle")}
    >
      {t("lang.toggle")}
    </button>
  );
}
