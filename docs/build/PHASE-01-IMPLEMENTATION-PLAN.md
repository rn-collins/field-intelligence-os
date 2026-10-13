# Phase 01 — Implementation Plan

Status: **In progress.** Map, not a stop-and-approve gate — everything here is
committed migrations and tests that touch no live database, so review happens on
the finished code with zero risk.
Branch: `feat/phase-01-data-auth` (off `feat/phase-00-foundation`)
Baseline: `2309c21`

## Goal (from `docs/BUILD_ORDER.md`, `docs/phases/PHASE-01-DATA-AUTH.md`)

Supabase auth, workspaces/tenancy, the initial canonical schema subset, RLS, and
pgTAP tests that prove tenant isolation. **Gate: RLS tests prove tenant
isolation** — including the negative cases.

## Decisions carried in

- **Multi-tenant from day one** (owner, 2026-07-21). Every domain table carries
  `workspace_id`; RLS isolates by workspace membership. Resolves OPEN_QUESTIONS #2.
- Schema derives from
  `docs/source-materials/engineering-package-expanded/fios_v1_spec/schema.sql`,
  the canonical representative schema.

## Scope — the initial subset

Phase 01 builds the identity and core-record spine only. Later phases add
interactions, claims, evidence, systems, assets, outputs.

| Migration                  | Tables              | Notes                                                                                                 |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------- |
| `..._extensions_and_enums` | —                   | `pgcrypto`; enums: `deployment_status`, `priority_level`, `sensitivity_level`, `member_role`          |
| `..._workspaces`           | `workspaces`        | + RLS, `updated_at` trigger                                                                           |
| `..._profiles`             | `profiles`          | references `auth.users`; + RLS                                                                        |
| `..._workspace_members`    | `workspace_members` | the membership join that every RLS policy checks                                                      |
| `..._helpers`              | —                   | `is_workspace_member(uuid)`, `has_workspace_role(uuid, member_role[])` — `security definer`, `stable` |
| `..._deployments`          | `deployments`       | first workspace-owned domain table                                                                    |
| `..._people`               | `people`            | sensitivity + soft delete                                                                             |
| `..._organizations`        | `organizations`     |                                                                                                       |
| `..._audit_events`         | `audit_events`      | append-only; insert-only policy                                                                       |

`vector` and `postgis` extensions from the canonical schema are **deferred** —
they belong to search (Phase 07) and geographic records, and requiring them now
would add Supabase configuration Phase 01 does not need.

## RLS strategy

- **Deny by default.** RLS enabled in the same migration that creates each table.
- **Membership-based.** A row is visible/writable only to active members of its
  `workspace_id`, via the `is_workspace_member` helper.
- **Role-aware where the permission matrix requires it** (`permission_matrix.csv`):
  e.g. restricted-identity people and verification decisions are gated by
  `has_workspace_role`. Phase 01 implements the membership gate on every table
  and the role gate where the matrix is unambiguous; finer role rules land with
  the features that need them.
- **Helpers are `security definer`** so the policy can read `workspace_members`
  without the caller needing direct access to it, avoiding recursive RLS.
- **`profiles`**: a user reads their own profile and the profiles of co-members.
- **`audit_events`**: insert-only; no update or delete policy exists, so history
  is append-only by construction.

## Testing (pgTAP — this is the phase gate)

`supabase/tests/` gains real tests. Each proves, at minimum:

1. RLS is **enabled** on the table (the flag itself, not just policies).
2. A member of workspace A **can** read/write A's rows.
3. A member of workspace A **cannot** read, update, or delete workspace B's rows.
4. An anonymous session reads nothing.
5. Append-only tables reject `update` and `delete`.

The negative cases (3, 4, 5) are the ones that matter and the ones usually
skipped; the runner (`scripts/db-test.sh`) already fails if migrations exist
without tests.

## Application layer

- **Typed schema** (`lib/db/types.ts` or generated) mirroring the tables, so the
  Command Center can move from static seed to query in Phase 02 without a
  component rewrite. The Phase 00 `Deployment` type is already shaped for this.
- **Cookie-bound server client** (`lib/supabase/server.ts` gains a request-scoped
  variant) so reads run **as the user** under RLS — the service-role client stays
  reserved for jobs that genuinely cannot, per ADR-006.
- **No UI wiring in Phase 01.** Auth flows and the login screen are the tail of
  this phase or the head of Phase 02; the schema + RLS + tests are the gate.

## What Phase 01 does NOT need from the owner yet

- No Supabase secrets. Migrations and pgTAP run against **local** Supabase
  (Docker), and are committed as code. Live credentials matter only when a
  preview/production deploy first talks to a real database — a later, explicit
  step.

## Verification

`npm run db:start` (local Supabase) → `npm run db:test` (pgTAP). The db:test
tripwire already flips from SKIPPED to enforcing the moment the first migration
lands. CI gains a database job in this phase (Docker-based), per the A7 note.

## Risks

| Risk                                                              | Mitigation                                                                                                                       |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Recursive RLS (policy reads a table that is itself RLS-protected) | `security definer` helpers, tested                                                                                               |
| A policy too permissive passes every positive test                | Mandatory negative cases in every table's test                                                                                   |
| Local-only verification (no Supabase CLI on this machine yet)     | Migrations written to the documented conventions; owner/CI runs them against local Supabase. Stated honestly, not claimed as run |
