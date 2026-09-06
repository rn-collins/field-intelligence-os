# Field Intelligence OS Architecture

## Architectural objective

Create one application through which RN can operate field deployments while preserving independent, auditable backing systems.

## Topology

```text
User / Field Mode
        |
Next.js application on Vercel
        |
Supabase Auth + Postgres + RLS
        |
---------------------------------
|                               |
Google Drive media vault      Notion mirror
(canonical master files)      (optional readable copy)
```

## Canonical stores

| Concern                                | Canonical system  |
| -------------------------------------- | ----------------- |
| Code, migrations, tests, docs          | GitHub            |
| Structured records                     | Supabase Postgres |
| Original photo/video/audio/doc masters | Google Drive      |
| Deployment runtime                     | Vercel            |
| Readable workspace mirror              | Notion            |

## Core domains

1. Identity and tenancy
2. Deployments and events
3. People, organizations, and relationships
4. Interactions and interviews
5. Claims, evidence, laws, and policies
6. Systems and workflows
7. Assets, permissions, and provenance
8. Cognition updates and field notes
9. Outputs and publication workflows
10. Search, retrieval, AI assistance, and audit

## Security model

- Authenticated access by default.
- Workspace-based authorization.
- RLS on every exposed table.
- Sensitive-record flags and role-scoped access.
- Server-only use of privileged keys.
- Immutable or append-only audit trail for permission, consent, verification, and publication-status changes.

## Integration model

### Google Drive

Drive stores original masters. Supabase stores metadata, provenance, checksum, permissions, and Drive identifiers/URLs. The application must not pretend that a Drive link alone is evidence of permission or verification.

### Notion

Notion is a one-way or explicitly reconciled mirror. Supabase remains canonical. Sync conflicts must never silently overwrite canonical data.

### AI

AI may assist with transcription, tagging, candidate claim extraction, relationship suggestions, retrieval, and rough assemblies. AI output remains proposed until human review. Source text, quotations, permissions, and legal status must remain traceable.

## Offline Field Mode

Field Mode should queue local capture records and synchronize when connectivity returns. Conflict resolution must preserve both versions and surface review rather than silently dropping changes.

## Implemented application structure

As of Phase 00. Each directory has one responsibility, and dependencies point
inward: `app/` may use everything, `components/` may use `features/` and `lib/`,
`features/` and `lib/` depend on neither of the above.

```text
app/                Next.js App Router routes and the root layout
components/
  layout/           Application shell and navigation
  ui/               Design-system primitives (no domain knowledge)
  patterns/         Composed, domain-aware patterns
features/
  <domain>/         Types and pure domain logic, independently testable
lib/
  env.ts            Zod-validated environment access
  supabase/         Browser and server clients
  seed/             Typed static demonstration data (Phase 00 only)
```

Pages are React Server Components by default; only the two navigation
components are client components, because only they need the current pathname.

### Server/client boundary

`lib/supabase/client.ts` uses the publishable key and is therefore always
subject to RLS. `lib/supabase/server.ts` holds the service-role key, which
bypasses RLS entirely, and is confined to the server by three independent
mechanisms: `import "server-only"`, an ESLint `no-restricted-imports` rule
blocking the import from presentation code, and a test asserting no other
tracked file references the key. Three defences because the failure mode is
silent — nothing breaks, the key simply becomes public.

Phase 01 note: the service-role client must stay reserved for operations that
genuinely cannot run as the user. Request-scoped reads belong on a cookie-bound
client, so that RLS rather than application code remains the enforcement
boundary.

## Architecture decisions

See `docs/decisions/`.
