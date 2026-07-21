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

13. **`candidate` and `not-selected` deployment statuses are additions to the
    v1.0 specification.** SCR-02 defines Planning | Ready | Active | Processing |
    Closed | Cancelled, all of which assume a deployment the operator has
    committed to. The September 2026 record is a choice between two competing
    options, which has no representation in that pipeline. Without a candidate
    state, a competing option must be stored as `planning` — asserting a
    commitment that was never made. Added in Phase 00 and recorded here for
    ratification against the v1.0 specification.

14. **The September 2026 decision itself is open.** Manhattan and Reykjavík are
    mutually exclusive candidates for one window. The planning workbook records a
    provisional result but its cost inputs are still zero. Until the decision is
    made, neither option should accumulate targets, consent templates or vault
    structure. See `PROJECT_MEMORY.md`.

15. **Blocking before any public release — `docs/source-materials/` is committed
    to git.** `AGENTS.md` requires assuming this repository may be made public and
    forbids committing confidential source material. The tracked source materials
    include the September 2026 planning workbook, which holds weighted decision
    scores, criterion rationales, client and outlet fit reasoning, a cost model,
    and Cannes/Hawaiʻi strategy — plus the Field Investigation Manual and the
    v0.1 prototype archive.

    These are **not** served by the application and are **not** in any build
    output; the exposure is repository access and git history only. That is
    correct for private development and unacceptable for a public repository.

    Two points of timing. First, deleting a file in a later commit does not
    remove it from history — resolving this after publication requires a history
    rewrite. Second, this history is currently short and unpublished, which makes
    now by far the cheapest moment to act.

    Options: keep the repository permanently private; move the binaries to a
    private documentation vault or release artifact and reference them by name
    (already anticipated in `docs/source-materials/README.md`, though on size
    grounds rather than confidentiality); or split the public-facing engineering
    specification from the private planning material.

16. **U.S. English house style.** Phase 00 adopts U.S. English with `canceled`
    (single-l), documented in `docs/standards/COPY_STANDARD.md`. Open to owner
    ratification; a different house style is cheap to switch while the corpus is
    small. The `cancelled` status enum value is intentionally left British to
    mirror the v1.0 spec vocabulary, being an identifier rather than copy.

17. **Navigation naming (E3), evaluated, no rename made.** The audit asked for
    explicit decisions on: Command Center vs Field Desk / Intelligence Desk /
    Home; Interactions vs Interviews & encounters; Evidence & law as one module
    vs two; Media & assets terminology. ADR-005 ratified the current names on
    2026-07-19, and renaming ratified routes without new evidence is churn.
    Recommendation: keep current names; revisit only if field use surfaces a
    concrete problem. Owner may override per name.

18. **`candidate`/`not-selected` deployment statuses** — carried from #13; the
    v1.0 status pipeline has no representation for an undecided competing option.
    Added in Phase 00; awaiting ratification against the spec.

**Resolved:** #12 (colour scheme) — system preference, implemented in Phase 00.
