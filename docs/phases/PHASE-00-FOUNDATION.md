# Phase 00 — Production Foundation

## Goal

Create a portfolio-grade, reproducible Next.js foundation without prematurely implementing the full domain.

## Required outcomes

- Next.js App Router and strict TypeScript.
- Accessible responsive shell and design tokens.
- Static Command Center with Manhattan and Reykjavík sample cards.
- Supabase local-development folder and migration conventions.
- Test framework, Playwright, accessibility smoke test and CI.
- Environment templates and no committed credentials.
- Documentation remains coherent after scaffolding.

## Acceptance criteria

- Fresh clone can follow README and run locally.
- `lint`, `typecheck`, `test` and `build` pass.
- CI runs on pull requests.
- No secrets or generated build artifacts are committed.
- Mobile and desktop navigation work with keyboard and screen reader semantics.
- Vercel can build the repository without production secrets using static seed content.
