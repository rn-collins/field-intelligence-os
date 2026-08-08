-- Interactions and consent — isolation and the append-only consent guarantee.
--
-- The consent guarantee is the one that matters most in this product: a source's
-- agreement must never be silently rewritten. This proves the database enforces
-- that, not just the application.

begin;
select plan(14);

create extension if not exists pgtap;

-- RLS enabled.
select ok((select relrowsecurity from pg_class where relname = 'interactions'), 'RLS enabled: interactions');
select ok((select relrowsecurity from pg_class where relname = 'consent_records'), 'RLS enabled: consent_records');

-- Seed two workspaces + members + an interaction and consent in each.
insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');
insert into profiles (id, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'User A'),
  ('22222222-2222-2222-2222-222222222222', 'User B');
insert into workspaces (id, name, slug) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A', 'ws-a'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B', 'ws-b');
insert into workspace_members (workspace_id, user_id, role, status) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'owner', 'active');
insert into interactions (id, workspace_id, interaction_type, title) values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'interview', 'A interview'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'interview', 'B interview');
insert into consent_records (id, workspace_id, interaction_id, capture_method, recording_allowed) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'verbal', true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'verbal', true);

-- Act as User A.
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';

-- Positive: A sees A.
select is((select count(*)::int from interactions where workspace_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 1, 'A sees its interaction');
select is((select count(*)::int from consent_records where workspace_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 1, 'A sees its consent');

-- Negative: A sees nothing of B.
select is((select count(*)::int from interactions where workspace_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'A cannot see B interactions');
select is((select count(*)::int from consent_records where workspace_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'A cannot see B consent');

-- THE CORE GUARANTEE: consent is append-only. No update or delete policy exists,
-- so both silently affect zero rows even for the owner's own workspace.
update consent_records set recording_allowed = false where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
select is(
  (select recording_allowed from consent_records where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  true,
  'consent cannot be updated — recording_allowed is unchanged'
);

delete from consent_records where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
select is((select count(*)::int from consent_records where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), 1, 'consent cannot be deleted');

-- A change in consent is a NEW record that supersedes the old one.
insert into consent_records (workspace_id, interaction_id, capture_method, recording_allowed, supersedes_consent_id)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'verbal', false, 'cccccccc-cccc-cccc-cccc-cccccccccccc');
select is((select count(*)::int from consent_records), 2, 'a consent change is a new superseding record');
select is(
  (select supersedes_consent_id from consent_records where recording_allowed = false),
  'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  'the new record points at the one it supersedes'
);

-- Negative: A cannot write consent into B.
select throws_ok(
  $$ insert into consent_records (workspace_id, interaction_id, capture_method) values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'forged') $$,
  '42501', null, 'A cannot record consent in B'
);

-- Anon sees no consent at all.
set local role anon;
set local request.jwt.claims = '';
select is((select count(*)::int from consent_records), 0, 'anon sees no consent');
select is((select count(*)::int from interactions), 0, 'anon sees no interactions');

select * from finish();
rollback;
