#!/usr/bin/env bash
# Apply the data-bucket CORS policy (giftless/r2-cors.json) to an R2 bucket so
# browsers can do cross-origin HTTP range fetches against served data — the
# foundation for the DuckDB-Wasm-over-Parquet query tier (epic po-g9y).
#
# R2 bucket-level CORS is an account operation: the object-scoped R2 token used
# by Giftless CANNOT set it (PutBucketCors -> AccessDenied). This uses wrangler
# (account-authenticated). Run `wrangler login` first if needed.
#
# Usage: ./scripts/set-r2-cors.sh [bucket-name]
#   bucket-name defaults to $R2_BUCKET, then portaljs-giftless (prod, po-g9y.11).
set -euo pipefail

cd "$(dirname "$0")/.."
BUCKET="${1:-${R2_BUCKET:-portaljs-giftless}}"

echo "Setting CORS on R2 bucket: $BUCKET (from r2-cors.json)"
wrangler r2 bucket cors set "$BUCKET" --file r2-cors.json --force
echo
wrangler r2 bucket cors list "$BUCKET"
