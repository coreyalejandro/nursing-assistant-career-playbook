import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { WebSocketServer } from "ws";
import { createServer } from "http";

import {
  securityHeaders,
  createRateLimiter,
  createSessionQuota,
  redactHighRiskPHI,
  sanitizeClientError,
  safeWarn,
  safeError,
  TTLCache,
  getClientIp,
} from "./server/security";
import {
  SAFETY_SETTINGS,
  withSafety,
  CNA_COACH_SYSTEM_INSTRUCTION,
  LIVE_VOICE_SYSTEM_INSTRUCTION,
} from "./server/safety";
import {
  getStateReqs,
  STATE_OPTIONS,
} from "./server/stateRequirements";

dotenv.config();

const app = express();
// Cloud Run / AI Studio inject the port via $PORT (default 8080). Never hardcode.
const PORT = Number(process.env.PORT) || 8080;

// Cloud Run terminates TLS at a front proxy and sets X-Forwarded-For; trust it
// so rate-limit keys and req.ip resolve to the real client.
app.set("trust proxy", true);
app.disable("x-powered-by");

// Hardening headers (CSP, HSTS, nosniff, frame options, permissions policy).
app.use(securityHeaders());

// Cap request bodies so a malicious client cannot send huge payloads.
app.use(express.json({ limit: "64kb" }));

/* -------------------------------------------------------------------------- */
/* Rate limiting (denial-of-wallet protection)                                 */
/* -------------------------------------------------------------------------- */

// Broad limiter across all API routes.
const apiLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
// Stricter limiter for endpoints that spend Gemini tokens.
const aiLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 12,
  message: "You're sending AI requests very quickly. Please wait a few seconds and try again.",
});
// Per-session daily budget for AI features.
const aiDailyQuota = createSessionQuota(200);

app.use("/api", apiLimiter);
const aiGuards = [aiLimiter, aiDailyQuota];

/* -------------------------------------------------------------------------- */
/* Gemini client                                                               */
/* -------------------------------------------------------------------------- */

let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      safeWarn("WARNING: GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY_FOR_BUILD_ONLY",
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

function hasApiKey(res: express.Response): boolean {
  if (!process.env.GEMINI_API_KEY) {
    res.status(503).json({
      success: false,
      error: "The AI service is not configured yet. Please contact the site administrator.",
    });
    return false;
  }
  return true;
}

// Utility: generate content with retries + fallback model on transient errors.
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: { model: string; contents: any; config?: any }
): Promise<any> {
  const modelsToTry = [params.model];
  if (params.model === "gemini-3.5-flash") modelsToTry.push("gemini-3.1-flash-lite");
  else if (params.model === "gemini-3.1-flash-lite") modelsToTry.push("gemini-3.5-flash");

  let lastError: any = null;
  for (const modelToUse of modelsToTry) {
    const maxRetries = 2;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await ai.models.generateContent({
          model: modelToUse,
          contents: params.contents,
          config: params.config,
        });
      } catch (err: any) {
        lastError = err;
        safeWarn(`Attempt ${attempt + 1} with model ${modelToUse} failed:`, err.message || err);
        const isTransient =
          err.status === 503 || err.status === 429 ||
          (err.message && (err.message.includes("503") || err.message.includes("429") || err.message.includes("high demand") || err.message.includes("temporary") || err.message.includes("UNAVAILABLE")));
        if (isTransient && attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }
  throw lastError;
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
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "The AI service is not configured yet. Please contact the site administrator." });
    }

    // Strip never-needed high-risk identifiers (SSN/card/MRN) before the model.
    // Names/room numbers are preserved so the model can trigger its HIPAA pivot.
    const { text: safeMessage } = redactHighRiskPHI(message);

    const ai = getGemini();
    let primaryModel = "gemini-3.5-flash";
    const tools: any[] = [];
    const config: any = {
      systemInstruction: CNA_COACH_SYSTEM_INSTRUCTION,
      safetySettings: SAFETY_SETTINGS,
    };

    if (type === "search") {
      tools.push({ googleSearch: {} });
      config.toolConfig = { includeServerSideToolInvocations: true };
    } else if (type === "maps") {
      tools.push({ googleMaps: {} });
    } else if (type === "lite") {
      primaryModel = "gemini-3.1-flash-lite";
    }
    if (tools.length > 0) config.tools = tools;

    const formattedHistory = (history || [])
      .filter((h: any) => h.role === "user" || h.role === "model")
      .map((h: any) => ({
        role: h.role,
        parts: [{ text: redactHighRiskPHI(String(h.text || "")).text }],
      }));

    const modelsToTry = [primaryModel];
    if (primaryModel === "gemini-3.5-flash") modelsToTry.push("gemini-3.1-flash-lite");

    let lastError: any = null;
    let responseText = "";

    for (const modelToUse of modelsToTry) {
      const maxRetries = 2;
      let success = false;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const chat = ai.chats.create({ model: modelToUse, config, history: formattedHistory });
          const response = await chat.sendMessage({ message: safeMessage });
          responseText = response.text || "";
          success = true;
          break;
        } catch (err: any) {
          lastError = err;
          safeWarn(`Chat attempt ${attempt + 1} with model ${modelToUse} failed:`, err.message || err);
          const isTransient =
            err.status === 503 || err.status === 429 ||
            (err.message && (err.message.includes("503") || err.message.includes("429") || err.message.includes("high demand") || err.message.includes("temporary") || err.message.includes("UNAVAILABLE")));
          if (isTransient && attempt < maxRetries - 1) {
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
            continue;
          }
          break;
        }
      }
      if (success) break;
    }

    if (!responseText && lastError) throw lastError;
    res.json({ text: responseText });
  } catch (error: any) {
    safeError("Gemini chat endpoint failed:", error?.message || error);
    res.status(500).json({ error: sanitizeClientError(error) });
  }
});

