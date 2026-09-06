# Initial Engineering Roadmap

> **Reconciled 2026-07-19.** This file previously described a ten-phase order
> that disagreed with `docs/BUILD_ORDER.md` and `PROJECT_MEMORY.md` at phases
> 03, 05 and 09. Those two agreed with each other and `PROJECT_MEMORY.md` is the
> durable-decision file, so this one was rewritten to match. See
> `docs/build/OPEN_QUESTIONS.md` #11 for the record of the conflict.
>
> `docs/BUILD_ORDER.md` is canonical for phase numbering. This file expands each
> phase into the work it contains.

## Phase 00 — Foundation ✅

Repository, Next.js shell, design system, testing, CI, documentation, static
dashboard proof. Delivered 2026-07-19; see
`docs/build/PHASE-00-COMPLETION-REPORT.md`.

## Phase 01 — Auth, schema and RLS

- Canonical initial schema subset
- Workspace/user/tenancy model
- Supabase auth flows
- RLS policies and pgTAP tests proving tenant isolation
- Manhattan/Reykjavík non-sensitive seed data, migrated from the Phase 00 static seed

**Gate:** RLS tests prove tenant isolation, including the negative cases.

## Phase 02 — Command Center and deployments

- Deployment workspaces, status pipelines and deadlines
- The Command Center reads from the database rather than static seed
- Readiness computed from real prerequisites

**Gate:** Manhattan and Reykjavík render from the database.

## Phase 03 — People, organizations and relationships

- People, organizations, targets, relationships and commitments
- Role history over time
- Duplicate prevention

**Gate:** no duplicate person entry across deployments.

## Phase 04 — Interviews, consent and Field Mode

- Interview preparation, question trees and live notes
- Versioned consent and attribution records
- Capture cards and mobile Field Mode
- Commitments and the follow-up queue

**Gate:** a complete field interaction can be logged on a phone.

## Phase 05 — Claims, evidence, law and systems

- Claim/evidence graph with separated assertion and support
- Law and policy records with jurisdiction and effective dates
- Verification queue, contradictions, and silence/absence records
- Systems reconstruction: steps, edges, exceptions, comparison

**Gate:** claim-to-evidence provenance is navigable.

## Phase 06 — Assets, Drive links and ingest

- Asset register and media metadata
- Drive OAuth and canonical vault links
- Permission-aware asset browser
- Ingest queue with checksum verification

**Gate:** master/derivative and restriction rules enforced.

## Phase 07 — Search, retrieval and reviewed AI

- Full-text, structured and graph retrieval
- Permission-aware search that filters before retrieval
- Human-reviewed transcription and claim proposals
- Evidence-aware assistant with internal citations

**Gate:** every generated answer cites internal record IDs.

## Phase 08 — Outputs, mirror and launch hardening

- Article, film, photo essay, podcast, course and presentation pipelines
- Source and permission readiness checks
- Notion mirror, automations and observability
- Offline queue and conflict resolution
- FCIF Library (`/library`) content

**Gate:** end-to-end deployment simulations pass.

## Release gates

Each phase requires passing CI, security and RLS review where applicable,
accessibility review, documentation, migration reproducibility, and a Vercel
preview.
