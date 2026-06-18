---
metatitle: PortalJS Core Concepts – Home, Catalog, and Dataset Showcase
metadescription: Every data portal is built from three surfaces — a home/landing page, a search catalog, and a per-dataset showcase. Learn what each does, how it scales, and how PortalJS builds them.
title: Core concepts
description: Every data portal is built from three surfaces — Home, Catalog, and Showcase. Understand these and the template, routes, and skills all fall into place.
---

Almost every data portal — however simple or sophisticated — is built from **three
surfaces**. Get these straight and the template layout, the URL structure, and the
skills all make sense, because each maps directly onto one of them.

1. **Home** — what this portal is, and a way in.
2. **Catalog** — find and discover datasets.
3. **Showcase** — explore one dataset in full.

Everything else is an elaboration of these three.

## 1. Home — the landing page

The front door. It tells a first-time visitor **what this portal is** (the project,
who runs it, what kind of data lives here) and gives them an immediate way in.

The most important element is usually the **search box in the hero** — the primary
call to action is "start searching," not "read about us." A good home page also
offers a few **suggested queries** (example searches based on the data that's
actually published) so visitors who don't know what to type still get moving.

- **Basic:** a title, a sentence of description, and a search input that sends
  people to the catalog.
- **Scales to:** featured/most-popular datasets, themes, recent additions, stats.

**In PortalJS:** `pages/index.tsx` at `/` — a search input whose submit routes to
`/search`, plus suggested-query chips. Built by **`/portaljs-new-portal`**.

## 2. Catalog — search & discovery

Where users **find what they're looking for**. This is the heart of a portal: a
searchable, browsable index of every dataset.

How much machinery sits behind it is the main thing that separates a simple portal
from a sophisticated one:

- **Basic:** a plain list you can filter client-side. For a statically built
  portal this is an **index written to a flat file** (e.g. `datasets.json`) loaded
  into the browser on page load — no server required.
- **Scales to:** a real **search engine** — full-text search, **faceted** filtering
  (by theme, format, organization…), pagination, ranking. CKAN does this with
  **Solr**; OpenMetadata with **Elasticsearch**. PortalJS stays decoupled: it
  renders results from whichever index you point it at.

**In PortalJS:** `pages/search.tsx` at `/search` — client-side full-text search over
the static `datasets.json` index, structured so a backend (e.g. CKAN) can replace
the index later via **`/portaljs-connect-ckan`** without changing the frontend.

## 3. Showcase — the dataset page

Where a user **explores a single dataset in full**. Once they've found something in
the catalog, this is where they decide whether it's what they need and how to use
it. A good showcase covers:

- **Metadata** — every attribute: title, description, license, source, fields, dates.
- **Understanding the data** — a **preview** of the actual rows so people see what
  they're getting.
- **How to use it** — **download** the file vs **API/programmatic** access.
- **Views** — visualizations: tables, **charts**, **maps**, so the data is legible
  at a glance.

**In PortalJS:** `pages/[owner]/[slug].tsx`, served at **`/@<namespace>/<slug>`** —
metadata block, a `Table` data preview, a Download & API section, and a **Views**
slot. Built incrementally: **`/portaljs-add-dataset`** creates the dataset, **`/portaljs-add-chart`**
and **`/portaljs-add-map`** add views.

### Why dataset URLs start with `@`

Datasets live under an `@`-prefixed namespace — `/@<owner-or-theme>/<dataset>` —
which separates them from ordinary content/static pages (which never start with
`@`), so the two can't collide. Pick **one** namespace mode per portal:

- **`theme`** — a single-publisher portal, grouping datasets by subject
  (`/@transport/road-deaths`).
- **`owner`** — a multi-publisher portal, grouping by who published it
  (`/@auckland-council/road-deaths`).

Using exactly one keeps every `(@namespace, slug)` pair unique.

## How the three map to skills

| Surface | Route | Skill(s) that build it |
|---------|-------|------------------------|
| Home | `/` | `/portaljs-new-portal` |
| Catalog | `/search` | `/portaljs-new-portal` (static) · `/portaljs-connect-ckan` (backend) |
| Showcase | `/@<namespace>/<slug>` | `/portaljs-add-dataset`, then `/portaljs-add-chart` · `/portaljs-add-map` |

Start with all three as static surfaces, then grow each one independently — a richer
home, a search backend behind the catalog, more views on each showcase.

## The principles underneath

These three surfaces are delivered the PortalJS way:

- **Lightweight template + agentic skills.** A small Next.js + Tailwind template
  plus skills that do the assembly — you describe intent, the skill writes the code.
- **Plain, editable code — no lock-in.** Every skill emits an ordinary Next.js
  project you can fork and hand to any developer. No magic runtime. See
  [Manual setup](/docs/manual-setup).
- **Decoupled by default.** The frontend talks to the backend over an API — CKAN,
  DKAN, OpenMetadata, Purview, DataHub, GitHub, Frictionless, plain JSON, or custom.
  Start static, point at a real catalog later with [`/portaljs-connect-ckan`](/ckan).
- **Bring your own stack.** Adopt the whole template, or lift the skills and the
  three-surface model into an app you already have.

## Where to go next

- **[Quickstart](/docs/quickstart)** — build all three surfaces with the skills.
- **[Manual setup](/docs/manual-setup)** — or by hand.
- **[Open-source framework docs](/opensource)** — the classic framework reference.

<DocsPagination prev="/docs/manual-setup" />
