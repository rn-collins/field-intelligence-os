import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ALL_ROUTES } from "../../features/navigation/nav-model";

/**
 * Automated accessibility scans across every route.
 *
 * `docs/standards/UI_STANDARD.md` sets WCAG 2.2 AA as the target. Automated
 * tooling catches perhaps a third of real accessibility defects, so this is a
 * floor, not a certificate — the manual keyboard and screen-reader pass
 * recorded in `docs/build/PHASE-00-COMPLETION-REPORT.md` covers the rest.
 *
 * The Playwright project matrix runs each of these at desktop and mobile
 * viewports; `colorScheme` is exercised separately below.
 */

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const route of ALL_ROUTES) {
  test(`${route.href} has no detectable accessibility violations`, async ({ page }) => {
    await page.goto(route.href);

    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

    expect(results.violations).toEqual([]);
  });
}

test.describe("dark color scheme", () => {
  test.use({ colorScheme: "dark" });

  for (const route of ["/", "/claims", "/field"]) {
    test(`${route} has no detectable accessibility violations in dark mode`, async ({ page }) => {
      await page.goto(route);

      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

      expect(results.violations).toEqual([]);
    });
  }
});

test("the page has exactly one main landmark and a navigation landmark", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(1);
});

test("declares a document language", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("does not suppress pinch zoom", async ({ page }) => {
  await page.goto("/");

  const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");

  expect(viewport).not.toContain("user-scalable=no");
  expect(viewport).not.toContain("maximum-scale=1");
});
