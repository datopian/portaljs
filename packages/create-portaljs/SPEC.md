# Spec: `create-portaljs`

> The canonical, zero-prerequisite scaffolder for a PortalJS data portal.
> `npm create portaljs@latest my-portal` → a working portal in your own directory.

## Why

Today's scaffold paths each have friction (issue #1556, po-pd1):

- `npx tiged datopian/portaljs/examples/portaljs-catalog my-portal` — works, but `tiged`
  is obscure, no prompts, no token substitution, no git/install, no "what next".
- `/portaljs-new-portal` — great, but requires Claude Code (the AI path).
- clone the repo — scaffolds *inside* the framework repo.

`create-portaljs` is the DX developers expect (cf. `create-next-app`, `create-vite`): one
memorable command, no prior knowledge, no AI required. It's the strongest top-of-funnel for
OSS adoption and the natural thing to lead the README / landing / a Show HN with.

## Goal & non-goals

**Goal:** reliably scaffold the canonical `examples/portaljs-catalog` template into a new
directory, substitute project tokens, set the namespace mode, optionally init git + install
deps, and print next steps.

**Non-goals (handled elsewhere):** adding datasets/charts/maps/backends (the `/add-*` and
`/connect-*` skills), the architecture interview (`/portaljs-architect`), deployment (`/portaljs-deploy`).
This is *scaffold only* — the same artifact `/portaljs-new-portal` produces, without the AI.

## Usage

```bash
npm create portaljs@latest               # prompts for everything
npm create portaljs@latest my-portal     # name from argv, prompts for the rest
# equivalently: npx create-portaljs@latest my-portal / pnpm create portaljs / yarn create portaljs
```

### CLI surface

```
create-portaljs [directory] [options]

Arguments:
  directory                 Target directory (also the default project slug).

Options:
  --namespace <theme|owner> Namespace mode (default: theme).
  --name <string>           Human project name (default: derived from directory).
  --description <string>    One-line description (default: "An open data portal.").
  --ref <git-ref>           Template ref to fetch (default: main).
  --no-install              Skip `npm install`.
  --no-git                  Skip `git init`.
  -y, --yes                 Accept all defaults, no prompts (CI-friendly).
  -h, --help                Show help.
```

Any option provided on the CLI skips its prompt. With `--yes`, all prompts are skipped.

## Behavior (step by step)

1. **Resolve inputs.** Parse argv; for anything missing (and not `--yes`), prompt:
   directory, project name, description, namespace mode, install?, git init?.
2. **Guard the target.** If the directory exists and is non-empty, error out (don't
   overwrite) and ask for a different name — never clobber.
3. **Fetch the template.** Download `github:datopian/portaljs/examples/portaljs-catalog#<ref>`
   into the target via `giget` (`downloadTemplate`) — reliable subdirectory extraction, no
   git history, no `node_modules`. (This is the robust replacement for the `degit`
   tarball-fallback bug from #1549.)
4. **Substitute tokens** in all text files under the target:
   `__PROJECT_NAME__` → name, `__PROJECT_SLUG__` → slug (kebab-cased dir name),
   `__DESCRIPTION__` → description.
5. **Set namespace mode.** Rewrite `NAMESPACE_TYPE` in `lib/datasets.ts` to the chosen
   `theme` | `owner`.
6. **Optional `git init`** (+ an initial commit) and **`npm install`**.
7. **Print next steps:** `cd <dir>`, `npm run dev`, and pointers to `/portaljs-add-dataset` /
   `/portaljs-add-resource` / `/portaljs-connect-ckan` / `/portaljs-deploy`.

## Implementation notes

- **Runtime:** Node >= 18, plain ESM (`index.mjs` with a shebang) — no build/transpile step.
- **Dependencies:** `giget` (template fetch) + `prompts` (interactive). Both small,
  established. No framework.
- **Token substitution** walks the tree in JS (read → replace → write) over text
  extensions (`.ts .tsx .js .json .css .md`), skipping binaries.
- **Idempotent-ish:** refuses to scaffold into a non-empty dir; safe to re-run with a new
  name.

## Publishing

- Package name **`create-portaljs`** (unscoped) — so `npm create portaljs` resolves to it,
  and it sidesteps the parked `@portaljs/*` scope-token blocker.
- Still requires an npm publish credential / automation token (the one prerequisite).
- Versioned with the repo (changesets). `@latest` is what `npm create portaljs@latest` uses.

## Acceptance

- `node packages/create-portaljs/index.mjs /tmp/p --yes` produces a portal that
  `npm install && npm run build` passes, with tokens substituted (no `__…__` left) and
  `NAMESPACE_TYPE` set.
- Refuses to scaffold into a non-empty directory.
- Works via `npm create portaljs@latest` once published.
