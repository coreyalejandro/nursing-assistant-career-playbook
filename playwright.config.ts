import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config. [DeepSeek P1 fix: no e2e coverage]
 *
 * By default it builds the app and starts the production Node server
 * (server.ts serving dist + /api), then runs the specs against it — so the same
 * shared handlers exercised in unit tests are exercised end-to-end. Set
 * PLAYWRIGHT_BASE_URL to instead run against a deployed URL (e.g. the live
 * Cloudflare Pages site).
 */
const PORT = process.env.PORT || "8080";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run build && npm start",
        url: `http://localhost:${PORT}/api/health`,
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
        env: { NODE_ENV: "production", PORT },
      },
});
