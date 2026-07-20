# Field Intelligence OS — Codex Operating Instructions

## Mission
Field Intelligence OS is a multimodal field-investigation, evidence, relationship, systems-reconstruction, archive, and publishing platform founded by RN Collins.

The first production user is RN Collins. The architecture must support future journalists, researchers, lawyers, educators, students, collaborators, and institutional teams without compromising source protection, consent, or evidentiary integrity.

## Product boundaries
Field Intelligence OS is not a generic CRM, note-taking app, content calendar, or file browser. It must connect people, places, institutions, interactions, claims, evidence, laws, systems, media assets, permissions, cognition updates, and outputs.

## Canonical sources
Use this order when sources conflict:
1. The latest approved product decision record in `docs/decisions/`.
2. `docs/product/PRODUCT_SPECIFICATION.md` and the v1.0 specification in `docs/source-materials/`.
3. `ARCHITECTURE.md` and `docs/architecture/`.
4. The Field Investigation Manual and canonical workbook in `docs/source-materials/`.
5. Existing implementation and tests.

Do not silently choose between conflicting requirements. Record the conflict in a new ADR or `docs/build/OPEN_QUESTIONS.md`.

## Required stack
- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- Supabase Postgres and Auth
- Vercel deployment
- Google Drive for canonical original media masters
- Notion as an optional readable mirror, never the canonical database

Do not change the stack without an approved ADR.

## Source-of-truth rules
- GitHub: canonical code, migrations, configuration, tests, and technical documentation.
- Supabase: canonical structured application data.
- Google Drive: canonical original media and source-file vault.
- Notion: optional knowledge mirror and human-readable workspace.
- Vercel: deployment platform, not a data store.

## Security and privacy
- Never commit secrets, credentials, access tokens, database passwords, service-role keys, private media, source identities, or restricted transcripts.
- Never expose the Supabase service-role key to browser code.
- Enable and test Row Level Security on every exposed table.
- Default to least privilege and deny-by-default.
- Treat off-record material, embargoes, consent records, source identity, health information, legal information, unpublished research, location data, and unpublished media as sensitive.
- Permission and verification histories must be auditable and append-only where feasible.
- AI output must never silently overwrite source evidence, quotations, consent terms, or verification status.

## Data and migration discipline
- All schema changes must be represented by timestamped migrations in `supabase/migrations/`.
- Never make an untracked production schema change.
- Seed data must contain no secrets or sensitive personal data.
- Manhattan and Reykjavík records are demonstration/seed deployments and must be clearly labeled.
- Use stable IDs and preserve source provenance.

## Engineering standards
- Prefer small, composable modules and explicit domain boundaries.
- Avoid premature abstractions, monolithic files, hidden side effects, and duplicated business logic.
- Validate all external input.
- Use accessible semantic HTML and keyboard-operable interactions.
- Mobile Field Mode must be usable with limited connectivity and minimal taps.
- Every feature must include empty, loading, error, unauthorized, and restricted states.

## Definition of done
Before marking work complete, run and report:
- lint
- TypeScript type check
- unit/component tests
- relevant database/RLS tests
- production build
- accessibility checks for changed UI

No task is complete while required checks fail.

## Git workflow
- Work on a feature branch; do not commit directly to `main` after initial bootstrap.
- Use focused commits with descriptive conventional messages.
- Open a pull request with summary, screenshots for UI work, test evidence, database changes, security considerations, and remaining limitations.
- Update documentation, migrations, seed data, and tests with implementation changes.

## Public-quality standard
This repository is intended to become publicly demonstrable and reproducible. Code, documentation, examples, setup instructions, and architecture decisions must be understandable to a competent developer who was not part of the original conversations.

## Immediate build order
Follow `docs/build/PHASE-00-CODEX-FOUNDATION.md` first. Do not attempt the entire product in one task.

## Mandatory session start

Before making changes, read `START_HERE.md`, `PROJECT_MEMORY.md`, the relevant phase file and applicable files in `docs/standards/`. For the initial build, follow `.codex/FIRST_TASK.md` exactly.

## Persistent project memory

Durable project context lives in `PROJECT_MEMORY.md` and `docs/memory/`. Update those files only for lasting decisions. Use GitHub issues, the build journal and roadmap for temporary task state.

## Public-quality repository requirement

Assume this repository may later be made public. Do not commit private contact data, credentials, confidential source material, proprietary third-party documents without permission, or generated artifacts that cannot be reproduced. Documentation and setup must be clear enough for a new developer to reproduce the application.
