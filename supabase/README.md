# Supabase Development

Codex must initialize Supabase local-development configuration during Phase 00.

Rules:
- All schema changes are migrations.
- All exposed tables require RLS.
- Policies require tests.
- Seed data must be fictional or explicitly approved non-sensitive demonstration data.
- Never commit production credentials.
