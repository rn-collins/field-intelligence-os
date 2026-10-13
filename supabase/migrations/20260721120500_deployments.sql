-- Purpose:     Deployments — the first workspace-owned domain table.
-- Phase:       01
-- Reversible:  Yes — drop table.
-- Data impact: None.
-- Security:    RLS enabled; workspace-member scoped. Mirrors the Phase 00
--              Deployment type so Phase 02 can query instead of reading seed.

create table deployments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  code text not null,
  name text not null,
  status deployment_status not null default 'planning',
  priority priority_level not null default 'B',
  city text,
  country text,
  timezone text,
  starts_on date,
  ends_on date,
  mission text,
  lanes text[] not null default '{}',
  readiness_score numeric(5, 2),
  competes_with uuid[] not null default '{}',
  version integer not null default 1,
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (workspace_id, code),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create index deployments_workspace_idx on deployments (workspace_id) where deleted_at is null;

create trigger deployments_set_updated_at
  before update on deployments
  for each row execute function set_updated_at();

comment on table deployments is 'A field deployment. Belongs to one workspace.';

alter table deployments enable row level security;

create policy deployments_member_all on deployments
  for all
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));
