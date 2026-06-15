import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

import {
  securityHeaders,
  createRateLimiter,
  createSessionQuota,
  redactHighRiskPHI,
  sanitizeClientError,
  safeWarn,
  safeError,
  TTLCache,
} from "./server/security";
import { CNA_COACH_SYSTEM_INSTRUCTION } from "./server/safety";
import { getStateReqs, STATE_OPTIONS } from "./server/stateRequirements";
import { computeTargetBand, buildPitch } from "./server/wage/negotiation";
import { chat, hasOpenRouter, type ChatMessage } from "./server/llm/openrouter";

dotenv.config();

const app = express();
// Hosts (Render / Cloud Run / Vercel) inject the port via $PORT. Never hardcode.
const PORT = Number(process.env.PORT) || 8080;
const NOT_CONFIGURED =
  "The AI service is not configured yet. Please contact the site administrator.";

// Behind a hosting proxy that sets X-Forwarded-For; trust it so rate-limit keys
// and req.ip resolve to the real client.
app.set("trust proxy", true);
app.disable("x-powered-by");
app.use(securityHeaders());
app.use(express.json({ limit: "64kb" }));

/* -------------------------------------------------------------------------- */
/* Rate limiting (denial-of-wallet protection)                                 */
/* -------------------------------------------------------------------------- */

const apiLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
const aiLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 12,
  message: "You're sending AI requests very quickly. Please wait a few seconds and try again.",
});
const aiDailyQuota = createSessionQuota(200);

app.use("/api", apiLimiter);
const aiGuards = [aiLimiter, aiDailyQuota];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Best-effort JSON parse that tolerates stray prose/markdown around the JSON. */
function parseJsonLoose<T>(text: string, fallback: T): T {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    /* fall through to extraction */
  }
  const obj = text.match(/\{[\s\S]*\}/);
  const arr = text.match(/\[[\s\S]*\]/);
  const chosen =
    arr && (!obj || (arr.index ?? 0) < (obj.index ?? 0)) ? arr : obj;
  if (chosen) {
    try {
      return JSON.parse(chosen[0]) as T;
    } catch {
      /* ignore */
    }
  }
  return fallback;
}

/* -------------------------------------------------------------------------- */
/* Chat API                                                                    */
/* -------------------------------------------------------------------------- */

app.post("/api/chat", ...aiGuards, async (req, res) => {
  try {
    const { message, history, type } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A message is required." });
    }
    if (!hasOpenRouter()) return res.status(503).json({ error: NOT_CONFIGURED });

    // Strip never-needed identifiers (SSN/card/MRN) before the model; names and
    // room numbers are preserved so the model can trigger its HIPAA pivot.
    const { text: safeMessage } = redactHighRiskPHI(message);

    const messages: ChatMessage[] = [{ role: "system", content: CNA_COACH_SYSTEM_INSTRUCTION }];
    for (const h of history || []) {
      if (h?.role === "user" || h?.role === "model") {
        messages.push({
          role: h.role === "model" ? "assistant" : "user",
          content: redactHighRiskPHI(String(h.text || "")).text,
        });
      }
    }
    messages.push({ role: "user", content: safeMessage });

    // "search"/"maps" → live web search via OpenRouter ":online". "lite" → default.
    const web = type === "search" || type === "maps";
    const text = await chat(messages, { web });
    res.json({ text });
  } catch (error: any) {
    safeError("Chat endpoint failed:", error?.message || error);
    res.status(500).json({ error: sanitizeClientError(error) });
  }
});

/* -------------------------------------------------------------------------- */
/* Playbook optimization API                                                   */
/* -------------------------------------------------------------------------- */

