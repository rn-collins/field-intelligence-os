import "server-only";

import { createClient } from "@supabase/supabase-js";
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
 * Phase 01 note — the service-role client must remain reserved for operations
 * that genuinely cannot run as the user (migrations, scheduled jobs, webhook
 * handlers). Request-scoped reads belong on a cookie-bound client so that RLS,
 * not application code, remains the enforcement boundary.
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
