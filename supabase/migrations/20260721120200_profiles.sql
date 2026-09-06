-- Purpose:     User profiles, keyed to Supabase auth.users.
-- Phase:       01
-- Reversible:  Yes — drop table.
-- Data impact: None. New table.
-- Security:    RLS enabled. A user sees their own profile and co-members'.

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

comment on table profiles is 'Application profile for an authenticated user.';

alter table profiles enable row level security;
-- Policies created in the helpers migration, which needs workspace_members.
