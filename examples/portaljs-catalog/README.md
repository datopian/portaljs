# PortalJS Catalog Template (dynamic routes)

A template variant for portals with **many datasets**. Instead of one page file per
dataset, the catalog is driven by a single manifest (`datasets.json`) and rendered by a
dynamic route (`pages/datasets/[slug].tsx` + `getStaticPaths`). Adding a dataset is one
JSON entry plus a data file — no new page.

## When to use this vs `portaljs-template`

| | `portaljs-template` | `portaljs-catalog` (this) |
|---|---|---|
| Dataset pages | one `.tsx` file per dataset | one dynamic `[slug].tsx` for all |
| Registration | hardcoded array in `index.tsx` | `datasets.json` manifest |
| Best for | a handful of datasets | dozens to hundreds |

Both ship the same lightweight `components/Table.tsx`, Tailwind setup, and Next 14 config.

## Running

```bash
cd examples/portaljs-catalog
npm install
npm run dev
```

## Adding a dataset

1. Drop the file in `public/data/` (e.g. `public/data/my-data.csv`).
2. Append an entry to `datasets.json`:

```json
{
  "slug": "my-data",
  "name": "My Data",
  "description": "One-line description.",
  "file": "my-data.csv",
  "format": "csv"
}
```

That's it. `getStaticPaths` picks up the new slug at build time and `/datasets/my-data`
renders automatically. CSV and TSV files are previewed in an interactive `<Table />`;
other formats (`json`, `geojson`) show a download link.

## Placeholder tokens

`/new-portal` replaces these at scaffold time:

| Token | Replaced with |
|-------|--------------|
| `__PROJECT_NAME__` | Human-readable portal name |
| `__PROJECT_SLUG__` | URL-safe slug |
| `__DESCRIPTION__` | One-sentence portal description |

## Structure

```
datasets.json             — manifest: the single source of truth for the catalog
lib/datasets.ts           — typed loader (getDatasets / getDataset)
pages/index.tsx           — searchable catalog, reads manifest via getStaticProps
pages/datasets/[slug].tsx — dynamic dataset page (getStaticPaths + getStaticProps)
public/data/              — dataset files
components/Table.tsx      — interactive table (search, sort, paginate)
```
