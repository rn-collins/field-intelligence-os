# Phase 00 — Implementation Plan

Status: **Proposed — awaiting product-owner approval**
Author: Codex agent session
Scope: `docs/phases/PHASE-00-FOUNDATION.md` and `docs/build/PHASE-00-CODEX-FOUNDATION.md`
Prerequisite reading completed: `AGENTS.md`, `START_HERE.md`, `PROJECT_MEMORY.md`, `docs/PRODUCT_VISION.md`, `docs/BUILD_ORDER.md`, `docs/phases/PHASE-00-FOUNDATION.md`, all of `docs/standards/`, `docs/product/PRODUCT_SPECIFICATION.md`, `docs/source-materials/README.md`, `ARCHITECTURE.md`, the four accepted ADRs, and the machine-readable v1.0 spec package (`screen_inventory.csv`, `schema.sql`, `permission_matrix.csv`, `domain_events.csv`, `migration_map.csv`, `openapi.yaml`).

---

## 0. Blockers and conflicts found before implementation

`AGENTS.md` forbids silently resolving conflicting requirements. Four items are recorded here and mirrored into `docs/build/OPEN_QUESTIONS.md`.

### B-1 — The working directory is not a Git repository (hard blocker)

`git status` returns `fatal: not a git repository`. `AGENTS.md` and `docs/DEVELOPMENT_WORKFLOW.md` both require a feature branch, focused commits, and a pull request. None of that is possible in the current state, and `START_HERE.md` lists "ensure the private GitHub repository exists and this folder is pushed to it" as an **owner action that cannot be automated from this repository**.

Proposed resolution: owner creates the private repo and pushes this folder, or explicitly authorizes `git init` + an initial `main` commit of the current documentation state, after which Phase 00 proceeds on `feat/phase-00-foundation`. **Implementation does not begin until this is resolved**, because otherwise the first commit of Phase 00 would land as an untracked working-tree change with no reviewable diff.

### B-2 — Route vocabulary conflict between the v1.0 spec and the Phase 00 task

| Concept | v1.0 spec (`screen_inventory.csv`) | Phase 00 task (`PHASE-00-CODEX-FOUNDATION.md` §12) | Canonical ontology (`PROJECT_MEMORY.md`) |
|---|---|---|---|
| Institutions/orgs | `/institutions` (SCR-05) | "Organizations" | **Organization** |
| Interactions | `/interactions` (SCR-06) | "Interviews" | **Interaction**, **Interview** |
| Media | `/archive/ingest` (SCR-10), `/assets/[id]` (SCR-11) | "Media" | **Asset** |
| Method library | `/library` — "FCIF Library" (SCR-14) | "Canon" | not listed |

`AGENTS.md` puts the v1.0 specification above `ARCHITECTURE.md` and above implementation, but `PROJECT_MEMORY.md` fixes the canonical entity nouns, and the Phase 00 task is the direct instruction. Recommendation, submitted as **proposed ADR-005** rather than applied silently: routes follow the canonical ontology nouns (`/organizations`, `/interactions`, `/assets`), navigation *labels* follow `docs/ux/NAVIGATION_AND_SCREEN_MAP.md` ("People & Organizations", "Interviews & Interactions"), and `/library` keeps the spec's route with the Phase 00 label "Canon & Standards". Ingest becomes `/assets/ingest` rather than `/archive/ingest` so there is one media root. Nothing in Phase 00 depends on this being right — these are empty-state placeholders — but the URLs become public surface in Phase 02+, so the decision should be ratified now.

### B-3 — Phase numbering conflict between two roadmap documents

`docs/BUILD_ORDER.md` and `PROJECT_MEMORY.md` agree on an eight-phase order (03 = people/orgs/relationships, 04 = interviews/consent/field mode). `docs/build/ROADMAP.md` describes a *different* ten-phase order (03 = interviews/consent, 05 = assets/Drive, 09 = offline/Notion). Phase 00 is identical in all three, so this does not block implementation, but every empty state I build will name the phase that activates it — and those labels will be wrong under one of the two schemes. Recommendation: treat `BUILD_ORDER.md` + `PROJECT_MEMORY.md` as canonical (two documents agree, and `PROJECT_MEMORY.md` is the durable-decision file), and rewrite `docs/build/ROADMAP.md` to match as part of Phase 00's documentation pass.

