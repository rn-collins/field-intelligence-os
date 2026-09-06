# Field Intelligence OS

Field Intelligence OS is a multimodal platform for planning field deployments, managing sources and relationships, documenting interviews, tracing claims to evidence, reconstructing systems, preserving consent and permissions, organizing media, and producing trustworthy editorial and research outputs.

## Status

**Phase 00 — foundation.** The application shell, design system, testing apparatus and CI now exist, along with a static Command Center that proves the information architecture. Thirteen modules are routed and navigable; **none of them read or write data yet**, and each states the phase that activates it.

There is no database, no authentication and no integration in this phase. The Command Center renders from typed static seed data, so the application builds and runs with no credentials of any kind.

## Why it exists

Conventional tools split fieldwork across notes, spreadsheets, file folders, CRMs, transcription apps, and publishing systems. Field Intelligence OS is designed around the actual structure of investigation:

`place → people → interaction → claim → evidence → law/policy → system → asset → permission → cognition update → output`

## Initial deployments

- Manhattan, September 2026: climate, AI, ESG, legal-tech, fintech, creator-economy, clean-energy, and materials fieldwork.
- Reykjavík, September 2026: cannabis and psychoactive-plant science, regulation, public health, medicine, culture, and island-systems reporting.

Both appear in the Phase 00 Command Center as clearly-labelled demonstration records.

## Getting started

### Prerequisites

- **Node.js 22** (see `.nvmrc`; `nvm use` picks it up). Node 24 also works.
- **npm 10+**, bundled with Node.
- Docker and the [Supabase CLI](https://supabase.com/docs/guides/cli) — **optional**, and not needed until Phase 01.

### Install and run

```bash
git clone <repository-url>
cd field-intelligence-os
npm install
npm run dev
```

Open <http://localhost:3000>. **No environment file is required.** Copy `.env.example` to `.env.local` only once an integration that needs it has been implemented.

### Commands

| Command                                     | What it does                                            |
| ------------------------------------------- | ------------------------------------------------------- |
| `npm run dev`                               | Development server on port 3000                         |
| `npm run build`                             | Production build                                        |
| `npm start`                                 | Serve the production build                              |
| `npm run lint`                              | ESLint, including `jsx-a11y`                            |
| `npm run format:check`                      | Prettier check (`npm run format` to fix)                |
| `npm run typecheck`                         | `tsc --noEmit`, strict                                  |
| `npm test`                                  | Vitest in watch mode (`npm test -- --run` for one pass) |
| `npm run test:e2e`                          | Playwright end-to-end and accessibility scans           |
| `npm run test:e2e:install`                  | Install the Playwright browser (first run only)         |
| `npm run db:start` / `db:stop` / `db:reset` | Local Supabase (Phase 01 onward)                        |
| `npm run db:test`                           | pgTAP database and RLS tests                            |

`npm run test:e2e` builds the app and starts it on port 3100 itself; you do not need `npm run dev` running.

## Project structure

```text
app/                     Next.js App Router routes
  page.tsx               Command Center (static, seeded)
  <module>/page.tsx      Twelve module routes with honest empty states
  field/                 Mobile Field Mode entry point
components/
  layout/                Application shell, navigation
  ui/                    Design-system primitives
  patterns/              Composed domain patterns
features/
  deployments/           Deployment types and readiness logic
  navigation/            The single source of truth for routes
lib/
  env.ts                 Zod-validated environment access
  supabase/              Client placeholders (unused in Phase 00)
  seed/                  Typed static demonstration data
supabase/
  migrations/            Timestamped migrations (none yet) + CONVENTIONS.md
  tests/                 pgTAP database and RLS tests (none yet)
  config.toml            Local development configuration
tests/
  unit/                  Domain logic, tokens, security boundaries
  component/             UI state behaviour
  e2e/                   Playwright smoke and accessibility
docs/                    Product, architecture, ADRs, standards, phases
```

## Design system

Tokens live in `app/globals.css` as CSS custom properties inside Tailwind's `@theme` block, in light and dark schemes that follow the operating-system preference.

Two rules are enforced rather than documented:

- **Status is never colour-only.** `StatusBadge` requires a text label and pairs each tone with a distinct icon _shape_, so states survive greyscale and colour-blindness. There is no API for rendering a badge without a label.
- **Contrast is tested.** `tests/unit/design-tokens.test.ts` verifies every foreground/background pair against WCAG 2.2 AA in both schemes, and `tests/e2e/accessibility.spec.ts` runs axe over every route at two viewports in both schemes.

## Security

Full policy in [`SECURITY.md`](SECURITY.md) and `docs/standards/SECURITY_PRIVACY_STANDARD.md`.

- **No secrets in the repository.** `.env*` is gitignored except `.env.example`, and a test asserts no `.env` file is tracked.
- **The Supabase service-role key never reaches the browser.** It is read in exactly one module, marked `server-only`; an ESLint rule blocks importing that module from presentation code, and a test asserts no other file references the key.
- **RLS is mandatory** on every exposed table, enabled in the same migration that creates the table, and tested before the table is exposed.
- **Demonstration data is labelled and cannot be dismissed.** Every seed record carries a required `provenance: "demonstration"` discriminant.

## Reproducibility principle

All schema changes are migrations committed to GitHub. All environment variables are documented in `.env.example`. A new developer must be able to clone the repository, follow this README, run the tests and build the application without access to any private source material — and, in Phase 00, without any credentials at all.

## Documentation

| Document                                     | Purpose                                                      |
| -------------------------------------------- | ------------------------------------------------------------ |
| [`AGENTS.md`](AGENTS.md)                     | Permanent engineering instructions and source-of-truth rules |
| [`ARCHITECTURE.md`](ARCHITECTURE.md)         | System architecture                                          |
| [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md)     | Durable product context                                      |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)         | Development workflow                                         |
| `docs/decisions/`                            | Architecture decision records                                |
| `docs/standards/`                            | Coding, UI, testing, database, security and AI standards     |
| `docs/phases/`, `docs/BUILD_ORDER.md`        | Phase plans and build order                                  |
| `docs/build/PHASE-00-IMPLEMENTATION-PLAN.md` | The plan this phase was built from                           |
| `docs/build/PHASE-00-COMPLETION-REPORT.md`   | What was built, what was verified, what remains              |
| `docs/build/OPEN_QUESTIONS.md`               | Unresolved decisions and recorded conflicts                  |

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Work happens on feature branches; lint, typecheck, tests and a production build must pass before merge.

## License

Copyright © 2026 RN Collins. All rights reserved during private development. See [`LICENSE`](LICENSE). A public/open-source license decision is required before public release (`docs/build/OPEN_QUESTIONS.md` #1).
