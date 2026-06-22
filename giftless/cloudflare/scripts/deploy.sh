#!/usr/bin/env bash
# Deploy the Giftless LFS host to Cloudflare Containers (staging).
#
# Idempotent: pushes the three secrets (only if a key exists locally), builds the
# container image, and deploys the fronting Worker. Re-running just rolls a new
# version. Reads R2 creds from ~/.config/portaljs/giftless-r2.env (or the env), and
# the JWT key from ../jwt_key (generate with ../scripts/gen-key.sh) unless
# GIFTLESS_JWT_KEY is already set.
#
#   cd giftless/cloudflare && ./scripts/deploy.sh
#
# After deploy the endpoint is https://giftless-staging.<account>.workers.dev.
set -euo pipefail
cd "$(dirname "$0")/.."

# --- creds ---------------------------------------------------------------
if [[ -z "${R2_ACCESS_KEY_ID:-}" && -f "$HOME/.config/portaljs/giftless-r2.env" ]]; then
  set -a; . "$HOME/.config/portaljs/giftless-r2.env"; set +a
fi
: "${R2_ACCESS_KEY_ID:?need R2 creds (R2_ACCESS_KEY_ID) — set env or ~/.config/portaljs/giftless-r2.env}"
: "${R2_SECRET_ACCESS_KEY:?need R2_SECRET_ACCESS_KEY}"

# JWT signing key: env wins, else the file the compose deploy uses.
if [[ -z "${GIFTLESS_JWT_KEY:-}" ]]; then
  if [[ -f ../jwt_key ]]; then
    GIFTLESS_JWT_KEY="$(cat ../jwt_key)"
  else
    echo "no JWT key: set GIFTLESS_JWT_KEY or run ../scripts/gen-key.sh" >&2; exit 1
  fi
fi

[[ -d node_modules ]] || npm install

# --- secrets (Worker env → injected into the container by src/index.ts) --
echo "==> pushing secrets"
printf '%s' "$R2_ACCESS_KEY_ID"     | npx wrangler secret put R2_ACCESS_KEY_ID
printf '%s' "$R2_SECRET_ACCESS_KEY" | npx wrangler secret put R2_SECRET_ACCESS_KEY
printf '%s' "$GIFTLESS_JWT_KEY"     | npx wrangler secret put GIFTLESS_JWT_KEY

# --- build image + deploy Worker ----------------------------------------
echo "==> deploying"
npx wrangler deploy

echo
echo "Deployed. Endpoint: https://giftless-staging.<account>.workers.dev"
echo "Verify end-to-end:  ./scripts/smoke-remote.sh"
