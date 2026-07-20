# Development Workflow

## Standard loop

1. Select one scoped phase or issue.
2. Create a feature branch: `feat/<issue>-<short-description>`.
3. Write or confirm acceptance criteria before implementation.
4. Implement code, migrations, tests and documentation together.
5. Run lint, formatting, TypeScript, unit, component, database/RLS, end-to-end and production-build checks applicable to the change.
6. Push the branch and open a pull request.
7. Review the Vercel preview, accessibility report and test evidence.
8. Merge only after required checks pass and the product owner approves.
9. Vercel deploys `main` to production.
10. Record meaningful architectural decisions and update the changelog/release notes.

## Database workflow

- All schema changes begin as versioned migration files.
- Every exposed table has RLS enabled and tested.
- Seed data must be deterministic, non-sensitive and clearly labeled.
- Production dashboard edits are never the sole record of a schema change.
- Destructive migrations require backup and rollback notes.

## AI workflow

AI-generated code, schema, documentation and content require human review. AI may propose claims, entities and links, but may not mark records verified or publish quotations without human confirmation.

## Definition of Done

A task is done only when implementation, tests, documentation, migration safety, accessibility and security implications are addressed. “Works on my machine” is not sufficient.
