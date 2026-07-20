-- Field Intelligence OS v1.0 representative canonical schema
-- Apply through versioned Supabase migrations. Enable RLS on every workspace-owned table.
create extension if not exists pgcrypto;
create extension if not exists vector;
create extension if not exists postgis;

create type deployment_status as enum ('planning','ready','active','processing','closed','cancelled');
create type priority_level as enum ('A','B','C');
create type sensitivity_level as enum ('public','internal','confidential','source_protected','highly_restricted');
create type verification_status as enum ('unreviewed','unverified','partially_verified','verified','disputed','false','superseded','do_not_use');

create table workspaces (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 slug text unique not null,
 settings jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table workspace_members (
 workspace_id uuid references workspaces(id) on delete cascade,
 user_id uuid references profiles(id) on delete cascade,
 role text not null check (role in ('owner','investigator','editor','researcher','producer','viewer','service')),
 status text not null default 'active',
 primary key (workspace_id,user_id)
);

create table deployments (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 code text not null,
 name text not null,
 status deployment_status not null default 'planning',
 priority priority_level not null default 'B',
 deployment_type text,
 start_at timestamptz,
 end_at timestamptz,
 timezone text,
 city text,
 country text,
 mission text,
 primary_question text,
 readiness_score numeric(5,2),
 drive_root_external_id text,
 notion_page_external_id text,
 version integer not null default 1,
 created_by uuid references profiles(id),
 updated_by uuid references profiles(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(workspace_id,code)
);

create table people (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
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
 merge_parent_id uuid references people(id),
 version integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz
);

create table organizations (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 name text not null,
 organization_type text,
 legal_name text,
 website text,
 jurisdiction text,
 description text,
 sensitivity sensitivity_level not null default 'internal',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz
);

create table targets (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 deployment_id uuid not null references deployments(id) on delete cascade,
 person_id uuid references people(id),
 organization_id uuid references organizations(id),
 title text not null,
 priority priority_level not null default 'B',
 status text not null default 'researching',
 reason text,
 interview_ask text,
 evidence_request text,
 contact_route text,
 next_action text,
 follow_up_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check ((person_id is not null) or (organization_id is not null))
);

create table interactions (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 deployment_id uuid references deployments(id) on delete set null,
 interaction_type text not null,
 status text not null default 'draft',
 title text not null,
 capacity text not null default 'editorial',
 scheduled_at timestamptz,
 started_at timestamptz,
 ended_at timestamptz,
 timezone text,
 purpose text,
 attribution_default text,
 recording_status text,
 summary text,
 restricted_notes_ciphertext text,
 version integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table consent_records (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 interaction_id uuid not null references interactions(id) on delete cascade,
 subject_person_id uuid references people(id),
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
 supersedes_consent_id uuid references consent_records(id),
 created_by uuid references profiles(id)
);

create table claims (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 deployment_id uuid references deployments(id),
 interaction_id uuid references interactions(id),
 claimant_person_id uuid references people(id),
 claimant_organization_id uuid references organizations(id),
 exact_text text not null,
 claim_type text,
 context text,
 made_at timestamptz,
 verification verification_status not null default 'unreviewed',
 stakes text,
 financial_interest text,
 legal_significance text,
 publication_language text,
 supersedes_claim_id uuid references claims(id),
 version integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table evidence (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 evidence_type text not null,
 title text not null,
 source_url text,
 drive_file_id text,
 publication_date date,
 version_label text,
 jurisdiction text,
 methodology text,
 population text,
 comparator text,
 metrics text,
 limitations text,
 reliability_status text,
 fitness_for_purpose text,
 sensitivity sensitivity_level not null default 'internal',
 authenticated_at timestamptz,
 authenticated_by uuid references profiles(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table claim_evidence (
 claim_id uuid references claims(id) on delete cascade,
 evidence_id uuid references evidence(id) on delete cascade,
 relation text not null check (relation in ('supports','challenges','contextualizes','supersedes')),
 strength text,
 notes text,
 primary key(claim_id,evidence_id,relation)
);

create table systems (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 deployment_id uuid references deployments(id),
 name text not null,
 jurisdiction text,
 trigger text,
 intended_outcome text,
 status text not null default 'draft',
 version integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table system_steps (
 id uuid primary key default gen_random_uuid(),
 system_id uuid not null references systems(id) on delete cascade,
 label text not null,
 description text,
 actor_text text,
 input_text text,
 decision_rule text,
 output_text text,
 evidence_status text not null default 'claimed',
 order_hint numeric,
 created_at timestamptz not null default now()
);

create table system_edges (
 id uuid primary key default gen_random_uuid(),
 system_id uuid not null references systems(id) on delete cascade,
 from_step_id uuid not null references system_steps(id) on delete cascade,
 to_step_id uuid not null references system_steps(id) on delete cascade,
 relation text not null default 'next',
 condition text,
 evidence_status text not null default 'claimed'
);

create table assets (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 asset_code text not null,
 asset_type text not null,
 capture_type_id text,
 master_provider text not null default 'google_drive',
 master_external_id text,
 master_path text,
 original_filename text,
 canonical_filename text,
 mime_type text,
 bytes bigint,
 captured_at timestamptz,
 timezone text,
 hash_sha256 text,
 ingest_status text not null default 'registered',
 sensitivity sensitivity_level not null default 'internal',
 transcript_status text,
 proxy_storage_path text,
 immutable boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(workspace_id,asset_code)
);

create table external_mappings (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 entity_type text not null,
 entity_id uuid not null,
 provider text not null check(provider in ('notion','google_drive','google_calendar','gmail','other')),
 external_id text not null,
 external_url text,
 external_parent_id text,
 last_pushed_version integer,
 last_pulled_version text,
 last_synced_at timestamptz,
 sync_direction text not null default 'push',
 sync_status text not null default 'never',
 conflict_payload jsonb,
 unique(workspace_id,entity_type,entity_id,provider)
);

create table audit_events (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references workspaces(id) on delete cascade,
 actor_user_id uuid references profiles(id),
 actor_service text,
 action text not null,
 entity_type text not null,
 entity_id uuid,
 occurred_at timestamptz not null default now(),
 before_data jsonb,
 after_data jsonb,
 correlation_id uuid,
 ip_hash text
);

-- Example RLS pattern; create per table with role-aware helpers.
alter table deployments enable row level security;
create policy deployments_workspace_member on deployments
for all using (
 exists (select 1 from workspace_members wm where wm.workspace_id=deployments.workspace_id and wm.user_id=auth.uid() and wm.status='active')
) with check (
 exists (select 1 from workspace_members wm where wm.workspace_id=deployments.workspace_id and wm.user_id=auth.uid() and wm.status='active')
);
