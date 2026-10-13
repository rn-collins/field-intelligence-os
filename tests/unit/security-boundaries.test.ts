import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getPublicEnv, getSupabaseBrowserConfig } from "@/lib/env";
import { SupabaseNotConfiguredError } from "@/lib/supabase/errors";
import {
  findFilesContaining,
  GitScanError,
  isGitCheckout,
  listTrackedFiles,
} from "../helpers/repo-scan";

const ROOT = process.cwd();
const IS_GIT = isGitCheckout(ROOT);

/**
 * Git-dependent assertions skip only in a genuine non-git environment, such as
 * an exported tarball, and say so out loud. A git failure inside a git checkout
 * throws instead — see `tests/helpers/repo-scan.ts`.
 *
 * The distinction matters because the previous helper swallowed every error and
 * returned an empty array, which is indistinguishable from "scanned everything,
 * found nothing". A broken scanner reported as a security pass.
 */
const gitIt = IS_GIT ? it : it.skip;

if (!IS_GIT) {
  console.warn(
    "[security-boundaries] Not a git checkout — git-dependent scans SKIPPED. " +
      "This is expected only for exported archives. In a checkout, this means the scan is broken.",
  );
}

const SERVICE_ROLE_KEY = "SUPABASE_SERVICE_ROLE_KEY";
const SOURCE_PATHSPECS = ["*.ts", "*.tsx"] as const;

/** The only modules permitted to reference the privileged key. */
const PERMITTED = new Set(["lib/supabase/server.ts", "lib/env.ts"]);

describe("repository scanner", () => {
  /**
   * These tests test the scanner itself. Without them, every assertion below is
   * vacuous: "no offenders found" passes identically whether the scan covered
   * 54 files, 4 files, or none.
   */

  gitIt("scans recursively, reaching nested files", () => {
    const files = listTrackedFiles(ROOT, [...SOURCE_PATHSPECS]);

    // Sentinels at three depths. If a future change reintroduces shell
    // expansion, these disappear from the result and this fails immediately.
    expect(files).toContain("lib/supabase/server.ts");
    expect(files).toContain("lib/env.ts");
    expect(files).toContain("features/deployments/readiness.ts");
    expect(files).toContain("app/page.tsx");
  });

  gitIt("scans every tracked TypeScript file, not a subset", () => {
    const scanned = listTrackedFiles(ROOT, [...SOURCE_PATHSPECS]);
    const nestedTs = scanned.filter((f) => f.endsWith(".ts") && f.includes("/"));

    // The defect being fixed: only 4 top-level .ts files were scanned and every
    // nested .ts was skipped. Any nested coverage at all disproves that shape,
    // and the count guards against silent narrowing.
    expect(nestedTs.length).toBeGreaterThan(10);
    expect(scanned.length).toBeGreaterThan(40);
  });

  it("detects a forbidden reference in a nested file", () => {
    // Proves detection positively, using synthetic paths so it does not depend
    // on the repository ever actually containing a leak.
    const files = ["app/page.tsx", "lib/supabase/deeply/nested/leak.ts", "lib/env.ts"];
    const contents: Record<string, string> = {
      "app/page.tsx": "export default function Page() {}",
      "lib/supabase/deeply/nested/leak.ts": `const k = process.env.${SERVICE_ROLE_KEY};`,
      "lib/env.ts": "export const x = 1;",
    };

    const found = findFilesContaining((f) => contents[f] ?? "", files, SERVICE_ROLE_KEY);

    expect(found).toEqual(["lib/supabase/deeply/nested/leak.ts"]);
  });

  gitIt("fails loudly rather than returning empty when git cannot run", () => {
    // A non-existent pathspec magic word makes git exit non-zero.
    expect(() => listTrackedFiles(ROOT, [":(nosuchmagic)x"])).toThrow(GitScanError);
  });

  it("reports whether it is running in a git checkout", () => {
    expect(typeof IS_GIT).toBe("boolean");
  });
});

describe("service-role key boundary", () => {
  /**
   * `AGENTS.md`: "Never expose the Supabase service-role key to browser code."
   *
   * The service-role key bypasses RLS entirely, so a single leak defeats every
   * access control in the product at once. Three defences exist — `server-only`,
   * an ESLint rule, and this test — because the failure is unrecoverable and
   * silent: nothing breaks, the key simply becomes public.
   */
  gitIt("is referenced only from lib/supabase/server.ts and lib/env.ts", () => {
    const files = listTrackedFiles(ROOT, [...SOURCE_PATHSPECS]).filter(
      (file) => !file.startsWith("tests/"),
    );

    const offenders = findFilesContaining(
      (file) => readFileSync(join(ROOT, file), "utf8"),
      files,
      SERVICE_ROLE_KEY,
    ).filter((file) => !PERMITTED.has(file));

    expect(offenders).toEqual([]);
  });

  it("marks the privileged module server-only", () => {
    const source = readFileSync(join(ROOT, "lib/supabase/server.ts"), "utf8");

    expect(source).toContain('import "server-only"');
  });

  it("never exposes the service-role key through a NEXT_PUBLIC_ variable", () => {
    const example = readFileSync(join(ROOT, ".env.example"), "utf8");

    expect(example).not.toMatch(/NEXT_PUBLIC_[A-Z_]*SERVICE_ROLE/);
  });
});

describe("committed secrets", () => {
  gitIt("does not track a .env file", () => {
    const envFiles = listTrackedFiles(ROOT, [".env", ".env.*"]).filter(
      (file) => file !== ".env.example",
    );

    expect(envFiles).toEqual([]);
  });

  it("keeps .env.example free of values", () => {
    const lines = readFileSync(join(ROOT, ".env.example"), "utf8")
      .split("\n")
      .filter((line) => line.includes("=") && !line.trim().startsWith("#"));

    // Every key must be empty, except the documented localhost default.
    const withValues = lines.filter((line) => {
      const [key, ...rest] = line.split("=");
      const value = rest.join("=").trim();
      return value !== "" && key?.trim() !== "NEXT_PUBLIC_APP_URL";
    });

    expect(withValues).toEqual([]);
  });

  it("ignores environment files in .gitignore", () => {
    const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");

    expect(gitignore).toContain(".env");
    expect(gitignore).toContain("!.env.example");
  });
});

describe("unconfigured Supabase environment", () => {
  /**
   * Phase 00 must build and run with no `.env` at all. The clients must fail
   * loudly rather than returning something that silently produces empty
   * results — in an evidence system, "no rows" and "not connected" must never
   * look the same.
   */
  it("reports configuration as absent rather than throwing", () => {
    const result = getSupabaseBrowserConfig();

    // The repository is developed without Supabase credentials in Phase 00. If
    // a developer has them set locally, the configured branch is also valid.
    if (result.configured) {
      expect(result.config.url).toMatch(/^https?:\/\//);
    } else {
      expect(result.reason).toMatch(/not configured/i);
    }
  });

  it("falls back to a localhost app URL", () => {
    expect(getPublicEnv().NEXT_PUBLIC_APP_URL).toMatch(/^https?:\/\//);
  });

  it("throws a typed, identifiable error", () => {
    const error = new SupabaseNotConfiguredError("test");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("SupabaseNotConfiguredError");
  });
});

describe("repository hygiene", () => {
  gitIt("does not commit build output", () => {
    const output = listTrackedFiles(ROOT, [".next/**", "node_modules/**", "coverage/**"]);

    expect(output).toEqual([]);
  });

  it("documents required environment variables", () => {
    expect(existsSync(join(ROOT, ".env.example"))).toBe(true);
  });
});
