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

Scaffold the canonical catalog template with the `create-portaljs` CLI — it copies the
template, substitutes your project name, and sets the namespace mode:

```bash
npm create portaljs@latest my-portal
cd my-portal
npm install   # (the CLI offers to do this for you)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You now have a running portal —
a home page (`/`), a search catalog at `/search`, and per-dataset showcase pages — with
a few sample datasets.

> [!note] Bare copy, no prompts
> To grab just the files with no scaffolding prompts, use
> [tiged](https://github.com/tiged/tiged) (a maintained `degit` fork that reliably
> extracts the subdirectory): `npx tiged datopian/portaljs/examples/portaljs-catalog my-portal`.

> [!note] Just a landing page?
> If you only want a single home page with no catalog or dataset pages, use the
> minimal variant `examples/portaljs-template` instead and build up from there. See
> [Templates](/docs/templates).

## 2. Add a dataset

Datasets are driven by a `datasets.json` manifest — there's no per-dataset page file
to write. Drop your file into `/public/data/`:

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

That's it — the dataset now renders at **`/@reference/population`** through the
existing `pages/[owner]/[slug].tsx` showcase route, and shows up in the `/search`
catalog. The showcase previews the file with the `Table` component (in
`components/Table.tsx`), which fetches the CSV in the browser with `papaparse` and
renders it with `@tanstack/react-table` — no server code needed, since Next.js serves
`/public/` statically.

Every dataset carries a `namespace`. A portal uses **one** namespace mode —
`theme` (group by subject) or `owner` (group by publisher) — set via `NAMESPACE_TYPE`
in `lib/datasets.ts`. It only changes the showcase's metadata label; the URL is always
`/@<namespace>/<slug>`. See [Core concepts](/docs/core-concepts) for why dataset URLs
start with `@`.

## 3. Add charts, maps, and backends

Everything the skills do, you can do by hand:

- **Charts** — `npm install recharts` and add a chart as a view in the dataset's
  showcase (`pages/[owner]/[slug].tsx`).
- **Maps** — `npm install react-leaflet leaflet` and render a GeoJSON file as a view
  in the showcase.
- **CKAN** — build a catalog against the CKAN REST API with a tiny server-side `fetch`
  client (no dependency); `/portaljs-connect-ckan` generates it for you. See
  [CKAN integration](/ckan).

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
