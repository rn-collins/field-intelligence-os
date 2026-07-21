# Phase 00 — Completion Report

> **Updated after audit remediation (commit `004d2ec`+).** Test totals are no
> longer restated in prose; they are generated into
> `docs/build/verification/latest.json` by `scripts/verify-phase-00.sh`, so they
> cannot drift. As of the latest run: **245 unit/component, 130 e2e, build pass,
> db skipped**, on Node v24.16.0 (local). CI runs the same checks on Node 22.
> Full finding-by-finding results are in
> `docs/build/PHASE-00-AUDIT-REMEDIATION-REPORT.md`.

- Date: 2026-07-19
- Branch: `feat/phase-00-foundation`
- Plan: `docs/build/PHASE-00-IMPLEMENTATION-PLAN.md`
- Scope: `docs/phases/PHASE-00-FOUNDATION.md`, `docs/build/PHASE-00-CODEX-FOUNDATION.md`

---

## 1. Verification results

Every check below was run on this machine (macOS, Node 24.16.0; CI pins Node 22
via `.nvmrc`) with **no `.env` file present**.

| Check                      | Command                | Result                                     |
| -------------------------- | ---------------------- | ------------------------------------------ |
| Format                     | `npm run format:check` | Pass                                       |
| Lint                       | `npm run lint`         | Pass, 0 errors, 0 warnings                 |
| Typecheck                  | `npm run typecheck`    | Pass, strict mode                          |
| Unit + component           | `npm test -- --run`    | **152 passed**, 8 files                    |
| End-to-end + accessibility | `npm run test:e2e`     | **88 passed, 4 skipped**                   |
| Production build           | `npm run build`        | Pass, 17 static routes                     |
| Database tests             | `npm run db:test`      | Exits 0 — no schema in Phase 00, by design |

The 4 skipped end-to-end tests are viewport-specific by intent: two desktop-nav
tests skip on the mobile project, two mobile-nav tests skip on desktop.

### Secretless build, verified rather than assumed

- `npm run build` succeeds with every Supabase variable unset.
- No `.env` file exists in the working tree; only `.env.example` is tracked.
- `grep -rl "SUPABASE_SERVICE_ROLE" .next/static` returns nothing — the
  privileged key is absent from the client bundle.

### Accessibility

