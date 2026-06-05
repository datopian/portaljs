---
metatitle: PortalJS Skills – Agentic Commands That Build Your Portal
metadescription: The six PortalJS skills — composable Claude Code commands that scaffold, load data, visualize, connect a backend, and deploy. Each produces plain, editable code you own.
title: Skills reference
description: PortalJS skills are first-class, composable commands that do the repetitive assembly — and produce plain, editable code with no lock-in.
---

PortalJS ships a set of **agentic skills** — Claude Code commands like
`/new-portal` and `/add-dataset` that do the repetitive assembly of a data
portal. You describe intent; the skill writes the code.

## What makes them skills

- **First-class.** Skills live in the repo alongside the template, are documented,
  and are tested end to end. They are not hidden helpers — they are the product's
  primary path.
- **Composable.** Each skill does one job and hands off to the next: scaffold with
  [`/new-portal`](/docs/skills/new-portal), load data with
  [`/add-dataset`](/docs/skills/add-dataset), enrich with
  [`/add-chart`](/docs/skills/add-chart) or [`/add-map`](/docs/skills/add-map),
  swap the data source with [`/connect-ckan`](/docs/skills/connect-ckan), and go
  live with [`/deploy`](/docs/skills/deploy).
- **Plain, editable output.** Every skill writes ordinary Next.js, Tailwind, and
  React code into your project — no magic runtime interpreting a config at request
  time, nothing feature-gated behind a hosted product. You can clone, fork, and
  hand-edit everything they produce. This is what _AI-native, not AI-only_ means.

## The six skills

| Skill | What it does |
| ----- | ------------ |
| [`/new-portal`](/docs/skills/new-portal) | Scaffold a new portal from a brief — copies the template, substitutes your project name and description, installs deps, verifies the build. |
| [`/add-dataset`](/docs/skills/add-dataset) | Add a CSV, TSV, JSON, or GeoJSON dataset — copies the data in, generates a dataset page, and registers it on the home page catalog. |
| [`/add-chart`](/docs/skills/add-chart) | Add a line, bar, area, pie, or scatter chart to a dataset page using `recharts`. |
| [`/add-map`](/docs/skills/add-map) | Render a GeoJSON dataset on an interactive Leaflet map and register it on the home page. |
| [`/connect-ckan`](/docs/skills/connect-ckan) | Wire the portal to a [CKAN](/ckan) backend over its API instead of static files. |
| [`/deploy`](/docs/skills/deploy) | Build and publish the portal to Vercel or any static host — with a live URL at the end. |

## Author your own

Skills are designed to be extended. Anyone can write a new one — see the
[skill authoring guide](https://github.com/datopian/portaljs/blob/main/.claude/AUTHORING.md).

The roadmap extends this model across the whole data-portal lifecycle — ingest and
migrate catalogs, wrangle and transform data, describe it with metadata, and
publish — as a growing **library of agentic skills**. See the
[PortalJS vision](https://github.com/datopian/portaljs/blob/main/VISION.md) for the
upcoming skill families.

## Where to go next

- **[Quickstart](/docs/quickstart)** — install the skills and run them end to end.
- **[Core concepts](/docs/core-concepts)** — the ideas behind the skills.

<DocsPagination prev="/docs/core-concepts" next="/docs/skills/new-portal" />