### B-4 — Node version

CI pins Node 22; this machine runs Node 24.16.0. Resolution: add `.nvmrc` (22) and `engines.node: ">=22 <25"` so both work, and keep CI on 22. Not a conflict, just needs pinning so "fresh clone works" is actually true.

---

## 1. What Phase 00 is and is not

Phase 00 produces a **reproducible, portfolio-quality, secretless foundation**: an application shell, a design system, twelve routed modules with honest empty states, one static Command Center proving the information architecture with clearly-labeled Manhattan and Reykjavík demonstration data, and the full quality apparatus (lint, typecheck, unit/component tests, e2e smoke, accessibility checks, CI, production build).

It explicitly does **not** include the production schema, real auth, Drive/Notion sync, AI extraction, offline sync, or any private source material. The static Command Center must read as a *proof of information architecture*, not as a working product — every module page states which phase activates it.

The one design risk worth naming up front: `PHASE-00-CODEX-FOUNDATION.md` §11 says the dashboard "must not pretend to be a finished functional product," while §36 of its acceptance criteria demands it be "visually distinctive and portfolio-quality." These pull in opposite directions. My resolution is *honest polish*: high craft in typography, spacing, and state design; zero fake interactivity. No buttons that do nothing, no charts of invented metrics, no counters not backed by a real seed record. Every demonstration surface carries a persistent, non-dismissable "Demonstration data" marker.

---

## 2. Architecture

### 2.1 Directory structure

Follows the map already published in `README.md` (`app/`, `components/`, `features/`, `lib/`, `tests/`, `public/`) so the README stays true.

```text
app/
  layout.tsx                    Root layout, fonts, skip link, <html lang>
  globals.css                   Tailwind v4 entry + @theme design tokens
  page.tsx                      SCR-01 Command Center (static, seeded)
  not-found.tsx  error.tsx      Global 404 / error boundary
  (modules)/                    Route group sharing the app shell
    deployments/page.tsx        + deployments/[id]/page.tsx placeholder
    people/page.tsx
    organizations/page.tsx
    interactions/page.tsx
    claims/page.tsx
    evidence/page.tsx
    systems/page.tsx
    assets/page.tsx             + assets/ingest/page.tsx
    outputs/page.tsx
    search/page.tsx
    library/page.tsx
    settings/page.tsx
  field/page.tsx                Mobile Field Mode entry (own minimal layout)
components/
  layout/     AppShell, SidebarNav, MobileTabBar, FieldModeLink, SkipLink
  ui/         Button, Card, Chip, StatusBadge, Tag, Callout, DemoDataBanner,
              EmptyState, ErrorState, RestrictedState, LoadingState, VisuallyHidden
  patterns/   ModulePlaceholder, DeploymentCard, ReadinessMeter, TimelineList
features/
  deployments/  types.ts, readiness.ts (pure domain logic + tests)
  navigation/   nav-model.ts (single source for sidebar, tab bar, breadcrumbs)
lib/
  env.ts        Zod-validated, lazily-read env access
  supabase/     client.ts (browser), server.ts (RSC/route handler), README.md
  seed/         deployments.ts, index.ts — typed static demonstration data
  utils/        cn.ts, format.ts
tests/
  unit/         Vitest specs for lib/ and features/
  component/    Testing Library specs for UI states
  e2e/          Playwright smoke + axe accessibility scans
supabase/
  config.toml   Local dev only, no secrets
  migrations/   .gitkeep + CONVENTIONS.md (no schema in Phase 00)
  tests/        .gitkeep + pgTAP conventions + one meta test
  seed.sql      Unchanged placeholder
scripts/
  db-test.sh    Supabase-local pgTAP runner (documented, not CI-gating)
```

### 2.2 Rendering and data model for Phase 00

