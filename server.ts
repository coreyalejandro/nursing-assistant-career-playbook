import express from "express";
import path from "path";
import dotenv from "dotenv";

import { securityHeaders, createRateLimiter, createSessionQuota, getClientIp } from "./server/security";
import { decide, upgradePayload, FREE_DAILY_AI_LIMIT } from "./server/freemium";
import {
  chatHandler,
  optimizeHandler,
  jobsSearchHandler,
  statesHandler,
  stateRequirementsHandler,
  quizResultHandler,
  salaryBenchmarkHandler,
  negotiationHandler,
  healthHandler,
  type ApiResult,
} from "./server/handlers";

dotenv.config();

const app = express();
// Hosts inject the port via $PORT. Never hardcode.
const PORT = Number(process.env.PORT) || 8080;

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

/* -------------------------------------------------------------------------- */
/* Freemium daily quota (in-memory mirror of the edge gate)                    */
/* 10 free AI calls/day; "pro" is unlimited. Production enforces this with the  */
/* distributed KV gate in functions/api; this keeps local dev consistent.      */
/* -------------------------------------------------------------------------- */
const FREE_LIMIT = Number(process.env.FREE_DAILY_AI_LIMIT) || FREE_DAILY_AI_LIMIT;
const freeCounters = new Map<string, { count: number; resetAt: number }>();
function freemiumGuard(req: express.Request, res: express.Response, next: express.NextFunction) {
  const sid =
    (req.headers["x-session-id"] as string) ||
    (req.body && typeof req.body === "object" ? req.body.sessionId : "") ||
    getClientIp(req);
  const now = Date.now();
  let c = freeCounters.get(sid);
  if (!c || c.resetAt <= now) {
    c = { count: 0, resetAt: now + 24 * 60 * 60 * 1000 };
    freeCounters.set(sid, c);
  }
  // Dev has no Supabase entitlement lookup, so treat everyone as "free".
  const d = decide("free", c.count, FREE_LIMIT);
  if (!d.allowed) {
    res.status(402).json(upgradePayload(d, process.env.UPGRADE_URL || process.env.VITE_UPGRADE_URL || ""));
    return;
  }
  c.count += 1;
  next();
}

const aiGuards = [aiLimiter, aiDailyQuota, freemiumGuard];

/* -------------------------------------------------------------------------- */
/* Routes — thin adapters over the shared, framework-neutral handlers.         */
/* The same handlers run behind Cloudflare Pages Functions (functions/api).    */
/* -------------------------------------------------------------------------- */

function send(res: express.Response, r: ApiResult) {
  res.status(r.status).json(r.body);
}

app.post("/api/chat", ...aiGuards, async (req, res) => send(res, await chatHandler(req.body || {})));
app.post("/api/optimize", ...aiGuards, async (req, res) => send(res, await optimizeHandler(req.body || {})));
app.post("/api/jobs/search", ...aiGuards, async (req, res) => send(res, await jobsSearchHandler(req.body || {})));
app.post("/api/quiz/result", ...aiGuards, async (req, res) => send(res, await quizResultHandler(req.body || {})));
app.post("/api/negotiation", ...aiGuards, async (req, res) => send(res, await negotiationHandler(req.body || {})));

app.get("/api/salary-benchmark", aiLimiter, freemiumGuard, async (req, res) =>
  send(res, await salaryBenchmarkHandler({ zip: req.query.zip as string, role: req.query.role as string }))
);
app.get("/api/states", (_req, res) => send(res, statesHandler()));
app.get("/api/state-requirements", (req, res) =>
  send(res, stateRequirementsHandler((req.query.code as string) || (req.query.state as string) || "GA"))
);
app.get("/api/health", (_req, res) => send(res, healthHandler()));

/* -------------------------------------------------------------------------- */
/* Server bootstrap (request/response only — serverless-ready)                 */
/* -------------------------------------------------------------------------- */

async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dev-only: import Vite lazily so the production server bundle (dist/server.cjs)
    // never requires it. Vite is a build/dev tool (devDependency), not a runtime dep.
    const { createServer: createViteServer } = await import("vite");
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
