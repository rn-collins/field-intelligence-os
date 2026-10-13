import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALL_NAV_ITEMS,
  ALL_ROUTES,
  BUILD_PHASES,
  isActiveRoute,
  MOBILE_PRIMARY,
  NAV_SECTIONS,
  findNavItem,
} from "@/features/navigation/nav-model";

const APP_DIR = join(process.cwd(), "app");

/** Maps "/assets/ingest" to "app/assets/ingest/page.tsx", "/" to "app/page.tsx". */
function pageFileFor(href: string): string {
  return href === "/" ? join(APP_DIR, "page.tsx") : join(APP_DIR, href.slice(1), "page.tsx");
}

describe("navigation model", () => {
  /**
   * The invariant that matters most: navigation cannot advertise a destination
   * that does not exist. A dead link in a shell whose entire purpose is to prove
   * the information architecture would undermine the one thing it is for.
   */
  it("every route has a corresponding page file", () => {
    const missing = ALL_ROUTES.filter((item) => !existsSync(pageFileFor(item.href)));

    expect(missing.map((item) => item.href)).toEqual([]);
  });

  it("has no duplicate routes", () => {
    const hrefs = ALL_ROUTES.map((item) => item.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("routes every phase label to a known build phase", () => {
    for (const item of ALL_ROUTES) {
      expect(Object.keys(BUILD_PHASES)).toContain(item.activatesIn);
    }
  });

  it("gives every item a non-empty label and summary", () => {
    for (const item of ALL_ROUTES) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.summary.length).toBeGreaterThan(0);
      expect(item.screenId).toMatch(/^SCR-\d{2}$/);
    }
  });

  it("covers the eleven primary destinations from the navigation map", () => {
    // docs/ux/NAVIGATION_AND_SCREEN_MAP.md lists eleven primary destinations;
    // "People & Organizations" and "Claims & Evidence" each split into two
    // routes here, giving thirteen navigable items.
    expect(ALL_NAV_ITEMS).toHaveLength(13);
    expect(NAV_SECTIONS).toHaveLength(5);
  });

  it("keeps the mobile tab bar to five slots", () => {
    expect(MOBILE_PRIMARY).toHaveLength(5);
  });

  it("reserves the last slot for the module menu", () => {
    // Five slots cannot hold thirteen destinations. The fifth is a menu rather
    // than a thirteenth compromise; without it, eight modules had no mobile route.
    const menus = MOBILE_PRIMARY.filter((i) => i.kind === "menu");
    expect(menus).toHaveLength(1);
    expect(MOBILE_PRIMARY.at(-1)?.kind).toBe("menu");
  });

  it("keeps Field Mode one tap away", () => {
    expect(MOBILE_PRIMARY.some((i) => i.href === "/field")).toBe(true);
  });

  it("points every mobile route at a real page", () => {
    for (const item of MOBILE_PRIMARY) {
      if (item.kind !== "route") continue;
      expect(existsSync(pageFileFor(item.href!)), `${item.href} has no page`).toBe(true);
    }
  });
});

describe("findNavItem", () => {
  it("finds nav items and sub-routes alike", () => {
    expect(findNavItem("/claims")?.label).toBe("Claims");
    expect(findNavItem("/assets/ingest")?.label).toBe("Ingest");
  });

  it("returns undefined for an unknown route", () => {
    expect(findNavItem("/nope")).toBeUndefined();
  });
});

describe("isActiveRoute", () => {
  it("matches the root only exactly", () => {
    expect(isActiveRoute("/", "/")).toBe(true);
    expect(isActiveRoute("/", "/claims")).toBe(false);
  });

  it("matches a route and its descendants", () => {
    expect(isActiveRoute("/assets", "/assets")).toBe(true);
    expect(isActiveRoute("/assets", "/assets/ingest")).toBe(true);
  });

  it("does not match a route that merely shares a prefix", () => {
    expect(isActiveRoute("/asset", "/assets")).toBe(false);
  });
});
