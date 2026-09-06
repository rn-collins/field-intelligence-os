# Database and RLS Tests

Phase 00 defines no schema, so there is nothing to test yet. This directory and
its runner exist so that Phase 01 cannot skip the step: the harness is already
here, and `npm run db:test` already works.

## Running

```bash
npm run db:start   # starts local Supabase (requires Docker)
npm run db:test    # runs every *.test.sql in this directory via pgTAP
npm run db:stop
```

Docker is required, so these are **not** part of the default CI gate. A dedicated
CI job is added in Phase 01, when there is schema to protect.

## What must be tested

From `docs/standards/TESTING_STANDARD.md` and `docs/standards/DATABASE_STANDARD.md`:

- Constraints and enums reject invalid values.
- Every exposed table has RLS **enabled** — test the flag itself, not only the
  policies, because a policy on a table with RLS disabled is decorative.
- A member of workspace A can read workspace A's rows.
- A member of workspace A **cannot** read, update or delete workspace B's rows.
- An anonymous session can read nothing.
- Restricted records are invisible to roles without the required permission,
  per `permission_matrix.csv`.
- Append-only history tables reject `update` and `delete`.

## Writing a test

pgTAP, one file per table or policy group:

```sql
begin;
select plan(4);

select has_table('public', 'workspaces', 'workspaces table exists');
select is(
  (select relrowsecurity from pg_class where relname = 'workspaces'),
  true,
  'RLS is enabled on workspaces'
);

-- Negative cases matter more than positive ones. A policy that is too
-- permissive still passes every "can read" test.
set local role authenticated;
set local request.jwt.claims = '{"sub": "<user-a>"}';
select is_empty(
  'select * from workspaces where id = ''<workspace-b>''',
  'a member of workspace A cannot read workspace B'
);

select * from finish();
rollback;
```

Wrap each test in `begin`/`rollback` so tests cannot contaminate one another.
