#!/usr/bin/env bash
# End-to-end check of the JWT-secured Giftless deployment against R2 (RS256, the
# same config as prod — giftless.yaml points at the portaljs-giftless bucket):
#   1. build + start the container
#   2. mint a client JWT (RS256) and run a full Git LFS round-trip (push -> R2 -> pull)
#   3. assert an UNAUTHENTICATED batch request is rejected (401/403)
#
# Prereqs: docker, git, git-lfs, python3 + 'cryptography', and R2 creds for the
# prod bucket. Reads creds from ~/.config/portaljs/giftless-r2-prod.env unless
# R2_ACCESS_KEY_ID is already set.
#
#   ./scripts/smoke-test.sh            # builds, tests, tears down
#   KEEP_UP=1 ./scripts/smoke-test.sh  # leave the container running afterward
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
HOST="http://localhost:8080"
ORG="datopian"
REPO="giftless-smoke"
PASS() { printf '  \033[32mPASS\033[0m %s\n' "$1"; }
FAIL() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; exit 1; }

# --- creds ---------------------------------------------------------------
if [[ -z "${R2_ACCESS_KEY_ID:-}" && -f "$HOME/.config/portaljs/giftless-r2-prod.env" ]]; then
  set -a; . "$HOME/.config/portaljs/giftless-r2-prod.env"; set +a
fi
: "${R2_ACCESS_KEY_ID:?need R2 creds (R2_ACCESS_KEY_ID)}"
export R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_ENDPOINT "${R2_REGION:=auto}"

# --- key + container -----------------------------------------------------
# Uses raw docker build/run (no compose plugin required); docker-compose.yml is
# the equivalent deploy path for humans.
IMAGE="portaljs/giftless-r2:latest"
NAME="giftless-smoke"
[[ -f jwt_private_key && -f jwt_public_key ]] || ./scripts/gen-rs256-keys.sh
echo "==> building image"
docker build -q -t "$IMAGE" . >/dev/null
echo "==> starting giftless"
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" -p 8080:5000 \
  -e AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
  -e AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
  -e R2_ENDPOINT="$R2_ENDPOINT" -e R2_REGION="$R2_REGION" \
  -v "$ROOT/jwt_public_key:/etc/giftless/jwt_public_key:ro" \
  -v "$ROOT/jwt_private_key:/etc/giftless/jwt_private_key:ro" \
  "$IMAGE" >/dev/null

TMP="$(mktemp -d)"
cleanup() {
  if [[ "${KEEP_UP:-}" != "1" ]]; then docker rm -f "$NAME" >/dev/null 2>&1 || true; fi
  rm -rf "$TMP"
}
trap cleanup EXIT

echo "==> waiting for server"
for i in $(seq 1 60); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$HOST/" || true)"
  [[ "$code" != "000" ]] && break
  sleep 1
done
[[ "$code" != "000" ]] && PASS "server reachable (HTTP $code)" || FAIL "server never came up"

# --- 1. unauthenticated batch must be rejected ---------------------------
echo "==> negative auth check"
NOAUTH="$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  "$HOST/$ORG/$REPO/objects/batch" \
  -H 'Accept: application/vnd.git-lfs+json' \
  -H 'Content-Type: application/vnd.git-lfs+json' \
  -d '{"operation":"download","transfers":["basic"],"objects":[{"oid":"0","size":0}]}')"
[[ "$NOAUTH" == "401" || "$NOAUTH" == "403" ]] \
  && PASS "no-token batch rejected (HTTP $NOAUTH)" \
  || FAIL "expected 401/403 without a token, got $NOAUTH"

# --- 2. LFS round-trip with a minted token -------------------------------
# Auth uses the JWT provider's HTTP Basic piggyback: username "_jwt", password =
# the token. git-lfs scopes credentials to the LFS API host only — it never sends
# them to the presigned R2 storage URL (which would 400 on a conflicting auth) and
# never clobbers the verify-action token. The committed .lfsconfig stays clean (no
# secret); creds live only in local .git/config.
echo "==> minting token + LFS round-trip"
TOKEN="$(python3 mint-token.py --org "$ORG" --repo "$REPO" --ttl 1800 \
  --algorithm RS256 --key-file jwt_private_key)"
CLEAN_URL="$HOST/$ORG/$REPO"
CRED_URL="http://_jwt:$TOKEN@localhost:8080/$ORG/$REPO"

git init --bare -q "$TMP/origin.git"
git -C "$TMP" init -q work
cd "$TMP/work"
git config user.email smoke@portaljs.test
git config user.name  smoke
git lfs install --local >/dev/null
git remote add origin "$TMP/origin.git"
git config -f .lfsconfig lfs.url "$CLEAN_URL"   # committed: clean, no token
git config lfs.url "$CRED_URL"                  # local only: carries the token
git lfs track "*.bin" >/dev/null

# 3 MB of random bytes so we can verify byte-exactness after pull.
head -c 3145728 /dev/urandom > data.bin
SRC_SHA="$(shasum -a 256 data.bin | awk '{print $1}')"
git add .gitattributes .lfsconfig data.bin
git commit -qm "smoke: add LFS data"
git push -q origin HEAD:refs/heads/main \
  && PASS "git push uploaded LFS object to R2 (incl. verify)" || FAIL "git push (LFS upload) failed"

# pointer (not bytes) is what git stored
git cat-file -p HEAD:data.bin | grep -q 'git-lfs' \
  && PASS "git stored an LFS pointer, not the bytes" \
  || FAIL "data.bin was not converted to an LFS pointer"

# committed .lfsconfig must not leak the token
git show HEAD:.lfsconfig | grep -q '_jwt:' \
  && FAIL "committed .lfsconfig leaked the token" \
  || PASS "committed .lfsconfig is clean (no token)"

# fresh clone + pull from R2
cd "$TMP"
git clone -q "$TMP/origin.git" fresh
cd fresh
git lfs install --local >/dev/null
git config lfs.url "$CRED_URL"
git lfs pull \
  && PASS "git lfs pull downloaded from R2" || FAIL "git lfs pull failed"
DST_SHA="$(shasum -a 256 data.bin | awk '{print $1}')"
[[ "$SRC_SHA" == "$DST_SHA" ]] \
  && PASS "round-trip byte-exact ($DST_SHA)" \
  || FAIL "sha mismatch: $SRC_SHA != $DST_SHA"

echo
echo "ALL CHECKS PASSED — JWT-secured Giftless ⇄ R2 staging works."
