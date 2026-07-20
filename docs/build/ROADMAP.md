# Initial Engineering Roadmap

## Phase 00 — Foundation
Repository, Next.js shell, design system, testing, CI, documentation, static dashboard proof.

## Phase 01 — Supabase foundation and authentication
- Canonical initial schema subset
- Workspace/user model
- Auth flows
- RLS policies and pgTAP tests
- Manhattan/Reykjavík non-sensitive seed data

## Phase 02 — Deployments and targets
- Deployment workspaces
- Events, assignments, targets, organizations, relationships
- Status pipelines and deadlines

## Phase 03 — Interviews, consent, and commitments
- Interview preparation and field mode
- Consent/attribution records
- Commitments and follow-up queue

## Phase 04 — Claims, evidence, law, and verification
- Claim/evidence graph
- Verification queue
- Contradictions and silence/absence records
- Citation and provenance handling

## Phase 05 — Assets and Drive integration
- Media metadata
- Drive OAuth and canonical vault links
- Permission-aware asset browser
- Ingest queue

## Phase 06 — Systems reconstruction and cognition
- Workflow reconstruction
- Field notes and hypothesis updates
- Comparative and longitudinal views

## Phase 07 — Search, retrieval, and AI assistance
- Full-text and structured retrieval
- Human-reviewed transcription and claim proposals
- Evidence-aware assistant with citations

## Phase 08 — Outputs and publishing
- Article, film, photo essay, podcast, course, presentation, and Cannes pipelines
- Source/permission readiness checks

## Phase 09 — Offline Field Mode and Notion mirror
- Offline queue/conflict resolution
- One-way or explicit Notion sync
- Mobile optimization

## Release gates
Each phase requires passing CI, RLS/security review where applicable, accessibility review, documentation, migration reproducibility, and a Vercel preview.
