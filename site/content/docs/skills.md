---
metatitle: PortalJS Skills – Agentic Commands That Build Your Portal
metadescription: The PortalJS agentic skills — composable Claude Code commands that recommend an architecture, scaffold, load and migrate data, visualize, connect a backend, and deploy to PortalJS Arc. Each produces plain, editable code you own.
title: Skills reference
description: PortalJS skills are first-class, composable commands that do the repetitive assembly — and produce plain, editable code with no lock-in.
---

PortalJS ships a set of **agentic skills** — Claude Code commands like
`/portaljs-new-portal` and `/portaljs-add-dataset` that do the repetitive assembly of a data
portal. You describe intent; the skill writes the code.

## What makes them skills

- **First-class.** Skills live in the repo alongside the template, are documented,
  and are tested end to end. They are not hidden helpers — they are the product's
  primary path.
- **Composable.** Each skill does one job and hands off to the next: plan with
  [`/portaljs-architect`](/docs/skills/portaljs-architect), scaffold with
  [`/portaljs-new-portal`](/docs/skills/portaljs-new-portal), load data with
  [`/portaljs-add-dataset`](/docs/skills/portaljs-add-dataset) or migrate a whole catalog with
  [`/portaljs-migrate`](/docs/skills/portaljs-migrate), enrich with
  [`/portaljs-add-chart`](/docs/skills/portaljs-add-chart) or [`/portaljs-add-map`](/docs/skills/portaljs-add-map),
  describe it with [`/portaljs-define-schema`](/docs/skills/portaljs-define-schema), swap the data
  source with [`/portaljs-connect-ckan`](/docs/skills/portaljs-connect-ckan), and go live with
  [`/portaljs-deploy`](/docs/skills/portaljs-deploy).
- **Plain, editable output.** Every skill writes ordinary Next.js, Tailwind, and
  React code into your project — no magic runtime interpreting a config at request
  time, nothing feature-gated behind a hosted product. You can clone, fork, and
  hand-edit everything they produce. This is what _AI-native, not AI-only_ means.

## The skills

| Skill | What it does |
| ----- | ------------ |
| [`/portaljs-architect`](/docs/skills/portaljs-architect) | Advisory — turns your needs (data, scale, governance) into a recommended architecture before you build. Start here if you're unsure of the stack. |
| [`/portaljs-new-portal`](/docs/skills/portaljs-new-portal) | Scaffold a new portal from a brief — copies the template, substitutes your project name and description, installs deps, verifies the build. |
| [`/portaljs-add-dataset`](/docs/skills/portaljs-add-dataset) | Add a CSV, TSV, JSON, or GeoJSON dataset — copies the data in, generates a dataset page, and registers it on the home page catalog. |
| [`/portaljs-migrate`](/docs/skills/portaljs-migrate) | Harvest or migrate a whole catalog into the portal from CKAN, Socrata, OpenDataSoft, ArcGIS, or DCAT-US, over a canonical Frictionless/DCAT model. |
| [`/portaljs-add-resource`](/docs/skills/portaljs-add-resource) | Attach another file (data dictionary, methodology, extra data) to an existing dataset — it becomes multi-resource and the showcase renders a section per file. |
| [`/portaljs-add-chart`](/docs/skills/portaljs-add-chart) | Add a line, bar, area, pie, or scatter chart to a dataset page using `recharts`. |
| [`/portaljs-add-map`](/docs/skills/portaljs-add-map) | Render a GeoJSON dataset on an interactive Leaflet map and register it on the home page. |
| [`/portaljs-connect-ckan`](/docs/skills/portaljs-connect-ckan) | Wire the portal to a [CKAN](/ckan) backend over its API instead of static files. |
| [`/portaljs-define-schema`](/docs/skills/portaljs-define-schema) | Infer a Frictionless Table Schema from a dataset's data, add license/source/keyword metadata, and surface a typed field table on its showcase. |
| [`/portaljs-check-data-quality`](/docs/skills/portaljs-check-data-quality) | Validate a dataset against its schema and flag quality issues (type mismatches, missing values, constraint violations). |
| [`/portaljs-deploy`](/docs/skills/portaljs-deploy) | Build a static export and publish it to [PortalJS Arc](/docs/arc) — Datopian-managed hosting — with a live `<slug>.arc.portaljs.com` URL. Or self-host the export anywhere. |

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

<DocsPagination prev="/docs/core-concepts" next="/docs/skills/portaljs-new-portal" />
