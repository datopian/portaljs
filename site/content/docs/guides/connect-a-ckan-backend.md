---
metatitle: Connect a CKAN Backend to PortalJS – The Decoupled Path
metadescription: Wire your PortalJS portal to a live CKAN instance over its API with /portaljs-connect-ckan — the decoupled path. Lists and renders datasets straight from CKAN, no static files.
title: Connect a CKAN backend
description: Wire the portal to a live CKAN instance over its API — the decoupled path, with /portaljs-connect-ckan or by hand.
---

**Goal:** stop reading static files from `/public/data/` and instead list and render
datasets straight from a live [CKAN](/ckan) instance over its REST API — the
decoupled, "any backend" path.

> [!info] Before you start
> You need a portal scaffolded with [`/portaljs-new-portal`](/docs/skills/portaljs-new-portal) and the
> **root URL of a publicly reachable CKAN instance** (e.g.
> `https://demo.dev.datopian.com`). The skill appends `/api/3/action/...` itself.

## The AI path — `/portaljs-connect-ckan`

```
/portaljs-connect-ckan https://demo.dev.datopian.com
```

Optionally restrict the catalog to one or more organizations or groups:

```
/portaljs-connect-ckan https://demo.dev.datopian.com — orgs: my-org
```

[`/portaljs-connect-ckan`](/docs/skills/portaljs-connect-ckan) verifies the CKAN API is reachable,
generates a tiny `lib/ckan.ts` fetch client (no runtime dependency), and rewrites the
catalog (`/search`) and the dataset showcase route to fetch from CKAN. It runs a full
`next build` and reports how many dataset pages were generated.

## How it works — the decoupled model

The frontend is **independent from the backend** and talks to it over the API
(`package_search` for the catalog, `package_show` for each dataset). The generated
pages fetch CKAN **server-side** in `getStaticProps`/`getStaticPaths`, so the catalog is
pre-rendered at build time and the site can still deploy statically.

It writes plain, editable code:

- `lib/ckan.ts` — a tiny `fetch`-based CKAN client (no dependency). The base URL defaults
  to what you passed and is overridable at deploy time via the `DMS` env var; org/group
  filters and a build-time `MAX_DATASETS` cap live here as plain constants.
- `pages/search.tsx` — the catalog at `/search`, listing datasets from `package_search`.
- `pages/[owner]/[slug].tsx` — the dataset showcase at `/@<namespace>/<slug>`, one
  statically generated page per dataset, with CSV/TSV resources previewed through the
  template's local `<Table />`.

> [!note] Keep CKAN calls server-side
> Reference `ckan`, `DMS`, and the filters **only** inside
> `getStaticProps`/`getStaticPaths`, and pass plain serializable props to components. The
> fetch wrapper has no client cost, but keeping data-fetching server-side preserves the
> pre-rendered SSG model.

## The by-hand path

Create `lib/ckan.ts` — a small server-side `fetch` wrapper over the CKAN REST API. No
package to install, no `tsconfig` changes; it uses the built-in `fetch`:

```ts
export const DMS = (process.env.DMS || 'https://demo.dev.datopian.com').replace(/\/+$/, '');

async function ckanAction(action: string, params: Record<string, string>) {
  const res = await fetch(`${DMS}/api/3/action/${action}?${new URLSearchParams(params)}`);
  if (!res.ok) throw new Error(`CKAN ${action} failed: ${res.status}`);
  const body = await res.json();
  if (!body?.success) throw new Error(`CKAN ${action} returned success=false`);
  return body.result;
}

export const ckan = {
  packageSearch: (rows = 200) =>
    ckanAction('package_search', { rows: String(rows) }).then((r) => ({ datasets: r.results, count: r.count })),
  getDatasetDetails: (slug: string) => ckanAction('package_show', { id: slug }),
};
```

Then call `ckan.packageSearch(...)` from `getStaticProps` on the catalog
(`pages/search.tsx`) and `ckan.getDatasetDetails(slug)` from the dynamic showcase route
`pages/[owner]/[slug].tsx`, passing the results as props.

> [!note] Why not `@portaljs/ckan`?
> That package's bundle wires React UI components to React 18 internals
> (`ReactCurrentDispatcher`) and crashes at import under the template's React 19 — even
> server-side. The fetch wrapper above covers the two REST actions the portal needs with
> no React coupling and zero client bytes.

## Notes

- **Data freshness vs. static deploy:** the default is SSG — fast and statically
  hostable, but data is fixed at build time (rebuild to pick up new datasets). For
  always-live data, deploy to a Node host and switch to `getServerSideProps` or
  `getStaticPaths` `fallback: 'blocking'`.
- **Build time scales with dataset count:** each dataset is one request and one static
  page. `MAX_DATASETS` caps it on large instances.
- **CORS for previews:** the `<Table>` preview fetches resource URLs from the browser;
  datastore-backed resources are the most reliable.

## Where to go next

- **[Backends](/docs/backends)** — integration notes for CKAN, DKAN, OpenMetadata,
  Purview, DataHub, GitHub, Frictionless, and custom backends.
- **[Deploy](/docs/guides/deploy)** — publish the portal (use Vercel for SSR portals).

<DocsPagination prev="/docs/guides/render-a-map" next="/docs/guides/deploy" />
