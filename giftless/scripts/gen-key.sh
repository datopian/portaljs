#!/usr/bin/env bash
# Generate the HS256 signing key Giftless uses to verify (and self-sign verify)
# tokens. Writes ./jwt_key next to docker-compose.yml. Idempotent: refuses to
# clobber an existing key so you don't invalidate live tokens by accident.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -f jwt_key ]]; then
  echo "jwt_key already exists — refusing to overwrite. Delete it to rotate." >&2
  exit 1
fi
# 48 random bytes, base64 -> a strong shared secret. No trailing newline.
openssl rand -base64 48 | tr -d '\n' > jwt_key
chmod 600 jwt_key
echo "Wrote $(pwd)/jwt_key (600). Keep it secret; it is the staging LFS auth key."