app.post("/api/optimize", ...aiGuards, async (req, res) => {
  try {
    const { targetSector, focusStrength, overrideExperience } = req.body || {};
    if (!hasOpenRouter()) return res.status(503).json({ success: false, error: NOT_CONFIGURED });

    const sectorLabels: Record<string, string> = {
      icu_stepdown: "Elite Hospital Networks (e.g., ICU/Emergency, Stepdown units)",
      memory_care: "Specialized Dementia, Alzheimer's & Memory Care Centers",
      private_care: "High-End Concierge Private Care & Palliative Operations",
      warehouse_logistics: "Healthcare Logistics, Medication Supply Chain & Sterile Operations (Sanofi hybrid)",
      general: "General High-Performance Clinical CNA & Post-Acute Rehab Care",
    };
    const sectorName = sectorLabels[targetSector] || sectorLabels.general;
    const safeOverride = redactHighRiskPHI(String(overrideExperience || "None provided")).text;

    const systemInstruction = `You are an elite healthcare career strategist specializing in Certified Nursing Assistant (CNA) positioning. Your goal is to optimize and rewrite Carla Miranda's Nursing Assistant Career Playbook for a highly specialized target area: "${sectorName}".

Target Focus Strength: ${focusStrength || "General Medical Rigor"}
Current User Additions/Latest Shift Updates: "${safeOverride}"

Baseline Context about Carla Miranda:
- CNA with 13+ years of patient care experience.
- Decatur Center for Nursing and Healing: Feb 2024 - Present. 35+ residents daily. Logged 12+ vital sets per shift. Fall prevention led to 15% fall reduction shift-over-shift. 10% patient satisfaction boost.
- Healing Hands Private Care: Oct 2020 - Feb 2024. Supported 50+ weekly complex patients. 12+ vitals monitored. Trained 3 new team members in infection control.
- Sanofi General Warehouse (2017 - 2020): Warehouse Operator. Sorted 500+ medication packages/shipments weekly with 100% labeling accuracy and strict sterile tracking.
- Geo Residential (2012 - 2017): CNA. Assisted 40+ residents daily. Anxiety de-escalation protocols.

Rules for Auto-Optimization:
1. Increase "vocabulary density" by embedding heavy clinical/systems keywords specific to the chosen target sector.
2. Structure her Decatur Experience bullet points as metric-driven "Mini-Arcs" (Challenge -> Action -> Measurable Outcome). Show how her Sanofi logistics experience gives her unique pharmaceutical accuracy and sterile inventory skills.
3. Rewrite her Case Study (Success vs Failure) to match clinical problem solving inside ${sectorName}.
4. Provide a tailored Gap Analysis Matrix showing where the industry lacks matches for this sector and what the Opportunity sizes are.
5. Provide 4 tailored resource cards relevant to this career sector target.
6. Return a single valid JSON object. Do not include markdown code fences.

The output MUST be a JSON object with this exact structure:
{
  "metrics": { "dailyResidentsCount": "e.g., 35+", "vitalSignsCount": "e.g., 12+", "fallReductionPct": "e.g., 15%", "satisfactionIncreasePct": "e.g., 10%", "trainingCount": "e.g., 3", "warehousePackagesCount": "e.g., 500+" },
  "resume": {
    "professionalSummary": "CNA professional summary tailored with high-impact words",
    "clinicalCompetencies": ["skill1","skill2","skill3","skill4","skill5"],
    "mobilitySafety": ["skill1","skill2","skill3","skill4"],
    "systemsAdmin": ["skill1","skill2","skill3","skill4"],
    "experiences": [
      { "company": "Decatur Center for Nursing and Healing", "location": "Atlanta, GA", "title": "Certified Nursing Assistant (CNA)", "dateRange": "Feb 2024 – Present", "bullets": [ { "id": "dec-1", "text": "tailored bullet 1" }, { "id": "dec-2", "text": "tailored bullet 2" }, { "id": "dec-3", "text": "tailored bullet 3" }, { "id": "dec-4", "text": "tailored bullet 4" } ] },
      { "company": "Healing Hands Private Care", "location": "Atlanta, GA", "title": "Certified Nursing Assistant (CNA)", "dateRange": "Oct 2020 – Feb 2024", "bullets": [ { "id": "heal-1", "text": "tailored bullet 1" }, { "id": "heal-2", "text": "tailored bullet 2" }, { "id": "heal-3", "text": "tailored bullet 3" } ] },
      { "company": "Sanofi General Warehouse", "location": "Forest Park, GA", "title": "General Warehouse Operator", "dateRange": "Mar 2017 – Oct 2020", "bullets": [ { "id": "sano-1", "text": "tailored bullet 1 emphasizing sterile medical supply chains" }, { "id": "sano-2", "text": "tailored bullet 2 emphasizing precision" } ] }
    ]
  },
  "caseStudies": [
    { "title": "A clinical dilemma title", "type": "success", "challenge": "...", "action": "...", "outcome": "...", "metrics": "..." },
    { "title": "Another complex dilemma title", "type": "failure", "challenge": "...", "action": "...", "outcome": "...", "metrics": "..." }
  ],
  "gaps": [
    { "stage": "Sourcing", "exists": "...", "missing": "...", "opportunitySize": "Est. TAM like $480M" },
    { "stage": "Credentialing", "exists": "...", "missing": "...", "opportunitySize": "Size" }
  ],
  "resources": [ { "type": "type", "name": "resource name", "desc": "description", "why": "value for Carla", "radar": "Off Radar", "category": "agency" } ],
  "editorialBrief": { "focusTitle": "...", "focusSub": "...", "focusDetails": "...", "vignetteTitle": "...", "vignetteBody": "A 100-word narrative" }
}`;

    const text = await chat(
      [
        { role: "system", content: systemInstruction },
        { role: "user", content: "Optimize Carla Miranda's Certified Nursing Assistant Playbook and return the structured JSON object." },
      ],
      { json: true, maxTokens: 4000 }
    );
    const parsedData = parseJsonLoose<Record<string, unknown> | null>(text, null);
    if (!parsedData) throw new Error("Could not parse optimization output.");

    res.json({ success: true, targetSector, optimizedPlaybook: parsedData });
  } catch (error: any) {
    safeError("Optimization endpoint failed:", error?.message || error);
    res.status(500).json({ success: false, error: sanitizeClientError(error) });
  }
});

