#!/usr/bin/env bash
#
# Read-only verification of Vercel deployment state.
#
# THIS SCRIPT MUST NEVER MUTATE ANYTHING.
#
# It exists because deployment state was twice reported to the product owner
# without being checked, and both reports were wrong: a production deployment
# was described as a preview, and a publicly readable URL was described as
# SSO-protected. A verification tool that can also deploy, promote, alias or
# remove would be a footgun in exactly the situation it is meant to make safe,
# so it runs only `vercel inspect`, read-only API GETs, and `curl`.
#
# `tests/unit/deployment-script.test.ts` asserts that no mutating verb appears
# in this file. Adding one will fail the test suite.
#
# Usage:
#   scripts/verify-deployment.sh --preview <url> [--production-alias <host>] [--scope <scope>]
#
# Exit codes:
#   0  all checks passed
#   1  a check failed (see output)
#   2  bad usage or missing tooling
#
set -euo pipefail

PREVIEW_URL=""
PRODUCTION_ALIAS=""
SCOPE=""
EXPECT_ALIAS_INACTIVE="true"

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
    --preview) PREVIEW_URL="${2:-}"; shift 2 ;;
    --production-alias) PRODUCTION_ALIAS="${2:-}"; shift 2 ;;
    --scope) SCOPE="${2:-}"; shift 2 ;;
    --expect-alias-active) EXPECT_ALIAS_INACTIVE="false"; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown argument: $1" >&2; usage ;;
  esac
done

[ -n "$PREVIEW_URL" ] || { echo "--preview is required" >&2; usage; }
command -v curl >/dev/null 2>&1 || { echo "curl is required" >&2; exit 2; }

# Normalize: accept with or without scheme.
host_only() { echo "${1#https://}" | sed 's|^http://||' | sed 's|/.*$||'; }
PREVIEW_HOST="$(host_only "$PREVIEW_URL")"

failures=0
pass() { echo "  PASS  $1"; }
fail() { echo "  FAIL  $1"; failures=$((failures + 1)); }
info() { echo "  ..    $1"; }

scope_args=()
[ -n "$SCOPE" ] && scope_args=(--scope "$SCOPE")

echo "Deployment verification"
echo "  preview          : https://$PREVIEW_HOST"
[ -n "$PRODUCTION_ALIAS" ] && echo "  production alias : https://$(host_only "$PRODUCTION_ALIAS")"
echo

# ---------------------------------------------------------------------------
# 1. Deployment target. A preview must not report target: production.
# ---------------------------------------------------------------------------
echo "1. Deployment target"
if command -v vercel >/dev/null 2>&1; then
  target="$(vercel inspect "$PREVIEW_HOST" "${scope_args[@]}" 2>&1 \
    | awk '/^[[:space:]]*target[[:space:]]/ {print $2}' | head -1)"
  if [ -z "$target" ]; then
    fail "could not read target from 'vercel inspect' (not logged in, or deployment not found)"
  elif [ "$target" = "preview" ]; then
    pass "target is 'preview'"
  else
    fail "target is '$target' — expected 'preview'. A branch build must never be production."
  fi
else
  info "SKIP — vercel CLI not installed; cannot read deployment target"
fi

# ---------------------------------------------------------------------------
# 2. Production branch setting.
# ---------------------------------------------------------------------------
echo "2. Project production branch"
if [ -f .vercel/project.json ] && command -v python3 >/dev/null 2>&1; then
  token="$(python3 - <<'PY' 2>/dev/null || true
import json, os
for p in [os.path.expanduser('~/Library/Application Support/com.vercel.cli/auth.json'),
          os.path.expanduser('~/.config/vercel/auth.json')]:
    if os.path.exists(p):
        print(json.load(open(p)).get('token','')); break
PY
)"
  if [ -n "$token" ]; then
    org="$(python3 -c "import json;print(json.load(open('.vercel/project.json'))['orgId'])")"
    pid="$(python3 -c "import json;print(json.load(open('.vercel/project.json'))['projectId'])")"
    branch="$(curl -s -H "Authorization: Bearer $token" \
      "https://api.vercel.com/v9/projects/$pid?teamId=$org" \
      | python3 -c "import json,sys;print((json.load(sys.stdin).get('link') or {}).get('productionBranch') or '')" 2>/dev/null || true)"
    if [ "$branch" = "main" ]; then
      pass "productionBranch is 'main'"
    elif [ -z "$branch" ]; then
      fail "could not read productionBranch"
    else
      fail "productionBranch is '$branch' — expected 'main'"
    fi
  else
    info "SKIP — no Vercel auth token found locally"
  fi
else
  info "SKIP — no .vercel/project.json (project not linked here)"
fi

# ---------------------------------------------------------------------------
# 3. Preview access. Unauthenticated visitors must not receive the app.
# ---------------------------------------------------------------------------
echo "3. Preview access"
code="$(curl -s -o /dev/null -w '%{http_code}' "https://$PREVIEW_HOST" || echo 000)"
if [ "$code" = "401" ] || [ "$code" = "302" ] || [ "$code" = "307" ]; then
  pass "preview requires authentication (HTTP $code)"
elif [ "$code" = "200" ]; then
  fail "preview returned HTTP 200 to an unauthenticated request — it is publicly readable"
else
  fail "unexpected HTTP $code from preview"
fi

# ---------------------------------------------------------------------------
# 4. Production alias.
# ---------------------------------------------------------------------------
if [ -n "$PRODUCTION_ALIAS" ]; then
  echo "4. Production alias"
  alias_host="$(host_only "$PRODUCTION_ALIAS")"
  acode="$(curl -s -o /dev/null -w '%{http_code}' "https://$alias_host" || echo 000)"
  if [ "$EXPECT_ALIAS_INACTIVE" = "true" ]; then
    if [ "$acode" = "404" ] || [ "$acode" = "000" ]; then
      pass "production alias has no active deployment (HTTP $acode)"
    else
      fail "production alias returned HTTP $acode — a production deployment appears active"
    fi
  else
    if [ "$acode" = "200" ] || [ "$acode" = "401" ] || [ "$acode" = "302" ]; then
      pass "production alias is serving as expected (HTTP $acode)"
    else
      fail "production alias returned HTTP $acode"
    fi
  fi
fi

echo
if [ "$failures" -eq 0 ]; then
  echo "All deployment checks passed."
  exit 0
fi
echo "$failures check(s) FAILED."
exit 1
