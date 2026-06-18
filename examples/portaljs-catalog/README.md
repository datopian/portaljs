# PortalJS Catalog Template (dynamic routes)

A template variant for portals with **many datasets**. Instead of one page file per
dataset, the catalog is driven by a single manifest (`datasets.json`) and rendered by a
dynamic route (`pages/[owner]/[slug].tsx` + `getStaticPaths`). Adding a dataset is one
JSON entry plus a data file — no new page.

## The three surfaces

| Surface | Route | File | What it is |
|---|---|---|---|
| Home | `/` | `pages/index.tsx` | Landing page: hero + search CTA + suggested-query chips |
| Catalog / search | `/search` | `pages/search.tsx` | The dataset list with client-side full-text filtering |
| Dataset showcase | `/@<namespace>/<slug>` | `pages/[owner]/[slug].tsx` | One dataset: metadata, data preview, download/API, views |

The home page's search box and chips navigate to `/search?q=…`; each search result links
to its showcase at `/@<namespace>/<slug>`.

## When to use this vs `portaljs-template`

| | `portaljs-template` | `portaljs-catalog` (this) |
|---|---|---|
| Dataset pages | one `.tsx` file per dataset | one dynamic `[owner]/[slug].tsx` for all |
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
  "namespace": "reference",
  "name": "My Data",
  "description": "One-line description.",
  "file": "my-data.csv",
  "format": "csv"
}
```

That's it. `getStaticPaths` picks up the new `(namespace, slug)` pair at build time and
`/@reference/my-data` renders automatically. CSV and TSV files are previewed in an
interactive `<Table />`; other formats (`json`, `geojson`) show a download link.

## Why dataset URLs start with `@`

Dataset showcase URLs are namespaced under `@` (`/@<owner-or-theme>/<dataset>`) so they
**never collide** with regular content/static pages (which never start with `@`). The
dataset route is a 2-segment dynamic route (`pages/[owner]/[slug].tsx`) resolved entirely
by static generation from the manifest — so **content/static pages should not use
2-segment non-`@` paths**, or they would clash with the dataset route's matcher.

A portal uses **exactly one** namespace mode, set via `NAMESPACE_TYPE` in
`lib/datasets.ts`:

- **`'theme'`** — a single-publisher portal whose datasets are grouped by subject
  (e.g. `@reference/country-codes`). The showcase labels the namespace "Theme".
- **`'owner'`** — a multi-publisher portal whose datasets are grouped by who published
  them (e.g. `@worldbank/country-codes`). The showcase labels the namespace "Owner".

Picking one mode keeps every `(@namespace, slug)` pair unique. The URL shape is
`/@<namespace>/<slug>` regardless of which mode is chosen — `NAMESPACE_TYPE` only changes
the metadata label on the showcase.

## Placeholder tokens

`/portaljs-new-portal` replaces these at scaffold time:

| Token | Replaced with |
|-------|--------------|
| `__PROJECT_NAME__` | Human-readable portal name |
| `__PROJECT_SLUG__` | URL-safe slug |
| `__DESCRIPTION__` | One-sentence portal description |

## Structure

```
datasets.json              — manifest: the single source of truth for the catalog
lib/datasets.ts            — typed loader (getDatasets / getDataset / datasetHref / NAMESPACE_TYPE)
pages/index.tsx            — landing page: hero + search CTA + suggested chips
pages/search.tsx           — searchable dataset list, reads manifest via getStaticProps
pages/[owner]/[slug].tsx   — dynamic dataset showcase (/@<namespace>/<slug>)
public/data/               — dataset files
components/Table.tsx       — interactive table (search, sort, paginate)
```
