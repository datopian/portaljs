#!/usr/bin/env bash
# Generate the RS256 keypair Giftless uses in PRODUCTION (po-g9y.11).
#
# Production hardens the staging HS256 single-shared-secret (scripts/gen-key.sh)
# into asymmetric RS256. ONE keypair is used (see giftless.yaml + cloudflare/README
# "Go-live"): Giftless verifies every incoming token with the PUBLIC key — both the
# client tokens minted by the issuer (Arc/CI) AND its own short-lived verify
# callbacks — and signs those verify callbacks with the PRIVATE key.
#
# Why a single keypair and not the "separate verify keypair" the bead body floated:
# giftless's auth chain aborts on the FIRST provider that rejects a token's
# signature (it does not fall through to a second provider — see giftless
# giftless/auth/__init__.py). Two keypairs on one auth path therefore cannot
# coexist; one keypair, verified by one public key, is the only stock-giftless
# config that authenticates both client tokens and verify callbacks.
#
# Custody (human decision, bead prereq #3): the PRIVATE key is the signer. It must
# live (a) on the token issuer — the Arc API / CI — to mint client tokens, and
# (b) as the GIFTLESS_JWT_PRIVATE_KEY Worker secret so the container can sign its
# verify callbacks. A Giftless host compromise therefore leaks the signer — this
# is the accepted trade-off ("store PRIVATE signer as a wrangler secret"). Rotate
# by re-running this (delete the old keys first) and re-pushing the secrets.
#
# Writes ../jwt_private_key and ../jwt_public_key (both gitignored, 600).
# Idempotent: refuses to clobber existing keys so you don't invalidate live tokens.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f jwt_private_key || -f jwt_public_key ]]; then
  echo "jwt_private_key / jwt_public_key already exist — refusing to overwrite." >&2
  echo "Delete both to rotate (this invalidates every token signed by the old key)." >&2
  exit 1
fi

# RSA-2048 is the floor for RS256; 3072 gives more headroom for a long-lived
# signer at negligible cost. PKCS#8 PEM for the private key, SPKI PEM for public.
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out jwt_private_key
openssl pkey -in jwt_private_key -pubout -out jwt_public_key
chmod 600 jwt_private_key jwt_public_key

echo "Wrote $(pwd)/jwt_private_key (600) — the SIGNER. Give it to the issuer (Arc/CI)"
echo "                                     and push as GIFTLESS_JWT_PRIVATE_KEY."
echo "Wrote $(pwd)/jwt_public_key  (600) — the VERIFIER. Push as GIFTLESS_JWT_PUBLIC_KEY."
echo
echo "Next: cd cloudflare && ./scripts/deploy.sh   (pushes both as Worker secrets)"
