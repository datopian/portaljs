#!/usr/bin/env bash
# Deploy the Giftless LFS host to Cloudflare Containers (PRODUCTION, po-g9y.11).
#
# Idempotent: pushes the four secrets, builds the container image, and deploys the
# fronting Worker. Re-running just rolls a new version. Reads PROD R2 creds from
# ~/.config/portaljs/giftless-r2-prod.env (or the env), and the RS256 keypair from
# ../jwt_private_key + ../jwt_public_key (generate with ../scripts/gen-rs256-keys.sh)
# unless GIFTLESS_JWT_PRIVATE_KEY / GIFTLESS_JWT_PUBLIC_KEY are already set.
#
#   cd giftless/cloudflare && ./scripts/deploy.sh
#
# After deploy the endpoint is https://giftless.<account>.workers.dev (and, once the
# DNS/ACM route in wrangler.jsonc is uncommented, https://lfs.portaljs.com).
set -euo pipefail
cd "$(dirname "$0")/.."

# --- creds ---------------------------------------------------------------
# PROD R2 token — a SEPARATE token scoped to the prod bucket (portaljs-giftless).
# The staging token (~/.config/portaljs/giftless-r2.env) is staging-bucket-scoped
# and returns AccessDenied on prod — do NOT reuse it.
if [[ -z "${R2_ACCESS_KEY_ID:-}" && -f "$HOME/.config/portaljs/giftless-r2-prod.env" ]]; then
  set -a; . "$HOME/.config/portaljs/giftless-r2-prod.env"; set +a
fi
: "${R2_ACCESS_KEY_ID:?need PROD R2 creds (R2_ACCESS_KEY_ID) — set env or ~/.config/portaljs/giftless-r2-prod.env (bead prereq #1)}"
: "${R2_SECRET_ACCESS_KEY:?need R2_SECRET_ACCESS_KEY (prod, scoped to portaljs-giftless)}"

# RS256 keypair: env wins, else the files gen-rs256-keys.sh writes.
if [[ -z "${GIFTLESS_JWT_PRIVATE_KEY:-}" ]]; then
  if [[ -f ../jwt_private_key ]]; then
    GIFTLESS_JWT_PRIVATE_KEY="$(cat ../jwt_private_key)"
  else
    echo "no RS256 private key: set GIFTLESS_JWT_PRIVATE_KEY or run ../scripts/gen-rs256-keys.sh" >&2; exit 1
  fi
fi
if [[ -z "${GIFTLESS_JWT_PUBLIC_KEY:-}" ]]; then
  if [[ -f ../jwt_public_key ]]; then
    GIFTLESS_JWT_PUBLIC_KEY="$(cat ../jwt_public_key)"
  else
    echo "no RS256 public key: set GIFTLESS_JWT_PUBLIC_KEY or run ../scripts/gen-rs256-keys.sh" >&2; exit 1
  fi
fi

[[ -d node_modules ]] || npm install

# --- secrets (Worker env → injected into the container by src/index.ts) --
echo "==> pushing secrets"
printf '%s' "$R2_ACCESS_KEY_ID"         | npx wrangler secret put R2_ACCESS_KEY_ID
printf '%s' "$R2_SECRET_ACCESS_KEY"     | npx wrangler secret put R2_SECRET_ACCESS_KEY
printf '%s' "$GIFTLESS_JWT_PUBLIC_KEY"  | npx wrangler secret put GIFTLESS_JWT_PUBLIC_KEY
printf '%s' "$GIFTLESS_JWT_PRIVATE_KEY" | npx wrangler secret put GIFTLESS_JWT_PRIVATE_KEY

# --- build image + deploy Worker ----------------------------------------
echo "==> deploying"
npx wrangler deploy

echo
echo "Deployed. Endpoint: https://giftless.<account>.workers.dev"
echo "Verify end-to-end:  ./scripts/smoke-remote.sh https://giftless.<account>.workers.dev"
