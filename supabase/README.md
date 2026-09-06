# Supabase Development

Supabase Postgres is the canonical structured store (ADR-001). Google Drive
holds media masters (ADR-003); Supabase holds their metadata and provenance.

**Phase 00 status:** no schema exists. This directory holds the configuration
and conventions so that Phase 01 starts correctly rather than improvising.

## Local development

Requires Docker and the [Supabase CLI](https://supabase.com/docs/guides/cli).
Neither is needed for Phase 00.

```bash
npm run db:start    # start local Supabase
npm run db:reset    # re-apply all migrations and seed from scratch
npm run db:test     # run pgTAP database and RLS tests
npm run db:stop
```

`db:reset` is the check that matters for reproducibility: if a clean database
plus the committed migrations does not produce the current schema, the
migrations are wrong.

## Layout

| Path          | Contents                                                    |
| ------------- | ----------------------------------------------------------- |
| `config.toml` | Local development configuration. No secrets, ever.          |
| `migrations/` | Timestamped, forward-only migrations. See `CONVENTIONS.md`. |
| `tests/`      | pgTAP database and RLS tests. See `tests/README.md`.        |
| `seed.sql`    | Deterministic, non-sensitive demonstration data.            |

## Rules

From `docs/standards/DATABASE_STANDARD.md` and `AGENTS.md`:

- **All schema changes are migrations.** Never an untracked production change.
- **Migrations are forward-only.** Correct a mistake with a new migration.
- **RLS is enabled in the same migration that creates the table**, so a table is
  never exposed and unprotected, even briefly.
- **Every policy has a test before the table is exposed**, and the tests must
  cover the negative cases — a policy that is too permissive passes every
  "can read" test.
- **Verification, consent and permission history is append-only.**
- **Seed data contains no secrets, contact details or sensitive source
  material**, and demonstration records are clearly labelled as such.
- **Never commit production credentials.** The service-role key belongs only in
  a server secret store, and only `lib/supabase/server.ts` reads it.
