# Contributing

## Before coding
1. Read `AGENTS.md`.
2. Review relevant product and architecture documents.
3. Confirm the task has acceptance criteria.
4. Identify schema, permission, migration, accessibility, and documentation impacts.

## Branches
Use short-lived branches:
- `feat/<name>`
- `fix/<name>`
- `docs/<name>`
- `chore/<name>`
- `security/<name>`

## Commits
Use focused conventional commits, for example:
- `feat(deployments): add deployment workspace shell`
- `fix(auth): prevent unauthorized workspace access`
- `docs(architecture): record Drive source-of-truth decision`

## Pull requests
Every PR must include:
- purpose and user outcome;
- screenshots or recordings for UI changes;
- tests run and results;
- migration and seed-data effects;
- security/privacy considerations;
- accessibility considerations;
- documentation changes;
- known limitations and follow-up work.

## Database changes
- Add a timestamped migration.
- Add/update database and RLS tests.
- Update seed data if appropriate.
- Never rely on an untracked dashboard change.

## Quality gate
A PR is not ready until lint, typecheck, tests, database checks, and production build pass.

Run the applicable checks before opening a PR:

```bash
npm run format:check   # Prettier (npm run format to fix)
npm run lint           # ESLint, including jsx-a11y
npm run typecheck      # tsc --noEmit, strict
npm test -- --run      # Vitest unit and component tests
npm run test:e2e       # Playwright end-to-end and axe accessibility scans
npm run build          # Production build
npm run db:test        # pgTAP database and RLS tests (Phase 01 onward)
```

`npm run test:e2e` builds and starts the app itself on port 3100. It requires
the Playwright browser: `npm run test:e2e:install` once.

CI runs the same checks on every pull request on the Node version in `.nvmrc`
(22). Local development may use any supported version (`>=22 <25`); the
verification artifact records which version produced a given result. See
`docs/DEPLOYMENT.md` for deployment rules — feature branches produce previews,
`main` is production, and manual production deploys require explicit authorization.

## Accessibility

Changed UI needs more than a passing axe scan:

- Operate the change with the keyboard only. Focus must be visible, ordered
  sensibly, and never trapped.
- Check both colour schemes. Tokens are tested for contrast, but new
  combinations are not tested until you add them to
  `tests/unit/design-tokens.test.ts`.
- Status, verification, consent and restriction states must carry a text label
  and an icon, never colour alone.
- Every new surface needs its loading, empty, error, restricted and success
  states.

## Formatting scope

Prettier deliberately does not format the canonical governance and specification
documents listed in `.prettierignore`. Those are owned by the product owner; a
diff in them should mean a decision, not a tooling pass.
