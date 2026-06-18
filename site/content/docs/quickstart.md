---
metatitle: PortalJS Quickstart – Build a Portal with AI in Minutes
metadescription: Install the PortalJS skills, scaffold a portal with /portaljs-new-portal, add your data with /portaljs-add-dataset, and go live — all from your AI assistant.
title: Quickstart — the AI path
description: Install the PortalJS skills, scaffold a portal, add your data, and go live in minutes — your AI assistant does the assembly.
---

> [!tip] One-command start
> The fastest way to a working portal — no AI, nothing to install beyond Node 18+:
>
> ```bash
> npm create portaljs@latest my-portal
> cd my-portal && npm run dev
> ```
>
> That scaffolds the full template. The rest of this page is the **AI-assisted** path:
> install the skills and drive the whole build (and ongoing changes) from chat.

This page is the AI path. You'll install the PortalJS skills into
[Claude Code](https://docs.claude.com/en/docs/claude-code), then drive the whole
build from chat. Prefer to build entirely by hand? See [Manual setup](/docs/manual-setup)
instead.

> [!info] Prerequisites
>
> - **Node.js >= 18**
> - **[Claude Code](https://docs.claude.com/en/docs/claude-code)** (or another
>   agent that runs Claude Code skills)

## 1. Install the skills

The skills are Claude Code commands — `/portaljs-architect`, `/portaljs-new-portal`, `/portaljs-add-dataset`,
`/portaljs-add-chart`, `/portaljs-add-map`, `/portaljs-connect-ckan`, `/portaljs-define-schema`, `/portaljs-deploy`, and
`/portaljs-check-data-quality`. Install them all once into your personal scope so they're
available in every project:

```bash
curl -fsSL https://raw.githubusercontent.com/datopian/portaljs/main/scripts/install-portaljs-skills.sh | bash
```

Restart Claude Code (or open a new session) so it picks up the new commands.

> [!note] Other install options
> You can also run the skills straight from a clone of the
> [portaljs repo](https://github.com/datopian/portaljs), or install them as a
> versioned plugin. See the [install guide](https://github.com/datopian/portaljs/blob/main/.claude/INSTALL.md)
> for all three paths.

## 2. Scaffold a portal

In Claude Code, describe the portal you want:

```
/portaljs-new-portal Auckland Council Open Data Portal — public datasets for the Auckland region
```

`/portaljs-new-portal` fetches the latest canonical catalog template, substitutes your project
name and description, installs dependencies, and verifies the build. You get a
real Next.js project — plain, editable code you own.

Start the dev server to see it:

```bash
cd auckland-council-open-data
npm run dev
```

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
- **[Manual setup](/docs/manual-setup)** — the same project, built by hand.

<DocsPagination prev="/docs" next="/docs/manual-setup" />
