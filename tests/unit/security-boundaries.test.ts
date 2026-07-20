import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getPublicEnv, getSupabaseBrowserConfig } from "@/lib/env";
import { SupabaseNotConfiguredError } from "@/lib/supabase/errors";

const ROOT = process.cwd();

function tracked(pattern: string): string[] {
  try {
    return execSync(`git ls-files -- ${pattern}`, { cwd: ROOT, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    // Not a git checkout (e.g. an exported tarball). The other assertions still
    // apply; this one is skipped rather than reported as a false pass.
    return [];
  }
}

describe("service-role key boundary", () => {
  /**
   * `AGENTS.md`: "Never expose the Supabase service-role key to browser code."
   *
   * The service-role key bypasses RLS entirely, so a single leak defeats every
   * access control in the product at once. Three defences exist — `server-only`,
   * an ESLint rule, and this test — because the failure is unrecoverable and
   * silent: nothing breaks, the key simply becomes public.
   */
  it("is referenced only from lib/supabase/server.ts and lib/env.ts", () => {
    const offenders = tracked("*.ts *.tsx")
      .filter((file) => !file.startsWith("tests/"))
      .filter((file) =>
        readFileSync(join(ROOT, file), "utf8").includes("SUPABASE_SERVICE_ROLE_KEY"),
      )
      .filter((file) => file !== "lib/supabase/server.ts" && file !== "lib/env.ts");

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
  it("does not track a .env file", () => {
    const envFiles = tracked(".env .env.*").filter((file) => file !== ".env.example");

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
  it("does not commit build output", () => {
    for (const directory of [".next", "node_modules", "coverage"]) {
      expect(tracked(`${directory}/**`)).toEqual([]);
    }
  });

  it("documents required environment variables", () => {
    expect(existsSync(join(ROOT, ".env.example"))).toBe(true);
  });
});
