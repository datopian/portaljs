---
title: "PortalJS is now AI-native: build a data portal with an agent"
description: "PortalJS is now the AI-native, open-source framework for building data portals. Spin one up with a single command, then work with an AI agent that runs composable skills to scaffold, load, visualize, and deploy — and produces plain, editable code you own."
created: 2026-06-27
authors: ['anuveyatsu']
tags:
  - PortalJS
  - AI
  - agents
  - skills
  - data portals
filetype: 'blog'
---

PortalJS is now **the AI-native, open-source framework for building data portals**. Spin one up with a single command, then work with an **AI agent** that runs PortalJS skills to assemble the rest — and what comes out is **plain Next.js code you own. No lock-in, any backend.**

## Start with one command

```bash
npm create portaljs@latest my-portal
cd my-portal
```

That scaffolds a working portal — three surfaces out of the box: a search-first **Home**, a full-text **Catalog**, and a per-dataset **Showcase**.

## Then let the agent build

The shift is in *how* you go from there. Instead of wiring components by hand, you describe intent to an **AI agent** (e.g. Claude Code) and it runs PortalJS's **agentic skills** — composable commands that do the repetitive assembly and write real, editable code:

| Skill | What it does |
|---|---|
| `/portaljs-add-dataset` | Add a CSV, JSON, or GeoJSON dataset — copies data in, generates a page, registers it in the catalog. |
| `/portaljs-add-chart` / `/portaljs-add-map` | Add a chart (`recharts`) or an interactive Leaflet map to a dataset. |
| `/portaljs-define-schema` | Infer a Frictionless Table Schema and surface a typed field table. |
| `/portaljs-connect-ckan` | Wire the portal to a CKAN backend over its API instead of static files. |
| `/portaljs-migrate` | Harvest a whole catalog from CKAN, Socrata, OpenDataSoft, ArcGIS, or DCAT-US. |
| `/portaljs-deploy` | Go live. |

Each one interviews you, then writes ordinary Next.js + Tailwind. Delete PortalJS later and your portal still runs — there's no runtime to rip out.

## An advisory layer, not just scaffolding

If you're unsure of the stack, start with **`/portaljs-architect`**. It turns your needs — what your data is, how big it gets, what it's for — into a recommended architecture, weighing **cost and lock-in** explicitly.

The default pushes compute toward **DuckDB over Parquet on object storage (Cloudflare R2)** instead of a warehouse that bills per scan. A refreshed billion-row job can quietly run ~$27k/yr on pay-per-scan pricing; the same query over Parquet on object storage is ~$0 recurring. Warehouses stay fully supported — the agent just makes the trade-off visible before you commit.

## Open by default

Frictionless-native authoring, DCAT interop for harvest and export, static-first with an opt-in runtime mode. Open standards in, plain code out.

---

Try it:

```bash
npm create portaljs@latest my-portal
```

…and ⭐ [star us on GitHub](https://github.com/datopian/portaljs). Tell us what you build in [our Discord](https://discord.gg/krmj5HM6He).
