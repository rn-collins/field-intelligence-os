# Phase 00 — Audit Remediation Plan

Status: **Executed.** See `docs/build/PHASE-00-AUDIT-REMEDIATION-REPORT.md` for results.
Branch: `feat/phase-00-foundation` · PR #1 (remains open, not merged)
Baseline commit: `e7b183c`
Author: Codex agent session

Prerequisite reading completed: `AGENTS.md`, `START_HERE.md`, `PROJECT_MEMORY.md`,
`docs/DEPLOYMENT.md`, `docs/build/PHASE-00-IMPLEMENTATION-PLAN.md`,
`docs/build/PHASE-00-COMPLETION-REPORT.md`, `docs/build/OPEN_QUESTIONS.md`,
`docs/standards/UI_STANDARD.md`, `docs/standards/SECURITY_PRIVACY_STANDARD.md`,
`docs/decisions/ADR-005-route-vocabulary.md`, `docs/decisions/ADR-006-phase-00-frontend-stack.md`.
Full PR diff inspected (93 files, +14,929/−146) and all 11 test files reviewed
(109 unit/component cases, 17 e2e cases).

---

## 0. Findings verified before planning

Two audit findings were reproduced empirically rather than accepted on
description. One is materially worse than the audit states.

### A1 is a live security hole, not a theoretical one

The audit describes unquoted wildcards that "may fail to scan nested files
reliably." Measured behaviour is worse and is deterministic:

```
git ls-files -- *.ts *.tsx          → 36 files
git ls-files '*.ts' '*.tsx'         → 54 files
lib/supabase/server.ts scanned?     → NO
```

`execSync` runs through `/bin/sh`. The repository has four top-level `.ts` files
(`next.config.ts`, `playwright.config.ts`, `vitest.config.ts`, `vitest.setup.ts`),
so the shell **expands** `*.ts` and git never receives a glob. `*.tsx` has no
top-level match, so sh passes it through literally and git expands it recursively.

The result is an asymmetric hole: **all 32 `.tsx` files are scanned; only 4 of
the 22 `.ts` files are.** Silently unscanned are `lib/supabase/server.ts`,
`lib/env.ts`, `lib/supabase/client.ts`, `lib/seed/*.ts` and `features/**/*.ts` —
precisely the files the test exists to police. A `SUPABASE_SERVICE_ROLE_KEY`
reference in any of them passes today.

The behaviour is also shell-dependent: under `zsh` the unmatched `*.tsx` aborts
the command entirely, the `catch` in A2 swallows it, and the test scans **zero
files** while still passing.

### A2 makes A1 undetectable

`tracked()` catches every error and returns `[]`. An empty result is
indistinguishable from "scanned everything, found nothing," so a scanner failure
reports as a security pass. This is the mechanism that would have hidden the
zsh variant of A1 indefinitely.

**Both are treated as required, highest-priority fixes.**

---

## 1. How this plan classifies work

| Class | Meaning                                                       |
| ----- | ------------------------------------------------------------- |
| **R** | Required in this remediation                                  |
| **D** | Deliberately deferred to Phase 01+, documented with rationale |
| **N** | Will not change; rationale recorded                           |

The audit repeatedly distinguishes "build it" from "specify it precisely."
Parts D2, D3, F5, F7 and most of A7 are explicitly documentation deliverables;
implementing them as working features would violate the standing instruction not
to begin Phase 01.

---

## 2. Part A — engineering, security, CI, deployment

| ID  | Class             | Files                                                                                | Tests                                       |
| --- | ----------------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| A1  | R                 | `tests/unit/security-boundaries.test.ts`                                             | rewrite scanner; add nested-detection proof |
| A2  | R                 | same                                                                                 | add explicit skip/fail behaviour test       |
| A3  | R                 | `docs/DEPLOYMENT.md`, `scripts/verify-deployment.sh` (new)                           | shellcheck-clean; no mutation               |
| A4  | R                 | `docs/build/PHASE-00-COMPLETION-REPORT.md`, `scripts/verify-phase-00.sh` (new)       | n/a                                         |
| A5  | R                 | `.nvmrc`, `package.json`, `README.md`, `CONTRIBUTING.md`, `.github/workflows/ci.yml` | n/a                                         |
| A6  | R                 | `scripts/db-test.sh`, `supabase/tests/README.md`, `README.md`                        | n/a                                         |
| A7  | R (config + docs) | `.github/dependabot.yml`, `.github/workflows/codeql.yml`, `docs/public-release/`     | n/a                                         |
| A8  | R (docs only)     | `docs/public-release/SOURCE_MATERIAL_CLASSIFICATION.md`                              | n/a                                         |

