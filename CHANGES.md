# CHANGES — Hardening Pass (technical)

Build status: `tsc --noEmit` ✅ · `vite build` ✅ (code-split: app / react-vendor / firebase) · `esbuild` server bundle ✅ · live server smoke test ✅

## Wage Negotiation Engine + Instant-load (build-verified)
- **Wage Negotiation Engine.** `server/wage/negotiation.ts` (deterministic `computeTargetBand` + `buildPitch`, unit-tested at 97%/90%), a grounded `POST /api/negotiation` endpoint (BLS-anchored market stats + real employer matches → a defensible target range, a copy-ready pitch, and talking points), and `src/components/WageNegotiator.tsx` mounted in the Salary Growth Center tab. Framed as guidance, not a guarantee; PHI-scrubbed inputs.
- **Instant-load.** Firebase is now off the initial critical path: `RetentionPanel` and `AccountMenu` are `React.lazy` chunks (firebase 106 KB gzip no longer blocks first paint). The service worker (v3) serves the app shell stale-while-revalidate for near-instant repeat loads and precaches `/`. `index.html` paints an on-brand skeleton immediately. Initial app chunk ≈ 69 KB gzip + react-vendor 60 KB; firebase/account/retention load on demand.

## Phase 1 & 2 — defense layer, enterprise architecture, and CI gate (`npm run test:ci` ✅ exit 0)
Pipeline: `typecheck` (0 errors) · `lint` eslint `--max-warnings=0` (0 warnings) · `test:unit` (29 tests; 100% stmts/funcs/lines, 95% branches on the new modules; 80% gate) · `test:integration` (5) · `test:security` (15 attacks blocked, 0 false positives across 8 CNA queries) · `test:hipaa` (honest wiring gate) · `test:backup` (audit-chain verify + tamper detection).

New `server/` modules: `defense/inputFilter.ts` (3-layer, workplace-context-aware injection filter), `defense/outputValidator.ts` (system-fragment + PII egress validator), `llm/LLMProvider.ts` + `llm/FallbackProvider.ts` (Firestore-backed circuit breaker, leak-free timeout), `hipaa/auditLogger.ts` (hash-chained; injectable store — Firestore+GCS for prod, in-memory for CI), `hipaa/rbac.ts`, `monitoring/metrics.ts` (prom-client), `enterprise/sso.ts` (injected-admin dead-gate scaffold). Plus `firestore.rules.enterprise` (multi-tenant, append-only audit) and `src/lib/enterpriseRuntime.ts` (tenant/tier claims).

Tooling: jest (+ ts-jest) unit & integration configs, `tsconfig.test.json`, eslint flat config (typescript-eslint), 7 new `test:*` scripts, three `tsx` probe scripts.

**Honest deviations from the supplied manifest** (made so CI passes *truthfully*):
- `inputFilter` EXACT patterns were anchored (`/^…$/`) and let real attacks (with trailing text) through. Rebuilt as de-anchored layered detection (structural / high-signal / context-gated) → blocks all 15 vectors, allows all 8 legitimate CNA queries.
- `outputValidator` shipped a regex literal split across two lines (syntax error) → fixed.
- `auditLogger` used `import { crypto } from 'crypto'` (no such named export) and a `(global as any).getFirestore()` landmine → fixed to `node:crypto` + an injectable store, so the chain is unit-testable without live infra.
- `FallbackProvider.executeWithTimeout` now clears its timer (no leaked handles).
- Probe scripts run via `tsx` (already a dependency, ESM-clean) instead of `ts-node`, which fails in this `type: module` project without an ESM loader.
- `mockConfig.json` no longer asserts `baaSigned: true`. The HIPAA gate verifies control **wiring** only, prints "NOT compliance evidence," and lists the human/legal/infra controls still required — it never claims a BAA is signed.

Added deps — dev: jest, ts-jest, @types/jest, ts-node, eslint, typescript-eslint, @eslint/js · server-only (not in client bundle): prom-client, firebase-admin, @google-cloud/storage.

## Retention loop (sign-in · cross-device persistence · progress dashboard · reminders) — LIVE
- **`src/lib/userProfile.ts`** — `useUserProfile()` hook: Google + anonymous sign-in, loads/saves the `UserProfile` doc (owner-scoped Firestore), friendly auth errors. Extended schema: `renewalDate`, `progressJson`.
- **`src/lib/notifications.ts`** — working local reminders (cert-renewal at 60/30/7/0 days + weekly check-in), de-duplicated via localStorage; FCM background-push hook (`enablePushIfConfigured`) that activates when `VITE_FIREBASE_VAPID_KEY` is set.
- **`src/components/RetentionPanel.tsx`** — assembles it: signed-out nudge → Google/guest; persists to localStorage always and to Firestore when signed in (debounced); reminders toggle; sync-status badge. Mounted on the Home dashboard.
- **`src/components/AccountMenu.tsx`** — compact sign-in / account control wired into the top nav (desktop + mobile).
- **`src/components/ProgressTracker.tsx`** — now hydratable from saved state (`initialChecklist`), re-syncs when the profile loads.
- **`public/sw.js`** — added `push` + `notificationclick` handlers (cache bumped to v2) for FCM background push.
- **`firestore.rules` + `firebase-blueprint.json`** — allow `renewalDate` (string) and `progressJson` (string ≤ 8 KB).
- **`vite.config.ts`** — `manualChunks` splits firebase + react into separately-cached vendor chunks (main app chunk back down to ~71 KB gzip).
- Works with or without Firebase fully configured: signed-out users get a working, localStorage-backed dashboard; signing in upgrades to cross-device sync.
- **Console prerequisites (one-time):** enable Google / Anonymous providers, add your authorized domain, and deploy `firestore.rules`. See START-HERE §5.

