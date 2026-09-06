-- Purpose:     Membership helper functions and the RLS policies for the
--              identity tables (workspaces, profiles, workspace_members).
-- Phase:       01
-- Reversible:  Yes — drop policies and functions.
-- Data impact: None.
-- Security:    This migration IS the tenant-isolation boundary. Helpers are
--              `security definer` so a policy can consult workspace_members
--              without the caller having direct rights to it — which also
--              avoids the table's own RLS recursing while it is being checked.

-- True when the current user is an active member of the given workspace.
create or replace function is_workspace_member(target_workspace uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  );
$$;

-- True when the current user holds one of the given roles in the workspace.
create or replace function has_workspace_role(target_workspace uuid, allowed member_role[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.role = any (allowed)
  );
$$;

comment on function is_workspace_member(uuid) is
  'RLS helper: is the current user an active member of this workspace? security definer to avoid recursive RLS on workspace_members.';

-- workspaces: visible to members; only an owner may modify workspace settings
-- (permission_matrix.csv: workspace settings are owner-only).
create policy workspaces_select on workspaces
  for select using (is_workspace_member(id));

create policy workspaces_modify on workspaces
  for all
  using (has_workspace_role(id, array['owner']::member_role[]))
  with check (has_workspace_role(id, array['owner']::member_role[]));

-- workspace_members: a member may read the membership of their own workspaces.
-- Writes (invitations, role changes) are owner-only.
create policy workspace_members_select on workspace_members
  for select using (is_workspace_member(workspace_id));

create policy workspace_members_modify on workspace_members
  for all
  using (has_workspace_role(workspace_id, array['owner']::member_role[]))
  with check (has_workspace_role(workspace_id, array['owner']::member_role[]));

-- profiles: a user always sees their own; and the profiles of people they share
-- a workspace with, so members are not anonymous to each other.
create policy profiles_select_self on profiles
  for select using (id = auth.uid());

create policy profiles_select_comembers on profiles
  for select using (
    exists (
      select 1
      from workspace_members mine
      join workspace_members theirs on theirs.workspace_id = mine.workspace_id
      where mine.user_id = auth.uid()
        and mine.status = 'active'
        and theirs.user_id = profiles.id
    )
  );

-- A user may edit only their own profile.
create policy profiles_update_self on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