All twelve module pages and the Command Center are **React Server Components with no client JavaScript**, except the mobile nav disclosure and the skip-link focus behavior. Seed data is imported as a typed, frozen TypeScript module — not fetched, not from a database, not from JSON. This satisfies `.codex/FIRST_TASK.md` §7 ("typed static seed data") and guarantees Vercel builds with zero secrets.

The seed types are written to be **structurally forward-compatible** with `supabase/.../schema.sql` (`workspaces`, `deployments`, `people`, `organizations`, …) so Phase 02 replaces the import with a query and keeps the components. Every seed record carries `provenance: "demonstration"` at the type level — not a boolean flag that can be forgotten, but a required discriminant, so a real record can never typecheck into a demonstration slot.

### 2.3 Supabase clients without secrets

`lib/env.ts` exposes a Zod schema where all Supabase variables are `.optional()` **in Phase 00 only**, with a `getSupabaseEnv()` that returns a discriminated `{ configured: false }` / `{ configured: true, ... }` result. `lib/supabase/client.ts` and `server.ts` are thin factories that throw a typed `SupabaseNotConfiguredError` when called without configuration. Phase 00 never calls them; they exist so Phase 01 has a reviewed, correct starting point.

Enforcement of `AGENTS.md`'s service-role rule: `SUPABASE_SERVICE_ROLE_KEY` is read only inside `lib/supabase/server.ts`, which carries `import "server-only"`. A custom ESLint rule (`no-restricted-imports` on `lib/supabase/server` from `components/**`) plus a unit test asserting the module is not reachable from any client component makes the violation fail CI rather than review.

### 2.4 Design system — "field instrument," not admin template

Tokens live as CSS custom properties inside Tailwind v4's `@theme` block, so they are available to both Tailwind utilities and raw CSS.

- **Palette**: a warm-neutral paper base and a deep slate ink, with a single restrained accent (signal amber) reserved exclusively for *needs-attention* states. Verification/consent/restriction states get their own semantic tokens. Light and dark both defined; both contrast-validated.
- **Type**: one variable sans for interface, one monospace for identifiers, timestamps, and record IDs. Record IDs render monospace everywhere — a small thing that signals "evidentiary system" rather than "SaaS dashboard."
- **Never color-only** (`docs/standards/UI_STANDARD.md`): `StatusBadge` requires both an icon and a text label; the API makes color alone unrepresentable.
- **Density**: desktop is research-dense; `/field` is large-target, one-handed, high-contrast.

### 2.5 Accessibility

Semantic landmarks, one `<h1>` per page, skip-to-content link, visible focus rings on all interactive elements, `prefers-reduced-motion` honored, mobile nav with correct `aria-current` and `aria-expanded`, 44×44px minimum targets in Field Mode (WCAG 2.2 AA target-size), keyboard-operable everything. Verified by automated axe scans on every route plus a documented manual keyboard pass.

---

## 3. Dependencies

Kept deliberately small; `docs/standards/CODING_STANDARD.md` requires justifying significant additions.

