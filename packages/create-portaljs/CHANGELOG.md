# create-portaljs

## 0.4.0

### Minor Changes

- [#1571](https://github.com/datopian/portaljs/pull/1571) [`d0f0c61d94f90fa8094c0641d0a38c297e21b337`](https://github.com/datopian/portaljs/commit/d0f0c61d94f90fa8094c0641d0a38c297e21b337) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Bundle the PortalJS agentic skills into the scaffolded project's `.claude/commands/`. The skills now travel with the new portal — running `claude` in the project directory picks up `/add-dataset`, `/connect-ckan`, `/deploy`, etc. immediately, with no separate global install. Skills are fetched at the same template ref as the scaffold (so they match) and pruned to the OSS allowlist; a fetch failure is non-fatal and prints the manual install one-liner.

## 0.3.0

### Minor Changes

- [#1567](https://github.com/datopian/portaljs/pull/1567) [`8c392a9d704187de87411775ed03176e2fa99ade`](https://github.com/datopian/portaljs/commit/8c392a9d704187de87411775ed03176e2fa99ade) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Show a branded cyclone animation (sky→teal gradient, spinner, rotating status, elapsed timer) while dependencies install. Falls back to a single plain line when stdout isn't a TTY (CI logs stay clean).

## 0.2.0

### Minor Changes

- [#1560](https://github.com/datopian/portaljs/pull/1560) [`70971c271f3488c04b8a44eac5563190c4133400`](https://github.com/datopian/portaljs/commit/70971c271f3488c04b8a44eac5563190c4133400) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Initial release: scaffold a PortalJS data portal with `npm create portaljs@latest`. Unscoped package (no `@portaljs` scope dependency); publishes public via the existing changesets release flow.
