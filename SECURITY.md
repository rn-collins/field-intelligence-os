# Security Policy

## Current status
Field Intelligence OS is in private pre-alpha development.

## Sensitive data
The product may contain protected source identities, off-record information, health-related material, legal information, location data, consent records, embargoed documents, unpublished research, and original media. Treat all such information as sensitive by default.

## Never commit
- `.env*` files containing values
- Supabase service-role keys
- database passwords or connection strings
- OAuth client secrets
- Drive or Notion tokens
- source identities or restricted transcripts
- unpublished private media

## Required controls
- RLS on every exposed table
- least-privilege policies
- server-only privileged operations
- audit records for access-sensitive state changes
- explicit permission checks before publication or sharing
- secret scanning and dependency scanning in CI

## Reporting a vulnerability
During private development, report vulnerabilities directly to RN Collins through a private channel. Do not open a public issue containing exploit details or sensitive data.
