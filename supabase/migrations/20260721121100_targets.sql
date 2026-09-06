-- Purpose:     Targets — a person/organization prioritized within a deployment.
-- Phase:       01 (needed to plan a deployment: who you intend to reach)
-- Reversible:  Yes — drop table.
-- Security:    RLS member-scoped.

create table targets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  deployment_id uuid not null references deployments (id) on delete cascade,
  person_id uuid references people (id),
  organization_id uuid references organizations (id),
  title text not null,
  priority priority_level not null default 'B',
  status text not null default 'researching',
  reason text,
  interview_ask text,
  evidence_request text,
  contact_route text,
  next_action text,
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A target must point at a person or an organization (or both), never neither.
  check ((person_id is not null) or (organization_id is not null))
);

create index targets_deployment_idx on targets (deployment_id);

create trigger targets_set_updated_at
  before update on targets
  for each row execute function set_updated_at();

alter table targets enable row level security;

create policy targets_member_all on targets
  for all
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));
