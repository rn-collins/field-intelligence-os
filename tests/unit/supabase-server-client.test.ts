import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * `createSupabaseServerClient` (the cookie-bound, request-scoped client added
 * alongside the service-role one) cannot be imported here to exercise
 * directly: `server-only` resolves to a no-op only under Next's `react-server`
 * bundler condition, which plain Vitest never sets, so importing
 * `lib/supabase/server.ts` in a test always throws — which is exactly why
 * `security-boundaries.test.ts` inspects this file as text rather than
 * importing it. This test does the same for the new function specifically.
 *
 * It isn't wired into any page or route handler yet — Phase 01 is schema +
 * RLS + tests, not UI — so what's verifiable pre-Phase-02 is the shape of the
 * guard: it must check configuration, and fail loudly, before ever touching
 * `next/headers`, and it must never reserve the service-role key.
 */
describe("createSupabaseServerClient (static inspection)", () => {
  const source = readFileSync(join(process.cwd(), "lib/supabase/server.ts"), "utf8");
  const fnStart = source.indexOf("export async function createSupabaseServerClient");
  const fnBody = source.slice(fnStart);

  it("is exported as an async function", () => {
    expect(fnStart).toBeGreaterThan(-1);
  });

  it("checks configuration, and throws, before calling cookies()", () => {
    const configCheckIndex = fnBody.indexOf("publicConfig.configured");
    const throwIndex = fnBody.indexOf("throw new SupabaseNotConfiguredError");
    const cookiesCallIndex = fnBody.indexOf("await cookies()");

    expect(configCheckIndex).toBeGreaterThan(-1);
    expect(throwIndex).toBeGreaterThan(configCheckIndex);
    expect(cookiesCallIndex).toBeGreaterThan(throwIndex);
  });

  it("uses the non-deprecated getAll/setAll cookie interface, not get/set/remove", () => {
    expect(fnBody).toContain("getAll()");
    expect(fnBody).toContain("setAll(");
    expect(fnBody).not.toMatch(/\bremove\s*\(/);
  });

  it("never reserves the service-role key", () => {
    expect(fnBody).not.toContain("SERVICE_ROLE");
  });

  it("uses only the publishable key, the same config the browser client uses", () => {
    expect(fnBody).toContain("publicConfig.config.publishableKey");
  });
});
