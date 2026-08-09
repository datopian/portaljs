#!/usr/bin/env bash
#
# scripts/verify.sh — the verification entry point for this repo.
#
# This is what the merge gate runs. Before it existed the gate had no command to
# execute and therefore passed without checking anything (po-mz4), so the one
# rule this script must never break is:
#
#   an empty run is a FAILURE, not a pass.
#
# Every stage asserts it actually executed at least one command. A stage that
# finds nothing to do exits non-zero rather than reporting success.
#
# Usage:
#   scripts/verify.sh                     # all stages, in order
#   scripts/verify.sh typecheck test      # only these stages
#   scripts/verify.sh --list              # show the stages
#
# Stages:
#   setup       install root workspace + cloud service deps, skipping an install
#               only when the tree is verified against its lockfile (po-agh)
#   lint        eslint (@portaljs/ckan) + generated-docs drift + this script's
#               own self-test (scripts/verify-selftest.sh)
#   typecheck   tsc --noEmit for each cloud service
#   test        vitest for each cloud service
#   build       build the three published @portaljs/* packages
#
# Deliberately NOT gated here (each needs something the gate cannot assume):
#   packages/ckan-api-client-js `npm test`  — mocha against a live CKAN instance
#                                             (needs network + a DMS URL)
#   site/ and examples/portaljs-catalog     — separate lockfiles + a full
#     builds, plus `check-export`             next build; the slow path, covered
#                                             by .github/workflows/ci.yml
#   cloud/*/migrations:check:prod           — needs CLOUDFLARE_API_TOKEN (po-mdd)
#
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1

CLOUD_SERVICES=(api auth worker)
PACKAGES=(ckan-api-client-js core ckan)
ALL_STAGES=(setup lint typecheck test build)

ran=0        # commands actually executed across this whole run
failures=()  # human-readable labels of what failed