### A1 — recursive, shell-free scanning

Replace `execSync` with `execFileSync("git", ["ls-files", "-z", ...])`. No shell,
so no expansion; `-z` handles paths containing spaces or newlines. Pathspecs are
passed as separate argv entries, and filtering by extension happens in JavaScript.

New test: write a temporary nested file containing the forbidden token under a
scanned directory, assert the scanner returns it, then remove it. This proves
recursion positively rather than asserting an empty array — the current test
passes whether the scanner works or scans nothing at all.

Also add a guard asserting the scanner sees a known-nested sentinel
(`lib/supabase/server.ts`) on every run, so a future regression to a
non-recursive scan fails immediately.

### A2 — fail loudly, skip explicitly

Distinguish three cases:

1. **Not a git checkout** (exported tarball) — detected by probing
   `git rev-parse --git-dir` once. Git-dependent assertions call `ctx.skip()`
   with a printed reason. Non-git assertions still run.
2. **Git present, command failed** — throw. Never return `[]`.
3. **Git present, command succeeded** — return results.

The skip must be visible in test output, not silent.

### A3 — deployment documentation matching verified behaviour

Current `docs/DEPLOYMENT.md` already documents the bootstrap trap (added after
the incident) but frames the remedy as "always pass `--target=preview`", which
this session proved insufficient. Revisions:

- State the **first-deployment bootstrap rule**: with zero production
  deployments, the next deployment becomes production regardless of requested
  target or source branch.
- State explicitly: **never delete the last production deployment to "clear"
  production** — it recreates the bootstrap condition and guarantees the next
  deployment is promoted.
- Document verification of: project `productionBranch`, deployment `target`,
  preview authentication, production alias status.
- Keep rules 1–4 (previews from branches/PRs; `main` is production; manual
  production deploys prohibited without explicit owner authorization; verify
  before reporting).

New `scripts/verify-deployment.sh`:

- Read-only. Runs only `vercel inspect`, `curl -I`, and a projects API GET.
- Accepts `--preview <url>` and `--production-alias <host>`; `--scope` optional.
- Contains no `deploy`, `promote`, `remove`, `alias` or any mutating verb — this
  will be asserted by a test grepping the script, because a verification tool
  that can deploy is a footgun.
- Exit non-zero if the preview reports `target: production`, or if the production
  alias serves application content when it is expected inactive.

### A4 — one source of truth for verification results

Root cause of the stale-totals inconsistency is that totals are hand-copied into
prose in two documents. Fix the mechanism, not just the numbers:

- `scripts/verify-phase-00.sh` runs every check and writes
  `docs/build/verification/latest.json` (commit SHA, ISO timestamp, node, npm,
  per-check status and counts, `local` vs `ci`).
- `PHASE-00-COMPLETION-REPORT.md` states results **once**, generated from that
  artifact, and links to it rather than restating totals elsewhere.
- Remove per-part totals scattered through the report and PR description.

### A5 — honest toolchain policy

Current documentation claims local and CI "cannot drift," which is false: `.nvmrc`
says 22, verification ran on Node 24.16.0.

Policy to adopt and document:

- **Primary version: Node 22** (`.nvmrc`, CI `node-version-file`).
- **Supported range: `>=22 <25`** (`engines`), because the code is verified to
  work on 24 and forbidding it would be dishonest.
- Add exact `packageManager` (npm pinned to the version used to generate the
  lockfile).
- Replace "cannot drift" wording with the accurate statement: CI runs the primary
  version; local may run any supported version; **the verification artifact
  records which version produced each result.**
- Re-run final verification on Node 22 if available on this machine; if not,
  record the actual version rather than claiming otherwise.

### A6 — honest database test status

`npm run db:test` exits 0 with no schema, which reads as a pass.

- Exit code **0 with an explicit `SKIPPED (not applicable — Phase 00 defines no
schema)`** marker, and emit `status=skipped` for the verification artifact.
- Add the Phase 01 tripwire: if `supabase/migrations/*.sql` exists and
  `supabase/tests/*.test.sql` does not, **exit 1** with an explanatory message.
  This makes "schema without tests" a build failure the moment Phase 01 begins.
- Completion report and README show SKIPPED, never PASS.

### A7 — security tooling appropriate to Phase 00

- `.github/dependabot.yml` — npm + github-actions, weekly, grouped minor/patch.
- `.github/workflows/codeql.yml` — JS/TS, PR + weekly schedule.
- `npm audit --audit-level=high` added to CI (currently zero vulnerabilities, so
  it will not be immediately red).
