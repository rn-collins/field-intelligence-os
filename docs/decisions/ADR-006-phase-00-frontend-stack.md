# ADR-006: Phase 00 front-end stack and quality gates

- Status: Accepted
- Date: 2026-07-19

## Context

`AGENTS.md` fixes the stack (Next.js App Router, TypeScript strict, Tailwind,
Supabase, Vercel) but leaves the supporting choices open. Phase 00 has to settle
them, because every later phase inherits them.

## Decision

### Framework and language

Next.js 16 (App Router), React 19, TypeScript 5.9 in strict mode plus
`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals` and
`verbatimModuleSyntax`. Strict alone leaves real gaps — indexing an array
returns a non-optional type under plain `strict`, which is exactly the class of
bug that produces a confident wrong answer in an evidence system.

### Styling

Tailwind CSS 4, with design tokens declared as CSS custom properties in an
`@theme` block. Tokens are therefore readable from both Tailwind utilities and
raw CSS, and a contrast test can parse them straight out of `globals.css`.

### No component library

Phase 00 needs roughly ten primitives. A library (shadcn/Radix/MUI) would add
surface area, push the interface toward the generic admin template the Phase 00
brief explicitly forbids, and make the "never colour-only" rule advisory rather
than enforced by the component API.

**This should be revisited in Phase 02**, when real dialogs, comboboxes, menus
and date pickers appear. Hand-rolling those is where accessibility genuinely
breaks, and Radix primitives would be the right answer at that point.

### Testing

- **Vitest** + Testing Library for unit and component tests — the starter CI
  already invoked `npm test -- --run`, which is Vitest's flag.
- **Playwright** for end-to-end, run against a production build started with no
  `.env` present, at desktop and mobile viewports.
- **`@axe-core/playwright`** scanning every route in both colour schemes.
- **pgTAP** for database and RLS tests, with the runner established now and the
  tests written in Phase 01.

Accessibility is checked at two levels deliberately: axe covers what is rendered,
and `tests/unit/design-tokens.test.ts` covers the palette itself, including pairs
not currently on screen. The token test was written first and still missed a
pair that axe caught — recorded here because it is the argument for keeping both.

### Fonts

System font stacks, not `next/font/google`. Fetching fonts at build time would
make a production build require network access and break the reproducibility
claim that a fresh clone can build offline. Substituting a self-hosted licensed
variable font is a one-file change.

### Security enforcement

The service-role boundary is enforced three ways: `import "server-only"` in
`lib/supabase/server.ts`, an ESLint `no-restricted-imports` rule blocking the
import from presentation code, and a test asserting no other tracked file
references the key. Three defences for one rule because the failure is silent
and unrecoverable — nothing breaks, the key simply becomes public.

## Consequences

- `npm ci && npm run build` succeeds with no environment file. CI enforces this.
- Adding a dependency requires justification in the pull request, per
  `docs/standards/CODING_STANDARD.md`.
- The absence of a component library is a debt to be paid deliberately in
  Phase 02, not a permanent position.
- **Toolchain policy (amended after audit).** Node 22 is the *primary* version:
  `.nvmrc` declares it and CI reads that same file. `engines` permits `>=22 <25`
  because the code is verified to work on Node 24 and forbidding it would be
  dishonest. `packageManager` pins the exact npm that generated the lockfile.

  An earlier revision of this ADR claimed local and CI toolchains "cannot
  drift." That was false — Phase 00 was verified locally on Node 24.16.0 while
  CI pinned 22. They *can* drift within the supported range. The honest control
  is not a claim but a record: `scripts/verify-phase-00.sh` writes the exact
  node and npm version into every verification artifact, so each result states
  which toolchain produced it.
