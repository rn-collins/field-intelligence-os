# Phase 00 — Audit Remediation Report

Branch: `feat/phase-00-foundation` · PR #1 (open, **not merged**)
Baseline: `e7b183c` · Head at report time: `004d2ec` (+ this report's commit)
Verification artifact: `docs/build/verification/latest.json`

Every finding maps to changed files, the tests that cover it, the result, and any
remaining limitation. Findings the audit framed as "specify, do not build" are
marked **Deferred (documented)** — implementing them would begin Phase 01, which
the instructions forbid.

## Verification (from `latest.json`, commit `004d2ec`, Node v24.16.0, local)

| Check               | Result                               |
| ------------------- | ------------------------------------ |
| format              | pass                                 |
| lint                | pass                                 |
| typecheck           | pass                                 |
| unit + component    | **pass — 245 tests, 14 files**       |
| build               | pass                                 |
| e2e + accessibility | **pass — 130 tests**                 |
| db:test             | **skipped** (no schema — not a pass) |

Deployment state (via `scripts/verify-deployment.sh`): preview target `preview`,
production branch `main`, preview requires auth (302), production alias inactive
(404). All four pass.

## Part A — engineering, security, CI, deployment

| ID  | Files                                                                                                                         | Tests                                                                  | Result                                                                                               | Limitation                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| A1  | `tests/helpers/repo-scan.ts`, `tests/unit/security-boundaries.test.ts`                                                        | scanner depth sentinels, coverage floor, positive nested detection     | **Fixed.** Was scanning 4/22 `.ts`; now recursive, shell-free, mutation-verified                     | —                                                                                                |
| A2  | same                                                                                                                          | fail-loud-on-git-error, explicit skip                                  | **Fixed.** Empty result can no longer mean failure                                                   | —                                                                                                |
| A3  | `docs/DEPLOYMENT.md`, `scripts/verify-deployment.sh`                                                                          | `tests/unit/deployment-script.test.ts` (read-only asserted)            | **Fixed.** Bootstrap trap + "never delete last production deploy" documented; script passes 4/4 live | Script needs `vercel` CLI + auth for the target check; degrades to SKIP otherwise                |
| A4  | `scripts/verify-phase-00.sh`, `docs/build/verification/latest.json`, completion report                                        | —                                                                      | **Fixed.** Totals generated from one artifact, not hand-copied                                       | e2e is opt-in in the artifact (slow); run with `VERIFY_E2E=1`                                    |
| A5  | `package.json`, `.nvmrc`, ADR-006                                                                                             | —                                                                      | **Fixed.** `packageManager` pinned; false "cannot drift" claim removed; honest range `>=22 <25`      | No version manager on this machine, so local runs are Node 24, not CI's 22. Recorded, not hidden |
| A6  | `scripts/db-test.sh`                                                                                                          | manual (skip + tripwire verified)                                      | **Fixed.** Reports SKIPPED; untested-schema tripwire exits 1                                         | —                                                                                                |
| A7  | `.github/dependabot.yml`, `.github/workflows/codeql.yml`, `.github/workflows/ci.yml`, `docs/public-release/REPO_HARDENING.md` | —                                                                      | **Fixed (config + docs).** npm audit in CI (currently clean)                                         | Secret scanning / push protection are owner GitHub settings; documented                          |
| A8  | `docs/public-release/SOURCE_MATERIAL_CLASSIFICATION.md`                                                                       | `tests/unit/seed-safety.test.ts` (unchanged, still enforces exclusion) | **Fixed (docs).** All 17 files classified; tracker is Class 4                                        | No history rewrite performed — that is an authorized owner action                                |

## Part B — mobile navigation

| ID  | Files                                                                                                           | Tests                                                                                             | Result                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| B1  | `features/navigation/nav-model.ts`, `components/layout/mobile-tab-bar.tsx`, `components/layout/module-menu.tsx` | `tests/e2e/responsive.spec.ts` (reachability, Escape, focus return, aria-expanded, keyboard, axe) | **Fixed.** All 13 modules reachable in ≤2 taps via a native `<dialog>` sheet |
| B2  | same                                                                                                            | one-tap Field Mode test                                                                           | **Fixed.** "Capture" → Field Mode, one tap                                   |
| B3  | `tests/e2e/responsive.spec.ts`                                                                                  | 320/360/390/430, landscape, tablet, zoom, long labels                                             | **Fixed.** Found and fixed a real 200%-zoom reflow overflow                  |

## Part C — Command Center

| ID  | Files                                                                           | Tests                                                | Result                                                                 |
| --- | ------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| C1  | `app/page.tsx`, `components/ui/demo-data-banner.tsx`                            | e2e "no engineering prose"                           | **Fixed.** Compact non-dismissible notice; verbose callout removed     |
| C2  | `components/patterns/module-placeholder.tsx`, `components/layout/app-shell.tsx` | e2e data-attribute test                              | **Fixed.** SCR/phase → `data-*`; removed from shell chrome             |
| C3  | `app/page.tsx`                                                                  | e2e decision-card test                               | **Fixed.** "Evidence needed before deciding"; named future destination |
| C4  | `components/patterns/deployment-card.tsx`                                       | component tests (lanes/ID omitted, top blocker only) | **Fixed.** Summary card; detail deferred to Phase 02; data retained    |
| C5  | same                                                                            | badge/detail test                                    | **Fixed.** "Candidate" badge; qualifier as supporting text             |

## Part D — Field Mode

| ID  | Files                                                    | Result                                                      |
| --- | -------------------------------------------------------- | ----------------------------------------------------------- |
| D1  | `app/field/page.tsx`                                     | **Fixed.** "Quick capture record types"                     |
| D2  | `docs/phases/PHASE-04-MINIMUM-CAPTURE-PACKAGE.md`        | **Deferred (documented).** Full package specified           |
| D3  | `docs/decisions/ADR-007-field-mode-interaction-shell.md` | **Deferred (documented).** Distinct shell specified         |
| D4  | `app/field/page.tsx`, ADR-007                            | **Fixed.** Reordered to priority; cognition update reframed |
| D5  | `docs/standards/COPY_STANDARD.md` + sweep                | **Fixed.** U.S. English; enum left as spec contract         |

## Part E — placeholders

| ID  | Files                                                       | Tests                                 | Result                                                               |
| --- | ----------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| E1  | `components/patterns/structure-preview.tsx`, 13 route files | e2e "structure, never sample records" | **Fixed.** Type-only diagram API; no fake data possible              |
| E2  | `components/patterns/module-placeholder.tsx`                | e2e placeholder copy                  | **Fixed.** User-centered copy + compact preview note                 |
| E3  | `docs/build/OPEN_QUESTIONS.md` #17                          | —                                     | **Evaluated, no rename.** Recorded with rationale (ADR-005 ratified) |

## Part F — design system

| ID  | Files                               | Tests                                    | Result                                                 |
| --- | ----------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| F1  | `app/globals.css` + all consumers   | `design-tokens.test.ts` (100 assertions) | **Fixed.** 7 semantic roles + sync/preview             |
| F2  | `components/ui/preview-badge.tsx`   | component tests                          | **Fixed.** Preview state off the record-status palette |
| F3  | `components/ui/states.tsx`          | `states.test.tsx`                        | **Fixed.** `SuccessState` added                        |
| F4  | `states.tsx`, `deployment-card.tsx` | heading-level tests                      | **Fixed.** Configurable heading levels                 |
| F5  | `docs/design/VISUAL_LANGUAGE.md`    | —                                        | **Deferred (documented).** Direction + Phase 00 subset |
| F6  | `app/globals.css`                   | —                                        | **Fixed.** Focus no longer forces border radius        |
| F7  | `docs/design/VISUAL_LANGUAGE.md`    | —                                        | **Deferred (documented).** Theme modes recorded        |

## Part G — states

| ID  | Files                                              | Tests                      | Result                                                                        |
| --- | -------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| G1  | `app/error.tsx`, `app/not-found.tsx`, `states.tsx` | `state-semantics.test.tsx` | **Fixed/verified.** digest-only errors; restricted ≠ error; distinctions held |
| G2  | `docs/ux/STATE_TAXONOMY.md`                        | —                          | **Fixed.** 14 states, incl. what each must not reveal                         |
| G3  | `tests/component/state-semantics.test.tsx`         | 4 cases                    | **Fixed.** ARIA roles per state tested                                        |

## What was deliberately not changed

Route vocabulary (ADR-005), `candidate`/`not-selected` statuses, seed content,
no-component-library (native `<dialog>` used instead), and the `cancelled` enum
spelling. Rationale for each is in the remediation plan §10 and OPEN_QUESTIONS.

## Mistakes made during remediation

Recorded because the pattern matters more than any single fix.

- **Committed twice with failing checks** (`85d5dcd`, and a lint failure after
  the Part B work). Both times a `| tail` pipe masked the exit code, so a
  "clean" line printed while the tool was failing. Fixed by a gate that captures
  exit codes directly; both failures were corrected in follow-up commits
  (`0a598cc`, `1bd6d8d`) before proceeding.
- **Two test-methodology errors, self-corrected**: `scrollWidth`-vs-`clientWidth`
  is invalid under CSS zoom, and CSS zoom mismodels fixed elements. The
  spec-faithful 320px reflow test covers the same surface honestly.

This is the same failure mode as the earlier deployment incident — reporting
before verifying. The verification artifact and the gated-commit habit are the
structural response.

## Owner decisions still open

`OPEN_QUESTIONS.md` #1 (license), #15 (source-material history cleanup — blocks
public release), #16 (U.S. English ratification), #17 (naming), #18 (status enum
ratification). None block continued Phase 00 review; #15 blocks public release.
