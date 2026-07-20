# Coding Standard

- TypeScript strict mode; avoid `any` unless justified in code comments.
- Prefer small, composable modules with explicit boundaries.
- Server components by default; client components only for interaction.
- Validate external and user input at runtime.
- No hidden network side effects inside presentation components.
- Use meaningful names from the canonical ontology.
- Errors must be typed, logged safely and presented accessibly.
- Do not log secrets, protected source identities or sensitive content.
- Keep dependencies minimal and explain significant additions in the PR.
