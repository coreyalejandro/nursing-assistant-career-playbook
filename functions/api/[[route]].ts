/**
 * functions/api/[[route]].ts
 * ---------------------------------------------------------------------------
 * Cloudflare Pages Functions adapter. This single catch-all handles every
 * /api/* request and dispatches it to the SAME framework-neutral handlers the
 * local Express server uses (server/handlers.ts) — one implementation, two
 * hosts. Runs on the Workers runtime with the nodejs_compat flag (wrangler.toml).
 *
 * Secrets (OPENROUTER_API_KEY, etc.) arrive as Cloudflare environment bindings
 * on `context.env`. We bridge them into process.env so the shared handlers and
 * the OpenRouter client (which read process.env) work without modification.
 * ---------------------------------------------------------------------------
 */
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
} from "../../server/handlers";

interface PagesContext {
  request: Request;
  env: Record<string, string | undefined>;
}

function json(r: ApiResult): Response {
  return new Response(JSON.stringify(r.body), {
    status: r.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function readBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  // Bridge Cloudflare env/secrets → process.env (requires nodejs_compat).
  const g = globalThis as any;
  if (!g.process) g.process = { env: {} };
  if (!g.process.env) g.process.env = {};
  Object.assign(g.process.env, env);

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();

  try {
    if (method === "POST") {
      const body = await readBody(request);
      switch (pathname) {
        case "/api/chat":
          return json(await chatHandler(body));
        case "/api/optimize":
          return json(await optimizeHandler(body));
        case "/api/jobs/search":
          return json(await jobsSearchHandler(body));
        case "/api/quiz/result":
          return json(await quizResultHandler(body));
        case "/api/negotiation":
          return json(await negotiationHandler(body));
      }
    } else if (method === "GET") {
      switch (pathname) {
        case "/api/health":
          return json(healthHandler());
        case "/api/states":
          return json(statesHandler());
        case "/api/state-requirements":
          return json(
            stateRequirementsHandler(
              url.searchParams.get("code") || url.searchParams.get("state") || "GA"
            )
          );
        case "/api/salary-benchmark":
          return json(
            await salaryBenchmarkHandler({
              zip: url.searchParams.get("zip") || "",
              role: url.searchParams.get("role") || "",
            })
          );
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}
