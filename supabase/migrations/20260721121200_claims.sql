-- Purpose:     Claims — one exact assertion per record, held apart from support.
-- Phase:       01 (the verification spine)
-- Reversible:  Yes — drop table.
-- Security:    RLS member-scoped. Verification status changes are recorded in a
--              separate append-only history table (next migration), never by
--              silently overwriting — AGENTS.md: AI/edits must not silently
--              overwrite verification status, and every status change is audited.

create table claims (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  deployment_id uuid references deployments (id) on delete set null,
  interaction_id uuid references interactions (id) on delete set null,
  claimant_person_id uuid references people (id),
  claimant_organization_id uuid references organizations (id),
  exact_text text not null,
  claim_type text,
  context text,
  made_at timestamptz,
  verification verification_status not null default 'unreviewed',
  stakes text,
  financial_interest text,
  legal_significance text,
  publication_language text,
  supersedes_claim_id uuid references claims (id),
  version integer not null default 1,
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index claims_workspace_idx on claims (workspace_id) where deleted_at is null;
create index claims_deployment_idx on claims (deployment_id) where deleted_at is null;

create trigger claims_set_updated_at
  before update on claims
  for each row execute function set_updated_at();

comment on column claims.exact_text is
  'The assertion in its original wording. Held separate from any evidence, so the claim and its support never contaminate each other.';

alter table claims enable row level security;

create policy claims_member_all on claims
  for all
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));
