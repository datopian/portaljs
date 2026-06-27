---
metatitle: Scaling Data in PortalJS – Large Files with Git LFS, R2, and DuckDB
metadescription: How PortalJS scales from a few KB of CSV to multi-GB datasets — three storage tiers (inline, Git-LFS + R2, external + Parquet), how Giftless streams bytes to Cloudflare R2, and the in-browser DuckDB query tier that reads big files without downloading them.
title: Scaling data / large files
description: Three tiers for dataset bytes — inline, Git-LFS + R2 via Giftless, and external Parquet queried in place — and how to pick between them.
---

**Goal:** understand how PortalJS handles data as it grows from a handful of KB to
multiple GB, and how to publish a large dataset so the portal stays lean and the
browser only fetches the bytes it needs.

> [!info] Before you start
> This page is conceptual — it explains the *why* behind the routing
> [`/portaljs-add-dataset`](/docs/skills/portaljs-add-dataset) and
> [`/portaljs-deploy`](/docs/skills/portaljs-deploy) apply automatically. You don't have
> to wire any of this by hand; the skills do. Read it to know which tier you're on and
> when to move up one.

## The problem with committing big files

A PortalJS catalog is a static Next.js export. The naive path — drop every CSV into
`public/data/` and commit it — works for a few small reference files, but breaks down
as data grows:

- **Git bloats.** Every revision of a binary lives forever in history; a repo with a
  few hundred MB of data becomes slow to clone.
- **The export ships every byte.** A static build copies `public/data/` into `out/`, so
  a 500 MB dataset becomes a 500 MB upload — and the browser would download the whole
  file just to preview ten rows.

So PortalJS routes dataset bytes through **three tiers**, and `/portaljs-add-dataset`
picks one per dataset by **source first, then size/intent**.

## The three tiers

| Tier | Where the bytes live | Manifest `path` | When |
|------|----------------------|-----------------|------|
| **1 — inline** | committed in `public/data/` | bare filename → `/data/<file>` | bundled **sample** data, or an OSS self-host with no R2. A *fenced exception*, not a size rule. |
| **2 — Git-LFS + R2** | Cloudflare R2; a ~134 B pointer in git | **absolute R2 URL** | **the default** for any data you add — the browser fetches bytes straight from R2. |
| **3 — external** | wherever it already is (incl. Parquet on R2) | the **absolute URL**, unchanged | a remote URL recorded as-is (passthrough, zero copy), or Parquet queried in place. |

One abstraction unifies them: every dataset entry in `datasets.json` carries a
`file` (or `resource.path`), and `resourceUrl()` in `lib/datasets.ts` serves a
**repo-relative** path from `/public/data` and passes an **absolute URL** straight
through. So a tier is just "what string goes in `path`" — the showcase, catalog, and
deploy never branch on the source.

### Tier 1 — inline (the fenced exception)

The bundled sample files under `public/data/` ship **inline** so a freshly scaffolded
portal runs offline with zero credentials. `.gitattributes` fences this directory out
of LFS:

```
public/data/** -filter -diff -merge text
```

Inline is **not a size threshold** — it's reserved for sample data and the
OSS-no-R2 fallback. Everything you add defaults to tier 2.

### Tier 2 — Git-LFS → R2 via Giftless (the default)

