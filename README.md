<p align="center">
  <img src="docs/banner.svg" alt="Certified Nursing Assistant (CNA) Career Playbook" width="100%" />
</p>

<h1 align="center">Certified Nursing Assistant (CNA) Career Playbook</h1>

<p align="center">
  A trauma-informed AI career companion for Certified Nursing Assistants — state-accurate
  certification guidance, real wage data, mock interviews, résumé tailoring, and burnout support.
  <br />Built for the people who hold U.S. care on their shoulders.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Google-Gemini-8E75B2?logo=googlegemini&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Deploy-Cloud%20Run-4285F4?logo=googlecloud&logoColor=white" alt="Cloud Run" />
</p>

> **Live app:** https://nursing-assistant-career-playbook-1045681641454.us-west2.run.app

---

## Why this exists

There are roughly **1.4 million Certified Nursing Assistants** in the United States — a workforce that is overwhelmingly women, disproportionately Black, Latina, and immigrant, paid a median of about **$19/hour**, and burning out fast. CNAs do the hands-on work of care, yet the tools meant to help people *advance* their careers ignore the specifics of the role: state-by-state certification rules, the CNA-to-LPN/RN ladder, scope-of-practice boundaries, and the emotional weight of the job.

This Playbook is built for that gap. It is **not** a generic chatbot wrapper — it's a vertical career companion that combines **state-accurate certification navigation**, **grounded wage and job data**, **interview and résumé practice**, and **genuine burnout support** in one place, in English and Spanish.

> ⚕️ **Not medical advice.** The assistant is a *career* coach. It refuses clinical/medication questions and redirects anything affecting patient safety to a supervising nurse.

---

## What it does

