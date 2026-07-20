# Phase 00 — Codex Foundation Task

## Objective
Initialize a production-grade, reproducible foundation for Field Intelligence OS without attempting the full domain product.

## Codex prompt

Build the production foundation for Field Intelligence OS in this repository.

1. Read `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, all accepted ADRs, and the canonical product files under `docs/source-materials/`.
2. Before implementation, create `docs/build/PHASE-00-IMPLEMENTATION-PLAN.md` describing the proposed file structure, packages, security assumptions, testing strategy, and unresolved decisions. Do not continue until the plan is internally consistent.
3. Scaffold a production-grade Next.js App Router application using TypeScript strict mode and Tailwind CSS.
4. Establish a polished, responsive application shell with desktop navigation and a mobile Field Mode entry point.
5. Create design tokens and accessible shared components. Avoid a generic dashboard template aesthetic.
6. Add Supabase browser/server client placeholders and local development configuration, but do not connect to production or require real secrets.
7. Establish `supabase/migrations`, `supabase/tests`, and seed-data conventions. Do not create the full schema yet.
8. Add testing infrastructure for unit/component tests, Playwright smoke tests, accessibility checks, and scripts for database/RLS testing.
9. Configure GitHub Actions CI for lint, typecheck, tests, and production build. Improve the starter workflow as needed.
10. Add `.env.example`, Vercel-compatible configuration, and clear setup instructions. Never commit secrets.
11. Create a polished static dashboard shell seeded with clearly labeled demonstration data for Manhattan and Reykjavík. It must prove the information architecture but must not pretend to be a finished functional product.
12. Add routes/placeholders for Deployments, People, Organizations, Interviews, Claims, Evidence, Systems, Media, Outputs, Search, Canon, and Settings.
13. Update README, architecture, contribution, security, and ADR documentation to match the implementation.
14. Run all quality checks and a production build.
15. Return a completion report listing created/changed files, package choices, commands run, test results, screenshots, remaining external dependencies, and Phase 01 recommendations.

## Acceptance criteria
- A new developer can clone, install, run, test, and build by following README.
- No secrets or private source data are committed.
- TypeScript strict mode is enabled.
- Responsive shell and static Manhattan/Reykjavík dashboard render correctly.
- Core routes exist with purposeful empty states.
- CI is configured and passes locally where possible.
- Supabase migrations/tests directories and documented workflow exist.
- Security and source-of-truth rules are preserved.
- Accessibility basics are verified.
- The implementation is visually distinctive and portfolio-quality, not a generic admin template.

## Out of scope
- Full production schema
- Real authentication
- Real Drive/Notion synchronization
- AI extraction
- Offline synchronization
- Importing sensitive or private data