/* -------------------------------------------------------------------------- */
/* Playbook optimization API                                                   */
/* -------------------------------------------------------------------------- */

app.post("/api/optimize", ...aiGuards, async (req, res) => {
  try {
    const { targetSector, focusStrength, overrideExperience } = req.body || {};
    if (!hasApiKey(res)) return;
    const ai = getGemini();

    const sectorLabels: Record<string, string> = {
      icu_stepdown: "Elite Hospital Networks (e.g., ICU/Emergency, Stepdown units)",
      memory_care: "Specialized Dementia, Alzheimer's & Memory Care Centers",
      private_care: "High-End Concierge Private Care & Palliative Operations",
      warehouse_logistics: "Healthcare Logistics, Medication Supply Chain & Sterile Operations (Sanofi hybrid)",
      general: "General High-Performance Clinical CNA & Post-Acute Rehab Care",
    };
    const sectorName = sectorLabels[targetSector] || sectorLabels.general;

    // Sanitize free-text user override before embedding it in the prompt.
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
6. Return the result in a valid, strictly structured JSON format matching the specified schema. Do not include markdown code block characters like \`\`\`json or \`\`\`.

The output MUST be a JSON object with this exact structure:
{
  "metrics": {
    "dailyResidentsCount": "e.g., 35+",
    "vitalSignsCount": "e.g., 12+",
    "fallReductionPct": "e.g., 15%",
    "satisfactionIncreasePct": "e.g., 10%",
    "trainingCount": "e.g., 3",
    "warehousePackagesCount": "e.g., 500+"
  },
  "resume": {
    "professionalSummary": "CNA professional summary tailored with high-impact words",
    "clinicalCompetencies": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "mobilitySafety": ["skill1", "skill2", "skill3", "skill4"],
    "systemsAdmin": ["skill1", "skill2", "skill3", "skill4"],
    "experiences": [
      {
        "company": "Decatur Center for Nursing and Healing",
        "location": "Atlanta, GA",
        "title": "Certified Nursing Assistant (CNA)",
        "dateRange": "Feb 2024 – Present",
        "bullets": [
          { "id": "dec-1", "text": "tailored bullet 1 with high clinical vocabulary density" },
          { "id": "dec-2", "text": "tailored bullet 2 with high clinical vocabulary density" },
          { "id": "dec-3", "text": "tailored bullet 3 with high clinical vocabulary density" },
          { "id": "dec-4", "text": "tailored bullet 4" }
        ]
      },
      {
        "company": "Healing Hands Private Care",
        "location": "Atlanta, GA",
        "title": "Certified Nursing Assistant (CNA)",
        "dateRange": "Oct 2020 – Feb 2024",
        "bullets": [
          { "id": "heal-1", "text": "tailored private care bullet 1" },
          { "id": "heal-2", "text": "tailored bullet 2" },
          { "id": "heal-3", "text": "tailored bullet 3" }
        ]
      },
      {
        "company": "Sanofi General Warehouse",
        "location": "Forest Park, GA",
        "title": "General Warehouse Operator",
        "dateRange": "Mar 2017 – Oct 2020",
        "bullets": [
          { "id": "sano-1", "text": "tailored warehouse bullet 1 emphasizing medical supply chains, sterile packing or temperature control" },
          { "id": "sano-2", "text": "tailored bullet 2 emphasizing precision" }
        ]
      }
    ]
  },
  "caseStudies": [
    {
      "title": "A title of a clinical dilemma in this sector",
      "type": "success",
      "challenge": "What was the critical challenge?",
      "action": "What clinical action did Carla take?",
      "outcome": "What was the resolution?",
      "metrics": "The metric impact"
    },
    {
      "title": "A title of another complex care refusal or transport dilemma",
      "type": "failure",
      "challenge": "Challenge where an initial attempt failed",
      "action": "Refactored therapeutic adjustment Carla designed",
      "outcome": "Protocols updated",
      "metrics": "Measurement impact"
    }
  ],
  "gaps": [
    {
      "stage": "Sourcing",
      "exists": "What works poorly now",
      "missing": "The advanced match missing layer in this sector",
      "opportunitySize": "Est. TAM like $480M"
    },
    {
      "stage": "Credentialing",
      "exists": "Certs",
      "missing": "What is missing",
      "opportunitySize": "Size"
    }
  ],
  "resources": [
    {
      "type": "type",
      "name": "resource name",
      "desc": "resource description",
      "why": "specific value for Carla in this track",
      "radar": "Off Radar",
      "category": "agency"
    }
  ],
  "editorialBrief": {
    "focusTitle": "Focus theme title (e.g., Trauma & ICU safety partner)",
    "focusSub": "Specialty brief subtitle",
    "focusDetails": "A synthesis of how Carla stands out",
    "vignetteTitle": "A custom clinical mini-story title",
    "vignetteBody": "A 100-word beautiful narrative of her care"
  }
}`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: "Optimize Carla Miranda's Certified Nursing Assistant Playbook and return the structured JSON.",
      config: withSafety({ systemInstruction, responseMimeType: "application/json" }),
    });

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      safeError("JSON parse error from optimize outcome.");
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsedData = JSON.parse(jsonMatch[0]);
      else throw parseError;
    }

    res.json({ success: true, targetSector, optimizedPlaybook: parsedData });
  } catch (error: any) {
    safeError("Gemini optimization endpoint failed:", error?.message || error);
    res.status(500).json({ success: false, error: sanitizeClientError(error) });
  }
});