- **🧭 AI career coach (safety-guarded).** Powered by Google Gemini with explicit safety settings, an injection-resistant system instruction, a hard scope-of-practice boundary (no medical advice), and HIPAA-aware handling that declines and redacts protected health information.
- **🗺️ 50-state + DC certification guidance.** A deterministic, rule-grounded dataset — federally-accurate baseline steps (OBRA '87 / 42 CFR §483) for every state, verified specifics where confirmed, and authoritative "verify on your official registry" links everywhere else. **No hallucinated fees or steps.**
- **💵 Real wage data.** Salary benchmarks anchored to U.S. Bureau of Labor Statistics OEWS data and refined with live Google Search grounding; cached to control cost.
- **🔎 National job search.** Live CNA / patient-care openings via search grounding (no longer region-locked).
- **🎤 Mock interviews & résumé tailoring.** STAR-method behavioral practice and ATS keyword optimization for CNA roles.
- **🔁 Retention loop.** Google / guest sign-in, a cross-device progress dashboard (certification-renewal countdown + quarterly checklist), and reminder notifications — with a local-storage fallback so it works signed-out too.
- **🌎 Bilingual (EN / ES).** Safety-critical strings translated, an in-app language toggle, and the coach replies in the user's language.
- **📲 Installable PWA + offline mode.** Works on a phone with no signal, including static certification guidance and the **988** crisis line.
- **🆘 Burnout support.** Trauma-informed tone with explicit, non-clinical escalation to the 988 Suicide & Crisis Lifeline.

---

## Tech stack & architecture

| Layer | Choice |
|---|---|
| **Front end** | React 19 · Vite 6 · TypeScript · Tailwind CSS 4 (SPA) |
| **Server** | Node · Express · `ws` (live voice) — single `server.ts` |
| **AI** | `@google/genai` → `gemini-3.5-flash` (primary), `gemini-3.1-flash-lite` (fallback), `gemini-3.1-flash-live-preview` (voice) |
| **Data / Auth** | Firebase Authentication + Cloud Firestore (owner-scoped rules) |
| **Hosting** | Google Cloud Run (built via AI Studio) |

```
Browser (PWA)  ──►  Express server  ──►  Gemini (safety settings + grounding)
   │  React SPA            │  rate limiting · PHI scrubbing · caching · security headers
   │                       └─►  /api/chat · /api/optimize · /api/jobs · /api/salary · /api/states
   └─►  Firebase Auth + Firestore  (cross-device profile & progress)
```

---

## Security & compliance

This app is hardened for a consumer (B2C) audience that should **never** enter PHI:

- **Gemini safety settings** on every call; injection / prompt-extraction resistance.
- **PHI/PII scrubbing** — SSNs, card and record numbers are stripped before the model and before any log write; logs are redacted.
- **Denial-of-wallet protection** — per-IP rate limiting + a per-session daily AI quota + response caching.
- **Hardened transport** — CSP, HSTS, `X-Content-Type-Options`, frame options, a request-size cap, and sanitized error responses (no internal details leak).
- **Sound data rules** — Firestore access is deny-by-default and owner-scoped; the Gemini API key is server-side only and never bundled to the client.

For any use that *does* involve PHI (e.g., a hospital deployment), see **[ENTERPRISE.md](ENTERPRISE.md)** for the HIPAA/BAA tier architecture (per-tenant isolation, customer-managed keys, SSO, audit logging).

---

## Quick start (local)

**Prerequisites:** Node.js 18+

```bash
npm install
# create .env.local and set your key (see .env.example)
echo 'GEMINI_API_KEY="your_key_here"' > .env.local
npm run dev
```

Open the printed URL. `npm run dev` runs the API server and the Vite app together.

---

## Build & deploy

```bash
npm run build      # vite build (client) + esbuild (server → dist/server.cjs)
npm start          # NODE_ENV=production node dist/server.cjs
```

Deploy to Cloud Run (the server honors the injected `$PORT`):

```bash
gcloud run deploy nursing-assistant-career-playbook \
  --source . --region us-west2 --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --update-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

> To enable accounts/sync and reminders, finish the one-time Firebase console steps in **[START-HERE.md](START-HERE.md) §5** (enable Google + Anonymous sign-in, add your authorized domain, deploy `firestore.rules`).

---

## Configuration

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Server-side Gemini API access |
| `APP_URL` | — | Hosted URL (self-links + live-voice origin allow-list) |
| `NODE_ENV` | — | `production` serves the built `/dist` assets |
| `PORT` | — | Injected by Cloud Run / AI Studio (default 8080) |
| `VITE_APP_TIER` | — | `free` (default) · `pro` · `enterprise` feature flags |
| `VITE_FIREBASE_VAPID_KEY` | — | Enables FCM background push (local reminders work without it) |

---

## Project structure

```
├── server.ts                 # Express + ws API server (Gemini, rate limiting, grounding)
├── server/
│   ├── security.ts           # headers, rate limiter, PHI scrubbing, error sanitization, cache
│   ├── safety.ts             # Gemini safety settings + system instructions
│   └── stateRequirements.ts  # deterministic 50-state + DC certification dataset
├── src/
│   ├── components/           # UI (Home, Resume, Playbook, Audit, chat, RetentionPanel, …)
│   └── lib/                  # i18n, userProfile (auth/Firestore), notifications, tier flags
├── public/                   # PWA: manifest, service worker, offline page, icons
├── firestore.rules           # owner-scoped security rules
├── START-HERE.md             # plain-language setup, publish & deploy guide
├── CHANGES.md                # technical change log
└── ENTERPRISE.md             # HIPAA/BAA tier architecture
```

---

## Status & roadmap

**Live & build-verified:** AI coach + safety hardening · 50-state certification data · BLS-anchored wages & national jobs · mock interviews & résumé tailoring · accounts + progress dashboard + local reminders · EN/ES · PWA/offline.

**On the path to investment-ready:**
- [ ] Expand verified state specifics beyond the five confirmed states.
- [ ] "New job match" push alerts (stored feed + diff) on top of the existing reminders.
- [ ] Full-screen Spanish coverage + response read-aloud.
- [ ] Clinical-boundary review of the burnout flow by a licensed advisor.
- [ ] Enterprise (BAA) tier build-out — see [ENTERPRISE.md](ENTERPRISE.md).

---

## Accessibility & privacy

Keyboard skip-link, ARIA labelling, 44px touch targets, and an offline crisis resource. The app is designed to avoid collecting protected health information; sample profile data ("Carla Miranda") is illustrative.

## License

© 2026 Certified Nursing Assistant (CNA) Career Playbook. All rights reserved. *(Add a `LICENSE` file before open-sourcing.)*
