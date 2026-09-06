import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerEnv, getSupabaseBrowserConfig } from "@/lib/env";
import { SupabaseNotConfiguredError } from "./errors";

/**
 * Privileged, server-only Supabase access.
 *
 * `import "server-only"` makes any client-component import of this module a
 * build error, and `eslint.config.mjs` blocks the import from `components/**`
 * with an explanatory message. Both exist because `AGENTS.md` treats leaking
 * the service-role key as a top-severity failure: that key bypasses RLS
 * entirely, so it would defeat every access control in the product at once.
 *
 * Phase 00 status: not called anywhere.
 *
 * Phase 01 note — reserved for operations that genuinely cannot run as the
 * user: migrations, scheduled jobs, webhook handlers. Anything that renders a
 * page or answers a request on a logged-in user's behalf belongs on
 * `createSupabaseServerClient` below instead, so RLS — not application code —
 * remains the enforcement boundary. See ADR-006 for why the boundary is
 * enforced three ways (`server-only`, an ESLint rule, and a repo-wide scan in
 * `tests/unit/security-boundaries.test.ts`).
 */
export function createSupabaseServiceRoleClient() {
  const publicConfig = getSupabaseBrowserConfig();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  if (!publicConfig.configured) {
    throw new SupabaseNotConfiguredError(publicConfig.reason);
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new SupabaseNotConfiguredError(
      "SUPABASE_SERVICE_ROLE_KEY is not set. It must be provided only through a server secret store, never through NEXT_PUBLIC_*.",
    );
  }

  return createClient(publicConfig.config.url, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Request-scoped, cookie-bound Supabase access — reads and writes run as the
 * signed-in user, under RLS, not as the service role.
 *
 * Uses only the publishable (anon) key, the same one `createSupabaseBrowserClient`
 * uses, so it can never bypass a policy: every query this client makes is
 * subject to the same Row Level Security a browser session would face. What it
 * adds over the browser client is identity — it reads the user's session from
 * the request's cookies (via `next/headers`) so a server component or route
 * handler can query "as this user" instead of receiving already-fetched props.
 *
 * Must be called fresh per request — never cache or share the returned client
 * across requests, since it closes over one request's cookie jar.
 *
 * `setAll` is wrapped in a try/catch because Server Components cannot write
 * cookies (only Route Handlers and Server Actions can); a component that only
 * reads should never fail because a token refresh tried to persist itself.
 * That gap is exactly why Supabase's own guidance requires a middleware that
 * refreshes the session on every request — this project has none yet, which
 * means a session nearing expiry inside a render-only path can silently fail
 * to refresh. Tracked as a follow-up, not solved by this function alone.
 *
 * Phase 01 status: built, not yet called anywhere — Phase 01 is schema + RLS
 * + tests; wiring this into an actual page or route handler is Phase 02.
 */
export async function createSupabaseServerClient() {
  const publicConfig = getSupabaseBrowserConfig();

  if (!publicConfig.configured) {
    throw new SupabaseNotConfiguredError(publicConfig.reason);
  }

  const cookieStore = await cookies();

  return createServerClient(publicConfig.config.url, publicConfig.config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, which cannot set cookies. Safe to
          // ignore only because nothing here depends on the write succeeding
          // for the current render; see the function-level note on why a
          // session-refresh middleware is still owed.
        }
      },
    },
  });
}
