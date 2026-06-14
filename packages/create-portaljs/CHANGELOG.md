# create-portaljs

## 0.3.0

### Minor Changes

- [#1567](https://github.com/datopian/portaljs/pull/1567) [`8c392a9d704187de87411775ed03176e2fa99ade`](https://github.com/datopian/portaljs/commit/8c392a9d704187de87411775ed03176e2fa99ade) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Show a branded cyclone animation (sky→teal gradient, spinner, rotating status, elapsed timer) while dependencies install. Falls back to a single plain line when stdout isn't a TTY (CI logs stay clean).

## 0.2.0

### Minor Changes

- [#1560](https://github.com/datopian/portaljs/pull/1560) [`70971c271f3488c04b8a44eac5563190c4133400`](https://github.com/datopian/portaljs/commit/70971c271f3488c04b8a44eac5563190c4133400) Thanks [@anuveyatsu](https://github.com/anuveyatsu)! - Initial release: scaffold a PortalJS data portal with `npm create portaljs@latest`. Unscoped package (no `@portaljs` scope dependency); publishes public via the existing changesets release flow.
