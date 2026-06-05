---
metatitle: PortalJS Templates – Default Template vs Catalog Variant
metadescription: PortalJS ships two starting points — the default template (one page file per dataset) and the catalog variant (one dynamic route driven by a datasets.json manifest). When to use which.
title: Templates
description: The default template vs the catalog variant — one page per dataset, or one dynamic route driven by a manifest. When to use which.
---

PortalJS ships two starting points. Both are real Next.js projects with the same
lightweight `components/Table.tsx`, Tailwind setup, and Next 14 config — they differ
only in how dataset pages are routed. [`/new-portal`](/docs/skills/new-portal) picks
the right one for your brief; you can also clone either by hand.

## The two templates

| | `portaljs-template` (default) | `portaljs-catalog` |
| --- | --- | --- |
| Dataset pages | one `.tsx` file per dataset | one dynamic `[slug].tsx` for all |
| Registration | hardcoded array in `index.tsx` | `datasets.json` manifest |
| Adding a dataset | new page file + array entry | one JSON entry + a data file |
| Best for | a handful of datasets | dozens to hundreds |

## Default template — one page per dataset

[`examples/portaljs-template`](https://github.com/datopian/portaljs/tree/main/examples/portaljs-template)
is the canonical template. Each dataset is its own `pages/datasets/<slug>.tsx` file,
registered in a `datasets` array on the home page. This is the simplest mental model —
one file, one page — and it has no `getStaticPaths`, so it static-exports without
fuss. [`/add-dataset`](/docs/skills/add-dataset) writes one file per dataset against
this template.

Clone it by hand with [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit datopian/portaljs/examples/portaljs-template my-portal
```

## Catalog variant — one dynamic route

[`examples/portaljs-catalog`](https://github.com/datopian/portaljs/tree/main/examples/portaljs-catalog)
is for portals with **many datasets**. Instead of a file per dataset, the catalog is
driven by a single `datasets.json` manifest and rendered by a dynamic
`pages/datasets/[slug].tsx` route with `getStaticPaths`. Adding a dataset is one JSON
entry plus a data file — no new page:

```json
{ "slug": "my-data", "name": "My Data", "description": "…", "file": "my-data.csv", "format": "csv" }
```

```bash
npx degit datopian/portaljs/examples/portaljs-catalog my-catalog
```

## Which should I use?

- **A handful of datasets, or you want each page to be its own editable file** → the
  **default template**.
- **Dozens to hundreds of datasets, driven from a manifest** → the **catalog variant**.
- **A live backend (CKAN, etc.)** → start from either, then run
  [`/connect-ckan`](/docs/guides/connect-a-ckan-backend) — it replaces the dataset route
  with one that fetches from the backend.

Both static-export cleanly (the catalog pre-renders every manifest entry via
`getStaticPaths` with `fallback: false`).

## Where to go next

- **[Authoring skills](/docs/authoring-skills)** — write your own skill.
- **[Backends](/docs/backends)** — connect a data management system.

<DocsPagination prev="/docs/guides/theming" next="/docs/authoring-skills" />
