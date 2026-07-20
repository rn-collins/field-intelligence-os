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

| Concern | Canonical system |
|---|---|
| Code, migrations, tests, docs | GitHub |
| Structured records | Supabase Postgres |
| Original photo/video/audio/doc masters | Google Drive |
| Deployment runtime | Vercel |
| Readable workspace mirror | Notion |

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

## Architecture decisions
See `docs/decisions/`.
