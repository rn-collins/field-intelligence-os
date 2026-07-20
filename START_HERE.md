# Start Here — Field Intelligence OS

This repository is the canonical engineering home for **Field Intelligence OS**.

## What to do first in Codex

1. Open this repository folder in the Codex desktop app.
2. Tell Codex: **“Read `AGENTS.md` and `START_HERE.md`, then execute `.codex/FIRST_TASK.md`. Do not change application code until the required implementation plan is written.”**
3. Codex must inspect the canonical source files in `docs/source-materials/` and the summarized specifications in `docs/product/`.
4. Codex must work on a feature branch, run the required checks, and prepare a pull request. It must not push secrets or edit the production database manually.

## Source-of-truth hierarchy

1. GitHub: code, database migrations, tests, engineering documentation and release history.
2. Supabase: canonical structured application data after migrations are applied.
3. Google Drive: master photo, video, audio, source documents and consent artifacts.
4. Notion: human-readable mirror and collaboration layer, not the authoritative database.
5. Vercel: preview and production deployment runtime.

## Current project state

The repository contains product architecture, field methodology, seed research, standards and the Phase 00 build task. It does **not** yet contain the production Next.js application. Codex will create that foundation in Phase 00.

## Owner actions that cannot be automated from this repository

- Ensure the private GitHub repository exists and this folder is pushed to it.
- Open the folder in Codex and authorize repository access.
- Link the GitHub repository to Vercel.
- Add Supabase and integration credentials to local/Vercel secret stores.
- Approve pull requests and production deployments.

See `docs/build/OWNER_SETUP_CHECKLIST.md` for exact steps.