/* -------------------------------------------------------------------------- */
/* Live jobs search (web-search-backed, national, cached)                      */
/* -------------------------------------------------------------------------- */

const jobsCache = new TTLCache<any[]>(6 * 60 * 60 * 1000);

app.post("/api/jobs/search", ...aiGuards, async (req, res) => {
  try {
    const { searchQuery, location, state } = req.body || {};
    if (!hasOpenRouter()) return res.status(503).json({ success: false, error: NOT_CONFIGURED, jobs: [] });

    const stateReqs = state ? getStateReqs(state) : null;
    const region = location && location !== "All"
      ? `${location}${stateReqs ? ", " + stateReqs.name : ""}`
      : (stateReqs ? stateReqs.name : "the United States");
    const keywordStr = searchQuery ? `with keywords "${String(searchQuery).slice(0, 120)}"` : "CNA Certified Nursing Assistant";

    const cacheKey = `${region}|${keywordStr}`.toLowerCase();
    const cached = jobsCache.get(cacheKey);
    if (cached) return res.json({ success: true, jobs: cached, cached: true });

    const promptText = `Use live web search to find active Certified Nursing Assistant (CNA), Patient Care Assistant, Patient Care Tech, or Nurse Aide job openings in ${region} ${keywordStr}.
Find 4 to 6 REAL, active listings from hospital, clinical, geriatric, senior-living, or reputable job-board sites for that area. Do not fabricate facility names. If exact pay isn't disclosed, estimate a realistic local hourly rate anchored to U.S. BLS OEWS data for SOC 31-1131 and note it's an estimate.
Return ONLY a JSON object of the form: {"jobs": [ { "id": "cna-job-1", "facility": "string", "location": "string", "title": "string", "basePay": 22.5, "nightDiff": 1.5, "weekendDiff": 2.5, "shiftType": "Day Shift", "hoursPerWeek": 36, "description": "string", "benefits": ["a","b"], "contactEmail": "https://careers...", "isVerified": true, "sourceUrl": "https://..." } ] }`;

    const text = await chat(
      [
        { role: "system", content: "You are a U.S. healthcare recruitment specialist. Use live web search to find real, active CNA jobs and return clean JSON. Never invent facility names or mock listings." },
        { role: "user", content: promptText },
      ],
      { json: true, web: true }
    );

    const parsed = parseJsonLoose<{ jobs?: any[] }>(text, {});
    const parsedJobs = Array.isArray(parsed?.jobs) ? parsed.jobs : [];
    if (parsedJobs.length > 0) jobsCache.set(cacheKey, parsedJobs);
    res.json({ success: true, jobs: parsedJobs });
  } catch (error: any) {
    safeError("Jobs search failure:", error?.message || error);
    res.status(500).json({ success: false, error: sanitizeClientError(error), jobs: [] });
  }
});

