-- Purpose:     Consent records — the versioned agreement behind every interaction.
-- Phase:       01
-- Reversible:  Yes — drop table.
-- Data impact: None.
-- Security:    RLS member-scoped. APPEND-ONLY: a consent record is never updated
--              or deleted. A change in what a source agreed to is a NEW record
--              that supersedes the prior one via supersedes_consent_id. This is
--              a hard product rule — AGENTS.md: "consent and permissions are
--              versioned records, not informal notes," and "the app must not
--              infer consent." An UPDATE policy would let consent be rewritten;
--              its deliberate absence makes that impossible through the API.

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  interaction_id uuid not null references interactions (id) on delete cascade,
  subject_person_id uuid references people (id),
  captured_at timestamptz not null default now(),
  capture_method text not null,
  recording_allowed boolean,
  photo_allowed boolean,
  video_allowed boolean,
  transcription_allowed boolean,
  publication_allowed boolean,
  research_allowed boolean,
  commercial_contact_allowed boolean,
  attribution_mode text,
  allowed_descriptor text,
  embargo_until timestamptz,
  restrictions text,
  -- Points at the consent record this one replaces. The chain is the history;
  -- nothing is edited in place.
  supersedes_consent_id uuid references consent_records (id),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index consent_records_interaction_idx on consent_records (interaction_id);
create index consent_records_subject_idx on consent_records (subject_person_id);

comment on table consent_records is
  'Append-only. Consent is never edited; a change is a new record superseding the old. No update or delete policy exists.';

alter table consent_records enable row level security;

-- Members may read consent for their workspace.
create policy consent_records_select on consent_records
  for select using (is_workspace_member(workspace_id));

-- Members may record consent. No update or delete policy: consent is immutable
-- once captured, superseded only by a new record.
create policy consent_records_insert on consent_records
  for insert with check (is_workspace_member(workspace_id));
