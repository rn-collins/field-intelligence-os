#!/usr/bin/env bash
#
# Runs the pgTAP database and RLS tests against local Supabase.
#
# Phase 00 defines no schema, so this exits cleanly with an explanation rather
# than failing. The script exists now so that Phase 01 inherits a working runner
# instead of inventing one under deadline.
#
set -euo pipefail

TEST_DIR="supabase/tests"

# Check for tests before checking for tooling: on a fresh Phase 00 clone there
# is nothing to run, and demanding a CLI install to discover that is noise.
shopt -s nullglob
tests=("$TEST_DIR"/*.test.sql)
shopt -u nullglob

if [ ${#tests[@]} -eq 0 ]; then
  echo "No database tests yet — Phase 00 defines no schema."
  echo "Conventions: supabase/migrations/CONVENTIONS.md"
  echo "How to write one: supabase/tests/README.md"
  exit 0
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "The Supabase CLI is not installed."
  echo "Install it from https://supabase.com/docs/guides/cli, then run: npm run db:start"
  exit 1
fi

if ! supabase status >/dev/null 2>&1; then
  echo "Local Supabase is not running. Start it with: npm run db:start"
  exit 1
fi

echo "Running ${#tests[@]} database test file(s)…"
supabase test db
