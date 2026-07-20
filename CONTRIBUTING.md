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
