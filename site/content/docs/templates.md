---
metatitle: PortalJS Templates – Default Catalog vs Minimal Single-Page
metadescription: PortalJS ships two starting points — the default catalog (a datasets.json manifest with a search page and dataset showcase) and a minimal single-page variant. When to use which.
title: Templates
description: The default catalog vs the minimal single-page variant — a manifest-driven catalog with showcase pages, or one home page. When to use which.
---

PortalJS ships two starting points. Both are real Next.js projects with the same
lightweight `components/Table.tsx`, Tailwind setup, and Next 14 config — they differ
in whether they include the catalog and per-dataset showcase pages.
[`/portaljs-new-portal`](/docs/skills/portaljs-new-portal) picks the right one for your brief; you can
also clone either by hand. For the surfaces these build — Home, Catalog, Showcase —
see [Core concepts](/docs/core-concepts).

## The two templates

| | `portaljs-catalog` (default) | `portaljs-template` |
| --- | --- | --- |
| Pages | home + `/search` catalog + dataset showcase | home only |
| Dataset pages | one dynamic `[owner]/[slug].tsx` for all | none |
| Registration | `datasets.json` manifest | n/a |
| Adding a dataset | one JSON entry + a data file | edit the home page directly |
| Best for | any portal with a catalog of datasets | a single landing page |

## Default catalog — manifest-driven

[`examples/portaljs-catalog`](https://github.com/datopian/portaljs/tree/main/examples/portaljs-catalog)
is the canonical template. Datasets are listed in a single `datasets.json` manifest;
every entry is rendered by one dynamic `pages/[owner]/[slug].tsx` showcase route,
served at **`/@<namespace>/<slug>`**. It ships three surfaces: a home page (`/`), a
client-side search **catalog** at `/search`, and the per-dataset **showcase**. Adding a
dataset is one JSON entry plus a data file — no new page:

```json
{ "slug": "my-data", "name": "My Data", "description": "…", "file": "my-data.csv", "format": "csv", "namespace": "reference" }
```

Each entry carries a `namespace`. A portal uses **one** namespace mode for all
datasets — `theme` (group by subject) or `owner` (group by publisher) — set via
`NAMESPACE_TYPE` in `lib/datasets.ts`. It only changes the showcase's metadata label;
the URL is always `/@<namespace>/<slug>`. See [Core concepts](/docs/core-concepts) for
the rationale. [`/portaljs-add-dataset`](/docs/skills/portaljs-add-dataset) appends a manifest entry
against this template.

Scaffold it with the CLI (recommended):

```bash
npm create portaljs@latest my-portal
```

Or grab the bare files with [tiged](https://github.com/tiged/tiged) (a maintained `degit` fork that reliably extracts a subdirectory):

```bash
npx tiged datopian/portaljs/examples/portaljs-catalog my-portal
```

## Minimal variant — single page

[`examples/portaljs-template`](https://github.com/datopian/portaljs/tree/main/examples/portaljs-template)
is a stripped-down starting point: just `pages/index.tsx`, `_app`, and `_document` —
no catalog, no per-dataset pages. Use it when you want a single landing page and will
add structure yourself, or as the smallest possible base to build on.

```bash
npx tiged datopian/portaljs/examples/portaljs-template my-portal
```

## Which should I use?

- **Any portal with a catalog of datasets** → the **default catalog**.
- **A single landing page you'll grow by hand** → the **minimal variant**.
- **A live backend (CKAN, etc.)** → start from the catalog, then run
  [`/portaljs-connect-ckan`](/docs/guides/connect-a-ckan-backend) — it rewrites the showcase
  route to fetch from the backend.

The catalog static-exports cleanly (it pre-renders every manifest entry via
`getStaticPaths` with `fallback: false`).

## Where to go next

- **[Authoring skills](/docs/authoring-skills)** — write your own skill.
- **[Backends](/docs/backends)** — connect a data management system.

<DocsPagination prev="/docs/guides/theming" next="/docs/authoring-skills" />
