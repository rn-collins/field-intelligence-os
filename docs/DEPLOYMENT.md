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

**Note the trap that caused this rule.** `vercel deploy` with no target flag is
not reliably a preview: on a project with no existing production deployment, it
creates one, and the CLI reports success without ever using the word
"production". Always pass the target explicitly:

```bash
vercel deploy --target=preview     # correct for any branch work
```

### 4. Deployment status must be **verified**, never assumed

Before reporting a deployment as successful, safe, or private, check it. A build
that returns "Ready" tells you the build compiled — nothing about where it went
or who can read it.

Minimum verification:

```bash
# Where did it actually go?
vercel inspect <url> --scope <scope> | grep -i target

# What does an unauthenticated visitor get?
curl -sI <url> | head -1
curl -s <url> | grep -qi "<known app string>" && echo "PUBLIC" || echo "protected"
```

Check the **production alias** (`<project>.vercel.app`), not only the
deployment-specific URL. They can differ: a deployment-specific URL may redirect
to SSO while the alias serves the application publicly from edge cache.

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
