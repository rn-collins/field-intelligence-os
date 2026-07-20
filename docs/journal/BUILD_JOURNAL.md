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
  adjusting the seed dates, the overlap is modelled as a blocked prerequisite on
  both deployments and surfaced on the Command Center. It turned the static
  dashboard into a demonstration of what the product is actually for.
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
