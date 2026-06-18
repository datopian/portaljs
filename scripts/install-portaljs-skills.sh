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
RAW_BASE="https://raw.githubusercontent.com/datopian/portaljs/${REF}/.claude/commands"

# OSS skills only — excludes Gas Town internal commands (done/handoff/review).
# Keep in sync with the `commands` list in .claude-plugin/plugin.json.
# All skills carry a uniform `portaljs-` prefix. The bare old names are thin alias
# stubs kept for one minor release (back-compat) — installed too so existing
# `/deploy`-style invocations keep working this release. (`login` was removed.)
SKILLS="portaljs-architect portaljs-new-portal portaljs-add-dataset portaljs-add-resource portaljs-add-chart portaljs-add-map portaljs-connect-ckan portaljs-migrate portaljs-define-schema portaljs-deploy portaljs-check-data-quality architect new-portal add-dataset add-resource add-chart add-map connect-ckan migrate define-schema deploy check-data-quality"

# Detect a local checkout: this script lives in <repo>/scripts/, so the commands
# dir is ../.claude/commands relative to the script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" >/dev/null 2>&1 && pwd)"
LOCAL_COMMANDS="$SCRIPT_DIR/../.claude/commands"

mkdir -p "$DEST"

if [ -f "$LOCAL_COMMANDS/portaljs-new-portal.md" ]; then
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