- **Owner-action instructions** for secret scanning and push protection (repo
  settings; cannot be enabled from the repository) → `docs/public-release/`.
- SBOM and third-party licence review added to the public-release checklist and
  roadmap, **not** built now.

Not adding: brittle checks that cannot run reliably (per the audit's own caveat).

### A8 — source-material classification

New `docs/public-release/SOURCE_MATERIAL_CLASSIFICATION.md` listing all 17 tracked
files under `docs/source-materials/`, each classified 1–4. No deletion, no history
rewrite now. Cross-linked from `OPEN_QUESTIONS.md` #15, which remains the blocker.

---

## 3. Part B — mobile navigation

| ID  | Class | Files                                                                                                                 |
| --- | ----- | --------------------------------------------------------------------------------------------------------------------- |
| B1  | R     | `features/navigation/nav-model.ts`, `components/layout/mobile-tab-bar.tsx`, `components/layout/module-menu.tsx` (new) |
| B2  | R     | same                                                                                                                  |
| B3  | R     | `tests/e2e/responsive.spec.ts` (new), `playwright.config.ts`                                                          |

Target IA: **Home · Deployments · Capture · Search · More**, with Capture routing
to `/field`, satisfying B2's one-tap requirement.

**Design decision requiring a note:** ADR-006 deliberately excluded a component
library, observing that hand-rolled dialogs are where accessibility breaks. B1
now requires a focus-trapped sheet. Rather than reverse that ADR mid-phase or
hand-roll a focus trap, the "More" sheet will use the **native `<dialog>` element
with `showModal()`**, which provides focus trapping, `Escape`, inertness of
background content and a top-layer render from the platform. This keeps the
zero-dependency position honest and is more robust than anything hand-rolled.
Recorded as an amendment note on ADR-006.

Requirements to satisfy and test: ≤2 taps to every module, keyboard operable,
focus moves into the sheet and returns to the trigger on close, `Escape` closes,
visible close control, `aria-label`, background inert, ≥44 px targets, no
meaning-hiding truncation.

Widths to verify: 320, 360, 390, 430; plus 200% zoom.

---

## 4. Part C — Command Center

| ID  | Class | Files                                                                                                                                             |
| --- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | R     | `app/page.tsx`, `components/ui/demo-data-banner.tsx`                                                                                              |
| C2  | R     | `components/patterns/module-placeholder.tsx`, `app/page.tsx`, `app/field/page.tsx`, `features/navigation/nav-model.ts`, `app/_dev/page.tsx` (new) |
| C3  | R     | `app/page.tsx`                                                                                                                                    |
| C4  | R     | `components/patterns/deployment-card.tsx`                                                                                                         |
| C5  | R     | `components/patterns/deployment-card.tsx`                                                                                                         |

- **C1/C2** — replace the verbose "foundation, not a product" callout and phase
  metadata with the compact non-dismissible notice: _"Phase 00 preview ·
  demonstration data · changes are not saved."_ SCR identifiers and phase numbers
  move to `data-*` attributes plus a dev-only route (`/_dev`, excluded from
  navigation and from the nav-model route tests' user-facing assertions).
  Engineering status prose moves to documentation.
- **C3** — rename "Waiting on" → **"Evidence needed before deciding"**. Add a
  clearly-labelled future-workflow note and a link to `/deployments`. No fake
  controls. The candidate-vs-conflict distinction from `features/deployments/decisions.ts`
  is preserved exactly.
- **C4** — summary card keeps city, dates, state, readiness, **top blocker only**,
  and a next destination. Record ID, full prerequisite list, all lane tags and
  notes move out of the summary. **Nothing is deleted from the data structures** —
  the fields remain on `Deployment` for the Phase 02 detail page.
- **C5** — badge text becomes `Candidate`; "Not selected yet" becomes supporting
  text beneath.

---

## 5. Part D — Field Mode

| ID  | Class                          | Files                                                          |
| --- | ------------------------------ | -------------------------------------------------------------- |
| D1  | R                              | `app/field/page.tsx`                                           |
| D2  | **D** (spec only)              | `docs/phases/PHASE-04-MINIMUM-CAPTURE-PACKAGE.md` (new)        |
| D3  | **D** (ADR only)               | `docs/decisions/ADR-007-field-mode-interaction-shell.md` (new) |
| D4  | R (docs) + partial UI ordering | `app/field/page.tsx`, ADR-007                                  |
| D5  | R                              | `docs/standards/COPY_STANDARD.md` (new) + copy sweep           |

- **D1** — the current heading "The minimum capture package" is inaccurate; it
  lists quick record types. Rename to **"Quick capture record types."**
- **D2** — the real minimum capture package (12 video, 10 photography, 8 audio,
  10 records items, plus required/optional, capture state incl. unavailable and
  refused, linked assets, exception reason, completion percentage, and the
  "safe to leave?" decision) is specified in full as a Phase 04 document. **Not
  implemented.**
- **D3** — ADR-007 states Field Mode will not reuse the dashboard shell, and lists
  the required properties (minimal chrome, one-handed, record-now, audio-first,
  sync/connection state, unsynced count, offline queue, conflict-safe sync,
  high-glare and low-light modes, large controls, haptic/audio confirmation,
  preserved deployment context, classify-later).
- **D4** — priority order documented; Phase 00 page reorders its static list to
  match. Cognition update reframed as a post-interaction prompt, not a peer action.
- **D5** — U.S. English standard. Sweep replaces `synchronise→synchronize`,
  `organisation→organization`, `behaviour→behavior`, `colour→color`,
  `honoured→honored`, `prioritised→prioritized`, `summarised→summarized`,
  `recognise→recognize`, `licence→license` (noun), `-ise/-isation` generally.
  Chosen style: **U.S. English, `canceled` single-l.** Applies to code comments,
  UI copy and documentation authored in Phase 00. **Does not** rewrite quoted
  source-material text or the canonical governance files listed in
  `.prettierignore` beyond genuine typos.

---

## 6. Part E — placeholders and IA

| ID  | Class                    | Files                                                                                                           |
| --- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| E1  | R                        | `components/patterns/module-placeholder.tsx`, `components/patterns/structure-preview.tsx` (new), 12 route files |
| E2  | R                        | same                                                                                                            |
| E3  | R (decision record only) | `docs/build/OPEN_QUESTIONS.md`, ADR note                                                                        |

- **E1** — each module renders an abstract **structure diagram** (labelled nodes
  and relationships from the audit's list), not fake records. Implemented as a
  small presentational component taking `nodes` and `edges` of plain strings, so
  it cannot accidentally render person-like data. No synthetic people, emails,
  claims, evidence or activity.
- **E2** — "This module activates in a later phase" → user-centered description
  of the capability, plus the compact note _"Preview only. This workflow is not
  active yet."_
- **E3** — no renames performed. Four naming questions (Command Center; Interactions;
  Evidence & law as one module; Media & assets) recorded as an open question with
  arguments on each side. Renaming routes now would contradict ADR-005, which was
  ratified three days ago; changing it again without new evidence is churn.

---

## 7. Part F — design system

| ID  | Class            | Files                                                                                |
| --- | ---------------- | ------------------------------------------------------------------------------------ |
| F1  | R                | `app/globals.css`, all components using `accent`, `tests/unit/design-tokens.test.ts` |
| F2  | R                | `components/ui/status-badge.tsx`, new preview badge                                  |
| F3  | R                | `components/ui/states.tsx`, `tests/component/states.test.tsx`                        |
| F4  | R                | `components/ui/states.tsx`, `components/patterns/*`, tests                           |
| F5  | **D** (doc only) | `docs/design/VISUAL_LANGUAGE.md` (new)                                               |
| F6  | R                | `app/globals.css`                                                                    |
| F7  | **D** (doc only) | `docs/design/VISUAL_LANGUAGE.md`, ADR note                                           |

- **F1** — split the single `--color-accent` into `--color-action`,
  `--color-link`, `--color-nav-active`, `--color-attention`, plus existing status
  tokens and new `--color-sync-*` and `--color-preview`. Every new pair added to
  the contrast test in both schemes.
- **F2** — `StatusBadge` currently uses tone `pending` for "not yet built," which
  conflates product-development state with record state. Introduce a separate
  `PreviewBadge` / preview notice; `pending` returns to meaning record/workflow
  pending only.
- **F3** — add `SuccessState` (title, description, optional action, icon,
  `role="status"`, non-color-only). The file's own doc comment currently claims
  five states and lists four — that claim is fixed by adding the component.
- **F4** — `StateBlock` and card patterns take a configurable heading level
  (`headingLevel?: 2|3|4|5|6`, default preserving current output). Tests assert
  each route keeps a single `h1` and a non-skipping hierarchy.
- **F6** — the global `:focus-visible` rule forces `border-radius: var(--radius-sm)`
  onto every focused element, which distorts circular and pill controls. Replace
  with outline-only (`outline`, `outline-offset`) and let component geometry
  supply the radius.

---

## 8. Part G — states

| ID  | Class | Files                                                            |
| --- | ----- | ---------------------------------------------------------------- |
| G1  | R     | `app/error.tsx`, `app/not-found.tsx`, `components/ui/states.tsx` |
| G2  | R     | `docs/ux/STATE_TAXONOMY.md` (new)                                |
| G3  | R     | `tests/component/states.test.tsx`, `tests/e2e/*`                 |

G1 review points: 404 keeps navigation and offers a safe destination (already
true — verify); global error exposes only `error.digest`, never a stack (already
true — verify and test); retry shown only when a retry is meaningful; restricted
copy reveals nothing about the protected record; offline distinct from server
error; unauthorized distinct from restricted; missing distinct from
not-synchronized; no implication that unsaved work was lost.

G2 taxonomy covers all 14 named states with meaning, copy principles, ARIA
behaviour, icon/color semantics, next action, and **what must not be revealed**.
Components for offline/syncing/queued/conflict are **specified, not built** —
they require Phase 04 sync to be meaningful.

---

## 9. Open product decisions (owner input needed, not blocking)

1. **E3 naming** — Command Center vs Field Desk/Home; Interactions vs Interviews &
   encounters; Evidence & law split; Media & assets terminology.
2. **D5 style** — confirm U.S. English and `canceled` (single-l).
3. **A5 toolchain** — confirm Node 22 primary with 22–24 supported, rather than
   hard-pinning 22 only.
4. **A8 classification** — the 1–4 classification is a proposal; each file's final
   class is the owner's call.
5. **OPEN_QUESTIONS #15** — public-release strategy remains unresolved and blocking
   for publication only.

---

## 10. What will not change, and why

| Item                                  | Rationale                                                                                                                              |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Route vocabulary (ADR-005)            | Ratified 2026-07-19. E3 asks for evaluation and explicit decisions, not renames. Changing ratified URLs without new evidence is churn. |
| `candidate` / `not-selected` statuses | Correct per the September decision record; already recorded as OPEN_QUESTIONS #13.                                                     |
| Seed data content                     | Public facts only; strategy deliberately excluded and test-enforced. No change needed.                                                 |
| No component library                  | ADR-006 stands. B1 is satisfied with the native `<dialog>` element rather than a dependency.                                           |
| Deployment state                      | No production deployment created; existing valid preview not deleted; PR #1 not merged.                                                |
| `docs/source-materials/` contents     | A8 classifies; it does not delete or rewrite history.                                                                                  |
| Canonical governance files            | `AGENTS.md`, `START_HERE.md`, ADRs 001–004 unchanged except where a finding requires it.                                               |

---

## 11. Execution order

1. **A1/A2** first — the security scanner is currently vacuous for nested `.ts`.
2. A5, A6 (toolchain + db honesty), then A3 + `verify-deployment.sh`.
3. F1, F2, F4, F6 (token and component substrate) before UI work that consumes it.
4. F3, G1, G2, G3 (states).
5. B1–B3 (mobile IA + responsive tests).
6. C1–C5 (Command Center), E1–E2 (placeholders).
7. D1, D4 (Field Mode UI), D2, D3, D5 (specs and copy standard).
8. A7, A8, F5, F7 (config and documentation deliverables).
9. A4 last — verification artifact and completion report generated from the final
   commit, so totals cannot be stale by construction.
10. Part J push protocol: inspect diff, run all checks, confirm `productionBranch`
    is `main`, state the expected deployment, push, then verify target, preview
    auth and production alias **before** reporting.

## 12. Risks

| Risk                                                               | Mitigation                                                                                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Scope is large; partial completion could leave the UI inconsistent | Execute in the substrate-first order above; each step ends green                                                           |
| Native `<dialog>` styling/behaviour differences across engines     | e2e coverage at four widths + keyboard/Escape/focus-return assertions                                                      |
| Token split (F1) touches every component                           | Mechanical rename with a lint-visible token list; contrast test extended before components change                          |
| Heading-level configurability (F4) could silently break hierarchy  | Per-route heading-order assertions, not just component unit tests                                                          |
| Copy sweep (D5) could alter quoted source material                 | Sweep excludes `docs/source-materials/` and quoted text; diff reviewed per file                                            |
| Pushing triggers an unintended deployment                          | Bootstrap condition no longer applies (a preview exists); expected result is a **preview**, verified after push per Part J |
