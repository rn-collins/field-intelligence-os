# Database Standard

- PostgreSQL via Supabase is the canonical structured store.
- Use UUID primary keys unless a documented exception exists.
- Include workspace/tenant ownership where applicable.
- Include created/updated timestamps and actor provenance for material records.
- Verification and permissions changes require immutable history.
- Enable and test RLS before exposing a table through the API.
- Use foreign keys, check constraints and enums/reference tables where they protect meaning.
- Migrations are forward-only records; corrections use new migrations.
- Seed data contains no secrets, personal contact details or sensitive source material.
