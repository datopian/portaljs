---
metatitle: PortalJS Guides – Task-Oriented How-Tos for Building Data Portals
metadescription: Short, task-oriented guides for PortalJS — add tabular data, charts, and maps; connect a CKAN backend; deploy; and bring your own branding. Each shows the AI path and the by-hand path.
title: Guides
description: Task-oriented "how do I…" guides. Each shows the fast AI/skill path and the equivalent by-hand path — the same project either way.
---

These are short, task-oriented guides — "how do I add a chart?", "how do I deploy?"
Each one shows two ways to get there: the **AI path** (run a skill) and the
**by-hand path** (the same edits, done yourself). Both produce the same plain,
editable code.

If you're just starting, read [Get started](/docs) and the
[Quickstart](/docs/quickstart) first — these guides assume you already have a portal
scaffolded with [`/portaljs-new-portal`](/docs/skills/portaljs-new-portal).

## The guides

| Guide | What you'll do |
| ----- | -------------- |
| [Add tabular data](/docs/guides/add-tabular-data) | Add a CSV, TSV, or JSON dataset and render it as a sortable table. |
| [Scaling data / large files](/docs/guides/scaling-data) | Move from inline files to Git-LFS + R2 and the in-browser DuckDB query tier. |
| [Add a chart](/docs/guides/add-a-chart) | Add a line, bar, area, pie, or scatter chart to a dataset page. |
| [Render a map](/docs/guides/render-a-map) | Put a GeoJSON dataset on an interactive map. |
| [Connect a CKAN backend](/docs/guides/connect-a-ckan-backend) | Wire the portal to a live CKAN instance — the decoupled path. |
| [Deploy](/docs/guides/deploy) | Publish to Vercel or any static host. |
| [Theming](/docs/guides/theming) | Bring your own branding with a `DESIGN.md`. |

## Where to go next

- **[Skills reference](/docs/skills)** — the full list of agentic commands behind
  these guides.
- **[Core concepts](/docs/core-concepts)** — the ideas that make the by-hand path as
  first-class as the AI path.

<DocsPagination prev="/docs/skills/portaljs-deploy" next="/docs/guides/add-tabular-data" />
