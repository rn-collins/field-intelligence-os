import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig } from "@/lib/env";
import { SupabaseNotConfiguredError } from "./errors";

/**
 * Browser Supabase client.
 *
 * Uses only the publishable (anon) key, so every query it makes is subject to
 * Row Level Security. This is the *only* Supabase entry point that client
 * components may use.
 *
 * Phase 00 status: not called anywhere. It exists so Phase 01 begins from a
 * reviewed client rather than an ad-hoc one.
 */
export function createSupabaseBrowserClient() {
  const result = getSupabaseBrowserConfig();

  if (!result.configured) {
    throw new SupabaseNotConfiguredError(result.reason);
  }

  return createBrowserClient(result.config.url, result.config.publishableKey);
}
