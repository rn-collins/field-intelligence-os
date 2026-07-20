import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * WCAG 2.2 AA contrast verification for the design tokens.
 *
 * `docs/standards/UI_STANDARD.md` sets AA as the target for all core workflows.
 * Checking it here rather than only in the browser means a token change that
 * breaks contrast fails at `npm test` — before it reaches a screen, and without
 * depending on a rendered page that may not use the pair in question yet.
 *
 * Automated axe scans in `tests/e2e` cover the rendered result; this covers the
 * palette itself, including combinations not currently on screen.
 */

const CSS = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

function extractBlock(pattern: RegExp): string {
  const match = CSS.match(pattern);
  if (!match?.[1]) throw new Error(`Could not find token block for ${pattern}`);
  return match[1];
}

function parseTokens(block: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const match of block.matchAll(/(--color-[a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    const [, name, value] = match;
    if (name && value) tokens[name] = value;
  }
  return tokens;
}

const lightTokens = parseTokens(extractBlock(/:root\s*\{([\s\S]*?)\n\}/));
const darkOverrides = parseTokens(
  extractBlock(/prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([\s\S]*?)\n {2}\}/),
);
// Dark mode overrides a subset; unlisted tokens inherit from `:root`.
const darkTokens = { ...lightTokens, ...darkOverrides };

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));

  const [r, g, b] = channels as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  ) as [number, number];

  return (lighter + 0.05) / (darker + 0.05);
}

/** [foreground, background, minimum ratio] */
const TEXT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["ink", "canvas"],
  ["ink", "surface"],
  ["ink", "surface-sunken"],
  ["ink", "surface-raised"],
  ["ink-muted", "canvas"],
  ["ink-muted", "surface"],
  ["ink-muted", "surface-sunken"],
  ["ink-subtle", "canvas"],
  ["ink-subtle", "surface"],
  // Added after an axe scan caught this pair on the deployment card footer,
  // which the original list omitted. Every text token is now checked against
  // every surface token it can legitimately sit on.
  ["ink-subtle", "surface-sunken"],
  ["ink-subtle", "surface-raised"],
  ["ink-muted", "surface-raised"],
  // Semantic roles (F1). Each is checked on every surface it can sit on;
  // splitting one token into seven is only safe if all seven are validated.
  ["action", "canvas"],
  ["action", "surface"],
  ["action", "surface-sunken"],
  ["action-contrast", "action"],
  ["link", "canvas"],
  ["link", "surface"],
  ["link", "surface-sunken"],
  ["nav-active", "canvas"],
  ["nav-active", "surface"],
  ["nav-active", "surface-sunken"],
  ["attention", "canvas"],
  ["attention", "surface"],
  ["attention", "surface-sunken"],
  ["sync-ok", "surface"],
  ["sync-pending", "surface"],
  ["sync-offline", "surface"],
  ["sync-conflict", "surface"],
  ["preview", "preview-bg"],
  ["preview", "surface"],
  ["preview", "canvas"],
  ["status-verified", "status-verified-bg"],
  ["status-pending", "status-pending-bg"],
  ["status-disputed", "status-disputed-bg"],
  ["status-restricted", "status-restricted-bg"],
  ["status-neutral", "status-neutral-bg"],
  ["status-verified", "surface"],
  ["status-pending", "surface"],
  ["status-disputed", "surface"],
  ["status-restricted", "surface"],
  ["status-neutral", "surface"],
  ["demo", "demo-bg"],
  ["demo", "surface"],
];

/** Non-text UI components and boundaries need 3:1, per WCAG 1.4.11. */
const NON_TEXT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["focus", "canvas"],
  ["focus", "surface"],
  ["border-strong", "surface"],
  ["border-strong", "canvas"],
];

const SCHEMES = [
  ["light", lightTokens],
  ["dark", darkTokens],
] as const;

describe.each(SCHEMES)("%s scheme", (_scheme, tokens) => {
  it.each(TEXT_PAIRS)("%s on %s meets AA for normal text (4.5:1)", (fg, bg) => {
    const foreground = tokens[`--color-${fg}`];
    const background = tokens[`--color-${bg}`];

    expect(foreground, `missing token --color-${fg}`).toBeDefined();
    expect(background, `missing token --color-${bg}`).toBeDefined();
    expect(contrastRatio(foreground!, background!)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(NON_TEXT_PAIRS)("%s on %s meets AA for non-text contrast (3:1)", (fg, bg) => {
    const foreground = tokens[`--color-${fg}`];
    const background = tokens[`--color-${bg}`];

    expect(contrastRatio(foreground!, background!)).toBeGreaterThanOrEqual(3);
  });

  it("defines a dark override for every surface and text token", () => {
    for (const name of [
      "canvas",
      "surface",
      "surface-sunken",
      "ink",
      "ink-muted",
      "action",
      "link",
      "nav-active",
      "attention",
      "preview",
    ]) {
      expect(tokens[`--color-${name}`]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("contrastRatio", () => {
  it("reports the known extremes", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#123456", "#abcdef")).toBeCloseTo(
      contrastRatio("#abcdef", "#123456"),
      10,
    );
  });
});
