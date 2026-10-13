# Migration Conventions

Phase 00 creates no schema. This document fixes the conventions so that Phase 01
starts consistently, and so a reviewer can tell a correct migration from an
incorrect one without reconstructing the reasoning each time.

## Naming

```
<UTC timestamp>_<verb>_<subject>.sql
20260801120000_create_workspaces.sql
20260801120500_enable_rls_on_workspaces.sql
```

Timestamps are UTC and must increase monotonically. Generate one with
`supabase migration new <verb>_<subject>` rather than by hand.

## Rules

These follow `docs/standards/DATABASE_STANDARD.md` and `AGENTS.md`.

1. **Migrations are forward-only.** A mistake is corrected by a new migration,
   never by editing one that has been applied anywhere.
2. **No untracked production schema change, ever.** A change made in the
   Supabase dashboard and not represented here is a defect, not a shortcut.
3. **UUID primary keys** unless an exception is documented in the migration
   itself.
4. **Workspace ownership** (`workspace_id`) on every tenant-scoped table.
5. **`created_at`, `updated_at`, and actor provenance** on every material record.
6. **RLS is enabled in the same migration that creates the table.** A table must
   never exist in a state where it is exposed and unprotected, even briefly.
7. **Every policy has a test** in `supabase/tests/` before the table is exposed
   through the API.
8. **Verification, consent and permission history is append-only.** Use a
   separate history table with an insert-only policy; do not mutate in place.
9. **Foreign keys, check constraints and enums** wherever they protect meaning.
   A status column with no constraint will eventually hold a typo.
10. **Destructive migrations require backup and rollback notes** in the
    migration header comment and in the pull request.

## Migration header

Every migration opens with a comment stating what it does, why, and what it
affects:

```sql
-- Purpose:     Create the workspaces table and its RLS policies.
-- Phase:       01
-- Reversible:  Yes — drop table (no data yet).
-- Data impact: None. New table.
-- Security:    RLS enabled below. Members read their own workspace only.
```

## Order within a table's migration

1. `create table`
2. Constraints and indexes
3. `alter table ... enable row level security`
4. Policies
5. Triggers (`updated_at`, audit)
6. Comments (`comment on table/column`) — these become the schema documentation

## Testing

See `supabase/tests/README.md`. In short: `npm run db:start`, then
`npm run db:test`. RLS tests must prove both that an authorized role _can_ read
its own rows and that an unauthorized role _cannot_ read another workspace's —
the second half is the one that actually matters and the one most often omitted.
