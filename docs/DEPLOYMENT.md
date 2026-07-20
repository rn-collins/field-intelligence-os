# Deployment

Vercel is the deployment runtime, not a data store (ADR-001). This document is
binding on both human contributors and automated agents.

## Rules

### 1. Feature branches and pull requests produce **preview** deployments

Every push to a non-`main` branch, and every pull request, builds a preview
deployment with its own URL. Previews are how work is reviewed. They are the
default and the only deployment an agent or contributor should expect to create.

### 2. `main` is the **production** branch

The Vercel project's production branch is `main`. Merging a pull request into
`main` is the intended — and normally the only — way a production deployment
comes into existence.

### 3. Manual production deployment is **prohibited** without explicit authorization

Do not run `vercel deploy --prod`, `vercel promote`, or any equivalent that
targets production, unless the product owner has explicitly authorized that
specific deployment. "Deploy it" is not authorization for a production deploy;
ask.

### 3a. The first-deployment bootstrap trap

**On a project with zero production deployments, Vercel promotes the next
deployment to production — regardless of the requested target or the source
branch.** This overrides `--target=preview`, and it overrides
`productionBranch: main`. The CLI reports success without ever printing the word
"production".

Verified the hard way: three consecutive deployments were forced to production,
including a Git-integration build from `feat/phase-00-foundation` while
`productionBranch` was correctly set to `main`. `--target=preview` was only
honored once a production deployment already existed.

```bash
vercel deploy --target=preview     # honored ONLY once a production deploy exists
```

So the rule is **not** simply "always pass `--target=preview`". That flag is
necessary and insufficient.

### 3b. Never delete the last production deployment to "clear" production

This is the trap's sharp edge, and it is counter-intuitive enough to state
plainly: deleting deployments to remove something from production **recreates
the zero-production state**, which guarantees the _next_ deployment — whatever
its stated target — is promoted to production.

During the incident this turned one mistake into three: each deletion re-armed
the condition that caused the next failure. The deletions were causing the
failure they were meant to correct.

If production is serving something it should not:

- **Do** deploy the correct commit to production, with owner authorization, so
  the alias moves.
- **Do** enable Deployment Protection to close public access.
- **Do not** delete the last production deployment as a workaround.

### 4. Deployment status must be **verified**, never assumed

Before reporting a deployment as successful, safe, or private, check it. A build
that returns "Ready" tells you the build compiled — nothing about where it went
or who can read it.

Use the script rather than remembering the commands:

```bash
scripts/verify-deployment.sh \
  --preview <preview-host> \
  --production-alias <project>.vercel.app \
  --scope <scope>
```

It checks four things and exits non-zero if any fail:

1. **Deployment target** — `vercel inspect`; a branch build reporting
   `production` is a failure.
2. **Project production branch** — must be `main`.
3. **Preview access** — an unauthenticated request must _not_ receive HTTP 200.
4. **Production alias** — expected inactive (HTTP 404) unless
   `--expect-alias-active` is passed.

The script is **read-only by construction**: it runs only `vercel inspect`,
read-only API GETs and `curl`. `tests/unit/deployment-script.test.ts` asserts
that no `deploy`, `promote`, `remove`, `alias`, `rollback` or `--prod` appears in
it, because the moment a verification tool can also mutate, it becomes dangerous
in precisely the situation it exists to make safe.

Always check the **production alias** (`<project>.vercel.app`), not only the
deployment-specific URL. They differ: during the incident the deployment URL
returned 302 to SSO while the alias served the application publicly with
`x-vercel-cache: HIT`. Checking only the first produced a confident, wrong
"it is protected" report.

## Environments

| Environment | Source                      | URL                     | Secrets required |
| ----------- | --------------------------- | ----------------------- | ---------------- |
| Local       | working tree                | `http://localhost:3000` | none in Phase 00 |
| Preview     | any non-`main` branch or PR | per-deployment URL      | none in Phase 00 |
| Production  | `main`                      | production alias        | none in Phase 00 |

Phase 00 builds with no environment variables at all. From Phase 01, Supabase
credentials are set in the Vercel project's environment settings — never
committed, and never with a `NEXT_PUBLIC_` prefix on a server-only value.

## Access control

Vercel Deployment Protection governs who can read a deployment. The application
itself has no authentication until Phase 01, so protection is the only access
control that exists right now. Verify it rather than trusting the project
setting: the `ssoProtection` field can read as enabled while the production
alias still serves the app publicly.

## Incident record

**2026-07-20 — an unauthorized production deployment was created and corrected.**
See `docs/journal/BUILD_JOURNAL.md`. These rules exist because of it.
