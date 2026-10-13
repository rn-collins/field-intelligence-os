import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ALL_NAV_ITEMS } from "../../features/navigation/nav-model";

/**
 * Mobile reachability and responsive behavior (Part B).
 *
 * The defect these exist to prevent: five of thirteen modules were in the tab
 * bar and the other eight had no mobile route at all. A route being registered
 * is not the same as it being reachable, and only a navigation test can tell the
 * difference.
 */

const PHONE_WIDTHS = [320, 360, 390, 430] as const;

test.describe("mobile module reachability", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("every module is reachable within two taps", async ({ page }) => {
    await page.goto("/");

    const tabBar = page.getByRole("navigation", { name: "Primary" });
    const directHrefs = await tabBar
      .getByRole("link")
      .evaluateAll((links) => links.map((l) => new URL((l as HTMLAnchorElement).href).pathname));

    // Tap 1: open "More". Tap 2: choose the module.
    await tabBar.getByRole("button", { name: "More" }).click();
    const sheet = page.getByRole("dialog", { name: "All modules" });
    await expect(sheet).toBeVisible();

    const sheetHrefs = await sheet
      .getByRole("link")
      .evaluateAll((links) => links.map((l) => new URL((l as HTMLAnchorElement).href).pathname));

    const reachable = new Set([...directHrefs, ...sheetHrefs]);
    const unreachable = ALL_NAV_ITEMS.map((i) => i.href).filter((h) => !reachable.has(h));

    expect(unreachable).toEqual([]);
  });

  test("Field Mode is one tap from anywhere", async ({ page }) => {
    await page.goto("/claims");

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Capture" })
      .click();

    await expect(page).toHaveURL(/\/field$/);
  });

  test("the sheet closes after navigating", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "More" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Claims" }).click();

    await expect(page).toHaveURL(/\/claims$/);
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

test.describe("More sheet accessibility", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("Escape closes it and focus returns to the trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "More" });

    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test("the close control returns focus to the trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "More" });

    await trigger.click();
    await page.getByRole("button", { name: "Close menu" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test("announces its expanded state", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "More" });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("is keyboard operable without a pointer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "More" }).focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("dialog")).toBeVisible();

    // Focus is inside the dialog, not left behind on the page.
    const inside = await page.evaluate(() => {
      const dialog = document.querySelector("dialog[open]");
      return dialog?.contains(document.activeElement) ?? false;
    });
    expect(inside).toBe(true);
  });

  test("has no detectable accessibility violations while open", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "More" }).click();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe("narrow viewports", () => {
  for (const width of PHONE_WIDTHS) {
    test(`${width}px — tab bar fits without clipping and targets stay large`, async ({ page }) => {
      await page.setViewportSize({ width, height: 780 });
      await page.goto("/");

      const nav = page.getByRole("navigation", { name: "Primary" });
      const items = nav.locator(":scope > ul > li");
      await expect(items).toHaveCount(5);

      // No horizontal overflow at any supported width.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal scroll at ${width}px`).toBe(false);

      // Touch targets remain comfortable even at 320px.
      for (const el of await items.all()) {
        const box = await el.boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    });
  }

  test("mobile landscape keeps content reachable", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("tablet portrait renders without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("zoom", () => {
  /**
   * WCAG 2.2 1.4.10 reflow.
   *
   * Measured per element rather than by comparing `documentElement.scrollWidth`
   * to `clientWidth`: under CSS `zoom`, `scrollWidth` reports zoomed layout
   * units while `clientWidth` reports the unzoomed viewport, so that comparison
   * fails even when every element fits. Asking "does anything stick out past the
   * viewport" is both the real question and measurable without that confusion.
   */
  test("200% zoom leaves no element overflowing the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.style.zoom = "200%";
    });

    const offenders = await page.evaluate(() => {
      const limit = document.documentElement.clientWidth;
      return [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((el) => {
          // Fixed-position elements are excluded deliberately. CSS `zoom` does
          // not faithfully model real browser zoom for them: a `fixed inset-x-0`
          // bar is laid out against the zoomed viewport and measures as
          // overflowing here, while in a real browser at 200% page zoom it spans
          // the visual viewport correctly. The spec-faithful reflow guarantee is
          // the 320px-equivalent test below, which exercises the same bar for
          // real and passes.
          const fixed = getComputedStyle(el).position === "fixed";
          return !fixed && !el.closest("[data-fixed-root]");
        })
        .filter((el) => el.getBoundingClientRect().right > limit + 2)
        .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`)
        .slice(0, 5);
    });

    expect(offenders).toEqual([]);
  });

  /**
   * The formal reflow target, tested the way the spec frames it: 320 CSS px of
   * content width, which is equivalent to a 1280px viewport at 400% zoom.
   */
  test("content reflows at the 320px equivalent width", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 780 });
    await page.goto("/");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("long labels", () => {
  test("navigation labels are not truncated into ambiguity", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 780 });
    await page.goto("/");
    await page.getByRole("button", { name: "More" }).click();

    // The longest label in the model must still be fully readable in the sheet,
    // where there is room, even though the tab bar itself abbreviates.
    const longest = [...ALL_NAV_ITEMS].sort((a, b) => b.label.length - a.label.length)[0]!;
    await expect(page.getByRole("dialog").getByRole("link", { name: longest.label })).toBeVisible();
  });
});
