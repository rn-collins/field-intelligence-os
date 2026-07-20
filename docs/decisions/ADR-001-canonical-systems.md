# ADR-001: Canonical systems of record

- Status: Accepted
- Date: 2026-07-19

## Decision
GitHub is canonical for code/schema/docs; Supabase for structured data; Google Drive for original media masters; Notion is an optional mirror; Vercel is the deployment platform.

## Consequences
Sync logic must preserve Supabase authority for structured records and must never silently overwrite canonical data from Notion.
