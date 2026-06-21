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

The bundled sample files under `public/data/` are the small reference data that ships
inline so the portal runs offline. For **large data**, see below.

## Large data (Git LFS → R2)

Committing big files to `public/data/` doesn't scale — git bloats and the static export
ships every byte. So the template wires large data through **Git LFS → Cloudflare R2**
(epic po-g9y):

- **`.gitattributes`** routes added data through Git LFS **per file** — it ships minimal
  and `/portaljs-add-dataset` appends a path-specific entry for each file it sends to R2
  (format-agnostic, any binary). The bundled `public/data/` sample is a fenced exception —
  it stays inline so the portal runs offline with zero credentials.
- **`.lfsconfig`** points LFS at the [Giftless](../../giftless) endpoint, which streams
  the bytes to R2 and leaves a tiny pointer in git. It carries **no credentials** — auth
  is local-only (see `giftless/README.md`).
- **Serving:** the browser fetches the bytes straight from R2. A dataset whose data lives
  in R2 sets its `resource.path` (or `file`) to the **absolute R2 URL** — `resourceUrl()`
  in `lib/datasets.ts` passes absolute URLs through unchanged, so no bytes are copied into
  the repo or the static export. R2 CORS + range headers are configured and verified
  (`giftless/r2-cors.json`), which also unlocks the DuckDB-Wasm range-query tier.

- **Deploy:** `/portaljs-deploy` serves large data from R2 too — it never pulls LFS bytes into
  the static export and gates the upload on `npm run check-export` (`scripts/check-export.mjs`),
  which fails on LFS pointer leaks or oversized files in `out/`. The export stays lean; the
  bytes stay in R2.

`/portaljs-add-dataset` automates this routing: local files → R2 via LFS by default;
remote URLs → recorded as-is (passthrough) by default, or adopted into R2 on request.
Inline storage is a fenced exception for bundled sample data.

## Query tier — query large data without downloading it

Once data is on R2, the showcase can query it **in place** instead of downloading
the whole file. Convert CSV/TSV to **Parquet** and the showcase reads it with
DuckDB-Wasm over HTTP range requests — projection + predicate pushdown mean a
browser fetches only the row groups and columns a query touches, so a phone can
query a multi-GB file by pulling a few MB:

```bash
scripts/csv-to-parquet.sh public/data/orders.csv orders.parquet
# version with Git LFS (→ R2), then point the resource at the R2 URL with format: "parquet"
```

A Parquet resource always renders the in-browser SQL explorer; CSV/TSV opt in via
`DATA_QUERY = 'duckdb'` in `lib/datasets.ts`. The engine runs entirely client-side
(no server, no catalog DB) and loads only when a query view mounts. For data too
big for the browser, the same `DataQuery` seam can route to an edge Worker or
MotherDuck — see [`lib/query/README.md`](lib/query/README.md) for the contract and
device-tier / fallback guidance.

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

## Branding (placeholder — swap it)

The template ships with the **PortalJS** mark as a clearly-swappable placeholder so a fresh
portal looks intentional before you customize it: a favicon, a navbar logo (with a tasteful
spin on hover that respects `prefers-reduced-motion`), and social/PWA icons.

To make it your own, replace the icon files in `public/` with your own brand marks — the
links in `pages/_document.tsx` and the logo in `components/Navbar.tsx` then need no changes:

| File | Used for |
|------|----------|
| `public/icon.svg` | navbar logo + modern-browser favicon (scalable) |
| `public/favicon.ico` | classic browser-tab favicon (16/32/48) |
| `public/apple-touch-icon.png` | iOS home-screen icon (180×180) |
| `public/icon-512.png` | PWA / social card (512×512) |

The navbar's brand text uses the same `__PROJECT_NAME__` token, so it is already set to your
portal name after scaffolding.

## Structure

```
datasets.json              — manifest: the single source of truth for the catalog
lib/datasets.ts            — typed loader (getDatasets / getDataset / datasetHref / NAMESPACE_TYPE)
pages/index.tsx            — landing page: hero + search CTA + suggested chips
pages/search.tsx           — searchable dataset list, reads manifest via getStaticProps
pages/[owner]/[slug].tsx   — dynamic dataset showcase (/@<namespace>/<slug>)
pages/_app.tsx             — renders the Navbar on every page
pages/_document.tsx        — favicon / icon links + default meta description
public/data/               — bundled SAMPLE data (inline, offline-friendly)
public/{icon.svg,favicon.ico,apple-touch-icon.png,icon-512.png} — branding (placeholder)
components/Navbar.tsx       — site navbar: logo (hover-spin) + name + link to /search
components/Table.tsx       — interactive table (search, sort, paginate)
.gitattributes             — routes large data formats through Git LFS (→ R2)
.lfsconfig                 — Git LFS endpoint (Giftless → R2); no credentials
```
