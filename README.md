# Field Intelligence OS

Field Intelligence OS is a multimodal platform for planning field deployments, managing sources and relationships, documenting interviews, tracing claims to evidence, reconstructing systems, preserving consent and permissions, organizing media, and producing trustworthy editorial and research outputs.

## Status

**Pre-alpha / foundation package.** This repository starter contains the canonical product materials, engineering instructions, architecture rules, security baseline, initial CI plan, and the first Codex build task. Production code has not yet been scaffolded.

## Why it exists

Conventional tools split fieldwork across notes, spreadsheets, file folders, CRMs, transcription apps, and publishing systems. Field Intelligence OS is designed around the actual structure of investigation:

`place → people → interaction → claim → evidence → law/policy → system → asset → permission → cognition update → output`

## Initial deployments

- Manhattan, September 2026: climate, AI, ESG, legal-tech, fintech, creator-economy, clean-energy, and materials fieldwork.
- Reykjavík, September 2026: cannabis and psychoactive-plant science, regulation, public health, medicine, culture, and island-systems reporting.

## Planned stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres and Auth
- Vercel
- Google Drive master-media vault
- Optional Notion knowledge mirror

## Repository map

```text
.github/                 GitHub workflows and templates
app/                     Next.js routes (created during Phase 00)
components/              Shared UI components
features/                Domain modules
lib/                     Shared libraries and integrations
supabase/                Migrations, tests, config, and seed data
docs/                    Product, architecture, ADRs, methodology, integrations
public/                  Static assets
tests/                   Cross-cutting tests
AGENTS.md                 Permanent Codex instructions
ARCHITECTURE.md           System architecture and source-of-truth rules
SECURITY.md               Security and responsible disclosure policy
CONTRIBUTING.md           Development and contribution workflow
```

## Start here

1. Read `AGENTS.md`.
2. Read `docs/build/PHASE-00-CODEX-FOUNDATION.md`.
3. Review the canonical source files in `docs/source-materials/`.
4. Complete the external setup checklist in `docs/build/OWNER_SETUP_CHECKLIST.md`.
5. Run Phase 00 through Codex.

## Reproducibility principle

All schema changes must be migrations committed to GitHub. All required environment variables must be documented in `.env.example`. A new developer must be able to clone the repository, follow the README, create a local Supabase environment, run tests, and reproduce the application without access to private source material.

## License

Copyright © 2026 RN Collins. All rights reserved during private development. See `LICENSE`. A public/open-source license decision is required before public release.
