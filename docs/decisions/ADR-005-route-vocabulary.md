# ADR-005: Route vocabulary

- Status: Accepted
- Date: 2026-07-19
- Supersedes: nothing. Resolves `docs/build/OPEN_QUESTIONS.md` #10.

## Context

Three canonical sources disagreed on what the modules are called.

| Concept        | v1.0 spec (`screen_inventory.csv`) | Phase 00 task (§12) | Ontology (`PROJECT_MEMORY.md`) |
| -------------- | ---------------------------------- | ------------------- | ------------------------------ |
| Institutions   | `/institutions`                    | "Organizations"     | **Organization**               |
| Interactions   | `/interactions`                    | "Interviews"        | **Interaction**, **Interview** |
| Media          | `/archive/ingest`, `/assets/[id]`  | "Media"             | **Asset**                      |
| Method library | `/library` ("FCIF Library")        | "Canon"             | not listed                     |

`AGENTS.md` ranks the v1.0 specification above `ARCHITECTURE.md` and above
implementation, but `PROJECT_MEMORY.md` fixes the canonical entity nouns and the
Phase 00 task was the direct instruction. The conflict was recorded rather than
resolved silently, and the product owner ratified the resolution below.

## Decision

**Routes use the canonical entity nouns. Navigation labels use the language of
`docs/ux/NAVIGATION_AND_SCREEN_MAP.md`.**

| Route            | Label             | Replaces          |
| ---------------- | ----------------- | ----------------- |
| `/organizations` | Organizations     | `/institutions`   |
| `/interactions`  | Interactions      | —                 |
| `/assets`        | Media & assets    | —                 |
| `/assets/ingest` | Ingest            | `/archive/ingest` |
| `/library`       | Canon & standards | —                 |

`/interviews` and `/media` are rejected: an Interview is one kind of
Interaction and an Asset is more than media, so both would name the route after
a subset of what it holds.

`/assets/ingest` replaces `/archive/ingest` so that media has exactly one root.
Two roots for one concept is how a system acquires a second, divergent mental
model.

Navigation groups the thirteen destinations into five sections (Operations,
Field record, Verification, Archive and output, Workspace). The navigation map's
flat list of eleven is preserved as a set of destinations; only the presentation
is grouped, to keep everything within two taps on mobile.

## Consequences

- `features/navigation/nav-model.ts` is the single source of truth, and a unit
  test asserts every route resolves to a real page.
- The `screenId` field on each nav item preserves traceability back to the v1.0
  screen inventory, so the divergence stays visible rather than being forgotten.
- If the v1.0 specification is ever converted to canonical Markdown, its route
  column must be updated to match, or this ADR explicitly noted as overriding it.
- Phase 02 onward must not introduce `/institutions`, `/interviews`, `/media` or
  `/archive` as aliases. Redirects would reintroduce the ambiguity this resolves.
