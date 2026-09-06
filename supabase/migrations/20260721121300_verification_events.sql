-- Purpose:     Append-only history of every claim verification-status change.
-- Phase:       01
-- Reversible:  Yes — drop table.
-- Security:    RLS member-scoped read; insert-only. AGENTS.md requires
--              verification history to be auditable and append-only, and that AI
--              output never silently overwrite verification status. The claims
--              table holds the CURRENT status; this table holds how it got
--              there. No update or delete policy exists.

create table verification_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  claim_id uuid not null references claims (id) on delete cascade,
  from_status verification_status,
  to_status verification_status not null,
  reason text not null,
  -- Who decided. A human reviewer is required to reach 'verified'; the
  -- application enforces that AI cannot set a final status (AGENTS.md).
  decided_by uuid references profiles (id),
  decided_by_service text,
  occurred_at timestamptz not null default now()
);

create index verification_events_claim_idx on verification_events (claim_id, occurred_at desc);

comment on table verification_events is
  'Append-only audit of claim status changes. No update/delete policy; the trail cannot be rewritten.';

alter table verification_events enable row level security;

create policy verification_events_select on verification_events
  for select using (is_workspace_member(workspace_id));

create policy verification_events_insert on verification_events
  for insert with check (is_workspace_member(workspace_id));
