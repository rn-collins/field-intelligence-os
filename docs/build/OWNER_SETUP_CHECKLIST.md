# Owner Setup Checklist

## Completed
- [x] Supabase account created
- [x] Supabase project created
- [x] Canonical source bundle assembled
- [x] Codex repository instruction files created
- [x] Public-quality repository documentation baseline created
- [x] Phase 00 Codex task prepared

## Owner actions still required
- [ ] Create the private GitHub repository `rn-collins/field-intelligence-os` if it does not already exist.
- [ ] Download and unzip this starter package.
- [ ] Open the unzipped folder in Codex.
- [ ] Confirm the local folder is initialized or cloned as the GitHub repository.
- [ ] Give Codex the Phase 00 task in `docs/build/PHASE-00-CODEX-FOUNDATION.md`.
- [ ] Review Codex's implementation plan before allowing broad implementation.
- [ ] Commit/push the foundation branch and open a pull request.
- [ ] Connect the GitHub repository to Vercel after the app scaffolds successfully.
- [ ] Add Supabase URL and publishable key only to local `.env.local` and Vercel encrypted environment variables when Phase 01 requires them.
- [ ] Configure GitHub branch protection/ruleset for `main` after the first successful CI workflow.

## Do not paste into chat or commit
- Database password
- Supabase service-role key
- OAuth secrets
- Notion/Drive tokens
- Private source data
