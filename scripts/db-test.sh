#!/usr/bin/env bash
#
# Runs the pgTAP database and RLS tests against local Supabase.
#
# Reports SKIPPED — not PASSED — when there is nothing to run. Phase 00 defines
# no schema, and a green checkmark for "we ran zero tests" is precisely the kind
# of false assurance this project cannot afford: it would read as "RLS verified"
# in a completion report.
#
# Emits a machine-readable status line for scripts/verify-phase-00.sh:
#   DB_TEST_STATUS=skipped|passed|failed
#
set -euo pipefail

TEST_DIR="supabase/tests"
MIGRATION_DIR="supabase/migrations"

status() { echo "DB_TEST_STATUS=$1"; }

shopt -s nullglob
tests=("$TEST_DIR"/*.test.sql)
migrations=("$MIGRATION_DIR"/*.sql)
shopt -u nullglob

# ---------------------------------------------------------------------------
# Phase 01 tripwire.
#
# The moment a migration exists, untested schema becomes a failure rather than
# a skip. docs/standards/DATABASE_STANDARD.md requires RLS to be enabled and
# tested before a table is exposed; without this check, Phase 01 could ship
# schema while db:test still reported a cheerful skip.
# ---------------------------------------------------------------------------
if [ ${#migrations[@]} -gt 0 ] && [ ${#tests[@]} -eq 0 ]; then
  echo "FAILED: ${#migrations[@]} migration(s) exist but supabase/tests/ contains no *.test.sql."
  echo
  echo "Every exposed table needs RLS tests before it is reachable through the API."
  echo "Negative cases are mandatory: a policy that is too permissive passes every"
  echo "'can read' test. See supabase/tests/README.md."
  status failed
  exit 1
fi

if [ ${#tests[@]} -eq 0 ]; then
  echo "SKIPPED — not applicable. Phase 00 defines no database schema."
  echo
  echo "This is not a passing test result. There is nothing to test yet."
  echo "  Conventions   : $MIGRATION_DIR/CONVENTIONS.md"
  echo "  Writing tests : $TEST_DIR/README.md"
  status skipped
  exit 0
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "FAILED: ${#tests[@]} database test file(s) exist but the Supabase CLI is not installed."
  echo "Install it from https://supabase.com/docs/guides/cli, then run: npm run db:start"
  status failed
  exit 1
fi

if ! supabase status >/dev/null 2>&1; then
  echo "FAILED: ${#tests[@]} database test file(s) exist but local Supabase is not running."
  echo "Start it with: npm run db:start"
  status failed
  exit 1
fi

echo "Running ${#tests[@]} database test file(s)…"
if supabase test db; then
  status passed
else
  status failed
  exit 1
fi
