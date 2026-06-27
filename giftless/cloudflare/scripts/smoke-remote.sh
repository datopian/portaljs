#!/usr/bin/env bash
# Live end-to-end check of the DEPLOYED Giftless host (Cloudflare Containers).
# Same contract as ../scripts/smoke-test.sh, but against the live HTTPS endpoint
# instead of a local docker container — plus a cold-start measurement (the bead's
# open CAVEAT: how slow is the first request after the container scales to zero?).
#
#   ./scripts/smoke-remote.sh                       # uses the workers.dev URL
#   GIFTLESS_URL=https://lfs.portaljs.com ./scripts/smoke-remote.sh
#
# Needs: git, git-lfs, python3, the 'cryptography' package, and the RS256 PRIVATE
# key (../jwt_private_key or $GIFTLESS_JWT_PRIVATE_KEY) to mint client tokens. The
# key must be the signer whose PUBLIC half is deployed as GIFTLESS_JWT_PUBLIC_KEY.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

URL="${GIFTLESS_URL:-${1:-}}"
if [[ -z "$URL" ]]; then
  # Derive the default workers.dev URL from `wrangler whoami`'s account subdomain
  # if discoverable; otherwise require it explicitly.
  echo "set GIFTLESS_URL (e.g. https://giftless.<account>.workers.dev or https://lfs.portaljs.com)" >&2
  exit 1
fi
URL="${URL%/}"
ORG="datopian"; REPO="giftless-smoke-remote"
PASS() { printf '  \033[32mPASS\033[0m %s\n' "$1"; }
FAIL() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; exit 1; }

# RS256 private key (to mint client tokens). Its public half must equal the
# deployed GIFTLESS_JWT_PUBLIC_KEY secret. mint-token signs with --algorithm RS256.
MINT_ARGS=(--algorithm RS256)
if [[ -n "${GIFTLESS_JWT_PRIVATE_KEY:-}" ]]; then
  printf '%s' "$GIFTLESS_JWT_PRIVATE_KEY" > "$ROOT/.jwt_key.tmp"
  MINT_ARGS+=(--key-file "$ROOT/.jwt_key.tmp")
  trap 'rm -f "$ROOT/.jwt_key.tmp"' EXIT
elif [[ -f ../jwt_private_key ]]; then
  MINT_ARGS+=(--key-file ../jwt_private_key)
else
  FAIL "no RS256 private key: set GIFTLESS_JWT_PRIVATE_KEY or provide ../jwt_private_key"
fi

# --- cold-start measurement ---------------------------------------------
# The container scales to zero after `sleepAfter`. The first request wakes it; we
# time an authenticated batch call (cheap — no bytes move) and report it. A second
# (warm) call gives the steady-state baseline for contrast.
echo "==> cold-start probe (authenticated batch)"
TOKEN="$(python3 ../mint-token.py --org "$ORG" --repo "$REPO" --ttl 1800 "${MINT_ARGS[@]}")"
batch() {
  curl -s -o /dev/null -w '%{http_code} %{time_total}s' -X POST \
    "$URL/$ORG/$REPO/objects/batch" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Accept: application/vnd.git-lfs+json' \
    -H 'Content-Type: application/vnd.git-lfs+json' \
    -d '{"operation":"download","transfers":["basic"],"objects":[{"oid":"0000000000000000000000000000000000000000000000000000000000000000","size":1}]}'
}
COLD="$(batch)"; echo "  cold:  $COLD"
WARM="$(batch)"; echo "  warm:  $WARM"
PASS "endpoint responding (cold=$COLD warm=$WARM)"

# --- negative auth -------------------------------------------------------
echo "==> negative auth check"
NOAUTH="$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  "$URL/$ORG/$REPO/objects/batch" \
  -H 'Accept: application/vnd.git-lfs+json' \
  -H 'Content-Type: application/vnd.git-lfs+json' \
  -d '{"operation":"download","transfers":["basic"],"objects":[{"oid":"0","size":0}]}')"
[[ "$NOAUTH" == "401" || "$NOAUTH" == "403" ]] \
  && PASS "no-token batch rejected (HTTP $NOAUTH)" \
  || FAIL "expected 401/403 without a token, got $NOAUTH"

# --- full LFS round-trip -------------------------------------------------
echo "==> minting token + LFS round-trip"
CRED_URL="https://_jwt:$TOKEN@${URL#https://}/$ORG/$REPO"
CLEAN_URL="$URL/$ORG/$REPO"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"; rm -f "$ROOT/.jwt_key.tmp"' EXIT

git init --bare -q "$TMP/origin.git"
git -C "$TMP" init -q work
cd "$TMP/work"
git config user.email smoke@portaljs.test; git config user.name smoke
git lfs install --local >/dev/null
git remote add origin "$TMP/origin.git"
git config -f .lfsconfig lfs.url "$CLEAN_URL"
git config lfs.url "$CRED_URL"
git lfs track "*.bin" >/dev/null
head -c 3145728 /dev/urandom > data.bin
SRC_SHA="$(shasum -a 256 data.bin | awk '{print $1}')"
git add .gitattributes .lfsconfig data.bin
git commit -qm "smoke: add LFS data"
git push -q origin HEAD:refs/heads/main \
  && PASS "git push uploaded LFS object to R2 (incl. verify)" || FAIL "git push (LFS upload) failed"

cd "$TMP"; git clone -q "$TMP/origin.git" fresh; cd fresh
git lfs install --local >/dev/null
git config lfs.url "$CRED_URL"
git lfs pull && PASS "git lfs pull downloaded from R2" || FAIL "git lfs pull failed"
DST_SHA="$(shasum -a 256 data.bin | awk '{print $1}')"
[[ "$SRC_SHA" == "$DST_SHA" ]] \
  && PASS "round-trip byte-exact ($DST_SHA)" || FAIL "sha mismatch"

echo
echo "ALL CHECKS PASSED — live Giftless ⇄ R2 round-trip works (cold=$COLD warm=$WARM)."
