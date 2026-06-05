---
metatitle: Connect a CKAN Backend to PortalJS – The Decoupled Path
metadescription: Wire your PortalJS portal to a live CKAN instance over its API with /connect-ckan — the decoupled path. Lists and renders datasets straight from CKAN, no static files.
title: Connect a CKAN backend
description: Wire the portal to a live CKAN instance over its API — the decoupled path, with /connect-ckan or by hand.
---

**Goal:** stop reading static files from `/public/data/` and instead list and render
datasets straight from a live [CKAN](/ckan) instance over its REST API — the
decoupled, "any backend" path.

> [!info] Before you start
> You need a portal scaffolded with [`/new-portal`](/docs/skills/new-portal) and the
> **root URL of a publicly reachable CKAN instance** (e.g.
> `https://demo.dev.datopian.com`). The skill appends `/api/3/action/...` itself.

## The AI path — `/connect-ckan`

```
/connect-ckan https://demo.dev.datopian.com
```

Optionally restrict the catalog to one or more organizations or groups:

```
/connect-ckan https://demo.dev.datopian.com — orgs: my-org
```

[`/connect-ckan`](/docs/skills/connect-ckan) verifies the CKAN API is reachable,
installs `@portaljs/ckan`, generates a `lib/ckan.ts` client module, and rewrites the
home page and dataset route to fetch from CKAN. It runs a full `next build` and
reports how many dataset pages were generated.

## How it works — the decoupled model

The frontend is **independent from the backend** and talks to it over the API
(`package_search` for the catalog, `package_show` for each dataset). The generated
pages fetch CKAN **server-side** in `getStaticProps`/`getStaticPaths`, so the
`@portaljs/ckan` bundle never reaches the browser — the client stays lean and the site
can still deploy statically.

It writes plain, editable code:

- `lib/ckan.ts` — a shared `CKAN` client. The base URL defaults to what you passed and
  is overridable at deploy time via the `DMS` env var; org/group filters and a
  build-time `MAX_DATASETS` cap live here as plain constants.
- `pages/index.tsx` — a catalog home that lists datasets from `package_search`.
- `pages/datasets/[slug].tsx` — one statically generated page per dataset, with
  CSV/TSV resources previewed through the template's local `<Table />`.

> [!note] Keep CKAN calls server-side
> Reference `ckan`, `DMS`, and the filters **only** inside
> `getStaticProps`/`getStaticPaths`. If a component body imports them, Next.js bundles
> the whole `@portaljs/ckan` package into the client. Pass plain serializable props to
> components instead.

## The by-hand path

Install the client and create `lib/ckan.ts`:

```bash
npm install @portaljs/ckan@^0.1.0
```

```ts
import { CKAN } from '@portaljs/ckan';
export const ckan = new CKAN((process.env.DMS || 'https://demo.dev.datopian.com').replace(/\/+$/, ''));
```

Then call `ckan.packageSearch(...)` from `getStaticProps` on the home page and
`ckan.getDatasetDetails(slug)` from a dynamic `pages/datasets/[slug].tsx`, passing the
results as props.

> [!note] TypeScript types for @portaljs/ckan
> Under the template's `moduleResolution: "bundler"`, add a `paths` entry in
> `tsconfig.json` so TypeScript finds the declarations:
> `"@portaljs/ckan": ["./node_modules/@portaljs/ckan/dist/index.d.ts"]`. Without it the
> build fails to type-check.

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
