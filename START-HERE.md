# START HERE — Certified Nursing Assistant (CNA) Career Playbook (Hardened Build)

This is your app, with the security, safety, and feature fixes from the audit applied.
Everything here **builds and runs** (verified: type-check, production build, and a live
server smoke test all pass). This page is in plain English. The deep technical list is in
**CHANGES.md**.

> **App name is now consistent everywhere:** *Certified Nursing Assistant (CNA) Career Playbook.*
> The "Assistant" word is never dropped in any file.

---

## 1) What changed, in plain words

**Safety & security (all done):**
- The AI now has **safety filters** turned on (blocks harassment, hate, sexual, and dangerous content).
- It **refuses to leak its own instructions** and resists "ignore previous instructions" tricks.
- **Sensitive personal data** (Social Security numbers, card numbers, medical record numbers) is **scrubbed** before anything is logged or sent to the AI. Logs no longer store raw personal info.
- **Rate limiting** stops someone from hammering the AI to run up your bill (a "denial-of-wallet" attack), plus a daily per-user cap.
- **Security headers** (the kind a bank site uses) are added to every response.
- Error messages shown to users are now **generic** — no internal details leak out.
- The server now uses the **port the host gives it** ($PORT), so it deploys cleanly on Cloud Run.

**Accuracy & reach (all done):**
- State certification info now covers **all 50 states + DC** (was 5). Where we have verified specifics, they're shown; everywhere else the app shows the **federally-accurate steps** and an **official "verify here" link** — it never makes up fees or steps.
- Job search and salary are **no longer locked to Georgia**, and salary is **anchored to U.S. Bureau of Labor Statistics data**, then refined with live web results. Repeated lookups are **cached** to save cost.

**Experience (done + scaffolded):**
- **Spanish** support is live for the safety-critical text, with an EN/ES toggle in the header. The AI also replies in Spanish when you write in Spanish. (Full translation of every screen is set up to expand over time.)
- **Offline mode (PWA):** the app can be installed to a phone and shows useful CNA guidance + the 988 crisis line even with no signal.
- **Accounts + progress dashboard** and an **enterprise (hospital/HIPAA) tier** are scaffolded — ready-to-wire modules + docs, not yet turned on. See CHANGES.md and ENTERPRISE.md.

---

## 2) Run it on your computer

**You need:** Node.js 18+ installed.

```bash
npm install
# put your OpenRouter key in a file named .env.local  (see .env.example)
# get a free key at openrouter.ai/keys
npm run dev
```
Then open the URL it prints. (`npm run dev` runs the server + app together.)

To test the real production build locally:
```bash
npm run build
NODE_ENV=production OPENROUTER_API_KEY=your_key_here npm start
```

---

## 3) Publish the fixes to GitHub

You have two easy options. **Option A** makes a clean pull request (recommended).

**Option A — push as a branch and open a PR:**
```bash
cd nursing-assistant-career-playbook   # the unzipped folder
git init
git add -A
git commit -m "Harden app: security, safety settings, 50-state data, i18n, PWA, naming"
git branch -M hardening
git remote add origin https://github.com/coreyalejandro/nursing-assistant-career-playbook.git
git push -u origin hardening
```
Then on GitHub, click **"Compare & pull request"** for the `hardening` branch and merge it.

**Option B — drag-and-drop:** on github.com, open your repo → **Add file → Upload files**, drag the changed files in, and commit. (Use Option A if you can — it preserves the folder structure for nested files like `server/` and `public/icons/`.)

---

## 4) Deploy

> **Note:** this project is migrating off Google AI Studio / Cloud Run to **Vercel + Supabase + OpenRouter** (more future-proof, no Google lock-in). The Vercel deploy steps will replace this section once that migration lands. Until then, the Cloud Run path below still works.

**With the gcloud CLI:**
```bash
gcloud run deploy nursing-assistant-career-playbook \
  --source . \
  --region us-west2 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --update-secrets OPENROUTER_API_KEY=OPENROUTER_API_KEY:latest
```
(The server now honors Cloud Run's `$PORT` automatically.)

---

## 5) A few things only YOU can do (cloud console — 15 min)

These finish the security story and can't be done from code:
- [ ] **Turn on the retention loop (accounts + reminders):** in the Firebase console → **Authentication → Sign-in method**, enable **Google** and **Anonymous**; under **Settings → Authorized domains**, add your Cloud Run domain. Then deploy the updated rules: `firebase deploy --only firestore:rules`. *(Until then, the progress dashboard still works locally per-device; sign-in just won't sync across devices.)*
- [ ] *(Optional)* **Background push when the app is closed:** in Firebase console → **Project settings → Cloud Messaging → Web Push certificates**, generate a key and set it as `VITE_FIREBASE_VAPID_KEY`. Local reminders work without this.
- [ ] **Restrict the Firebase web API key** (Google Cloud Console → Credentials → HTTP referrer + API restrictions) and turn on **Firebase App Check**. The key in `firebase-applet-config.json` is a public client ID by design, but restricting it blocks abuse.
- [ ] **Set a budget alert** on the project so AI usage can't surprise you.
- [ ] **Confirm the `OPENROUTER_API_KEY`** is stored as a **Secret** (not a plain env var) and rotate it if it was ever shared.
- [ ] (Optional) Put **Cloud Armor** in front of Cloud Run for network-level rate limiting on top of the app-level limits already added.

---

## 6) Rename reminder
If the **conversation/thread title** anywhere still says "Nursing Career Playbook," rename it to
**Certified Nursing Assistant (CNA) Career Playbook**. The app's own code is already consistent.