/* -------------------------------------------------------------------------- */
/* Live jobs search (Google Search grounding) — national, cached               */
/* -------------------------------------------------------------------------- */

const jobsCache = new TTLCache<any[]>(6 * 60 * 60 * 1000); // 6h

app.post("/api/jobs/search", ...aiGuards, async (req, res) => {
  try {
    const { searchQuery, location, state } = req.body || {};
    if (!hasApiKey(res)) return;

    const ai = getGemini();
    const stateReqs = state ? getStateReqs(state) : null;
    const region = location && location !== "All"
      ? `${location}${stateReqs ? ", " + stateReqs.name : ""}`
      : (stateReqs ? stateReqs.name : "the United States");
    const keywordStr = searchQuery ? `with keywords "${String(searchQuery).slice(0, 120)}"` : "CNA Certified Nursing Assistant";

    const cacheKey = `${region}|${keywordStr}`.toLowerCase();
    const cached = jobsCache.get(cacheKey);
    if (cached) return res.json({ success: true, jobs: cached, cached: true });

    const promptText = `Search the live web using Google Search for active Certified Nursing Assistant (CNA), Patient Care Assistant, Patient Care Tech, or Nurse Aide job openings in ${region} ${keywordStr}.
Find 4 to 6 REAL, active job listings currently open for applications on hospital, clinical, geriatric, senior-living, or reputable job-board sites for that area.

For each real, active job, translate the details into the structured format below.
IMPORTANT: Return a JSON array of objects for THESE REAL LISTINGS. Do not fabricate facility names. If exact pay is not disclosed, estimate a realistic local hourly rate anchored to U.S. Bureau of Labor Statistics OEWS data for SOC 31-1131 (Nursing Assistants) for that metro, and mark it as an estimate in the description.

The returned JSON MUST match this exact schema:
[
  {
    "id": "string (unique ID like 'cna-job-1')",
    "facility": "string (real hospital or care facility name)",
    "location": "string (City name)",
    "title": "string (Job Title)",
    "basePay": number (hourly wage as a float, e.g., 22.50),
    "nightDiff": number (e.g., 1.50),
    "weekendDiff": number (e.g., 2.50),
    "shiftType": "Day Shift" | "Night Shift" | "Weekend Shift" | "Flexible",
    "hoursPerWeek": number,
    "description": "string (2-3 sentences; note if pay is a BLS-anchored estimate)",
    "benefits": ["string", "string", "string"],
    "contactEmail": "string (real careers/application page URL)",
    "isVerified": true,
    "sourceUrl": "string (actual web source URL from Google Search grounding)"
  }
]

Return only valid raw JSON (no markdown, no commentary). If no active jobs are found, return recent standard active CNA listings for that area; never use dummy placeholder names.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: withSafety({
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
        systemInstruction:
          "You are an elite U.S. healthcare recruitment specialist. You use live, verified Google Search grounding to find active, real-world open CNA clinical jobs and output clean structured JSON arrays. Never generate simulated or mock listings; never invent facility names.",
      }),
    });

    const responseText = response.text || "[]";
    let parsedJobs: any[] = [];
    try {
      parsedJobs = JSON.parse(responseText.trim());
    } catch {
      const arrayMatch = responseText.match(/\[[\s\S]*\]/);
      if (arrayMatch) parsedJobs = JSON.parse(arrayMatch[0]);
    }

    if (Array.isArray(parsedJobs) && parsedJobs.length > 0) jobsCache.set(cacheKey, parsedJobs);
    res.json({ success: true, jobs: parsedJobs });
  } catch (error: any) {
    safeError("Gemini live jobs search failure:", error?.message || error);
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
  const reqs = getStateReqs(code);
  res.json({ success: true, ...reqs });
});

/* -------------------------------------------------------------------------- */
/* Quiz → next-step generator                                                  */
/* -------------------------------------------------------------------------- */

app.post("/api/quiz/result", ...aiGuards, async (req, res) => {
  try {
    const { score, stateCode } = req.body || {};
    const finalScore = typeof score === "number" ? score : 50;
    const code = (stateCode || "GA").toUpperCase();
    const stateReqs = getStateReqs(code);

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

    if (path === "full_speed" && process.env.GEMINI_API_KEY) {
      try {
        const ai = getGemini();
        const searchPrompt = `Search for a real, state-approved, active CNA (Certified Nursing Assistant) school, institute, or community college offering certified courses in ${stateReqs.name}. Output exactly one REAL school with name, website URL, city/location, average cost, and WIOA/funding eligibility. Return only JSON: {"name": "string", "url": "string", "location": "string", "estimatedCost": "string", "fundingAvailable": boolean}. No markdown, no commentary, no invented schools.`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: searchPrompt,
          config: withSafety({
            tools: [{ googleSearch: {} }],
            toolConfig: { includeServerSideToolInvocations: true },
            responseMimeType: "application/json",
          }),
        });
        const pData = JSON.parse(response.text || "{}");
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
        safeWarn("Quiz real program search failed, using state defaults:", err?.message || err);
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
/* Salary benchmarking (BLS-anchored, grounded, cached)                        */
/* -------------------------------------------------------------------------- */

const salaryCache = new TTLCache<any>(6 * 60 * 60 * 1000); // 6h

app.get("/api/salary-benchmark", aiLimiter, async (req, res) => {
  try {
    const zipCode = (req.query.zip as string) || "";
    const roleTitle = (req.query.role as string) || "Certified Nursing Assistant";
    const areaLabel = zipCode ? `ZIP ${zipCode}` : "the United States";

    const cacheKey = `${zipCode}|${roleTitle}`.toLowerCase();
    const cached = salaryCache.get(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    // Conservative national-ish defaults (clearly labeled as estimates).
    let median = 21.5, p25 = 18.5, p75 = 24.5, activePostingsCount = 0;
    let source = "Regional estimate (BLS OEWS-anchored)";
    let grounded = false;
    let sampledJobs: any[] = [];

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getGemini();
        const salaryPrompt = `Using Google Search, find current hourly pay for "${roleTitle}" roles in or near ${areaLabel}. Anchor your figures to U.S. Bureau of Labor Statistics OEWS data for SOC 31-1131 (Nursing Assistants) for that area, then refine with live job postings.
Return strictly this JSON (no markdown):
{
  "median": number, "p25": number, "p75": number, "listingsCount": number,
  "postings": [ { "facility": "string (real employer)", "wage": "string", "title": "string" } ],
  "source": "string (cite BLS OEWS and/or the job sources used)"
}
Use only real employer names found via grounding; do not fabricate facilities.`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: salaryPrompt,
          config: withSafety({
            tools: [{ googleSearch: {} }],
            toolConfig: { includeServerSideToolInvocations: true },
            responseMimeType: "application/json",
          }),
        });
        const resData = JSON.parse(response.text || "{}");
        if (resData.median) {
          median = Number(resData.median);
          p25 = Number(resData.p25 || (median - 2.5));
          p75 = Number(resData.p75 || (median + 3.0));
          activePostingsCount = Number(resData.listingsCount || 0);
          source = resData.source || "BLS OEWS + live job-board grounding";
          sampledJobs = Array.isArray(resData.postings) ? resData.postings : [];
          grounded = true;
        }
      } catch (err: any) {
        safeWarn("Live salary grounding failed; using BLS-anchored estimate:", err?.message || err);
      }
    }

    // Honest fallback: a clearly-labeled regional estimate, NOT fake facilities.
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
/* Health check                                                                */
/* -------------------------------------------------------------------------- */

app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

/* -------------------------------------------------------------------------- */
/* Server + hardened live voice WebSocket                                      */
/* -------------------------------------------------------------------------- */

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // non-browser clients (no Origin header)
  try {
    const host = new URL(origin).host;
    if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) return true;
    if (process.env.APP_URL) {
      try { if (host === new URL(process.env.APP_URL).host) return true; } catch { /* ignore */ }
    }
    // Allow the Cloud Run domain family by default.
    return /\.run\.app$/.test(host);
  } catch {
    return false;
  }
}

async function runServer() {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/live" });

  // Basic per-IP concurrent-connection cap for the live voice socket.
  const liveConnections = new Map<string, number>();
  const MAX_LIVE_PER_IP = 3;

  wss.on("connection", async (clientWs, req) => {
    const origin = req.headers.origin;
    if (!isAllowedOrigin(origin)) {
      clientWs.close(1008, "Origin not allowed");
      return;
    }
    const ip = getClientIp(req as any);
    const current = liveConnections.get(ip) || 0;
    if (current >= MAX_LIVE_PER_IP) {
      clientWs.close(1013, "Too many live sessions");
      return;
    }
    liveConnections.set(ip, current + 1);

    try {
      const ai = getGemini();
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } } },
          systemInstruction: LIVE_VOICE_SYSTEM_INSTRUCTION,
          safetySettings: SAFETY_SETTINGS,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) clientWs.send(JSON.stringify({ audio }));
            if (message.serverContent?.interrupted) clientWs.send(JSON.stringify({ interrupted: true }));
          },
        },
      });

      clientWs.on("message", (data) => {
        try {
          const { audio } = JSON.parse(data.toString());
          if (audio) session.sendRealtimeInput({ audio: { data: audio, mimeType: "audio/pcm;rate=16000" } });
        } catch (e) {
          safeError("Error processing websocket message");
        }
      });

      clientWs.on("close", () => {
        session.close();
        liveConnections.set(ip, Math.max(0, (liveConnections.get(ip) || 1) - 1));
      });
    } catch (e: any) {
      safeError("Live connection failed:", e?.message || e);
      clientWs.send(JSON.stringify({ error: "Live session is unavailable right now." }));
      liveConnections.set(ip, Math.max(0, (liveConnections.get(ip) || 1) - 1));
    }
  });

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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`CNA Playbook Server running on http://localhost:${PORT}`);
  });
}

runServer();