/* -------------------------------------------------------------------------- */
/* State requirements API (deterministic, national coverage)                   */
/* -------------------------------------------------------------------------- */

app.get("/api/states", (_req, res) => {
  res.json({ success: true, states: STATE_OPTIONS });
});

app.get("/api/state-requirements", (req, res) => {
  const code = (req.query.code as string) || (req.query.state as string) || "GA";
  res.json({ success: true, ...getStateReqs(code) });
});

/* -------------------------------------------------------------------------- */
/* Quiz → next-step generator                                                  */
/* -------------------------------------------------------------------------- */

app.post("/api/quiz/result", ...aiGuards, async (req, res) => {
  try {
    const { score, stateCode } = req.body || {};
    const finalScore = typeof score === "number" ? score : 50;
    const stateReqs = getStateReqs((stateCode || "GA").toUpperCase());

    let path: "full_speed" | "cautious" | "explore_other" = "cautious";
    if (finalScore >= 70) path = "full_speed";
    else if (finalScore < 40) path = "explore_other";

    let nearestProgram = {
      name: "Local State-Approved Training Program",
      url: stateReqs.officialUrl,
      location: stateReqs.name,
      estimatedCost: "Varies — confirm with the program",
      fundingAvailable: true,
    };

    if (path === "full_speed" && hasOpenRouter()) {
      try {
        const searchPrompt = `Use live web search to find one real, state-approved, active CNA school, institute, or community college in ${stateReqs.name}. Return ONLY JSON: {"name": "string", "url": "string", "location": "string", "estimatedCost": "string", "fundingAvailable": boolean}. No invented schools.`;
        const text = await chat(
          [{ role: "system", content: "You find real, state-approved CNA training programs and return clean JSON. Never invent schools." }, { role: "user", content: searchPrompt }],
          { json: true, web: true }
        );
        const pData = parseJsonLoose<any>(text, {});
        if (pData.name) {
          nearestProgram = {
            name: pData.name,
            url: pData.url || stateReqs.officialUrl,
            location: pData.location || stateReqs.name,
            estimatedCost: pData.estimatedCost || "Varies — confirm with the program",
            fundingAvailable: pData.fundingAvailable !== undefined ? pData.fundingAvailable : true,
          };
        }
      } catch (err: any) {
        safeWarn("Quiz program search failed, using state defaults:", err?.message || err);
      }
    }

    let planSteps: string[] = [];
    if (path === "full_speed") {
      planSteps = [
        `Enroll in State-Approved Training: Enroll at ${nearestProgram.name} in ${nearestProgram.location}. (Meets ${stateReqs.name}'s minimum of ${stateReqs.minHours} training hours${stateReqs.verified ? "" : " — confirm current hours on the official registry"}.)`,
        ...stateReqs.extraSteps.map((step, idx) => `State Step ${idx + 1}: ${step}`),
        `Schedule & Sit Exam: Register for your CNA competency exam via ${stateReqs.examVendor} (${stateReqs.examUrl}).`,
      ];
    } else if (path === "cautious") {
      planSteps = [
        "Shadow and Explore: Take a free simulated shadowing module (first-person clinical videos of daily resident vitals & care).",
        "Local Information Session: Attend an info forum at a community facility near you.",
        "Sample Module: Complete a free basic HIPAA guidelines microcourse.",
      ];
    } else {
      planSteps = [
        "Consider Medical Receptionist Roles: Maintain patient registries and manage point-of-care EHR logistics without physical-hazard exposure.",
        "Explore Home Health Aide (HHA) Paths: more flexible personal schedules with less intensive ward rotations.",
        "Explore Pharmacy Technician Options: specialized sterile inventory flows & labeling systems.",
      ];
    }

    res.json({
      success: true,
      readinessScore: finalScore,
      path,
      nearestProgram,
      planSteps,
      examVendor: stateReqs.examVendor,
      examLink: stateReqs.examUrl,
      officialUrl: stateReqs.officialUrl,
      verified: stateReqs.verified,
      fundingLinks: stateReqs.fundingLinks,
    });
  } catch (error: any) {
    safeError("Quiz result endpoint failure:", error?.message || error);
    res.status(500).json({ success: false, error: sanitizeClientError(error) });
  }
});

