import { test, expect } from "@playwright/test";

const PLACEHOLDER = /Ask anything|Pregúntame/i;

test.describe("AI assistant: safety boundary + freemium paywall", () => {
  test("shows the HIPAA safety boundary and renders a coach reply", async ({ page }) => {
    // Mock the model call so the test is deterministic and free.
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ text: "Mocked coach reply." }),
      })
    );

    await page.goto("/");
    await page.locator("#assistant-trigger").click();

    // Safety boundary UI (no PHI) is always shown in the chat.
    await expect(page.getByText(/HIPAA/i)).toBeVisible();

    const input = page.getByPlaceholder(PLACEHOLDER);
    await input.fill("Hello");
    await input.press("Enter");

    await expect(page.getByText("Mocked coach reply.")).toBeVisible();
  });

  test("surfaces the upgrade paywall when the free daily limit is hit (402)", async ({ page }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 402,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          code: "FREE_LIMIT_REACHED",
          error: "You've used your 10 free AI interactions for today.",
          limit: 10,
          used: 10,
        }),
      })
    );

    await page.goto("/");
    await page.locator("#assistant-trigger").click();

    const input = page.getByPlaceholder(PLACEHOLDER);
    await input.fill("Hello");
    await input.press("Enter");

    // The accessible upgrade dialog appears.
    await expect(page.getByRole("dialog", { name: /Upgrade to Pro/i })).toBeVisible();
    await expect(page.getByText(/Unlimited AI coaching/i)).toBeVisible();
  });
});