| Package | Why |
|---|---|
| `next` (15.x), `react`, `react-dom` (19.x) | Required stack |
| `typescript` (5.x) | Required stack, strict mode |
| `tailwindcss` (4.x), `@tailwindcss/postcss` | Required stack; v4 for CSS-native `@theme` tokens |
| `@supabase/supabase-js`, `@supabase/ssr` | Required stack; placeholders only in Phase 00 |
| `zod` | `docs/standards/API_STANDARD.md` + `CODING_STANDARD.md` require runtime validation of external input; used for env now, payloads later |
| `vitest`, `@vitejs/plugin-react`, `jsdom` | CI already invokes `npm test -- --run` (Vitest's flag) |
| `@testing-library/react`, `/dom`, `/user-event`, `/jest-dom` | Component-state tests required by `TESTING_STANDARD.md` |
| `@playwright/test`, `@axe-core/playwright` | E2E smoke + automated accessibility |
| `eslint` (9.x), `eslint-config-next`, `@typescript-eslint/*`, `eslint-plugin-jsx-a11y` | Lint + a11y linting |
| `prettier`, `prettier-plugin-tailwindcss` | Deterministic formatting; class ordering |
| `server-only` | Enforces the service-role boundary at build time |
| `clsx`, `tailwind-merge` | Small, standard class composition |

**Deliberately excluded in Phase 00**: any component library (shadcn/Radix/MUI) — Phase 00 needs ~10 primitives and a distinctive aesthetic, and a library would push toward the generic template the task forbids; state managers; ORMs (migrations are canonical SQL per `DATABASE_STANDARD.md`); analytics; any paid vendor (`FIRST_TASK.md` §8). Radix should be reconsidered in Phase 02 when real dialogs, comboboxes, and menus appear — hand-rolling those is where accessibility actually breaks.

---

## 4. Files created and changed

**Created (new):** `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `.nvmrc`, `vercel.json`, `next-env.d.ts` (generated, gitignored), plus everything under the tree in §2.1.

**Changed (existing):**
- `README.md` — replace "Production code has not yet been scaffolded" with real prerequisites, install/run/test/build commands, environment setup, project structure, and a Phase 00 scope statement.
- `.gitignore` — add `next-env.d.ts`, `.turbo/`, `*.tsbuildinfo`.
- `.github/workflows/ci.yml` — add formatting check, Playwright job with browser caching and report artifact upload, `concurrency` cancel-in-progress, and explicit `timeout-minutes`.
- `.env.example` — annotate that Phase 00 requires none of these; document the two-tier public/server-only boundary.
- `ARCHITECTURE.md` — add the implemented front-end structure and the server-only key boundary.
- `CONTRIBUTING.md`, `CHANGELOG.md`, `docs/journal/BUILD_JOURNAL.md` — real commands, Phase 00 entry.
- `docs/build/OPEN_QUESTIONS.md` — append B-1 … B-4.
- `docs/build/ROADMAP.md` — reconcile with `BUILD_ORDER.md` (pending B-3 approval).
- `supabase/README.md` — migration naming, RLS-before-exposure rule, local workflow, pgTAP instructions.

**Created (documentation):** `docs/decisions/ADR-005-route-vocabulary.md` (proposed), `docs/decisions/ADR-006-phase-00-frontend-stack.md` (proposed), `supabase/migrations/CONVENTIONS.md`, `docs/build/PHASE-00-COMPLETION-REPORT.md` (written at the end).

**Not touched:** everything in `docs/source-materials/`, all four accepted ADRs, `LICENSE`, `SECURITY.md`, `PROJECT_MEMORY.md` (no durable project fact changes in Phase 00), `AGENTS.md`.

---

## 5. Commands

```bash
npm install                 # first-time setup
npm run dev                 # local development
npm run lint                # ESLint (incl. jsx-a11y)
npm run format:check        # Prettier
npm run typecheck           # tsc --noEmit, strict
npm test                    # Vitest watch
npm test -- --run           # Vitest single pass (CI)
npm run test:e2e            # Playwright smoke + axe
npm run build               # Production build
npm run db:start            # supabase start (local, optional)
npm run db:test             # pgTAP via scripts/db-test.sh (no-op in Phase 00)
```

`npm run db:*` are documented as optional and are **not** CI-gating in Phase 00, because there is no schema yet and requiring Docker would break "fresh clone can follow README and run locally."

---

## 6. Test plan

Mapped to `docs/standards/TESTING_STANDARD.md`. Phase 00 can only satisfy the layers that have subject matter; the rest are scaffolded with conventions so Phase 01 has somewhere to write them.

| Layer | Phase 00 coverage |
|---|---|
| Unit | `lib/env.ts` parsing incl. the unconfigured path; `features/deployments/readiness.ts` domain logic; `features/navigation/nav-model.ts` invariants (every nav route resolves to a real page — this catches dead links at test time) |
| Component | `StatusBadge` never renders color without a text label; `EmptyState` / `ErrorState` / `RestrictedState` / `LoadingState` each render correct roles and headings; `DemoDataBanner` present on every seeded surface; `AppShell` mobile nav `aria-expanded` / `aria-current` |
| Database / RLS | **Not applicable** — no schema. `supabase/tests/` + `CONVENTIONS.md` + a runner script are established so Phase 01 starts with the harness in place |
| Integration | **Not applicable** — no auth or storage. A test asserts `lib/supabase/*` throws `SupabaseNotConfiguredError` rather than silently returning a broken client |
| E2E | Playwright: shell renders; every one of the twelve module routes returns 200 with an `<h1>`; Command Center shows both Manhattan and Reykjavík with the demonstration marker; Field Mode reachable at mobile viewport; keyboard tab order reaches skip link → nav → main |
| Accessibility | `@axe-core/playwright` scan on every route at 390px and 1440px, light and dark, zero serious/critical violations; plus a documented manual keyboard/screen-reader pass in the completion report |
| Build | `npm run build` with **no `.env` file present** — this is the check that proves the Vercel-without-secrets requirement |

Security assertions worth calling out as tests rather than review comments: no `SUPABASE_SERVICE_ROLE_KEY` reference outside `lib/supabase/server.ts`; no `.env` file committed; no seed record containing contact details, real source identity, or unpublished reporting plans.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| **B-1 no Git repo** — no branch, no PR, no reviewable diff | Blocking. Resolve with the owner before writing code |
| Tailwind v4 is a substantial change from v3 and much online guidance is stale | Tokens defined once in `@theme`; if v4 causes friction, fall back to v3 with `tailwind.config.ts` — a contained, one-file decision |
| "Portfolio-quality" vs "must not pretend to be finished" | Honest-polish rule (§1): high craft, zero fake interactivity, persistent demonstration-data marker |
| Demonstration data leaking real reporting plans | Manhattan/Reykjavík seed uses only what is already public in `PROJECT_MEMORY.md` (city, dates, topic lanes). No names, no contacts, no target lists, no unpublished angles. Reviewed against `SECURITY_PRIVACY_STANDARD.md` before commit |
| Playwright in CI is slow/flaky and blocks merges | Separate job, browser cache, `timeout-minutes`, smoke scope only |
| Empty-state phase labels go stale | Single `features/navigation/nav-model.ts` source; a unit test asserts labels match `BUILD_ORDER.md` phases |
| Scope creep into Phase 01 domain features | Every module page is a placeholder using one shared component. If a page needs bespoke logic, that is the signal it belongs to a later phase |

---

## 8. Unresolved questions requiring the product owner

1. **B-1**: authorize `git init` + initial commit, or push to the private GitHub repo first? *(blocking)*
2. **B-2 / proposed ADR-005**: ratify the route vocabulary before URLs become surface area.
3. **B-3**: confirm `BUILD_ORDER.md` over `ROADMAP.md`, and authorize rewriting the latter.
4. Light-first, dark-first, or system-preference default for the interface? Plan assumes system-preference with both fully specified.
5. `OPEN_QUESTIONS.md` #8 (public demo-data strategy) partially binds Phase 00. The plan takes the most conservative reading — public facts only. Confirm that is the intended standard.
6. `OPEN_QUESTIONS.md` #2 (workspace tenancy from day one) does not block Phase 00, but the seed types are shaped to include `workspace_id` on the assumption that the answer is yes. Confirm before Phase 01.

---

## 9. Execution order once unblocked

1. Git branch `feat/phase-00-foundation`.
2. Tooling: `package.json`, TS strict, ESLint/Prettier, Vitest, Playwright, `.nvmrc` — commit.
3. Design tokens + `globals.css` + UI primitives with component tests — commit.
4. `AppShell`, `nav-model.ts`, desktop nav, mobile tab bar, Field Mode entry — commit.
5. Twelve module routes with empty states — commit.
6. Typed seed data + static Command Center + demonstration markers — commit.
7. Supabase client placeholders, `supabase/` conventions, `scripts/db-test.sh` — commit.
8. E2E + axe suites — commit.
9. CI workflow improvements, `vercel.json` — commit.
10. Documentation reconciliation pass (README, ARCHITECTURE, CONTRIBUTING, ROADMAP, OPEN_QUESTIONS, ADR-005/006, CHANGELOG, BUILD_JOURNAL) — commit.
11. Full check run with no `.env` present; capture screenshots; write `docs/build/PHASE-00-COMPLETION-REPORT.md`; open the PR.
