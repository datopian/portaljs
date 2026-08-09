# `.gastown/` — verification config for the merge queue

This directory tells Gas Town how to verify this repo. It exists because the merge
gate used to have **no command to run**, and a gate with no command reports success
without checking anything (po-mz4).

Everything here points at one entry point: [`scripts/verify.sh`](../scripts/verify.sh),
which refuses to report success if it ran zero commands.

## The two halves — and why only one of them is in git

| What | Where | In git? | Read by |
|------|-------|---------|---------|
| Formula commands (`{{test_command}}`, `{{lint_command}}`, …) | `.gastown/settings.json` (this dir) | **yes** | `config.LoadRepoSettings` → polecat formula var injection (`internal/cmd/sling_helpers.go`) |
| Refinery merge gates | `~/gt/<rig>/config.json` → `merge_queue.gates` | **no** — outside the repo | `internal/refinery/engineer.go` (`loadConfig` reads the rig root `config.json` only) |

`config.MergeQueueConfig` (the repo-settings schema) has no `gates` field, so the
refinery's gates **cannot** be carried in git. They must be applied to the rig
directory on the machine running the refinery. The block below is the source of
truth for what that config should be.

### Rig config to apply — `~/gt/portaljs/config.json`

```json
{
  "merge_queue": {
    "enabled": true,
    "run_tests": true,
    "gates_parallel": false,
    "gates": {
      "verify": { "cmd": "bash scripts/verify.sh", "timeout": "30m" }
    }
  }
}
```

Merge that `merge_queue` key into the existing rig identity JSON (keep `type`,
`name`, `git_url`, `default_branch`, `beads`). Verify with:

```bash
node -e 'console.log(JSON.stringify(require(process.env.HOME+"/gt/portaljs/config.json").merge_queue,null,2))'
```

One gate, not five: the refinery runs gates on a cold clone, so each gate pays its
own `npm ci`. A single `verify.sh` invocation installs once and runs all stages
(~90s cold on an M-series laptop). `gates_parallel` is therefore off — there is
nothing to parallelise.

## What `verify.sh` covers

| Stage | Commands |
|-------|----------|
| `setup` | `npm ci` at root (builds `@portaljs/*` via `prepare`) + `cloud/{api,auth,worker}` |
| `lint` | `eslint` for `@portaljs/ckan`, `gen:skills:check` (generated-docs drift), `scripts/verify-selftest.sh` |
| `typecheck` | `tsc --noEmit` in each `cloud/*` service |
| `test` | `vitest run` in each `cloud/*` service |
| `build` | `@portaljs/ckan-api-client-js`, `@portaljs/core`, `@portaljs/ckan` |

Deliberately **not** gated, each for a stated reason:

- `packages/ckan-api-client-js` `npm test` — mocha against a live CKAN instance.
- `site/` and `examples/portaljs-catalog` builds (and `check-export`) — separate
  lockfiles plus a full `next build`; the slow path, covered by
  `.github/workflows/ci.yml`.
- `cloud/*/migrations:check:prod` — needs `CLOUDFLARE_API_TOKEN` (po-mdd).

## The rule this exists to enforce

An empty run is a **failure**, not a pass:

```
$ bash scripts/verify.sh nosuchstage
✖ unknown stage: nosuchstage          # exit 2 — a typo in gate config is not a pass
```

and `verify.sh` exits 3 if it completes having executed no commands at all. Both
exit codes are asserted by [`scripts/verify-selftest.sh`](../scripts/verify-selftest.sh),
which the `lint` stage runs — so the guard is tested on every gate run, not trusted.

The gastown-side half of that rule — an *unconfigured* gate failing instead of being
skipped — is town-wide and tracked in gt-cd2.

## Note on when the formula commands take effect

`.gastown/settings.json` is read from the **mayor's clone** (`~/gt/<rig>/mayor/rig`),
not from a polecat worktree. The commands above therefore start substituting into
`{{test_command}}` and friends once this lands on `main` and that clone pulls it —
not while the change is still on a branch.
