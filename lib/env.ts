import { z } from "zod";

/**
 * Environment access for Field Intelligence OS.
 *
 * Phase 00 must build and run with **no `.env` file at all** — the static
 * Command Center is served from typed seed data and touches no backend
 * (`.codex/FIRST_TASK.md` §7). Every Supabase variable is therefore optional
 * here, and callers must handle the unconfigured case explicitly rather than
 * receiving a half-built client that fails at request time.
 *
 * Phase 01 tightens this: once auth is real, the server schema becomes
 * required and a missing variable should fail the boot, not the request.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export type PublicEnv = z.infer<typeof publicSchema>;

/**
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time only when each key
 * is referenced statically, so they cannot be read through a dynamic loop.
 */
export function getPublicEnv(): PublicEnv {
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    // Report which keys are wrong, never their values — a malformed key is
    // still a credential (`docs/standards/CODING_STANDARD.md`).
    const keys = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid public environment configuration for: ${keys}`);
  }

  return parsed.data;
}

export type SupabaseBrowserConfig = {
  url: string;
  publishableKey: string;
};

export type SupabaseConfigResult =
  { configured: false; reason: string } | { configured: true; config: SupabaseBrowserConfig };

/**
 * Browser-safe Supabase configuration, or an explanation of what is missing.
 * Deliberately returns a result rather than throwing: an unconfigured
 * environment is the normal state in Phase 00, not an exceptional one.
 */
export function getSupabaseBrowserConfig(): SupabaseConfigResult {
  const env = getPublicEnv();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return {
      configured: false,
      reason:
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example). Phase 00 does not require them.",
    };
  }

  return {
    configured: true,
    config: {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    },
  };
}

/**
 * Server-only secrets. Never call this from a client component; the only
 * intended caller is `lib/supabase/server.ts`, which is marked `server-only`.
 */
export function getServerEnv(): z.infer<typeof serverSchema> {
  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    const keys = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid server environment configuration for: ${keys}`);
  }

  return parsed.data;
}
