import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT = "scripts/verify-deployment.sh";
const source = readFileSync(join(ROOT, SCRIPT), "utf8");

/**
 * `scripts/verify-deployment.sh` is the tool reached for when deployment state
 * is uncertain — which is exactly when a destructive command would do the most
 * damage. It must stay incapable of changing anything, so that running it can
 * never be the reason production moved.
 */
describe("verify-deployment.sh is read-only", () => {
  const MUTATING = [
    "vercel deploy",
    "vercel promote",
    "vercel remove",
    "vercel rm",
    "vercel alias",
    "vercel rollback",
    "vercel redeploy",
    "vercel env add",
    "vercel env rm",
    "vercel link",
    "--prod",
    "git push",
  ];

  it.each(MUTATING)("contains no %s", (verb) => {
    expect(source).not.toContain(verb);
  });

  it("uses only read-only vercel subcommands", () => {
    const invocations = [...source.matchAll(/vercel\s+([a-z-]+)/g)].map((m) => m[1]);
    const allowed = new Set(["inspect"]);

    for (const sub of invocations) {
      expect(allowed.has(sub!), `unexpected 'vercel ${sub}' in ${SCRIPT}`).toBe(true);
    }
  });

  it("issues only GET requests", () => {
    // No -X POST/PUT/PATCH/DELETE, and no --data payloads.
    expect(source).not.toMatch(/-X\s*(POST|PUT|PATCH|DELETE)/);
    expect(source).not.toMatch(/--data\b/);
  });

  it("is executable", () => {
    // eslint-disable-next-line no-bitwise
    expect(statSync(join(ROOT, SCRIPT)).mode & 0o111).toBeGreaterThan(0);
  });

  it("requires a preview URL rather than defaulting to one", () => {
    expect(source).toContain("--preview is required");
  });

  it("fails when a preview reports the production target", () => {
    expect(source).toMatch(/expected 'preview'/);
  });
});
