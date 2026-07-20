# Codex Owner Handoff

## How to open the project

1. Download and unzip the repository package.
2. Open the Codex desktop app.
3. Choose **Open Folder** and select the unzipped repository root—the folder containing `AGENTS.md`, `START_HERE.md` and `.codex/`.
4. Paste: `Read AGENTS.md and START_HERE.md, then execute .codex/FIRST_TASK.md. Begin with the required implementation plan.`

## What is already encoded

The repository itself tells Codex to create the Next.js foundation, test it, work on a branch, preserve migrations, avoid secrets and prepare a pull request. The owner does not need to restate those requirements in every session.

## What is not automatic

Codex cannot approve its own pull request, create account-level secrets safely without owner authorization, or connect Vercel/Supabase account permissions if not granted. Git pushes and PR creation depend on the Codex app's GitHub authorization and repository state.

## After Phase 00 passes

1. Push the branch if Codex has not already done so.
2. Open/approve the pull request after checks pass.
3. Connect the GitHub repository to Vercel and confirm preview deployments.
4. Phase 01 will request Supabase public environment variables; add them to `.env.local` and Vercel, never to GitHub or chat.
