---
metatitle: Add Tabular Data to PortalJS – CSV, TSV, JSON Tables
metadescription: Add a CSV, TSV, or JSON dataset to your PortalJS portal and render it as a sortable, paginated table — with /portaljs-add-dataset, or by hand with the Table component.
title: Add tabular data
description: Add a CSV, TSV, or JSON dataset and render it as a sortable table — with /portaljs-add-dataset, or by hand.
---

**Goal:** add a CSV, TSV, or JSON file to your portal and render it as a table in its
dataset showcase, discoverable from the `/search` catalog.

> [!info] Before you start
> You need a portal scaffolded with [`/portaljs-new-portal`](/docs/skills/portaljs-new-portal). Tabular
> formats supported: **CSV, TSV, and JSON (array)**. For GeoJSON, see
> [Render a map](/docs/guides/render-a-map).

## The AI path — `/portaljs-add-dataset`

Point [`/portaljs-add-dataset`](/docs/skills/portaljs-add-dataset) at a local file or a public URL:

```
/portaljs-add-dataset ./data/population.csv — Auckland population by area
```

```
/portaljs-add-dataset https://example.com/air-quality.csv — Air quality monitoring
```

It copies the data into `/public/data/` and appends an entry to `datasets.json`
(including its `namespace`). The dataset then renders at `/@<namespace>/<slug>` through
the existing `pages/[owner]/[slug].tsx` showcase — no new page file. Run `npm run dev`
and visit `/@<namespace>/<slug>` to check it.

## The by-hand path

Drop the file into `/public/data/`:

```bash
cp ~/Downloads/population.csv public/data/population.csv
```

Then append an entry to `datasets.json`:

```json
{
  "slug": "population",
  "name": "Population by area",
  "description": "Resident population by area.",
  "file": "population.csv",
  "format": "csv",
  "namespace": "reference"
}
```

That's all — the dataset now renders at **`/@reference/population`** via the existing
`pages/[owner]/[slug].tsx` showcase, and appears in the `/search` catalog. The showcase
previews the file with the `Table` component (in `components/Table.tsx`), which fetches
it in the browser with `papaparse` and renders it with `@tanstack/react-table` — no
server code, and it works under static export.

Every entry carries a `namespace`. A portal uses **one** namespace mode — `theme`
(group by subject) or `owner` (group by publisher) — set via `NAMESPACE_TYPE` in
`lib/datasets.ts`. See [Core concepts](/docs/core-concepts) for why dataset URLs start
with `@`.

## Notes

- **TSV** works the same way — `papaparse` auto-detects the delimiter.
- **Large files (>5MB)** load slowly in the browser. Don't commit them inline —
  route them through Git-LFS + R2 and query them in place. See
  [Scaling data / large files](/docs/guides/scaling-data).

## Where to go next

- **[Add a chart](/docs/guides/add-a-chart)** — visualize the data you just added.
- **[Render a map](/docs/guides/render-a-map)** — for geographic data.

<DocsPagination prev="/docs/guides" next="/docs/guides/scaling-data" />
