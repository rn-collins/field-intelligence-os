/**
 * Raised when Supabase access is attempted without configuration.
 *
 * Phase 00 ships no database calls, so reaching this error means either a
 * misconfigured environment or code that arrived ahead of Phase 01. Failing
 * loudly is deliberate: a silently broken client would surface later as an
 * empty result set, which in an evidence system is indistinguishable from
 * "there is no evidence".
 */
export class SupabaseNotConfiguredError extends Error {
  override readonly name = "SupabaseNotConfiguredError";

  constructor(reason: string) {
    super(reason);
  }
}
