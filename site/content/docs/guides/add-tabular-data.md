---
metatitle: Add Tabular Data to PortalJS – CSV, TSV, JSON Tables
metadescription: Add a CSV, TSV, or JSON dataset to your PortalJS portal and render it as a sortable, paginated table — with /add-dataset, or by hand with the Table component.
title: Add tabular data
description: Add a CSV, TSV, or JSON dataset and render it as a sortable table — with /add-dataset, or by hand.
---

**Goal:** add a CSV, TSV, or JSON file to your portal and render it as a table on its
own dataset page, linked from the home page catalog.

> [!info] Before you start
> You need a portal scaffolded with [`/new-portal`](/docs/skills/new-portal). Tabular
> formats supported: **CSV, TSV, and JSON (array)**. For GeoJSON, see
> [Render a map](/docs/guides/render-a-map).

## The AI path — `/add-dataset`

Point [`/add-dataset`](/docs/skills/add-dataset) at a local file or a public URL:

```
/add-dataset ./data/population.csv — Auckland population by area
```

```
/add-dataset https://example.com/air-quality.csv — Air quality monitoring
```

It copies the data into `/public/data/`, generates a dataset page at
`pages/datasets/<slug>.tsx` with a `<Table />`, and registers the dataset on the home
page catalog. Run `npm run dev` and visit `/datasets/<slug>` to check it.

## The by-hand path

Drop the file into `/public/data/`:

```bash
cp ~/Downloads/population.csv public/data/population.csv
```

Create `pages/datasets/population.tsx`:

```tsx
import { Table } from '../../components/Table';
import Head from 'next/head';

export default function PopulationDataset() {
  return (
    <>
      <Head><title>Population by area</title></Head>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Population by area</h1>
        <Table url="/data/population.csv" fullWidth />
      </main>
    </>
  );
}
```

The `Table` component (in `components/Table.tsx`) fetches the file in the browser with
`papaparse` and renders it with `@tanstack/react-table` — no server code, and it works
under static export. For a **JSON array**, import the file and pass it as `data` with
`cols` instead of a `url`; set `"resolveJsonModule": true` in `tsconfig.json` first.

Finally, add a link to the new page from your home page catalog (`pages/index.tsx`).

> [!note] Many datasets?
> If you'll have dozens of datasets, use the
> [catalog template](/docs/templates) — one dynamic `[slug].tsx` route driven by a
> `datasets.json` manifest, so adding a dataset is a JSON entry plus a data file.

## Notes

- **TSV** works the same way — `papaparse` auto-detects the delimiter.
- **Large files (>5MB)** load slowly in the browser; consider server-side pagination
  for production.

## Where to go next

- **[Add a chart](/docs/guides/add-a-chart)** — visualize the data you just added.
- **[Render a map](/docs/guides/render-a-map)** — for geographic data.

<DocsPagination prev="/docs/guides" next="/docs/guides/add-a-chart" />
