# Project Memory — Field Intelligence OS

## Purpose

Field Intelligence OS is a multimodal field investigation, evidence, relationship, systems-reconstruction and publishing platform. It exists to preserve and connect reality that cannot be recreated later: observations, interviews, claims, evidence, laws, places, workflows, permissions, media assets and investigator cognition.

## Founding principle

Do not merely record what a trip looked like. Capture enough reality to reconstruct how the place, people, law, evidence and systems worked—and how the investigator's understanding changed.

## Initial operator

RN Collins is the founder, product owner and first investigator. The system must be excellent for a solo operator while remaining architecturally capable of supporting future editors, researchers, attorneys, students, contributors and institutional teams.

## First live deployment — one September window, two competing options

The September 2026 deployment is a **single trip with two mutually exclusive
candidates**, not two trips. The choice is open.

- **Manhattan**, September 20–22, 2026: climate, AI, ESG, legal technology, fintech, creator economy, clean energy and materials.
- **Reykjavík**, September 20–26, 2026: cannabis, psychoactive-plant science, medical access, law, regulation, public health, harm reduction, culture and island systems.

The overlapping dates are deliberate — these are alternatives being weighed, not
a scheduling error to be corrected. The decision framework, weighting and
provisional scores live in the owner's September 2026 planning workbook
(`docs/source-materials/RN_Fall_2026_Conference_Intelligence_Master_Tracker_v4.xlsx`,
sheet "September Decision"). That workbook is the authority.

Its contents are deliberately **not copied into the application seed data** —
`lib/seed/deployments.ts` models the shape of the decision and none of its
substance, and a test enforces that. Note the limit of that protection: the
workbook itself is committed to this repository under `docs/source-materials/`,
so it travels with the git history. It is not served by the application and is
not part of any build output, but anyone with repository access can read it.
See `docs/build/OPEN_QUESTIONS.md` #15 — this must be resolved before the
repository is made public.

The decision is blocked on verified cost and access inputs, which the workbook
still records as zero. Until it is made, neither option should accumulate
downstream work — targets, consent templates or vault structure — because effort
spent on the option that is dropped is effort thrown away.

**When the decision is made**, update this section and `lib/seed/deployments.ts`
together: the selected option moves from `candidate` to `planning`, the other to
`not-selected`.

## Non-negotiable product principles

1. Evidence and provenance over polished but unsupported output.
2. Human review over autonomous publication or legal/scientific conclusions.
3. Role separation among editorial, research, professional networking and commercial work.
4. Consent and permissions are versioned records, not informal notes.
5. Original masters are preserved; edits are derivatives.
6. Structured data is portable and reproducible.
7. Accessibility and mobile field usability are core requirements.
8. The system must reduce cognitive load, not create an administrative burden larger than the investigation.
9. AI must expose uncertainty, sources and limitations.
10. Every major feature must be useful in a real deployment, not merely impressive in a demo.

## Canonical domain language

Deployment, Person, Organization, Place, Interaction, Interview, Claim, Evidence, Law/Policy, System, Workflow Step, Asset, Permission, Cognition Update, Commitment, Output and Relationship are canonical entities. Do not create synonymous duplicate entities without an approved architecture decision record.

## Current build priority

Phase 00: reproducible repository and production application foundation.
Phase 01: authentication, tenancy, core schema and RLS.
Phase 02: command center and deployments.
Phase 03: targets, people, organizations and relationships.
Phase 04: interviews, consent and field mode.
Phase 05: claims, evidence, law and systems reconstruction.
Phase 06: asset metadata, Drive linking and ingest queues.
Phase 07: search, retrieval and human-reviewed AI assistance.
Phase 08: outputs, Notion mirror, automation and deployment hardening.

## Known boundaries

- The app does not provide legal or medical advice.
- The app must not infer consent.
- The app must not publish generated quotations.
- The app must not expose service-role credentials to the browser.
- Google Drive links may point to restricted files; app authorization must not imply Drive authorization.

## How to update this file

Update only when a durable project-level fact, principle or priority changes. Short-lived task status belongs in the roadmap, build journal or GitHub issues.