log()  { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
warn() { printf '\033[33m! %s\033[0m\n' "$*"; }

# run <label> <dir> <cmd...> — execute, record, keep going on failure so one run
# reports every problem instead of only the first.
run() {
  local label="$1" dir="$2"
  shift 2
  printf '\033[2m$ (%s) %s\033[0m\n' "$dir" "$*"
  ran=$((ran + 1))
  if ! (cd "$dir" && "$@"); then
    failures+=("$label")
    warn "FAILED: $label"
    return 1
  fi
  return 0
}

# install <dir> — npm ci, skipped only when the installed tree is VERIFIED against
# the lockfile by scripts/check-install.mjs. Counts as a command either way: a
# skipped install is a satisfied dependency, not an unverified one — which is only
# true if something checked.
#
# This used to compare mtimes (`package-lock.json -nt node_modules`). That answers
# "was the lockfile edited after the install?", never "is the tree complete?", so a
# PRUNED node_modules skipped its own repair and the gate failed every run with
# code-shaped tsc errors (po-agh). The check now looks at what is actually on disk.
#
# It fails toward installing: cannot-verify and drift both reinstall.
install() {
  local dir="$1" label="install ${1#./}"
  local report
  if [ -d "$dir/node_modules" ] && report="$(node "$ROOT/scripts/check-install.mjs" "$dir" 2>&1)"; then
    printf '\033[2m$ (%s) npm ci  [skipped — tree verified against package-lock.json]\033[0m\n' "$dir"
    ran=$((ran + 1))
    return 0
  fi
  # Say why, so a reinstall in the gate log is self-explanatory rather than noise.
  [ -n "${report:-}" ] && printf '\033[2m%s\033[0m\n' "$report"
  run "$label" "$dir" npm ci || return 1

  # npm ci reported success — if the tree still does not match, the stages about to
  # run are standing on sand, and their failures will look like code defects. Warned
  # rather than failed on purpose: a bug in the checker must not be able to block
  # every merge, which is the same outage po-agh was.
  if ! node "$ROOT/scripts/check-install.mjs" "$dir" --quiet >/dev/null 2>&1; then
    warn "$dir: tree still does not match package-lock.json after npm ci — later failures here may be environmental, not code"
  fi
  return 0
}

stage_setup() {
  log "setup — install dependencies"
  # Root install also builds the @portaljs/* packages via their prepare scripts.
  install .
  for svc in "${CLOUD_SERVICES[@]}"; do install "cloud/$svc"; done
}

stage_lint() {
  log "lint — eslint + generated-docs drift"
  run "lint @portaljs/ckan" . npm run lint -w @portaljs/ckan
  # Fails when README / site docs / sidebar have drifted from skills-manifest.mjs.
  run "gen:skills:check" . npm run gen:skills:check
  # Asserts this script still fails an empty run — the property po-mz4 is about.
  run "verify.sh self-test" . bash scripts/verify-selftest.sh
  # Asserts the nav + landing hero still lead to a page that can actually sign a
  # visitor up (po-506 / po-6el). Zero-dependency node, so it runs on a cold tree
  # even though site/ is otherwise out of this gate's scope.
  run "signup path guard" . node site/scripts/check-signup-path.mjs
  run "signup path guard self-test" . node site/scripts/check-signup-path-selftest.mjs
  # Asserts the setup stage can still tell a pruned node_modules from a satisfied
  # one (po-agh) — the check that decides whether npm ci may be skipped.
  run "install check self-test" . node scripts/check-install-selftest.mjs
}

stage_typecheck() {
  log "typecheck — tsc --noEmit"
  for svc in "${CLOUD_SERVICES[@]}"; do
    run "typecheck cloud/$svc" "cloud/$svc" npm run typecheck
  done
}

stage_test() {
  log "test — vitest"
  for svc in "${CLOUD_SERVICES[@]}"; do
    run "test cloud/$svc" "cloud/$svc" npm test
  done
}

stage_build() {
  log "build — published packages"
  for pkg in "${PACKAGES[@]}"; do
    run "build @portaljs/$pkg" . npm run build -w "@portaljs/$pkg"
  done
}

usage() {
  printf 'usage: scripts/verify.sh [stage...]\nstages: %s\n' "${ALL_STAGES[*]}"
  # Said out loud because a gate wired to --list would exit 0 having verified
  # nothing. Anyone reading gate logs should see this line and recognise it.
  printf 'note: this is help output, NOT a verification run.\n'
}

main() {
  local stages=()
  if [ "$#" -eq 0 ]; then
    stages=("${ALL_STAGES[@]}")
  else
    for arg in "$@"; do
      case "$arg" in
        --list) usage; return 0 ;;
        -h | --help) usage; return 0 ;;
        *)
          # Unknown stage names are a hard error. Silently ignoring one would
          # turn a typo in the rig's gate config into a vacuous pass.
          local known=0
          for s in "${ALL_STAGES[@]}"; do [ "$arg" = "$s" ] && known=1; done
          if [ "$known" -eq 0 ]; then
            printf '\033[31m✖ unknown stage: %s\033[0m\n' "$arg" >&2
            usage >&2
            return 2
          fi
          stages+=("$arg")
          ;;
      esac
    done
  fi

  # setup is a precondition for every other stage, so run it implicitly when a
  # caller asks for a later stage on a cold tree.
  local needs_setup=0
  for s in "${stages[@]}"; do [ "$s" != "setup" ] && needs_setup=1; done
  if [ "$needs_setup" -eq 1 ] && [[ " ${stages[*]} " != *" setup "* ]]; then
    stage_setup
  fi

  for s in "${stages[@]}"; do "stage_$s"; done # selftest:dispatch

  printf '\n'
  if [ "$ran" -eq 0 ]; then
    printf '\033[31m✖ verify ran 0 commands — refusing to report success.\033[0m\n' >&2
    printf '  An unconfigured or empty check is not a passing check (po-mz4).\n' >&2
    return 3
  fi

  if [ "${#failures[@]}" -gt 0 ]; then
    printf '\033[31m✖ verify FAILED — %d of %d command(s) failed:\033[0m\n' "${#failures[@]}" "$ran" >&2
    for f in "${failures[@]}"; do printf '    - %s\n' "$f" >&2; done
    return 1
  fi

  printf '\033[32m✓ verify passed — %d command(s), stages: %s\033[0m\n' "$ran" "${stages[*]}"
  return 0
}

main "$@"
