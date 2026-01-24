# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PortalJS is a React/Next.js framework for building data portals, data catalogs, and publishing systems. It provides components for data visualization, dataset pages, and catalog functionality with support for multiple backends (CKAN, GitHub, Frictionless Data Packages).

## Monorepo Structure

This is an Nx monorepo with npm workspaces:
- **packages/** - Published libraries (@portaljs/*)
- **examples/** - Next.js example applications demonstrating different use cases
- **site/** - Documentation and landing page site

### Key Packages

| Package | Description | Build Tool |
|---------|-------------|------------|
| `@portaljs/components` | Data visualization components (Plotly, Vega, tables, maps, PDF viewer) | Vite |
| `@portaljs/core` | Core portal components and utilities | Rollup |
| `@portaljs/ckan` | CKAN-specific portal components | Vite |
| `@portaljs/ckan-api-client-js` | JavaScript client for CKAN API | Rollup |
| `@portaljs/remark-*` | Remark plugins for wiki-links, callouts, embeds | ESM |

## Common Commands

### Running Tasks via Nx
```sh
npx nx <target> <project>    # Run a target on a project
npx nx serve ckan            # Serve the ckan example app
npx nx build components      # Build the components package
npx nx lint core             # Lint the core package
npx nx test <project>        # Run tests for a project
npx nx storybook components  # Start Storybook for components
```

### Running Across Projects
```sh
npx nx run-many --target=build      # Build all projects
npx nx run-many --target=lint       # Lint all projects
npx nx affected --target=test       # Test affected projects only
```

### Formatting
```sh
npx nx format:check --all           # Check formatting
npx nx format:write --all           # Fix formatting
```

### Dependency Graph
```sh
npx nx graph                        # Visualize project dependencies
```

### Package-specific Scripts
Some packages have their own scripts in package.json:
- `@portaljs/components`: `npm run storybook` for component dev, Vitest for testing
- `@portaljs/ckan-api-client-js`: Uses Mocha for tests (`npm test` in package dir)

## Changesets for Versioning

When making changes to packages:
```sh
npx changeset                       # Create a changeset file
```
Select the affected package(s), semver bump type, and add a description. Changesets are committed with PRs.

## Creating New Projects

```sh
# New publishable library
nx g @nrwl/next:lib --js --publishable --importPath @portaljs/<name>

# New example app
nx g @nrwl/next:app <example-name>
```

## Tech Stack

- **Framework**: Next.js 13.x, React 18.x
- **Styling**: Tailwind CSS
- **Visualizations**: Plotly.js, Vega/Vega-Lite, Leaflet (maps), AG Grid (tables)
- **Markdown**: Remark/Rehype ecosystem, MDX support
- **Build**: Nx orchestration, Vite/Rollup for packages
- **Testing**: Jest (via Nx), Mocha (ckan-api-client-js), Cypress (E2E), Storybook

## Architecture Notes

PortalJS = Next.js + data-specific React components + data loading (Frictionless-based).

The framework provides:
- React components for data portal functionality (tables, graphs, dataset pages)
- Template sites reusable via `create-next-app` (single dataset, GitHub-backed catalog, CKAN-backed catalog)
- Tooling to load data based on Frictionless specifications

## Using PortalJS Templates

### Basic Data Portal
```sh
npx create-next-app my-data-portal --example https://github.com/datopian/datahub/tree/main/examples/learn
cd my-data-portal && npm run dev
```

### CKAN-backed Catalog
```sh
npx create-next-app my-ckan-portal --example https://github.com/datopian/datahub/tree/main/examples/ckan-example
cd my-ckan-portal
echo "DMS=<ckan-url>" > .env
npm run dev
```

### GitHub-backed Catalog
```sh
npx create-next-app my-github-catalog --example https://github.com/datopian/datahub/tree/main/examples/github-backed-catalog
cd my-github-catalog
echo "GITHUB_PAT=<github-token>" > .env  # Optional but recommended
# Edit datasets.json to configure which GitHub repos/files to display
npm run dev
```

## Documentation

- **Online docs**: https://www.portaljs.com/opensource/docs
- **Local docs**: `site/content/opensource/docs/` (markdown files)
- **Developer guides**: `site/content/opensource/developers/` (CKAN integration, GitHub catalogs, Cloudflare Workers)
- **How-tos**: `site/content/opensource/howtos/` (analytics, SEO, sitemaps, blogging, data visualization)

## Community

- GitHub Discussions: https://github.com/datopian/datahub/discussions
- Discord: https://discord.gg/KZSf3FG4EZ
