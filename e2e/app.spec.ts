import { test, expect } from "@playwright/test";

test.describe("core app + API", () => {
  test("home shell loads with the correct title and main landmark", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Certified Nursing Assistant \(CNA\) Career Playbook/);
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("health endpoint is up (Functions/Express running)", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).status).toBe("healthy");
  });

  test("deterministic state data API responds", async ({ request }) => {
    const res = await request.get("/api/states");
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.states)).toBeTruthy();
    expect(body.states.length).toBeGreaterThanOrEqual(50);
  });
});
