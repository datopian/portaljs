#!/usr/bin/env bash
#
# scripts/verify-selftest.sh — tests the one property scripts/verify.sh must never lose:
#
#   an empty run is a FAILURE, not a pass.
#
# po-mz4 was a merge gate that reported success because it had no command to run.
# The fix is only worth anything while verify.sh keeps refusing to do the same, so
# that refusal is tested rather than trusted. Runs as part of the `lint` stage.
#
# Cases:
#   1. a normal stage list is accepted          (parses, does not error out early)
#   2. an unknown stage exits 2                 (a typo in gate config is not a pass)
#   3. a run that executes 0 commands exits 3   (the core guard)
#   4. the install skip is decided by verifying the tree, not by comparing mtimes
#      (po-agh — a skipped install must mean a checked one; behaviour of the check
#      itself is covered by scripts/check-install-selftest.mjs)
#
# Case 3 needs a verify.sh that reaches the end having run nothing, which the real
# script will never do. It is produced by stripping the stage-dispatch line — tagged
# `# selftest:dispatch` in verify.sh — from a throwaway copy.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERIFY="$ROOT/scripts/verify.sh"

fails=0
check() { # check <description> <expected-status> <actual-status>
  if [ "$2" = "$3" ]; then
    printf '  ✓ %s (exit %s)\n' "$1" "$3"
  else
    printf '  ✗ %s — expected exit %s, got %s\n' "$1" "$2" "$3" >&2
    fails=$((fails + 1))
  fi
}

printf 'verify.sh self-test\n'

bash -n "$VERIFY"
check "verify.sh parses" 0 "$?"

bash "$VERIFY" --this-is-not-a-stage >/dev/null 2>&1
check "unknown stage is rejected" 2 "$?"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
stub="$tmp/verify-empty.sh"
grep -v '# selftest:dispatch' "$VERIFY" > "$stub"

if ! grep -q 'selftest:dispatch' "$VERIFY"; then
  printf '  ✗ verify.sh has no `# selftest:dispatch` marker — the empty-run case cannot be built\n' >&2
  fails=$((fails + 1))
elif [ "$(wc -l < "$stub")" -ge "$(wc -l < "$VERIFY")" ]; then
  printf '  ✗ stub is not smaller than verify.sh — the dispatch line was not stripped\n' >&2
  fails=$((fails + 1))
else
  # `setup` alone: the implicit-setup path is skipped and, with dispatch stripped,
  # nothing else runs — so the run ends having executed 0 commands.
  bash "$stub" setup >/dev/null 2>&1
  check "a run that executes nothing FAILS" 3 "$?"
fi

if grep -q 'package-lock.json" -nt' "$VERIFY"; then
  printf '  ✗ install() compares mtimes again — that cannot detect a pruned tree (po-agh)\n' >&2
  fails=$((fails + 1))
elif ! grep -q 'check-install.mjs' "$VERIFY"; then
  printf '  ✗ install() no longer verifies the tree against the lockfile (po-agh)\n' >&2
  fails=$((fails + 1))
else
  printf '  ✓ install skip is verified against the lockfile, not mtimes\n'
fi

if [ "$fails" -gt 0 ]; then
  printf '✖ verify.sh self-test FAILED (%d case(s))\n' "$fails" >&2
  exit 1
fi
printf '✓ verify.sh self-test passed\n'
