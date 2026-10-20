#!/usr/bin/env bash
# Install PortalJS agentic skills into your personal Claude Code commands dir.
#
# Usage:
#   # From a clone of the repo (copies local files):
#   ./scripts/install-portaljs-skills.sh
#
#   # From anywhere (downloads from GitHub):
#   curl -fsSL https://raw.githubusercontent.com/datopian/portaljs/main/scripts/install-portaljs-skills.sh | bash
#
# Env overrides:
#   CLAUDE_COMMANDS_DIR   target dir (default: $HOME/.claude/commands)
#   PORTALJS_SKILLS_REF   git ref to download from when remote (default: main)
#
# Idempotent: re-running overwrites the installed skill files in place.
set -euo pipefail

REF="${PORTALJS_SKILLS_REF:-main}"
DEST="${CLAUDE_COMMANDS_DIR:-$HOME/.claude/commands}"
RAW_REPO="https://raw.githubusercontent.com/datopian/portaljs/${REF}"
RAW_BASE="$RAW_REPO/.claude/commands"

# OSS skills only — excludes Gas Town internal commands (done/handoff/review).
# The canonical skill names are read from the `commands` array of
# .claude-plugin/plugin.json, the single source of truth (create-portaljs reads
# it too), so this installer can't drift from the plugin.
# The bare old names below are thin alias stubs kept for one minor release
# (back-compat) — installed too so existing `/deploy`-style invocations keep
# working this release. (`login` was removed.)
ALIASES="architect new-portal add-dataset add-resource add-chart add-map connect-ckan migrate define-schema deploy check-data-quality"

# `"./.claude/commands/<name>.md"` entries of plugin.json -> `<name>`, one per line.
# Plain grep/sed so the installer doesn't need jq.
skill_names() {
  { grep -o '\.claude/commands/[a-z0-9-]*\.md' || true; } |
    sed -e 's#^\.claude/commands/##' -e 's#\.md$##'
}

# Detect a local checkout: this script lives in <repo>/scripts/, so the commands
# dir is ../.claude/commands relative to the script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" >/dev/null 2>&1 && pwd)"
LOCAL_COMMANDS="$SCRIPT_DIR/../.claude/commands"
LOCAL_PLUGIN="$SCRIPT_DIR/../.claude-plugin/plugin.json"

if [ -f "$LOCAL_COMMANDS/portaljs-new-portal.md" ] && [ -f "$LOCAL_PLUGIN" ]; then
  MODE=local
  CANONICAL="$(skill_names < "$LOCAL_PLUGIN")"
else
  MODE=remote
  if ! MANIFEST="$(curl -fsSL "$RAW_REPO/.claude-plugin/plugin.json")"; then
    echo "error: could not download .claude-plugin/plugin.json from github.com/datopian/portaljs@$REF" >&2
    exit 1
  fi
  CANONICAL="$(printf '%s\n' "$MANIFEST" | skill_names)"
fi

if [ -z "$CANONICAL" ]; then
  echo "error: no skills found in the 'commands' list of .claude-plugin/plugin.json" >&2
  exit 1
fi

# Word-split on whitespace: names are [a-z0-9-] only.
SKILLS="$(echo $CANONICAL $ALIASES)"

mkdir -p "$DEST"

if [ "$MODE" = local ]; then
  echo "Installing PortalJS skills from local checkout -> $DEST"
  for s in $SKILLS; do
    cp "$LOCAL_COMMANDS/$s.md" "$DEST/$s.md"
    echo "  + $s.md"
  done
else
  echo "Installing PortalJS skills from github.com/datopian/portaljs@$REF -> $DEST"
  for s in $SKILLS; do
    curl -fsSL "$RAW_BASE/$s.md" -o "$DEST/$s.md"
    echo "  + $s.md"
  done
fi

echo ""
echo "Done. Installed: $SKILLS"
echo "Restart Claude Code (or open a new session) and run /portaljs-new-portal to start."
