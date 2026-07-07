---
metatitle: PortalJS Quickstart – Build a Portal in Minutes
metadescription: Scaffold a portal with npm create portaljs, add your data with /portaljs-add-dataset, and go live — the skills come pre-installed, your AI assistant does the assembly.
title: Quickstart
description: One command to scaffold a portal with the skills pre-installed, then drive data, charts, maps, and deploys from your AI assistant.
---

Go from nothing to a live portal in a few minutes: scaffold with one command,
then drive everything else — data, charts, maps, deploys — from
[Claude Code](https://docs.claude.com/en/docs/claude-code). Everything the skills
write is **plain, editable Next.js code** you own, so you can open any file and
change it by hand at any point.

> [!info] Prerequisites
>
> - **Node.js >= 22**
> - **[Claude Code](https://docs.claude.com/en/docs/claude-code)** (or another
>   agent that runs Claude Code skills)

## 1. Create a portal

```bash
npm create portaljs@latest my-portal
cd my-portal
npm run dev
```

That scaffolds the full catalog template — a home page (`/`), a search catalog at
`/search`, and per-dataset showcase pages — and **bundles the PortalJS skills into
the project's `.claude/commands/`**, so they work the moment you open Claude Code.
Open [http://localhost:3000](http://localhost:3000) to see it running.

## 2. Open Claude Code

Run `claude` in the project. The skills are already there — no install step:
`/portaljs-architect`, `/portaljs-add-dataset`, `/portaljs-add-chart`, `/portaljs-add-map`,
`/portaljs-define-schema`, `/portaljs-connect-ckan`, `/portaljs-check-data-quality`,
and `/portaljs-deploy`.

> [!note] Optional — skills for an existing project, or globally
> The bundled skills only exist in projects created via `npm create portaljs`.
> To add them to an **existing project**, or install them once into your personal
> scope so they're available everywhere:
>
> ```bash
> curl -fsSL https://raw.githubusercontent.com/datopian/portaljs/main/scripts/install-portaljs-skills.sh | bash
> ```
>
> You can also run them from a clone of the
> [portaljs repo](https://github.com/datopian/portaljs), or install them as a
> versioned plugin — see the
> [install guide](https://github.com/datopian/portaljs/blob/main/.claude/INSTALL.md).

## 3. Add your data

Point `/portaljs-add-dataset` at a local file or a public URL. It copies the data into
`/public/data/`, generates a dataset page, and registers it on the home page
catalog:

```
/portaljs-add-dataset ./data/population.csv — Auckland population by area
```

```
/portaljs-add-dataset https://example.com/air-quality.csv — Air quality monitoring
```

Supported formats: **CSV, TSV, JSON (array), and GeoJSON**.

## 4. Make it richer (optional)

- `/portaljs-add-chart` — add a line, bar, area, pie, or scatter chart to a dataset page.
- `/portaljs-add-map` — render a GeoJSON dataset on an interactive Leaflet map.
- `/portaljs-connect-ckan` — wire the portal to a [CKAN](/ckan) backend over its API
  instead of static files.

Every skill writes plain, readable code — nothing it produces is hidden behind a
runtime you can't see or edit.

## 5. Deploy

When you're ready to go live:

```
/portaljs-deploy
```

`/portaljs-deploy` detects your target (Vercel or static hosting), builds the portal, and
publishes it — you get a live URL at the end.

## Where to go next

- **[Core concepts](/docs/core-concepts)** — understand the model behind the
  skills so you can customize confidently.
- **[Editing by hand](/docs/manual-setup)** — a reference for working on the
  project directly: the `datasets.json` manifest, namespaces, and conventions.

<DocsPagination prev="/docs" next="/docs/core-concepts" />