/* -------------------------------------------------------------------------- */
/* Salary benchmarking (BLS-anchored, web-backed, cached)                      */
/* -------------------------------------------------------------------------- */

const salaryCache = new TTLCache<any>(6 * 60 * 60 * 1000);

app.get("/api/salary-benchmark", aiLimiter, async (req, res) => {
  try {
    const zipCode = (req.query.zip as string) || "";
    const roleTitle = (req.query.role as string) || "Certified Nursing Assistant";
    const areaLabel = zipCode ? `ZIP ${zipCode}` : "the United States";

    const cacheKey = `${zipCode}|${roleTitle}`.toLowerCase();
    const cached = salaryCache.get(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    let median = 21.5, p25 = 18.5, p75 = 24.5, activePostingsCount = 0;
    let source = "Regional estimate (BLS OEWS-anchored)";
    let grounded = false;
    let sampledJobs: any[] = [];

    if (hasOpenRouter()) {
      try {
        const salaryPrompt = `Use live web search to find current hourly pay for "${roleTitle}" roles in or near ${areaLabel}. Anchor figures to U.S. BLS OEWS data for SOC 31-1131 (Nursing Assistants) for that area, then refine with live postings.
Return ONLY JSON: {"median": number, "p25": number, "p75": number, "listingsCount": number, "postings": [ { "facility": "real employer", "wage": "string", "title": "string" } ], "source": "cite BLS OEWS and/or sources used"}. Use only real employer names; do not fabricate.`;
        const text = await chat(
          [{ role: "system", content: "You report grounded U.S. wage data and return clean JSON. Never fabricate employers." }, { role: "user", content: salaryPrompt }],
          { json: true, web: true }
        );
        const resData = parseJsonLoose<any>(text, {});
        if (resData.median) {
          median = Number(resData.median);
          p25 = Number(resData.p25 || (median - 2.5));
          p75 = Number(resData.p75 || (median + 3.0));
          activePostingsCount = Number(resData.listingsCount || 0);
          source = resData.source || "BLS OEWS + live job-board search";
          sampledJobs = Array.isArray(resData.postings) ? resData.postings : [];
          grounded = true;
        }
      } catch (err: any) {
        safeWarn("Live salary search failed; using BLS-anchored estimate:", err?.message || err);
      }
    }

    if (sampledJobs.length === 0) {
      sampledJobs = [
        { facility: "Regional estimate (no live listings matched)", wage: `$${p25.toFixed(2)} – $${p75.toFixed(2)}`, title: roleTitle },
      ];
    }

    const payload = {
      success: true,
      role: roleTitle,
      zip: zipCode,
      median, p25, p75,
      listingsCount: activePostingsCount,
      postings: sampledJobs,
      source,
      grounded,
      updatedAt: new Date().toISOString(),
    };
    if (grounded) salaryCache.set(cacheKey, payload);
    res.json(payload);
  } catch (error: any) {
    safeError("Salary benchmarking failure:", error?.message || error);
    res.status(500).json({ success: false, error: sanitizeClientError(error) });
  }
});

/* -------------------------------------------------------------------------- */
/* Wage Negotiation Engine (web-backed market stats → deterministic band+pitch)*/
/* -------------------------------------------------------------------------- */

app.post("/api/negotiation", ...aiGuards, async (req, res) => {
  try {
    const { role, location, yearsExperience, currentWage, strengths } = req.body || {};
    const safeRole = redactHighRiskPHI(String(role || "Certified Nursing Assistant")).text.slice(0, 80);
    const safeLocation = redactHighRiskPHI(String(location || "")).text.slice(0, 80);
    const safeStrengths = Array.isArray(strengths)
      ? strengths.slice(0, 6).map((s: any) => redactHighRiskPHI(String(s)).text.slice(0, 120))
      : [];

    let stats = { median: 21.5, p25: 18.5, p75: 24.5 };
    let employers: { name: string; wageRange?: string }[] = [];
    let grounded = false;

    if (hasOpenRouter()) {
      try {
        const prompt = `Use live web search to find current hourly wage data for "${safeRole}" roles${safeLocation ? ` near ${safeLocation}` : " in the United States"}. Anchor figures to U.S. BLS OEWS (SOC 31-1131) for that area, then refine with live postings. Also list up to 3 real employers currently hiring with their posted wage range.
Return ONLY JSON: {"median": number, "p25": number, "p75": number, "employers": [{"name": "real employer", "wageRange": "string"}], "source": "string"}. Use only real employer names; never fabricate.`;
        const text = await chat(
          [{ role: "system", content: "You report grounded U.S. wage data and return clean JSON. Never fabricate employers." }, { role: "user", content: prompt }],
          { json: true, web: true }
        );
        const data = parseJsonLoose<any>(text, {});
        if (data.median) {
          const m = Number(data.median);
          stats = { median: m, p25: Number(data.p25 || m - 3), p75: Number(data.p75 || m + 3) };
          employers = Array.isArray(data.employers) ? data.employers.slice(0, 3) : [];
          grounded = true;
        }
      } catch (err: any) {
        safeWarn("Negotiation market search failed; using BLS-anchored estimate:", err?.message || err);
      }
    }

    const band = computeTargetBand({
      yearsExperience: Number(yearsExperience) || 0,
      currentWage: currentWage ? Number(currentWage) : undefined,
      ...stats,
    });
    const { pitch, talkingPoints } = buildPitch(
      { role: safeRole, location: safeLocation, yearsExperience: Number(yearsExperience) || 0, strengths: safeStrengths },
      band,
      employers
    );

    res.json({ success: true, band, stats, employers, pitch, talkingPoints, grounded });
  } catch (error: any) {
    safeError("Negotiation endpoint failed:", error?.message || error);
    res.status(500).json({ success: false, error: sanitizeClientError(error) });
  }
});

/* -------------------------------------------------------------------------- */
/* Health check                                                                */
/* -------------------------------------------------------------------------- */

app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

/* -------------------------------------------------------------------------- */
/* Server bootstrap (no WebSocket — request/response only, serverless-ready)   */
/* -------------------------------------------------------------------------- */

async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CNA Playbook Server running on http://localhost:${PORT}`);
  });
}

runServer();
