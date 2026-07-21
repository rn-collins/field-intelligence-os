-- Purpose:     Foundational extensions and domain enums for Phase 01.
-- Phase:       01
-- Reversible:  Yes — drop the enums and extension (no data yet).
-- Data impact: None. New types only.
-- Security:    No tables created here; nothing to protect yet.

create extension if not exists pgcrypto;

-- Deployment lifecycle. Extends the v1.0 spec pipeline with `candidate` and
-- `not-selected` (ADR / OPEN_QUESTIONS #13): a competing option that has not
-- been chosen has no representation in the original pipeline, and storing it as
-- `planning` would assert a commitment that was never made.
create type deployment_status as enum (
  'candidate',
  'not_selected',
  'planning',
  'ready',
  'active',
  'processing',
  'closed',
  'cancelled'
);

create type priority_level as enum ('A', 'B', 'C');

-- Sensitivity drives access decisions. `source_protected` and above are the
-- categories `docs/standards/SECURITY_PRIVACY_STANDARD.md` treats as protected.
create type sensitivity_level as enum (
  'public',
  'internal',
  'confidential',
  'source_protected',
  'highly_restricted'
);

-- Workspace roles, from permission_matrix.csv. `service` is for automated jobs.
create type member_role as enum (
  'owner',
  'investigator',
  'editor',
  'researcher',
  'producer',
  'viewer',
  'service'
);
