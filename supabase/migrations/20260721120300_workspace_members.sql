-- Purpose:     Workspace membership — the join every RLS policy checks.
-- Phase:       01
-- Reversible:  Yes — drop table.
-- Data impact: None. New table.
-- Security:    RLS enabled. A member sees the membership of their workspaces.

create table workspace_members (
  workspace_id uuid not null references workspaces (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role member_role not null,
  status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

comment on table workspace_members is 'Which users belong to which workspace, and their role.';

alter table workspace_members enable row level security;
