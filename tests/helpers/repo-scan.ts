import { execFileSync } from "node:child_process";

/**
 * Repository scanning for the security boundary tests.
 *
 * Split out of the test file so the two halves can be tested independently:
 * `listTrackedFiles` proves the scan is recursive, and `findFilesContaining`
 * proves detection works on nested paths. The previous implementation could only
 * assert "no offenders found", which passes identically whether the scanner
 * works, scans four files, or scans nothing at all.
 *
 * WHY THIS EXISTS
 * ---------------
 * The original helper built a shell command by interpolation:
 *
 *     execSync(`git ls-files -- ${pattern}`)   // pattern = "*.ts *.tsx"
 *
 * `execSync` runs through `/bin/sh`, so the shell — not git — got first refusal
 * on the globs. This repository has four top-level `.ts` files, so `*.ts`
 * expanded to exactly those four and git never saw a pattern. `*.tsx` had no
 * top-level match, so sh passed it through and git expanded it recursively.
 *
 * Measured result: 32 of 32 `.tsx` files scanned, 4 of 22 `.ts` files scanned.
 * Silently skipped were `lib/supabase/server.ts`, `lib/env.ts` and
 * `lib/supabase/client.ts` — the exact files the scan exists to police. Under
 * `zsh` the unmatched glob aborted the command entirely and the old `catch`
 * returned `[]`, so the test scanned zero files and still passed.
 *
 * Everything here therefore avoids a shell completely.
 */

export class GitScanError extends Error {
  override readonly name = "GitScanError";
}

/**
 * True when `cwd` is inside a git checkout.
 *
 * Used to distinguish a legitimate non-git environment (an exported tarball)
 * from git being broken. Those must never be conflated: the first is a valid
 * reason to skip an assertion, the second is a failure to report.
 */
export function isGitCheckout(cwd: string): boolean {
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { cwd, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Tracked files matching the given pathspecs.
 *
 * `execFileSync` passes argv directly to git with no shell, so pathspecs reach
 * git intact and git applies them recursively. `-z` keeps paths containing
 * spaces or newlines intact.
 *
 * Throws `GitScanError` on any git failure. It never returns an empty array to
 * signal a problem — an empty result must only ever mean "git ran and matched
 * nothing", so that a scanner failure can never be mistaken for a clean scan.
 */
export function listTrackedFiles(cwd: string, pathspecs: readonly string[]): string[] {
  let stdout: string;

  try {
    stdout = execFileSync("git", ["ls-files", "-z", "--", ...pathspecs], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    throw new GitScanError(
      `git ls-files failed for pathspecs [${pathspecs.join(", ")}]: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return stdout.split("\0").filter((entry) => entry.length > 0);
}

/**
 * Files whose contents include `needle`.
 *
 * Pure over its `files` argument so it can be exercised with synthetic nested
 * paths in tests, independently of what git happens to return.
 */
export function findFilesContaining(
  readFile: (file: string) => string,
  files: readonly string[],
  needle: string,
): string[] {
  return files.filter((file) => readFile(file).includes(needle));
}
