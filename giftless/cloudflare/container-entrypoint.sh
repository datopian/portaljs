#!/bin/sh
# Cloudflare Containers entrypoint for Giftless.
#
# CF Containers pass secrets as env vars, not mounted files — but Giftless's JWT
# provider wants a key *file* (private_key_file: /etc/giftless/jwt_key in
# giftless.yaml). So materialize that file from $GIFTLESS_JWT_KEY, then hand off to
# uwsgi. The key is a single-line base64 string (scripts/gen-key.sh), safe to round
# trip through an env var — `printf %s` writes it with no trailing newline, exactly
# as the file-based deploy expects.
set -eu

: "${GIFTLESS_JWT_KEY:?GIFTLESS_JWT_KEY not set — wire it with: wrangler secret put GIFTLESS_JWT_KEY}"

mkdir -p /etc/giftless
printf '%s' "$GIFTLESS_JWT_KEY" > /etc/giftless/jwt_key
chmod 600 /etc/giftless/jwt_key

# Same uwsgi invocation as ./Dockerfile's CMD: plain HTTP on :5000 behind the edge.
exec uwsgi --http 0.0.0.0:5000 --pythonpath /app \
  --module giftless.wsgi_entrypoint --callable app \
  --manage-script-name -M -T --threads 2 -p 2
