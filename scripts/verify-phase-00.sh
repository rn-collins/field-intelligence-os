#!/usr/bin/env bash
#
# Runs every Phase 00 quality gate and writes a machine-readable record to
# docs/build/verification/latest.json.
#
# Exists to fix the root cause of stale test totals: numbers were hand-copied
# into prose in two documents and drifted. The completion report and PR should
# cite this artifact rather than restate counts, so "the totals disagree" cannot
# recur — there is one source, and it records the exact commit, toolchain and
# per-check result that produced it.
#
# Read-only with respect to the repository (it runs a production build into
# .next, which is gitignored). It does not deploy.
#
# Written for bash 3.2 (the macOS system bash): no associative arrays.
#
set -uo pipefail

OUT_DIR="docs/build/verification"
OUT="$OUT_DIR/latest.json"
mkdir -p "$OUT_DIR"

sha="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
short="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
node_v="$(node -v 2>/dev/null || echo unknown)"
npm_v="$(npm -v 2>/dev/null || echo unknown)"
stamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
env_label="${VERIFY_ENV:-local}"

# Accumulated JSON check entries and overall failure flag.
checks_json=""
any_fail=0

append_check() {
  # name status detail
  local name="$1" st="$2" det="$3"
  det="${det//\\/\\\\}"
  det="${det//\"/\\\"}"
  [ -n "$checks_json" ] && checks_json="$checks_json,"
  checks_json="$checks_json
    \"$name\": { \"status\": \"$st\", \"detail\": \"$det\" }"
  printf "  %-10s %s\n" "$name" "$st"
  [ "$st" = "fail" ] && any_fail=1
  return 0
}

run() {
  # name command...
  local name="$1"; shift
  local out st
  if out="$("$@" 2>&1)"; then st="pass"; else st="fail"; fi
  append_check "$name" "$st" "$(printf '%s' "$out" | tail -1 | tr -d '\r')"
}

echo "Phase 00 verification — $short on $branch ($node_v)"

run format npx prettier --check .
run lint npx eslint .
run typecheck npx tsc --noEmit
run unit npx vitest --run
run build npm run build

if [ "${VERIFY_E2E:-0}" = "1" ]; then
  run e2e npx playwright test
else
  append_check e2e skipped "set VERIFY_E2E=1 to run"
fi

# db:test reports its own status line; classify it.
db_out="$(bash scripts/db-test.sh 2>&1)"
case "$db_out" in
  *DB_TEST_STATUS=passed*) db_st="pass" ;;
  *DB_TEST_STATUS=skipped*) db_st="skipped" ;;
  *) db_st="fail" ;;
esac
append_check db "$db_st" "$(printf '%s' "$db_out" | grep -v DB_TEST_STATUS | head -1)"

{
  echo "{"
  echo "  \"commit\": \"$sha\","
  echo "  \"branch\": \"$branch\","
  echo "  \"timestamp\": \"$stamp\","
  echo "  \"environment\": \"$env_label\","
  echo "  \"node\": \"$node_v\","
  echo "  \"npm\": \"$npm_v\","
  printf '  "checks": {%s\n  }\n' "$checks_json"
  echo "}"
} > "$OUT"

echo
echo "Wrote $OUT"

if [ "$any_fail" -eq 1 ]; then
  echo "FAILED — see $OUT"
  exit 1
fi
echo "All non-skipped checks passed."
