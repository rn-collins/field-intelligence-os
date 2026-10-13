# Repository Hardening — Owner Actions

These steps cannot be performed from within the repository. They are GitHub
repository settings the owner enables, and they are prerequisites for making the
repository public.

## Before going public

1. **Resolve the source-material blocker.** See
   `docs/public-release/SOURCE_MATERIAL_CLASSIFICATION.md` and
   `docs/build/OPEN_QUESTIONS.md` #15. The Class 4 tracker must be purged from
   history first.

2. **Enable secret scanning.**
   Settings → Code security and analysis → Secret scanning → Enable.
   Detects committed credentials across history.

3. **Enable push protection.**
   Same panel → Push protection → Enable.
   Blocks commits containing recognized secret patterns _before_ they land, which
   is the cheap moment to catch them.

4. **Confirm CodeQL is running.** `.github/workflows/codeql.yml` is committed; a
   public repo also surfaces results in the Security tab.

5. **Confirm Dependabot alerts and security updates are on.**
   Settings → Code security and analysis. `.github/dependabot.yml` handles
   version updates; alerts are a separate toggle.

6. **Third-party license review.** Run the dependency license check
   (`docs/build/ROADMAP.md`, public-release checklist) and confirm every
   transitive license is compatible with the intended repository license, which
   is itself still an open question (`OPEN_QUESTIONS.md` #1).

7. **Generate an SBOM.** GitHub can export one (Insights → Dependency graph →
   Export SBOM), or generate at build time. Attach to the first public release.

## Ongoing

- Branch protection on `main`: require PR review and passing checks before merge.
- Keep the deployment rules in `docs/DEPLOYMENT.md` enforced.
