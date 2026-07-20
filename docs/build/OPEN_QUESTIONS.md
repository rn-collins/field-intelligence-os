# Open Questions

1. Public license strategy before repository publication.
2. Whether single-user alpha should still implement workspace tenancy from day one.
3. Exact Supabase region and production data residency requirements.
4. Drive OAuth ownership model and folder-level permission strategy.
5. Notion mirror scope and conflict policy.
6. Which AI providers/models are permitted for sensitive source material.
7. Offline storage encryption and device-loss policy.
8. Public demo-data strategy that proves the product without exposing private reporting plans.

## Conflicts recorded during Phase 00 planning

Raised per `AGENTS.md` ("Do not silently choose between conflicting requirements"). Detail and recommendations in `docs/build/PHASE-00-IMPLEMENTATION-PLAN.md` §0.

9. **Blocking — no Git repository.** The working directory is not a Git repo, so the required feature-branch/commit/pull-request workflow cannot be followed. Owner must push this folder to the private GitHub repository, or authorize `git init` plus an initial commit.
10. **Route vocabulary conflict.** The v1.0 spec `screen_inventory.csv` specifies `/institutions`, `/interactions`, `/archive/ingest`, and `/library`; `docs/build/PHASE-00-CODEX-FOUNDATION.md` §12 names "Organizations", "Interviews", "Media", and "Canon"; `PROJECT_MEMORY.md` fixes Organization, Interaction, and Asset as canonical entity nouns. Needs ratification before URLs become public surface in Phase 02. Proposed resolution: ADR-005.
11. **Phase numbering conflict.** `docs/BUILD_ORDER.md` and `PROJECT_MEMORY.md` describe an eight-phase order; `docs/build/ROADMAP.md` describes a different ten-phase order (03, 05, and 09 disagree). Recommendation: `BUILD_ORDER.md` is canonical and `ROADMAP.md` should be rewritten to match.
12. **Interface color-scheme default.** Light-first, dark-first, or system preference? Phase 00 assumes system preference with both schemes fully specified and contrast-validated.