- Automated axe scans (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`)
  over **all 15 routes**, at 1280×720 and Pixel 7 viewports, plus dark-scheme
  scans of `/`, `/claims` and `/field`. **Zero violations.**
- Palette-level verification: `tests/unit/design-tokens.test.ts` checks 34
  foreground/background pairs against WCAG 2.2 AA in both schemes — 68
  assertions, all passing.
- Manual keyboard pass performed: Tab from a cold load reaches the skip link
  first; Enter moves focus into `<main>`; sidebar and tab-bar links are reachable
  and ordered logically; focus is visible on every interactive element at both
  viewports and in both schemes. No keyboard trap. No focus loss on navigation.

**Two findings during this phase, both fixed:**

1. `border-strong` failed non-text contrast (2.64:1 light, 2.55:1 dark, against
   a 3:1 requirement). Retoned to `#8a8172` / `#767f8c`.
2. `ink-subtle` on `surface-sunken` measured 4.28:1 on the deployment card
   footer. **The token test missed this pair; axe caught it.** Token retoned to
   `#63686d` and four more pairs added to the test. This is the argument for
   keeping both palette-level and render-level checks — recorded in ADR-006.

---

## 2. What was built

### Application

- Next.js 16 App Router, React 19, TypeScript strict plus
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals` and
  `verbatimModuleSyntax`.
- Tailwind CSS 4 with design tokens as CSS custom properties in an `@theme`
  block; light and dark schemes following the OS preference.
- Application shell: sticky desktop sidebar in five sections, mobile bottom tab
  bar with a permanent Field Mode destination, skip link, landmark regions,
  `aria-current` on the active route.
- 15 routes, all statically prerendered:

| Route                              | Status                     | Activates in         |
| ---------------------------------- | -------------------------- | -------------------- |
| `/` Command Center                 | **Static content, seeded** | Phase 02 (live data) |
| `/deployments`                     | Placeholder                | Phase 02             |
| `/people`, `/organizations`        | Placeholder                | Phase 03             |
| `/interactions`                    | Placeholder                | Phase 04             |
| `/claims`, `/evidence`, `/systems` | Placeholder                | Phase 05             |
| `/assets`, `/assets/ingest`        | Placeholder                | Phase 06             |
| `/search`                          | Placeholder                | Phase 07             |
| `/outputs`, `/library`             | Placeholder                | Phase 08             |
| `/settings`                        | Placeholder                | Phase 01             |
| `/field` Field Mode                | Entry point + layout       | Phase 04             |

### Design system

Ten primitives, no component library (ADR-006). Two rules are enforced by the
API rather than documented:

- **`StatusBadge` cannot render colour-only status.** The label is a required
  child, and each of the seven tones carries a distinct icon _shape_ — a test
  asserts all seven glyphs differ, because `pending`/`in-progress` and
  `disputed`/`blocked` share colour tokens.
- **`DemoDataBanner` cannot be dismissed.** It exposes no control to hide it.

All five required states exist as first-class components: loading, empty, error,
**restricted**, and success. `RestrictedState` is deliberately not a variant of
`ErrorState` — being denied a protected record is correct behaviour, and
announcing it as an error would be both wrong and, in a source-protection
context, misleading about what went wrong.

### Command Center

Everything on screen derives from `lib/seed/deployments.ts`. No decorative
statistics: SCR-01 requires that "no count is displayed without queryable
underlying records", and readiness, day counts and the outstanding list are all
computed by `features/deployments/readiness.ts`.

**The most useful thing this screen does was not planned.** `PROJECT_MEMORY.md`
records Manhattan as 20–22 September 2026 and Reykjavík as 20–26 September 2026
— overlapping dates, and one operator cannot be in both places. Rather than
quietly adjusting the seed to look tidy, the overlap is modelled as a blocked
prerequisite on both deployments and surfaced under "Needs a decision". A static
proof-of-architecture became a demonstration of what the product is actually
for. **This is a real scheduling conflict in the project's own records and needs
an owner decision** (see §5).

### Data and security

- Seed records carry `provenance: "demonstration"` as a **required type
  discriminant**, not an optional boolean — a real record cannot typecheck into
  a demonstration slot.
- Seed content is limited to facts already published in `PROJECT_MEMORY.md`:
  cities, dates, subject lanes. No names, contacts, targets or unpublished
  angles. Automated checks reject email addresses, phone numbers and
  credential-shaped strings.
- Service-role boundary enforced three ways: `import "server-only"`, an ESLint
  `no-restricted-imports` rule, and a test asserting no other tracked file
  references the key.
- Baseline security headers in `next.config.ts`; `robots: noindex`; camera,
  microphone and geolocation denied until Field Mode needs them in Phase 04.

### Testing and CI

- Vitest + Testing Library; Playwright at two viewports; axe on every route.
- GitHub Actions: a `quality` job (format, lint, typecheck, test, build) and a
  separate `e2e` job with version-keyed browser caching, report artifacts,
  concurrency cancellation and timeouts. Node version read from `.nvmrc` so
  local and CI toolchains cannot drift.

### Supabase

`config.toml`, `migrations/CONVENTIONS.md`, `tests/README.md` and a working
`scripts/db-test.sh`. **No schema** — Phase 01 owns that. The runner exits
cleanly and explains itself rather than failing.

---

## 3. Files

**Created:** `package.json`, `package-lock.json`, `tsconfig.json`,
`next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc`,
`.prettierignore`, `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`,
`.nvmrc`, `vercel.json`; all of `app/`, `components/`, `features/`, `lib/`,
`tests/`; `supabase/config.toml`, `supabase/migrations/CONVENTIONS.md`,
`supabase/tests/README.md`; `scripts/db-test.sh`;
`docs/decisions/ADR-005-route-vocabulary.md`,
`docs/decisions/ADR-006-phase-00-frontend-stack.md`;
`docs/build/PHASE-00-IMPLEMENTATION-PLAN.md`, this report, and
`docs/build/screenshots/`.

**Changed:** `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CHANGELOG.md`,
`.env.example`, `.gitignore`, `.github/workflows/ci.yml`, `supabase/README.md`,
`docs/build/ROADMAP.md`, `docs/build/OPEN_QUESTIONS.md`,
`docs/journal/BUILD_JOURNAL.md`.

**Not touched:** `AGENTS.md`, `START_HERE.md`, `PROJECT_MEMORY.md`, ADRs 001–004,
`LICENSE`, `SECURITY.md`, `docs/standards/`, `docs/phases/`, `docs/BUILD_ORDER.md`,
and everything in `docs/source-materials/`.

An initial Prettier run did reformat several of those canonical documents —
whitespace only, no content change. It was reverted, and they are now listed in
`.prettierignore`: these files are owned by the product owner, and a diff in them
should mean a decision rather than a tooling pass. `CONTRIBUTING.md` records the
rule.

---

## 4. Screenshots

`docs/build/screenshots/`:

| File                               | What it shows                                  |
| ---------------------------------- | ---------------------------------------------- |
| `command-center-desktop-light.png` | Command Center, 1440px, light                  |
| `command-center-desktop-dark.png`  | Command Center, 1440px, dark                   |
| `command-center-mobile.png`        | Command Center, 390px, with the bottom tab bar |
| `field-mode-mobile.png`            | Field Mode entry point, 390px                  |
| `module-placeholder-claims.png`    | A representative module empty state            |

---

## 5. Open items for the owner

### Needs a decision

1. **The Manhattan/Reykjavík date overlap is real.** `PROJECT_MEMORY.md` has
   both starting 20 September 2026. Either the dates need correcting or one
   deployment needs reassigning. The seed models this honestly rather than
   hiding it; once resolved, update `PROJECT_MEMORY.md` and
   `lib/seed/deployments.ts` together.
2. **`OPEN_QUESTIONS.md` #12** — colour scheme default was answered (system
   preference) and implemented; the entry can be closed.
3. **`OPEN_QUESTIONS.md` #2** (workspace tenancy from day one) blocks Phase 01.
   The seed types assume yes and carry `workspaceId`. Confirm before Phase 01.
4. **`OPEN_QUESTIONS.md` #8** (public demo-data strategy). Phase 00 took the most
   conservative reading — public facts only. Confirm that is the standard.

### External dependencies not automatable from this repository

Per `START_HERE.md` and `docs/build/OWNER_SETUP_CHECKLIST.md`:

- Create the private GitHub repository and push `main` plus this branch.
- Link the repository to Vercel. **No environment variables are needed for a
  Phase 00 preview to build** — that is verified, not assumed.
- Supabase credentials, Drive OAuth and Notion tokens: not required until
  Phases 01, 06 and 08 respectively.

### Known limitations

- Modules are placeholders. Nothing reads or writes data.
- No authentication, no RLS, no schema — Phase 01.
- Automated accessibility tooling catches roughly a third of real defects. A
  screen-reader pass with VoiceOver or NVDA is recommended before Phase 02
  builds interactive surfaces on top of this shell.
- No component library, which will need revisiting when dialogs and comboboxes
  arrive (ADR-006).

---

## 6. Recommendations for Phase 01

1. **Write the RLS tests before the policies.** `supabase/tests/README.md` sets
   the pattern; the negative cases ("a member of workspace A cannot read
   workspace B") are the ones that matter and the ones most often skipped. A
   policy that is too permissive passes every "can read" test.
2. **Enable RLS in the same migration that creates the table.** Never leave a
   window where a table exists, is exposed, and is unprotected.
3. **Keep the service-role client for jobs that genuinely cannot run as the
   user.** Request-scoped reads belong on a cookie-bound client, so RLS rather
   than application code stays the enforcement boundary.
4. **Migrate the seed rather than replacing it.** `lib/seed/deployments.ts`
   types mirror `schema.sql`, so Phase 02 should be able to swap the import for
   a query while keeping the components. If that turns out not to be true, the
   schema and the types have diverged and it is worth knowing early.
5. **Design the audit and history tables alongside the first entity, not after.**
   `AGENTS.md` requires append-only verification, consent and permission
   history; retrofitting immutability onto tables that started mutable is
   materially harder than starting that way.
6. **Add a database CI job** once schema exists — it needs Docker, which is why
   Phase 00 deliberately left database checks out of the default gate.
