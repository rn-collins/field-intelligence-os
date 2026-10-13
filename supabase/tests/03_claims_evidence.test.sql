-- Claims and evidence — the verification spine.
--
-- Proves: workspace isolation across the claim/evidence graph; that a claim
-- links to its evidence (provenance is navigable); and that verification history
-- is append-only, so a claim's status cannot be silently rewritten.

begin;
select plan(13);
create extension if not exists pgtap;

select ok((select relrowsecurity from pg_class where relname = 'claims'), 'RLS enabled: claims');
select ok((select relrowsecurity from pg_class where relname = 'evidence'), 'RLS enabled: evidence');
select ok((select relrowsecurity from pg_class where relname = 'claim_evidence'), 'RLS enabled: claim_evidence');
select ok((select relrowsecurity from pg_class where relname = 'verification_events'), 'RLS enabled: verification_events');

insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');
insert into profiles (id, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'A'),
  ('22222222-2222-2222-2222-222222222222', 'B');
insert into workspaces (id, name, slug) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A', 'ws-a'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B', 'ws-b');
insert into workspace_members (workspace_id, user_id, role, status) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'owner', 'active');

insert into claims (id, workspace_id, exact_text) values
  ('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A claim'),
  ('c2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B claim');
insert into evidence (id, workspace_id, evidence_type, title) values
  ('e1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'document', 'A doc'),
  ('e2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'document', 'B doc');
insert into claim_evidence (claim_id, evidence_id, workspace_id, relation) values
  ('c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'supports');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';

-- Provenance is navigable: from A's claim, reach A's evidence via the link.
select is(
  (select e.title
   from claims c
   join claim_evidence ce on ce.claim_id = c.id
   join evidence e on e.id = ce.evidence_id
   where c.id = 'c1111111-1111-1111-1111-111111111111'),
  'A doc',
  'claim -> evidence provenance is navigable'
);

-- Isolation across the whole graph.
select is((select count(*)::int from claims where workspace_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'A cannot see B claims');
select is((select count(*)::int from evidence where workspace_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'A cannot see B evidence');

-- Verification history is append-only.
insert into verification_events (workspace_id, claim_id, from_status, to_status, reason, decided_by)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111111', 'unreviewed', 'partially_verified', 'first source', '11111111-1111-1111-1111-111111111111');
select is((select count(*)::int from verification_events where claim_id = 'c1111111-1111-1111-1111-111111111111'), 1, 'a verification event is recorded');

update verification_events set to_status = 'verified';
select is((select count(*)::int from verification_events where to_status = 'verified'), 0, 'verification events cannot be updated');

delete from verification_events;
select is((select count(*)::int from verification_events), 1, 'verification events cannot be deleted');

-- The claim itself still carries its current status, changed via a new event +
-- an explicit update (allowed — the CURRENT value lives on the claim; the trail
-- lives in verification_events).
update claims set verification = 'partially_verified' where id = 'c1111111-1111-1111-1111-111111111111';
select is((select verification::text from claims where id = 'c1111111-1111-1111-1111-111111111111'), 'partially_verified', 'claim current status updates');

-- A cannot link B's claim to A's evidence (workspace mismatch on insert check).
select throws_ok(
  $$ insert into claim_evidence (claim_id, evidence_id, workspace_id, relation) values ('c2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'supports') $$,
  '42501', null, 'A cannot create a link in B'
);

set local role anon;
set local request.jwt.claims = '';
select is((select count(*)::int from claims), 0, 'anon sees no claims');

select * from finish();
rollback;