## New files
- **`server/security.ts`** — dependency-free hardening: `securityHeaders()` (CSP, HSTS, nosniff, X-Frame-Options, Permissions-Policy), `createRateLimiter()` (in-memory fixed-window per IP), `createSessionQuota()` (per-session daily AI budget), `redactHighRiskPHI()` (strips SSN/card/MRN before the model), `scrubForLog()` + `safeLog/Warn/Error` (PII-redacting logging), `sanitizeClientError()` (no internal leakage), `TTLCache`, `getClientIp()` (X-Forwarded-For aware).
- **`server/safety.ts`** — `SAFETY_SETTINGS` (HARASSMENT / HATE / SEXUAL / DANGEROUS → BLOCK_MEDIUM_AND_ABOVE) applied to every Gemini call; `withSafety()` helper; hardened, injection-resistant `CNA_COACH_SYSTEM_INSTRUCTION`; upgraded `LIVE_VOICE_SYSTEM_INSTRUCTION` (was "You are a helpful CNA assistant"). Note: `HARM_CATEGORY_MEDICAL` from the audit does not exist in the Gemini API — medical refusal is enforced via DANGEROUS_CONTENT + the system instruction.
- **`server/stateRequirements.ts`** — deterministic CNA certification lookup for **all 50 states + DC**. Federally-accurate baseline steps (OBRA '87 / 42 CFR §483) for every state; verified specifics for CA/TX/GA/NY/FL; authoritative "verify on official registry" link + `verified:false` everywhere else (no invented fees/steps). Exposes `getStateReqs()` and `STATE_OPTIONS`.
- **`public/manifest.webmanifest`, `public/sw.js`, `public/offline.html`, `public/offline-content.json`, `public/icons/icon.svg`, `public/icons/icon-maskable.svg`** — installable PWA + offline fallback with static CNA guidance and the 988 line.
- **`src/lib/i18n.tsx`** — EN/ES framework (`LanguageProvider`, `useI18n`, `t()`, `LanguageToggle`); safety-critical strings translated, English fallback for the rest.
- **`src/lib/userProfile.ts`** — accounts/persistence hook on the existing Firebase + Firestore rules (scaffold, not yet mounted).
- **`src/lib/tier.ts`** — free/pro/enterprise feature flags (scaffold).
- **`src/components/ProgressTracker.tsx`** — progress dashboard UI (cert-renewal countdown + checklist; pure, ready to mount).
- **`src/vite-env.d.ts`** — Vite client types.
- **`START-HERE.md`, `ENTERPRISE.md`** — plain-language guide and enterprise architecture.

## Rewritten / edited
- **`server.ts`** — honors `process.env.PORT` (was hardcoded 3000); `trust proxy`; security headers; `express.json({limit:'64kb'})`; rate limiters on `/api` + stricter AI limiter + daily quota on AI routes; `SAFETY_SETTINGS` on chat/optimize/jobs/quiz/salary/live; PHI redaction on chat input + history; `sanitizeClientError()` on all error responses; PII-safe logging; **jobs + salary de-Georgia-fied** and salary anchored to BLS OEWS with 6h caching; honest salary fallback (no fake facilities); new `GET /api/states` and `GET /api/state-requirements`; quiz/state endpoints use the 50-state dataset; live-voice WebSocket gains origin allow-list + per-IP connection cap + real system instruction + safety settings.
- **`index.html`** — real `<title>` + meta description + `theme-color` + manifest link + noscript; canonical app name.
- **`src/main.tsx`** — wraps app in `LanguageProvider`; registers the service worker in production.
- **`src/components/Navigation.tsx`** — `LanguageToggle` (desktop + mobile); canonical wordmark.
- **`src/components/GeminiChat.tsx`** — i18n for greeting/HIPAA banner/labels/placeholder; fixed invalid `rose-450` class.
- **`src/App.tsx`** — footer wordmark.
- **`.env.example`** — documents `NODE_ENV`, `PORT`, `VITE_APP_TIER`.

## What the audits got wrong (verified against the real code/live app)
- **No plaintext prompt leak existed** — instructions were already in `systemInstruction`; the live app refuses extraction.
- **Medical advice was already refused** with a HIPAA pivot and correct "report to your supervising nurse" routing.
- **The skip-to-content link already existed**; the chat PHI banner already existed.
- The app targets **gemini-3.5-flash / 3.1-flash-lite**, not Gemini 1.5 Pro.

## Known follow-ups (still open)
- Expand verified state specifics beyond 5 (dataset structure supports it; flip `verified:true` as you confirm each).
- Mount `userProfile`/`ProgressTracker` behind a sign-in entry point; add push notifications.
- Full-screen ES translation coverage; read-aloud for responses.
- Enterprise tier build-out (see ENTERPRISE.md) for any PHI-containing use.
- Cloud-side: key restriction, App Check, budget alerts, Secret-stored key rotation, optional Cloud Armor.
