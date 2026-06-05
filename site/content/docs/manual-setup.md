---
metatitle: PortalJS Manual Setup – Clone the Template and Build by Hand
metadescription: Prefer to build by hand? Clone the PortalJS template, add CSV/JSON/GeoJSON data to /public/data, and edit plain Next.js pages directly. No AI required.
title: Manual setup — build by hand
description: Clone the lightweight template and edit it directly. No AI assistant required — the same project the skills produce, built by hand.
---

The skills are the fast path, but PortalJS is **AI-native, not AI-only**. Every
skill produces plain, editable code — so you can skip the agent entirely and build
the same project by hand. This page shows how.

> [!info] Prerequisites
>
> - **Node.js >= 18**
> - Familiarity with Next.js and Tailwind helps, but isn't required.

## 1. Get the template

Grab the canonical lightweight template with [degit](https://github.com/Rich-Harris/degit)
(no git history, just the files):

```bash
npx degit datopian/portaljs/examples/portaljs-template my-portal
cd my-portal
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You now have a running portal
with a sample dataset.

> [!note] Many datasets?
> For a catalog with dozens of datasets, use the dynamic-routes variant
> `examples/portaljs-catalog` instead — it renders every dataset through one
> `pages/datasets/[slug].tsx` route from a `datasets.json` manifest, so adding a
> dataset is a JSON entry plus a data file.

## 2. Add a dataset

Drop your file into `/public/data/`:

```bash
cp ~/Downloads/population.csv public/data/population.csv
```

Create a dataset page at `pages/datasets/population.tsx`:

```tsx
import { Table } from '../../components/Table';
import Head from 'next/head';

export default function PopulationDataset() {
  return (
    <>
      <Head>
        <title>Population by area</title>
      </Head>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Population by area</h1>
        <Table url="/data/population.csv" />
      </main>
    </>
  );
}
```

The `Table` component (in `components/Table.tsx`) fetches the CSV in the browser
with `papaparse` and renders it with `@tanstack/react-table`. No server code
needed — Next.js serves `/public/` statically.

Then add a link to the new page from your home page catalog (`pages/index.tsx`).

## 3. Add charts, maps, and backends

Everything the skills do, you can do by hand:

- **Charts** — `npm install recharts` and add a chart component to the dataset
  page.
- **Maps** — `npm install react-leaflet leaflet` and render a GeoJSON file.
- **CKAN** — `npm install @portaljs/ckan` and pass a `datastoreConfig` to `Table`,
  or build a catalog against the CKAN API. See [CKAN integration](/ckan).

For the conventions these follow — import paths, data loading, page structure —
read the [`CLAUDE.md`](https://github.com/datopian/portaljs/blob/main/CLAUDE.md)
development guide in the repo.

## 4. Deploy

The template is a standard Next.js app. Deploy it to Vercel:

```bash
npx vercel
```

…or export a static build (`next build`) and host the `out/` directory anywhere.

## Where to go next

- **[Core concepts](/docs/core-concepts)** — the ideas behind the template and the
  skills.
- **[Quickstart](/docs/quickstart)** — let the skills do the typing instead.

<DocsPagination prev="/docs/quickstart" next="/docs/core-concepts" />
