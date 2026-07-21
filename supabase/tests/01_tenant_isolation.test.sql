-- Tenant isolation — the Phase 01 gate.
--
-- Proves the thing that actually matters: a member of workspace A cannot reach
-- workspace B's rows. The positive cases (a member CAN read their own) are
-- necessary but insufficient; a policy that is too permissive passes every one
-- of them. The negative cases below are the point.
--
-- Run with: npm run db:start && npm run db:test

begin;
select plan(24);

-- Extensions used by the harness.
create extension if not exists pgtap;

-- ---------------------------------------------------------------------------
-- RLS is ENABLED on every exposed table (the flag itself, not just policies —
-- a policy on a table with RLS disabled is decorative).
-- ---------------------------------------------------------------------------
select ok(
  (select relrowsecurity from pg_class where relname = 'workspaces'),
  'RLS enabled: workspaces'
);
select ok((select relrowsecurity from pg_class where relname = 'profiles'), 'RLS enabled: profiles');
select ok(
  (select relrowsecurity from pg_class where relname = 'workspace_members'),
  'RLS enabled: workspace_members'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'deployments'),
  'RLS enabled: deployments'
);
select ok((select relrowsecurity from pg_class where relname = 'people'), 'RLS enabled: people');
select ok(
  (select relrowsecurity from pg_class where relname = 'organizations'),
  'RLS enabled: organizations'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'audit_events'),
  'RLS enabled: audit_events'
);

-- ---------------------------------------------------------------------------
-- Seed two workspaces, two users, one membership each. Done as the table owner
-- (RLS does not apply to the seeding role), then we switch to each user.
-- ---------------------------------------------------------------------------
insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');

insert into profiles (id, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'User A'),
  ('22222222-2222-2222-2222-222222222222', 'User B');

insert into workspaces (id, name, slug) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Workspace A', 'ws-a'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Workspace B', 'ws-b');

insert into workspace_members (workspace_id, user_id, role, status) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'owner', 'active');

insert into deployments (workspace_id, code, name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A-1', 'A deployment'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B-1', 'B deployment');

insert into people (workspace_id, preferred_name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Source A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Source B');

-- ---------------------------------------------------------------------------
-- Act as User A (member of workspace A only).
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';

-- Positive: A sees A's rows.
select is(
  (select count(*)::int from deployments where workspace_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  1, 'A can read its own deployment'
);
select is(
  (select count(*)::int from people where workspace_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  1, 'A can read its own people'
);
select is((select count(*)::int from workspaces where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 1, 'A can read its own workspace');

-- Negative (the point): A sees NOTHING of B.
select is((select count(*)::int from deployments where workspace_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'A cannot read B deployments');
select is((select count(*)::int from people where workspace_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'A cannot read B people');
select is((select count(*)::int from workspaces where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'A cannot read B workspace');
select is((select count(*)::int from organizations where workspace_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'A cannot read B organizations');

-- Negative: A cannot WRITE into B.
select throws_ok(
  $$ insert into deployments (workspace_id, code, name) values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'X', 'intrusion') $$,
  '42501',
  null,
  'A cannot insert into B'
);

-- Negative: A cannot UPDATE B's rows (0 rows affected — invisible, not error).
update deployments set name = 'hijacked' where workspace_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
select is(
  (select name from deployments where code = 'B-1' and workspace_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  null,
  'A cannot even see B to update it'
);

-- ---------------------------------------------------------------------------
-- Anonymous session reads nothing.
-- ---------------------------------------------------------------------------
set local role anon;
set local request.jwt.claims = '';
select is((select count(*)::int from deployments), 0, 'anon reads no deployments');
select is((select count(*)::int from people), 0, 'anon reads no people');
select is((select count(*)::int from workspaces), 0, 'anon reads no workspaces');

-- ---------------------------------------------------------------------------
-- Audit log is append-only: no update or delete policy exists.
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';

insert into audit_events (workspace_id, action, entity_type)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'test', 'deployment');
select is((select count(*)::int from audit_events), 1, 'A can append an audit event');

-- Update and delete are blocked by the ABSENCE of a permitting policy → 0 rows.
update audit_events set action = 'tampered';
select is((select count(*)::int from audit_events where action = 'tampered'), 0, 'audit events cannot be updated');

delete from audit_events;
select is((select count(*)::int from audit_events), 1, 'audit events cannot be deleted');

-- Membership helper behaves.
select ok(is_workspace_member('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 'helper: A is a member of A');
select ok(not is_workspace_member('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 'helper: A is not a member of B');
select ok(has_workspace_role('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', array['owner']::member_role[]), 'helper: A is owner of A');
select ok(not has_workspace_role('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', array['viewer']::member_role[]), 'helper: A is not a viewer of A');

select * from finish();
rollback;
