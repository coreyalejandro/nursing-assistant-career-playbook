import { test, expect } from "@playwright/test";

test.describe("PWA + offline", () => {
  test("manifest is linked and served", async ({ page, request }) => {
    await page.goto("/");
    const href = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(href).toBeTruthy();
    const res = await request.get(href!);
    expect(res.ok()).toBeTruthy();
    const manifest = await res.json();
    expect(manifest.name || manifest.short_name).toBeTruthy();
  });

  test("offline fallback page is available and includes the 988 crisis line", async ({ request }) => {
    const res = await request.get("/offline.html");
    expect(res.ok()).toBeTruthy();
    expect(await res.text()).toMatch(/988/);
  });
});
