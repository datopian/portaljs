# create-portaljs

## 0.7.1

### Patch Changes

- [#1693](https://github.com/datopian/portaljs/pull/1693) [`86cca861782c579cab7c3b40e9f42af6c6e0e1f0`](https://github.com/datopian/portaljs/commit/86cca861782c579cab7c3b40e9f42af6c6e0e1f0) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Upgrade `giget` from 1.x to ^3.3.1. giget 1.x extracts the template with `tar@6`, which has unpatched path-traversal / symlink advisories (including a critical one); giget 3.3.1 bundles a patched `tar@7`. The `downloadTemplate` API used by the CLI is unchanged and the scaffolded project is byte-identical.

## 0.7.0

### Minor Changes

- [#1682](https://github.com/datopian/portaljs/pull/1682) [`2d1d2865a06d3eee398f58ab0ba206ca117dbd59`](https://github.com/datopian/portaljs/commit/2d1d2865a06d3eee398f58ab0ba206ca117dbd59) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - **Requires Node.js 22 or newer.** Node 18 reached end of life on 2025-04-30, and the CLI and the scaffolded portal are now tested on Node 22 and 24 only (`engines.node` is `>=22`). On older Node, npm prints an `EBADENGINE` warning; upgrade Node to scaffold reliably.

  Scaffolding now also names any skill from `.claude-plugin/plugin.json` that wasn't found at the chosen `--ref` (e.g. an older ref), instead of only reporting a smaller "Bundled N" count.

### Patch Changes

- [#1676](https://github.com/datopian/portaljs/pull/1676) [`06c9a8f5fac1dd23f2ca04a8d7578647189a84ae`](https://github.com/datopian/portaljs/commit/06c9a8f5fac1dd23f2ca04a8d7578647189a84ae) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Bundle every shipped skill into scaffolds, including `/portaljs-add-geo`, `/portaljs-add-dcat`, and `/arcgis-to-portaljs`, which were missing from the hard-coded allowlist. The list of skills to bundle is now read from the repo's `.claude-plugin/plugin.json` at the same `--ref` as the template, so the scaffold always ships exactly what the plugin ships. A built-in list (now complete) is used only if that file can't be fetched.

## 0.6.0

### Minor Changes

- [`0f2a02301316da383565e7cf338ff4bdfe201809`](https://github.com/datopian/portaljs/commit/0f2a02301316da383565e7cf338ff4bdfe201809) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Rename the agentic skill suite to a uniform `portaljs-` prefix.

  All shipped skills now carry a `portaljs-` prefix — `/portaljs-new-portal`,
  `/portaljs-add-dataset`, `/portaljs-add-chart`, `/portaljs-add-map`,
  `/portaljs-add-resource`, `/portaljs-connect-ckan`, `/portaljs-migrate`,
  `/portaljs-define-schema`, `/portaljs-architect`, `/portaljs-deploy`, and
  `/portaljs-check-data-quality`. The prefix prevents collisions in Claude Code's flat
  command pool (where bare names like `/deploy` and `/migrate` clash with other tools'
  skills) and makes the whole suite autocomplete under `/portaljs`. Fresh scaffolds bundle
  only the prefixed names.

  **Back-compat:** the bare old names (`/deploy`, `/add-dataset`, …) keep working for one
  minor release as thin alias stubs that forward to the prefixed skill, then are removed.
  Update any scripts or docs that invoke the old names. (`/login` was already removed and
  has no alias.)

## 0.5.0

### Minor Changes

- [#1573](https://github.com/datopian/portaljs/pull/1573) [`2ca271e29939026b8cc4394981fcb70d7e4edd42`](https://github.com/datopian/portaljs/commit/2ca271e29939026b8cc4394981fcb70d7e4edd42) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Bundle the new `/migrate` skill into scaffolds. `/migrate` harvests datasets from a CKAN instance or a DCAT-US `/data.json` catalog (DKAN, ArcGIS Hub, data.gov) into the static PortalJS catalog — link-by-URL by default, or download the files. Added to the skills allowlist so it ships in every scaffolded portal's `.claude/commands/` alongside the other skills.

## 0.4.0

### Minor Changes

- [#1571](https://github.com/datopian/portaljs/pull/1571) [`d0f0c61d94f90fa8094c0641d0a38c297e21b337`](https://github.com/datopian/portaljs/commit/d0f0c61d94f90fa8094c0641d0a38c297e21b337) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Bundle the PortalJS agentic skills into the scaffolded project's `.claude/commands/`. The skills now travel with the new portal — running `claude` in the project directory picks up `/add-dataset`, `/connect-ckan`, `/deploy`, etc. immediately, with no separate global install. Skills are fetched at the same template ref as the scaffold (so they match) and pruned to the OSS allowlist; a fetch failure is non-fatal and prints the manual install one-liner.

## 0.3.0

### Minor Changes

- [#1567](https://github.com/datopian/portaljs/pull/1567) [`8c392a9d704187de87411775ed03176e2fa99ade`](https://github.com/datopian/portaljs/commit/8c392a9d704187de87411775ed03176e2fa99ade) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Show a branded cyclone animation (sky→teal gradient, spinner, rotating status, elapsed timer) while dependencies install. Falls back to a single plain line when stdout isn't a TTY (CI logs stay clean).

## 0.2.0

### Minor Changes

- [#1560](https://github.com/datopian/portaljs/pull/1560) [`70971c271f3488c04b8a44eac5563190c4133400`](https://github.com/datopian/portaljs/commit/70971c271f3488c04b8a44eac5563190c4133400) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Initial release: scaffold a PortalJS data portal with `npm create portaljs@latest`. Unscoped package (no `@portaljs` scope dependency); publishes public via the existing changesets release flow.
