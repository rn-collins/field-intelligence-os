-- Purpose:     Interactions — interviews and encounters with sources.
-- Phase:       01 (September-first: the interview workflow spine)
-- Reversible:  Yes — drop table.
-- Data impact: None.
-- Security:    RLS member-scoped. restricted_notes are stored as ciphertext:
--              off-record and sensitive notes are application-encrypted, so the
--              database never holds their plaintext. Soft delete via deleted_at.

create type interaction_status as enum (
  'draft',
  'scheduled',
  'in_progress',
  'processing',
  'completed',
  'restricted',
  'cancelled'
);

create table interactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  deployment_id uuid references deployments (id) on delete set null,
  interaction_type text not null,
  status interaction_status not null default 'draft',
  title text not null,
  -- The role RN is acting in (editorial, research, professional networking,
  -- commercial). Kept separate so role separation is a data fact, not a memory.
  capacity text not null default 'editorial',
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  timezone text,
  purpose text,
  attribution_default text,
  recording_status text,
  summary text,
  restricted_notes_ciphertext text,
  version integer not null default 1,
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ended_at is null or started_at is null or ended_at >= started_at)
);

create index interactions_workspace_idx on interactions (workspace_id) where deleted_at is null;
create index interactions_deployment_idx on interactions (deployment_id) where deleted_at is null;

create trigger interactions_set_updated_at
  before update on interactions
  for each row execute function set_updated_at();

comment on column interactions.restricted_notes_ciphertext is
  'Application-encrypted. Off-record and sensitive notes never reach the database as plaintext.';

alter table interactions enable row level security;

create policy interactions_member_all on interactions
  for all
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));
