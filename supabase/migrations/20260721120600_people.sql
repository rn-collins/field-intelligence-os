-- Purpose:     People — sources, participants, collaborators.
-- Phase:       01
-- Reversible:  Yes — drop table.
-- Data impact: None.
-- Security:    RLS member-scoped. Sensitive identity fields are stored as
--              ciphertext columns: field-level encryption is applied in the
--              application, and the database never holds the plaintext of a
--              protected source identity. Soft delete via deleted_at.

create table people (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  preferred_name text not null,
  full_name_ciphertext text,
  pronunciation text,
  email_ciphertext text,
  phone_ciphertext text,
  bio text,
  expertise text[] not null default '{}',
  relationship_status text,
  sensitivity sensitivity_level not null default 'internal',
  do_not_contact boolean not null default false,
  merge_parent_id uuid references people (id),
  version integer not null default 1,
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index people_workspace_idx on people (workspace_id) where deleted_at is null;

create trigger people_set_updated_at
  before update on people
  for each row execute function set_updated_at();

comment on column people.full_name_ciphertext is
  'Application-encrypted. The database never stores the plaintext identity of a protected source.';

alter table people enable row level security;

-- Baseline: workspace members. Finer role gating for source_protected and
-- highly_restricted identities (permission_matrix.csv: restricted identities are
-- owner-only readable) lands with the People feature in Phase 03; the column and
-- sensitivity level exist now so that policy has something to gate on.
create policy people_member_all on people
  for all
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));
