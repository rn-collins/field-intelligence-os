# Build Order

| Phase | Outcome | Gate |
|---|---|---|
| 00 | Reproducible Next.js repository foundation and static dashboard shell | Clean clone installs, tests and builds |
| 01 | Supabase auth, organizations/workspaces, schema, RLS and seed framework | RLS tests prove tenant isolation |
| 02 | Command Center and Deployment workspaces | Manhattan and Reykjavík render from database |
| 03 | People, organizations, targets, relationships and commitments | No duplicate person entry across deployments |
| 04 | Interviews, consent, capture cards and mobile Field Mode | A complete field interaction can be logged on phone |
| 05 | Claims, evidence, law/policy, contradictions and systems reconstruction | Claim-to-evidence provenance is navigable |
| 06 | Asset register, Drive links, ingest queue and permissions | Master/derivative and restriction rules enforced |
| 07 | Search, retrieval and human-reviewed AI assistance | Every generated answer cites internal records |
| 08 | Outputs, Notion mirror, automations, observability and launch hardening | End-to-end deployment simulations pass |

Detailed phase files live in `docs/phases/`.
