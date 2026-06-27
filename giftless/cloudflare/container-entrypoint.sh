#!/bin/sh
# Cloudflare Containers entrypoint for Giftless (PRODUCTION, RS256 — po-g9y.11).
#
# CF Containers pass secrets as env vars, not mounted files — but Giftless's JWT
# provider wants key *files* (public_key_file / private_key_file in giftless.yaml).
# So materialize both PEM files from their secrets, then hand off to uwsgi.
#
#   GIFTLESS_JWT_PUBLIC_KEY  -> /etc/giftless/jwt_public_key   (verify all tokens)
#   GIFTLESS_JWT_PRIVATE_KEY -> /etc/giftless/jwt_private_key  (sign verify callbacks)
#
# These are multi-line PEM blocks (scripts/gen-rs256-keys.sh). An env var preserves
# the newlines and `printf %s` writes them verbatim — no trailing newline added.
set -eu

: "${GIFTLESS_JWT_PUBLIC_KEY:?GIFTLESS_JWT_PUBLIC_KEY not set — wire it with: wrangler secret put GIFTLESS_JWT_PUBLIC_KEY}"
: "${GIFTLESS_JWT_PRIVATE_KEY:?GIFTLESS_JWT_PRIVATE_KEY not set — wire it with: wrangler secret put GIFTLESS_JWT_PRIVATE_KEY}"

mkdir -p /etc/giftless
printf '%s' "$GIFTLESS_JWT_PUBLIC_KEY"  > /etc/giftless/jwt_public_key
printf '%s' "$GIFTLESS_JWT_PRIVATE_KEY" > /etc/giftless/jwt_private_key
chmod 600 /etc/giftless/jwt_public_key /etc/giftless/jwt_private_key

# Same uwsgi invocation as ./Dockerfile's CMD: plain HTTP on :5000 behind the edge.
exec uwsgi --http 0.0.0.0:5000 --pythonpath /app \
  --module giftless.wsgi_entrypoint --callable app \
  --manage-script-name -M -T --threads 2 -p 2
