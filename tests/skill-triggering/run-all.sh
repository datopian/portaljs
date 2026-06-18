#!/usr/bin/env bash
# Run every skill-triggering test and summarize. See run-test.sh for details.
# Usage: ./run-all.sh
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPTS="$SCRIPT_DIR/prompts"

# One entry per shipped skill (.claude/commands/*.md).
SKILLS=(
  portaljs-architect
  portaljs-new-portal
  portaljs-add-dataset
  portaljs-add-resource
  portaljs-add-chart
  portaljs-add-map
  portaljs-connect-ckan
  portaljs-define-schema
  portaljs-deploy
  portaljs-check-data-quality
)

echo "=== PortalJS skill-triggering tests ==="
PASS=0; FAIL=0; FAILED=()
for skill in "${SKILLS[@]}"; do
  prompt="$PROMPTS/${skill}.txt"
  if [ ! -f "$prompt" ]; then
    echo "❌ FAIL $skill (no prompt file — every shipped skill needs one)"
    FAIL=$((FAIL+1)); FAILED+=("$skill")
    continue
  fi
  if "$SCRIPT_DIR/run-test.sh" "$skill" "$prompt"; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1)); FAILED+=("$skill")
  fi
  echo ""
done

echo "=== Summary: $PASS passed, $FAIL failed ==="
[ "$FAIL" -gt 0 ] && { echo "Failed: ${FAILED[*]}"; exit 1; }
exit 0
