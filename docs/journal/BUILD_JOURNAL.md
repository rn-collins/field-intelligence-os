# Build Journal

Record meaningful milestones, surprises, rejected approaches and lessons. Keep entries concise and link to issues, PRs, ADRs and previews. This is a project history, not a duplicate changelog.

## 2026-07 — Foundation prepared

- Product specifications and field methodology consolidated.
- Supabase project created by owner.
- Codex-ready repository standard established.
- Production application not yet scaffolded.

## 2026-07-19 — Phase 00 built

- Implementation plan written first (`docs/build/PHASE-00-IMPLEMENTATION-PLAN.md`),
  as `.codex/FIRST_TASK.md` requires, before any application code.
- **Four conflicts found during planning and recorded rather than resolved
  silently**, per `AGENTS.md`. All four are in `docs/build/OPEN_QUESTIONS.md` #9–12.
  The blocking one: the working directory was not a Git repository, so the
  required branch/commit/PR workflow was impossible. Resolved with owner
  authorization to `git init`.
- Route vocabulary conflict between the v1.0 screen inventory, the Phase 00 task
  and the canonical ontology resolved by ADR-005 in favour of the ontology nouns.
- **Surprise worth keeping:** the two first deployments overlap on the calendar.
  `PROJECT_MEMORY.md` records Manhattan as 20–22 September 2026 and Reykjavík as
  20–26 September 2026 — one operator cannot be in both. Rather than quietly
  adjusting the seed dates, the overlap was modelled as a blocker and surfaced on
  the Command Center. See the correction below: the interpretation was wrong, but
  surfacing it rather than hiding it is what led to finding out.
- **Rejected:** a component library (shadcn/Radix) for Phase 00. Ten primitives
  did not justify it, and it pulled the interface toward the generic admin
  template the brief forbids. Recorded in ADR-006 as a debt to revisit in
  Phase 02, when dialogs and comboboxes arrive.
- **Rejected:** `next/font/google`. Fetching fonts at build time would make a
  production build require network access, breaking the offline-reproducibility
  claim. System stacks instead.
- **Lesson:** the hand-written token contrast test passed on all 56 pairs, and
  axe then caught a 57th the list had missed (`ink-subtle` on `surface-sunken`,
  4.28:1, on the deployment card footer). Palette-level and render-level
  accessibility checks catch different things; keep both.

## 2026-07-19 — September deployments corrected: a decision, not a clash

Asked to "fix the overlap", I checked the conference tracker before moving any
dates. It contains a sheet named **"September Decision"**, titled _"September
2026 Competing Field Deployments — Manhattan vs Reykjavík"_, with an eight-criterion
weighted model and a provisional result pending real cost inputs.

The overlap was never an error. The two deployments are **mutually exclusive
alternatives for one window**, and moving a date would have fabricated a two-trip
itinerary the owner never chose — erasing a documented strategic decision in a
system whose entire purpose is preserving provenance.

- Root cause was `PROJECT_MEMORY.md`, which listed both as "first live
  deployments". Corrected with owner approval; the seed had faithfully
  reproduced the error.
- Added `candidate` and `not-selected` statuses. SCR-02's pipeline assumes
  commitment, so a competing option previously had to be stored as `planning` —
  silently upgrading "considering" to "planned". Recorded as OPEN_QUESTIONS #13
  for ratification against the v1.0 spec.
- **The distinction that mattered:** an open decision and a scheduling conflict
  are identical in the data — two deployments, same dates — and mean opposite
  things. Exclusivity is now _declared_ on the record via `competesWith`, never
  inferred from dates. `findScheduleConflicts` ignores candidates entirely;
  reporting an expected either/or as a clash would train the operator to ignore
  the alert.
- **Bug found while fixing this:** `DeploymentCard` hard-coded its status badge
  to "Planning". In a provenance system, rendering an assumed commitment is a
  correctness bug, not a cosmetic one.
- **Deliberately not imported:** the weighted scores, criterion rationales,
  client-fit reasoning and cost figures. That is live commercial and editorial
  strategy, and this repository is written to survive being made public. The
  seed models the shape of the decision and none of its contents; a test asserts
  it stays that way.
- **Lesson:** "fix the data" was the wrong instruction to follow literally. The
  source material had the answer, and the five minutes spent reading it before
  editing prevented a change that would have looked correct and been wrong.
