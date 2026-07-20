# ADR-002: Supabase Postgres with deny-by-default RLS

- Status: Accepted
- Date: 2026-07-19

## Decision
Use Supabase Postgres and Auth. Enable RLS on every exposed table and implement least-privilege policies with tests.

## Consequences
All schema changes require migrations. Privileged keys remain server-only.
