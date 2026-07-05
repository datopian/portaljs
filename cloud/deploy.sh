#!/usr/bin/env bash
#
# PortalJS Arc deploy wrapper — schema-before-code guard (po-3kq).
#
# Prod-blocking bug hit twice: a worker shipped code that queried a new D1 table/column
# whose migration wasn't applied to the target DB yet → runtime 1101/500 (po-5vs, po-jwn).
# Migrations apply SEPARATELY from `wrangler deploy`, so it's easy to deploy code ahead of
# its schema. This wrapper makes that impossible: it ALWAYS applies pending D1 migrations
# BEFORE deploying the worker, and aborts the deploy if the migration step fails.
#
# All three Arc workers (auth, api, worker/router) share ONE D1 database per environment
# (portaljs-arc-staging / portaljs-arc). The migrations live in cloud/api/migrations and are
# the single source of truth for that shared schema. `d1 migrations apply` is idempotent —
# only unapplied migrations run — so applying before every worker deploy is safe and cheap.
#
# Usage:
#   cloud/deploy.sh <worker> <env> [--check]
#     worker : auth | api | worker
#     env    : staging | production
#     --check: DO NOT deploy. List pending migrations on the target DB and exit non-zero if
#              any are pending (use in CI to block merges that outrun the deployed schema).
#
# Examples:
#   cloud/deploy.sh api production        # apply migrations to portaljs-arc, then deploy arc-api
#   cloud/deploy.sh auth staging          # apply to portaljs-arc-staging, then deploy arc-auth-staging
#   cloud/deploy.sh api production --check # CI: fail if portaljs-arc has unapplied migrations
#
# Or via npm from a worker dir: `npm run deploy:prod` / `npm run deploy:staging`.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Pin the Cloudflare account. The workers login has TWO accounts; a bare wrangler call is
# ambiguous in non-interactive shells and picks the wrong one / errors out (po-3kq gotcha).
# Matches account_id in every cloud/*/wrangler.toml.
export CLOUDFLARE_ACCOUNT_ID="83025b28472d6aa2bf5ae59f3724aa78"

WORKER="${1:-}"
ENV="${2:-}"
MODE="${3:-deploy}"

usage() {
  echo "usage: cloud/deploy.sh <auth|api|worker> <staging|production> [--check]" >&2
  exit 2
}

case "$WORKER" in
  auth|api|worker) ;;
  *) echo "error: unknown worker '$WORKER'" >&2; usage ;;
esac

case "$ENV" in
  staging)    DB="portaljs-arc-staging"; ENV_FLAG=() ;;
  production) DB="portaljs-arc";         ENV_FLAG=(--env production) ;;
  *) echo "error: unknown env '$ENV'" >&2; usage ;;
esac

case "$MODE" in
  deploy|--check) ;;
  *) echo "error: unknown mode '$MODE'" >&2; usage ;;
esac

API_DIR="$SCRIPT_DIR/api"       # owns migrations/ — the shared-schema source of truth
WORKER_DIR="$SCRIPT_DIR/$WORKER"

# Run wrangler from a given worker dir so it reads that dir's wrangler.toml.
run_wrangler() {
  local dir="$1"; shift
  ( cd "$dir" && npx wrangler "$@" )
}

if [ "$MODE" = "--check" ]; then
  echo "▸ Checking for unapplied D1 migrations on $DB ($ENV)…"
  out="$(run_wrangler "$API_DIR" d1 migrations list "$DB" --remote 2>&1)" || {
    echo "$out" >&2
    echo "✗ Could not list migrations on $DB." >&2
    exit 1
  }
  echo "$out"
  # wrangler prints "No migrations to apply!" when the DB is up to date.
  if echo "$out" | grep -qi "No migrations to apply"; then
    echo "✓ $DB is up to date — no pending migrations."
    exit 0
  fi
  echo "✗ $DB has UNAPPLIED migrations (above). Apply them before deploying:" >&2
  echo "    cloud/deploy.sh $WORKER $ENV" >&2
  exit 1
fi

echo "▸ Arc deploy — worker=$WORKER env=$ENV db=$DB"

# 1. Migrations BEFORE deploy. Aborts (set -e) if apply fails, so code never ships ahead
#    of its schema. Idempotent — a no-op when the DB is already current.
echo "▸ Applying pending D1 migrations to $DB (shared by auth/api/worker)…"
run_wrangler "$API_DIR" d1 migrations apply "$DB" --remote

# 2. Deploy the worker only after the schema is guaranteed current.
echo "▸ Deploying $WORKER worker ($ENV)…"
run_wrangler "$WORKER_DIR" deploy "${ENV_FLAG[@]}"

echo "✓ Deployed $WORKER to $ENV (migrations current on $DB)."
