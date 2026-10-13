# Source Material Classification

Status: **Proposed classification — owner ratification required before any public release.**
Related blocker: `docs/build/OPEN_QUESTIONS.md` #15.

`AGENTS.md` requires assuming this repository may be made public and forbids
committing confidential source material. Everything under `docs/source-materials/`
is currently committed to git history. It is **not** served by the application
and **not** in any build output — the exposure is repository access and git
history only, which is correct for private development and unacceptable for a
public repository.

This document classifies each tracked file. It does **not** delete anything or
rewrite history; those actions require owner authorization and are a separate,
deliberate step (see "History cleanup" below).

## Classification scale

1. **Safe to publish** — no confidential content.
2. **Publish after redaction** — mostly safe; specific content must be removed first.
3. **Private; replace with a synthetic or public substitute** — the _shape_ is
   useful publicly but the _content_ is confidential.
4. **Remove from history before public release** — confidential; should not be
   in a public repository at all, including its history.

## Proposed classification

| File                                                                                 | Class | Rationale                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                                                          | 1     | Describes the folder; no confidential content.                                                                                                                                                                                                                                     |
| `engineering-package-expanded/fios_v1_spec/schema.sql`                               | 1     | Representative schema; already the basis of public engineering docs.                                                                                                                                                                                                               |
| `.../openapi.yaml`                                                                   | 1     | API contract shape; no data.                                                                                                                                                                                                                                                       |
| `.../screen_inventory.csv`                                                           | 1     | Screen/route inventory; already reflected in the app.                                                                                                                                                                                                                              |
| `.../domain_events.csv`                                                              | 1     | Event names and payload shapes; no data.                                                                                                                                                                                                                                           |
| `.../migration_map.csv`                                                              | 1     | Structural mapping; no data.                                                                                                                                                                                                                                                       |
| `.../permission_matrix.csv`                                                          | 1     | Role/permission grid; no data.                                                                                                                                                                                                                                                     |
| `.../README.txt`                                                                     | 1     | Package description.                                                                                                                                                                                                                                                               |
| `Field_Intelligence_OS_v1.0_Product_Specification.docx` / `.pdf` (both copies)       | **2** | The product spec is largely publishable, but must be read in full for embargoed reporting plans, named sources, or client specifics before release. Two duplicate copies exist (top level and `engineering-package-expanded/`); de-duplicate.                                      |
| `Field_Intelligence_OS_v0.1_Canonical_System_Architecture_and_Migration_Packet.docx` | **2** | Architecture packet; likely publishable after a read for confidential specifics.                                                                                                                                                                                                   |
| `Field_Intelligence_OS_v1.0_Engineering_Package.zip`                                 | **2** | Binary bundle; must be unpacked and each item classified before release. Provisionally 2 pending that review.                                                                                                                                                                      |
| `Field_Intelligence_OS_v0.1_Prototype.zip`                                           | **3** | Prototype archive; replace with a reproducible reference rather than shipping a binary blob.                                                                                                                                                                                       |
| `RN_Collins_Field_Investigation_Manual_Foundational_Edition.docx`                    | **3** | The method is a core intellectual asset. Publishing the full manual is a business decision, not a default; substitute a public overview unless the owner intends to release it.                                                                                                    |
| `RN_Fall_2026_Conference_Intelligence_Master_Tracker_v4.xlsx`                        | **4** | Confirmed confidential. Contains the September decision model — weighted scores, criterion rationales, client and outlet fit reasoning, a cost model, and Cannes/Hawaiʻi strategy. Live commercial and editorial planning. Must be removed from history before any public release. |

## Immediate posture

- **Class 4 (the tracker) is the binding constraint.** As long as it is in
  history, the repository cannot be made public without a history rewrite.
- Nothing here is served or built, so there is no runtime exposure to fix today.
- The seed data already excludes the tracker's contents by design, enforced by
  `tests/unit/seed-safety.test.ts`.

## History cleanup (when authorized, before public release)

Deleting a file in a new commit does not remove it from history. Removing Class 3
and 4 files requires rewriting history with `git filter-repo` (preferred) or the
BFG Repo-Cleaner, followed by a force-push and re-clone by any collaborators.

This is cheapest now: the history is short and has not been shared. It becomes
progressively more disruptive with every collaborator and every published clone.

Recommended sequence when the owner authorizes publication:

1. Decide final class for each Class 2 file after a full read.
2. Move Class 1/2 keepers to their intended home (a docs vault or the repo,
   de-duplicated).
3. `git filter-repo` to purge Class 3/4 paths from all history.
4. Verify with `git log --all -- <path>` returning nothing.
5. Force-push; collaborators re-clone.
6. Enable secret scanning and push protection (see `docs/public-release/REPO_HARDENING.md`).
