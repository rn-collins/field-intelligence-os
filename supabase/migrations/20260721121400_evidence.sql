-- Purpose:     Evidence — sources that support or challenge claims.
-- Phase:       01
-- Reversible:  Yes — drop table.
-- Security:    RLS member-scoped. Later versions supersede rather than overwrite
--              (source_url + version_label + a superseding link preserve history).

create table evidence (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  evidence_type text not null,
  title text not null,
  source_url text,
  drive_file_id text,
  publication_date date,
  version_label text,
  jurisdiction text,
  methodology text,
  population text,
  comparator text,
  metrics text,
  limitations text,
  reliability_status text,
  fitness_for_purpose text,
  sensitivity sensitivity_level not null default 'internal',
  authenticated_at timestamptz,
  authenticated_by uuid references profiles (id),
  supersedes_evidence_id uuid references evidence (id),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index evidence_workspace_idx on evidence (workspace_id) where deleted_at is null;

create trigger evidence_set_updated_at
  before update on evidence
  for each row execute function set_updated_at();

alter table evidence enable row level security;

create policy evidence_member_all on evidence
  for all
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));
