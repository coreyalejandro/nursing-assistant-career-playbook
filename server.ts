import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

import { securityHeaders, createRateLimiter, createSessionQuota } from "./server/security";
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
const aiGuards = [aiLimiter, aiDailyQuota];

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

app.get("/api/salary-benchmark", aiLimiter, async (req, res) =>
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
