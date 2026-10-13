-- Purpose:     Workspaces (tenants) and the updated_at trigger they share.
-- Phase:       01
-- Reversible:  Yes — drop table (no data yet).
-- Data impact: None. New table.
-- Security:    RLS enabled below. A workspace is visible only to its members.

-- Shared trigger: keep updated_at honest without trusting the client to set it.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger workspaces_set_updated_at
  before update on workspaces
  for each row execute function set_updated_at();

comment on table workspaces is 'A tenant. Every domain record belongs to exactly one workspace.';

alter table workspaces enable row level security;

-- Membership is defined in workspace_members (next migration). The policy is
-- created there, after both tables exist, to avoid a forward reference.