This is where added data goes. The bytes stream to Cloudflare R2; only a tiny
[Git LFS](https://git-lfs.com) pointer (the SHA-256 + size, ~134 B) stays in git. See
[how Giftless and R2 work](#how-giftless-and-r2-work) below for the mechanism.

`/portaljs-add-dataset` does it for you — `git lfs track` the file, commit the pointer,
push (bytes land in R2), then write the **absolute R2 URL** into `datasets.json`. The
browser fetches the data directly from R2, so no bytes ever enter the static export.

### Tier 3 — external + the query tier

A remote URL is recorded **as-is** by default (passthrough): nothing is downloaded or
copied, and `resourceUrl()` passes the absolute URL through. The special case worth
reaching for is **Parquet on R2**, which unlocks querying a huge file without
downloading it — see [the query tier](#the-query-tier).

> [!warning] Passthrough + querying
> Serving and download links always work for a remote URL. But in-browser **range /
> DuckDB queries** against a third-party host need CORS + HTTP range support on *that*
> host, which PortalJS doesn't control. If you need querying (not just preview), adopt
> the file into R2 (`/portaljs-add-dataset` offers this) — R2 is configured for both.

## How Giftless and R2 work

[Giftless](https://github.com/datopian/giftless) is Datopian's pluggable Git LFS
server. PortalJS runs it in front of a Cloudflare **R2** bucket (R2 speaks the
S3-compatible API). The flow when you add a large file:

1. **`git lfs track <path>`** appends a per-file entry to `.gitattributes`. Routing is
   **format-agnostic** — any binary, not an extension allowlist.
2. **Commit** replaces the file in git with a small text pointer (`oid sha256:…` + size).
3. **`git push`** — Git LFS uploads the bytes to Giftless, which **presigns a
   direct-to-R2 PUT**; the bytes land in R2 at key `lfs/datopian/<project-slug>/<oid>`.
4. **Serving** — the manifest `path` is the bucket's public R2 URL for that object, so
   the browser fetches the data **straight from R2**. R2 has CORS + range headers
   configured (`giftless/r2-cors.json`), which also unlocks the query tier.

**Auth is local-only.** `.lfsconfig` is committed and points LFS at the Giftless
endpoint, but carries **no credentials**. Each client mints a repo-scoped JWT and sets a
credentialed `lfs.url` in *local* git config (never committed):

```bash
# Prod signs tokens with RS256 — needs the issuer's private key (jwt_private_key).
TOKEN=$(python3 giftless/mint-token.py --org datopian --repo <project-slug> \
  --ttl 3600 --algorithm RS256 --key-file giftless/jwt_private_key)
git config lfs.url "https://_jwt:$TOKEN@lfs.portaljs.com/datopian/<project-slug>"
```

The `_jwt:` HTTP-Basic piggyback authenticates the LFS API call without clobbering the
presigned-R2 PUT or the verify callback. See
[`giftless/README.md`](https://github.com/datopian/portaljs/blob/main/giftless/README.md)
for the full setup.

After a push, reclaim local disk with `git lfs prune` — the working tree plus the
`.git/lfs` cache hold ~2× the bytes until pruned.

## The query tier

Once data is on R2, the showcase can query it **in place** rather than downloading the
whole file. Convert CSV/TSV to **Parquet** and the showcase reads it with **DuckDB-Wasm**
over HTTP **range requests**: projection + predicate pushdown mean the browser fetches
only the Parquet footer and the row groups/columns a query actually touches. A phone can
query a multi-GB file by pulling a few MB.

```bash
# Convert at publish time (DuckDB CLI — columnar + compressed):
duckdb -c "COPY (SELECT * FROM 'data/orders.csv') TO 'data/orders.parquet' (FORMAT parquet)"
# Version the .parquet with Git LFS (→ R2, tier 2), then point the dataset's
# resource at the R2 URL with format: "parquet".
```

**Two execution paths** (`lib/query/duckdb.ts`):

| | Range query | Buffered |
|---|---|---|
| **When** | remote **Parquet** URL (e.g. on R2) | local/bundled files, and all CSV/TSV |
| **How** | a `VIEW` over `read_parquet(url)` | `fetch` whole file → in-memory `TABLE` |
| **Bytes fetched** | footer + only the row groups/columns each query touches | the entire file, up front |
| **Ceiling** | bounded by the query, not the file size | Wasm memory (~4 GB) holds the whole file |

A **Parquet** resource always renders the in-browser SQL explorer
(`components/DataExplorer.tsx`). CSV/TSV opt in portal-wide with
`DATA_QUERY = 'duckdb'` in `lib/datasets.ts` (default `'flat'` = papaparse preview).
The engine runs **entirely client-side** — no server, no datastore — and `duckdb-wasm`
loads on demand from a CDN only when a query view mounts, so flat portals never pay for
it.

Because DuckDB-Wasm runs on the client, performance is **device-bound** (single-threaded
unless cross-origin isolated; ~4 GB Wasm memory wall; slower on mobile). Lean on the
range path, keep a `LIMIT` on exploratory queries, and pre-aggregate at publish time.
For data too big for the browser, the same `DataQuery` seam can route to an edge Worker
or MotherDuck — a deliberately deferred follow-on. See
[`lib/query/README.md`](https://github.com/datopian/portaljs/blob/main/examples/portaljs-catalog/lib/query/README.md)
for the contract and device-tier guidance.

## Choosing a tier

- **A few small reference CSVs that ship with the portal** → tier 1 (inline). Leave them
  in `public/data/`.
- **Any data you add, of any size** → tier 2 (LFS → R2). This is the default;
  `/portaljs-add-dataset` handles it.
- **A dataset that already lives at a public URL** → tier 3 passthrough (recorded as-is).
- **A large dataset users will filter/aggregate** → tier 3 Parquet on R2 + the DuckDB
  query tier.

[`/portaljs-architect`](/docs/skills/portaljs-architect) names two of these directly in
its brief: the **data tier** (`inline | LFS | external`) and the **query mode**
(`DATA_QUERY = flat | duckdb`). See the
[Architecture decision framework](/docs/architecture/decision-framework) for how it
reasons about volume, query needs, and cost.

## Deploy stays lean

[`/portaljs-deploy`](/docs/skills/portaljs-deploy) serves large data from R2 too. It
**never** runs `git lfs pull` into the build, so no dataset bytes enter the static
export, and it gates the upload on `npm run check-export` (`scripts/check-export.mjs`),
which fails on Git LFS pointer leaks or oversized files in `out/`. The export ships zero
dataset bytes; the bytes stay in R2.

## Where to go next

- **[Add tabular data](/docs/guides/add-tabular-data)** — add a dataset (tier 2 by
  default).
- **[Deploy](/docs/guides/deploy)** — publish; large data serves from R2.
- **[Architecture decision framework](/docs/architecture/decision-framework)** — the
  reasoning behind storage + compute choices.

<DocsPagination prev="/docs/guides/add-tabular-data" next="/docs/guides/add-a-chart" />
