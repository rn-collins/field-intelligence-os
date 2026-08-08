-- Purpose:     The link between a claim and a piece of evidence.
-- Phase:       01
-- Reversible:  Yes — drop table.
-- Security:    RLS via the owning claim's workspace. A row is reachable only to
--              members of the workspace that owns both the claim and the evidence.

create table claim_evidence (
  claim_id uuid not null references claims (id) on delete cascade,
  evidence_id uuid not null references evidence (id) on delete cascade,
  workspace_id uuid not null references workspaces (id) on delete cascade,
  relation text not null check (relation in ('supports', 'challenges', 'contextualizes', 'supersedes')),
  strength text,
  notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  primary key (claim_id, evidence_id, relation)
);

create index claim_evidence_evidence_idx on claim_evidence (evidence_id);

alter table claim_evidence enable row level security;

create policy claim_evidence_member_all on claim_evidence
  for all
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));
