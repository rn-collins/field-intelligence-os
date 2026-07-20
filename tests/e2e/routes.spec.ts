import { expect, test } from "@playwright/test";
import { ALL_ROUTES } from "../../features/navigation/nav-model";

/**
 * Smoke coverage for every route in the navigation model.
 *
 * Driven from the model rather than a hard-coded list, so adding a route
 * without a working page fails here as well as in the unit tests.
 *
 * These run against a production build started with no `.env` file present —
 * see `playwright.config.ts`. That is the check proving the Phase 00 requirement
 * that Vercel can build and serve the application without secrets.
 */

for (const route of ALL_ROUTES) {
  test(`${route.href} renders with a single top-level heading`, async ({ page }) => {
    const response = await page.goto(route.href);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

test("the Command Center shows both demonstration deployments", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Manhattan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reykjavík" })).toBeVisible();
});

test("demonstration data is labeled and cannot be dismissed", async ({ page }) => {
  await page.goto("/");

  const banner = page.getByText(/demonstration data/i);
  await expect(banner).toBeVisible();

  // No control exists to hide the marker.
  await expect(page.getByRole("button", { name: /dismiss|close|hide/i })).toHaveCount(0);
});

test("the Command Center leads with the open September decision", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Decision required" })).toBeVisible();
  await expect(page.getByText(/mutually exclusive alternatives, not two trips/i)).toBeVisible();
  await expect(page.getByText(/Verified airfare and routing cost/i)).toBeVisible();

  // C3: analytical framing, and a named future destination rather than a dead control.
  await expect(page.getByText("Evidence needed before deciding")).toBeVisible();
  await expect(page.getByText(/That workflow is not built yet/)).toBeVisible();
});

test("the Command Center carries no engineering status prose", async ({ page }) => {
  await page.goto("/");

  // C1/C2: build status belongs in documentation, not the operational screen.
  await expect(page.getByText(/foundation, not a product/i)).toHaveCount(0);
  await expect(page.getByText(/modules are routed and navigable/i)).toHaveCount(0);
  await expect(page.getByText(/SCR-\d\d/)).toHaveCount(0);
});

test("candidate deployments are not presented as committed", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Candidate", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Not selected yet")).toHaveCount(2);
  await expect(page.getByText(/^Starts in \d+ days\.$/)).toHaveCount(0);
});

test("module placeholders describe the capability without engineering metadata", async ({
  page,
}) => {
  await page.goto("/claims");

  await expect(page.getByText("Not built yet")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What this will do" })).toBeVisible();
  await expect(page.getByText(/Preview only\. This workflow is not active yet/)).toBeVisible();

  // C2: phase numbers and screen IDs are build metadata, not user-facing text.
  await expect(page.getByText(/Phase 0\d/)).toHaveCount(0);
  await expect(page.getByText(/SCR-\d\d/)).toHaveCount(0);
});

test("module placeholders keep build metadata in data attributes", async ({ page }) => {
  await page.goto("/claims");

  const root = page.locator("[data-module='/claims']");
  await expect(root).toHaveAttribute("data-activates-in", "05");
  await expect(root).toHaveAttribute("data-screen-id", "SCR-07");
});

test("module placeholders show structure, never sample records", async ({ page }) => {
  await page.goto("/people");

  // Record types, not instances. Scoped to the diagram: the module summary
  // legitimately mentions the same words in prose.
  const diagram = page.getByRole("figure");
  await expect(diagram.getByText("Person", { exact: true })).toBeVisible();
  await expect(diagram.getByText("Relationship history", { exact: true })).toBeVisible();

  // Nothing that looks like a real source.
  await expect(page.getByText(/@[a-z]+\.[a-z]{2,}/i)).toHaveCount(0);
});

test("an unknown route renders the not-found state", async ({ page }) => {
  const response = await page.goto("/no-such-module");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Not found" })).toBeVisible();
});

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => Boolean(isMobile), "Sidebar is desktop-only.");

  test("marks the current route with aria-current", async ({ page }) => {
    await page.goto("/claims");

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Claims" })).toHaveAttribute("aria-current", "page");
  });

  test("navigates between modules", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Evidence & law" })
      .click();

    await expect(page).toHaveURL(/\/evidence$/);
    await expect(page.getByRole("heading", { level: 1, name: "Evidence & law" })).toBeVisible();
  });
});

test.describe("mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "Tab bar is mobile-only.");

  test("reaches Field Mode in one tap", async ({ page }) => {
    await page.goto("/");

    // The tab is labelled "Capture" — the action, not the module name.
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Capture" })
      .click();

    await expect(page).toHaveURL(/\/field$/);
    await expect(page.getByRole("heading", { level: 1, name: "Field Mode" })).toBeVisible();
  });

  test("gives tab targets a comfortable touch height", async ({ page }) => {
    await page.goto("/");

    const link = page.getByRole("navigation", { name: "Primary" }).getByRole("link").first();
    const box = await link.boundingBox();

    // WCAG 2.2 AA requires 24px; the field standard here is far higher.
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});

test("the skip link is the first thing a keyboard user reaches", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const focused = page.locator(":focus");
  await expect(focused).toHaveText(/Skip to main content/);

  await focused.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});
