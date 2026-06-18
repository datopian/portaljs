#!/usr/bin/env bash
# Skill-triggering test: does a NAIVE prompt (one that never names the skill)
# make Claude fire the expected PortalJS skill?
#
# Usage: ./run-test.sh <skill-name> <prompt-file> [max-turns]
# Example: ./run-test.sh portaljs-new-portal ./prompts/portaljs-new-portal.txt
#
# Requires: the `claude` CLI on PATH and an ANTHROPIC_API_KEY.
# Set CLAUDE_MODEL to test triggering on a specific model (e.g. a small one).
set -euo pipefail

SKILL_NAME="${1:-}"
PROMPT_FILE="${2:-}"
MAX_TURNS="${3:-2}"

if [ -z "$SKILL_NAME" ] || [ -z "$PROMPT_FILE" ]; then
  echo "Usage: $0 <skill-name> <prompt-file> [max-turns]"
  exit 2
fi
if [ ! -f "$PROMPT_FILE" ]; then
  echo "Prompt file not found: $PROMPT_FILE"; exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# repo root is two levels up from tests/skill-triggering
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

PROMPT="$(cat "$PROMPT_FILE")"
OUT_DIR="$(mktemp -d)"          # isolate the FS: these skills scaffold/write files
LOG="$OUT_DIR/claude-output.json"

MODEL_ARGS=()
[ -n "${CLAUDE_MODEL:-}" ] && MODEL_ARGS=(--model "$CLAUDE_MODEL")

echo "=== Skill-triggering: $SKILL_NAME (max-turns=$MAX_TURNS${CLAUDE_MODEL:+, model=$CLAUDE_MODEL}) ==="

# Run headless from the throwaway dir; load the PortalJS skills via --plugin-dir.
# Low --max-turns: we only need the Skill tool-call to appear in the transcript,
# not for the skill to finish (some skills deploy/install).
( cd "$OUT_DIR" && timeout 300 claude -p "$PROMPT" \
    --plugin-dir "$REPO_ROOT" \
    --dangerously-skip-permissions \
    --max-turns "$MAX_TURNS" \
    --output-format stream-json \
    "${MODEL_ARGS[@]}" > "$LOG" 2>&1 ) || true

# Match "skill":"portaljs-new-portal" or "skill":"portaljs:portaljs-new-portal" — but only on a
# line that is also the Skill tool-call, so the two fragments can't satisfy the
# check from different stream-json events. (stream-json = one JSON record/line.)
SKILL_PATTERN='"skill":"([^"]*:)?'"${SKILL_NAME}"'"'
if grep -E '"name":"Skill"' "$LOG" | grep -qE "$SKILL_PATTERN"; then
  echo "✅ PASS: '$SKILL_NAME' triggered"
  RESULT=0
else
  echo "❌ FAIL: '$SKILL_NAME' did NOT trigger"
  RESULT=1
fi

echo "Skills triggered this run:"
grep -oE '"skill":"[^"]*"' "$LOG" 2>/dev/null | sort -u | sed 's/^/  /' || echo "  (none)"
echo "Log: $LOG"
exit $RESULT
