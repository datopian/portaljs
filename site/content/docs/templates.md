---
metatitle: PortalJS Template – The Manifest-Driven Catalog
metadescription: PortalJS ships one canonical starting point — the catalog template, a datasets.json manifest with a home page, a search catalog, and per-dataset showcase pages.
title: Templates
description: The canonical catalog template — a manifest-driven catalog with a home page, search, and per-dataset showcase pages.
---

PortalJS ships one canonical starting point: the catalog template. It is a real
Next.js 16 project with a lightweight `components/Table.tsx` and a Tailwind setup. [`/portaljs-new-portal`](/docs/skills/portaljs-new-portal) and
`npm create portaljs` both scaffold it; you can also clone it by hand. For the surfaces
it builds — Home, Catalog, Showcase — see [Core concepts](/docs/core-concepts).

## The catalog template — manifest-driven

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

## Starting points

- **Any portal with a catalog of datasets** → the catalog template, as is.
- **A single landing page you'll grow by hand** → start from the catalog and trim the
  `/search` and showcase pages you don't need. (The former minimal
  [`portaljs-template`](https://github.com/datopian/portaljs/tree/59d816c73aa3569733ce26cf6c471d24b155d760/examples/portaljs-template) variant was retired and is archived for reference.)
- **A live backend (CKAN, etc.)** → start from the catalog, then run
  [`/portaljs-connect-ckan`](/docs/guides/connect-a-ckan-backend) — it rewrites the showcase
  route to fetch from the backend.

The catalog static-exports cleanly (it pre-renders every manifest entry via
`getStaticPaths` with `fallback: false`).

## Where to go next

- **[Authoring skills](/docs/authoring-skills)** — write your own skill.
- **[Backends](/docs/backends)** — connect a data management system.

<DocsPagination prev="/docs/guides/theming" next="/docs/authoring-skills" />
