-- Purpose:     Organizations — institutions, outlets, agencies, regulators.
-- Phase:       01
-- Reversible:  Yes — drop table.
-- Data impact: None.
-- Security:    RLS member-scoped.

create table organizations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name text not null,
  organization_type text,
  legal_name text,
  website text,
  jurisdiction text,
  description text,
  sensitivity sensitivity_level not null default 'internal',
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index organizations_workspace_idx on organizations (workspace_id) where deleted_at is null;

create trigger organizations_set_updated_at
  before update on organizations
  for each row execute function set_updated_at();

alter table organizations enable row level security;

create policy organizations_member_all on organizations
  for all
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));
