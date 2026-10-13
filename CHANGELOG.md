# Changelog

All notable changes to Field Intelligence OS are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Audit remediation (Phase 00)

- **Security**: the service-role scanner was recursive-blind — it checked 4 of
  22 `.ts` files, missing `lib/supabase/server.ts` itself. Rewritten shell-free
  and mutation-verified; git failures now fail loudly instead of passing.
- **Mobile**: all 13 modules are reachable in two taps via a native `<dialog>`
  "More" sheet; eight were previously unreachable on a phone. Responsive tests
  at 320–430px, landscape, tablet and 200% zoom; fixed a real zoom-reflow bug.
- **Command Center**: leads with the decision; compact preview notice; summary
  cards with a route to full detail; engineering metadata moved off the UI.
- **Design system**: one accent token split into seven semantic roles
  (100 contrast assertions); added `SuccessState`; configurable heading levels;
  focus outline no longer reshapes controls.
- **Field Mode**: corrected "minimum capture package" terminology; specified the
  real package and the distinct interaction shell (ADR-007) for a later release.
- **Deployment**: documented the first-deployment bootstrap trap and added a
  read-only `verify-deployment.sh`.
- **Honesty**: `db:test` reports SKIPPED not pass; toolchain claims corrected;
  verification results generated into an artifact rather than hand-copied.
- Added Dependabot, CodeQL, `npm audit` in CI, a state taxonomy, a source-material
  classification, and a copy standard (U.S. English).

### Added — Phase 00, production foundation

- Next.js 16 App Router application with TypeScript strict mode and Tailwind CSS 4.
- Design-token system in light and dark schemes, following the operating-system
  preference, with every foreground/background pair verified against WCAG 2.2 AA.
- Accessible application shell: desktop sidebar, mobile bottom tab bar, skip link,
  landmark regions, and a Field Mode entry point.
- UI primitives covering the five required states — loading, empty, error,
  restricted and success — plus a `StatusBadge` whose API makes colour-only
  status impossible to express.
- Static Command Center seeded with clearly-labelled Manhattan and Reykjavík
  demonstration deployments, including derived readiness and a surfaced
  scheduling conflict between them.
- Twelve module routes plus `/assets/ingest` and `/field`, each with an honest
  empty state naming the phase that activates it.
- Supabase browser and server client placeholders, `supabase/config.toml`,
  migration conventions, pgTAP test conventions and a database test runner.
- Vitest unit and component tests, Playwright end-to-end tests, and automated
  axe accessibility scans across every route at two viewports in both schemes.
- GitHub Actions CI: format, lint, typecheck, test, production build, and a
  separate cached end-to-end job.
- ADR-005 (route vocabulary) and ADR-006 (Phase 00 front-end stack).

### Changed

- README rewritten with real prerequisites, commands and project structure.
- `.env.example` documents the public/server-only boundary and records that
  Phase 00 requires no variables at all.
- CI workflow extended with a formatting gate, an end-to-end job, concurrency
  cancellation and job timeouts.
- `docs/build/ROADMAP.md` reconciled with `docs/BUILD_ORDER.md`.

### Fixed

- **Competing September deployments were modelled as two committed trips.**
  `PROJECT_MEMORY.md` listed Manhattan and Reykjavík as "first live deployments"
  with overlapping dates; the owner's planning workbook records them as mutually
  exclusive candidates for a single window with the decision still open. Added
  `candidate` and `not-selected` statuses, declared mutual exclusion on the
  record, and separated an open decision from a scheduling conflict — the two
  look identical in the data and mean opposite things.
- `DeploymentCard` hard-coded its status badge to "Planning", asserting a
  commitment that had not been made. Status now renders from the record.

### Security

- Supabase service-role key confined to a single `server-only` module, enforced
  by an ESLint rule and an automated test.
- Baseline security response headers configured in `next.config.ts`.
- Automated checks that no `.env` file and no build output is tracked.
