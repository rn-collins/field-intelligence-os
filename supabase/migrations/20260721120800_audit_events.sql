-- Purpose:     Append-only audit log.
-- Phase:       01
-- Reversible:  Yes — drop table.
-- Data impact: None.
-- Security:    RLS member-scoped for reads. INSERT-only: there is deliberately
--              no UPDATE or DELETE policy, so history is append-only by
--              construction — AGENTS.md requires permission/verification/consent
--              history to be immutable where feasible.

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  actor_user_id uuid references profiles (id),
  actor_service text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  correlation_id uuid,
  occurred_at timestamptz not null default now()
);

create index audit_events_workspace_idx on audit_events (workspace_id, occurred_at desc);

comment on table audit_events is
  'Append-only. No update/delete policy exists, so rows are immutable once written.';

alter table audit_events enable row level security;

-- Members may read their workspace's audit trail.
create policy audit_events_select on audit_events
  for select using (is_workspace_member(workspace_id));

-- Any member may append an event for their workspace. No update/delete policy,
-- so the log cannot be rewritten through the API.
create policy audit_events_insert on audit_events
  for insert with check (is_workspace_member(workspace_id));
