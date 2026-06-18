---
description: Wire a scaffolded PortalJS portal to a CKAN backend over its API. Generates a tiny server-side fetch client (no runtime dependency) and feeds the /search catalog and /@<namespace>/<slug> showcases from CKAN instead of datasets.json.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /portaljs-connect-ckan

Connect an existing `portaljs-catalog` portal to a live CKAN backend. The portal stops
reading the static `datasets.json` manifest (and files in `/public/data/`) and instead
feeds its two data surfaces — the **`/search` catalog** and the **`/@<namespace>/<slug>`
showcases** — straight from a CKAN instance's REST API (`package_search` / `package_show`)
through a tiny generated fetch client. Output is plain, editable Next.js code with **no
runtime dependency** — no opaque framework wiring.

> **Why a fetch client, not `@portaljs/ckan`?** That package's bundle wires React UI
> components to React 18 internals (`ReactCurrentDispatcher`) and crashes at import under
> the template's React 19 — even server-side, where this skill imports it. The CKAN client
> class is locked inside that same module, so it can't be used in isolation. A ~40-line
> `fetch` wrapper covers the two REST actions this skill needs (`package_search`,
> `package_show`), is server-side only, ships zero client bytes, and has no React coupling.

Use this for the "decoupled / any backend" path: the user has a CKAN data management
system (their own or a public one) and wants a browseable portal in front of it.

**You can run this right after `/portaljs-new-portal`.** A fresh portal ships with a few sample
datasets so it builds and renders immediately — you do NOT need to hand-author a static
dataset list first. If the user says up front they want a CKAN backend, scaffold with the
sample data, then run `/portaljs-connect-ckan` to swap the source over to CKAN. Only a CKAN base
URL is required.

The generated pages fetch CKAN **server-side** in `getStaticProps`/`getStaticPaths`, so the
catalog is pre-rendered at build time and the site can be statically deployed.

## Required input — ask, don't error

- **CKAN base URL** (required) — e.g. `https://demo.dev.datopian.com`. The root of the
  CKAN instance; the skill appends `/api/3/action/...` itself. Must be publicly reachable.
- **Org filter** (optional) — one or more CKAN organization names to restrict the catalog to.
- **Group filter** (optional) — one or more CKAN group names to restrict the catalog to.
- **Portal directory** (optional) — path to the portal project (default: current directory).

**If the CKAN base URL is missing, ask for it (and the optional org/group filter) — never
dead-end with a missing-input error.**

## Steps

### 1. Gather input from `$ARGUMENTS` (interview if thin)

Extract:
- `CKAN_URL` — base URL, with any trailing slash stripped.
- `ORG_FILTER` — list of org names (default: empty = all orgs).
- `GROUP_FILTER` — list of group names (default: empty = all groups).
- `PORTAL_DIR` — portal directory (default: `.`).

If the CKAN base URL is missing, **ask** and wait for the answer:
```
To connect a CKAN backend I need:
1. CKAN base URL (e.g. https://demo.dev.datopian.com)  — required
2. Optional org filter (Enter for all organizations)
3. Optional group filter (Enter for all groups)
4. Portal directory (Enter for current directory)
```

### 2. Validate the portal directory

The target must be a `portaljs-catalog` portal. Confirm `PORTAL_DIR/package.json` and
`PORTAL_DIR/pages` exist (the catalog template also has `datasets.json`,
`pages/search.tsx`, and `pages/[owner]/[slug].tsx`, which this skill rewires). If it isn't
a portal, tell the user and suggest running `/portaljs-new-portal` first rather than failing
silently.

### 3. Verify the CKAN backend is reachable

Hit `package_search` with a tiny page to confirm the URL is a working CKAN API:
```bash
curl -s -m 20 "CKAN_URL/api/3/action/package_search?rows=1"
```
The response must be JSON with `"success": true`. If the request fails, times out, or
`success` is not `true`, tell the user the URL didn't resolve to a working CKAN API and
ask them to confirm it's a CKAN root that's publicly accessible, then retry — don't
dead-end.

If `ORG_FILTER` is set, validate each org exists:
```bash
curl -s -m 20 "CKAN_URL/api/3/action/organization_show?id=ORG"
```
If any returns `success: false`, tell the user that org wasn't found, list the valid orgs
from `organization_list`, and ask which one they meant (or to drop the filter) before
continuing.

### 4. Generate the CKAN client module (a tiny fetch wrapper)

Write `PORTAL_DIR/lib/ckan.ts` — a self-contained server-side client over the CKAN REST
API. **No package install, no `tsconfig` changes**: it uses the built-in `fetch`, so there
is nothing to add to `package.json` and no `paths` entry to maintain. The provided URL
becomes the default, overridable at deploy time via the `DMS` env var. Org/group filters
and the build-time page cap live here as plain editable constants.

```ts
// Minimal server-side CKAN client — plain fetch, no dependency, no React coupling.
// Used ONLY in getStaticProps/getStaticPaths, so it never reaches the browser bundle.

// CKAN backend base URL. Override at deploy time with the DMS env var.
export const DMS = (process.env.DMS || 'CKAN_URL').replace(/\/+$/, '')

// Filters baked in by /portaljs-connect-ckan. Empty array = no filter.
export const ORG_FILTER: string[] = [/* ORG_FILTER */]
export const GROUP_FILTER: string[] = [/* GROUP_FILTER */]

// Max datasets to pre-render at build time (SSG). Raise for larger catalogs;
// note every dataset becomes one statically generated page.
export const MAX_DATASETS = 200

// CKAN REST shapes — only the fields the pages read.
type CkanResource = { id: string; name?: string; format?: string; url?: string }
type CkanOrganization = { name?: string; title?: string }
export type CkanPackage = {
  name: string
  title?: string
  notes?: string
  organization?: CkanOrganization
  resources?: CkanResource[]
}

export type SearchArgs = {
  offset?: number
  limit?: number
  tags?: string[]
  orgs?: string[]
  groups?: string[]
}

// Build a CKAN `fq` filter-query from org/group/tag lists (OR within a field).
function buildFq({ orgs = [], groups = [], tags = [] }: SearchArgs): string {
  const clause = (field: string, vals: string[]) =>
    vals.length ? `${field}:(${vals.map((v) => `"${v}"`).join(' OR ')})` : ''
  return [clause('organization', orgs), clause('groups', groups), clause('tags', tags)]
    .filter(Boolean)
    .join(' ')
}

async function ckanAction(action: string, params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${DMS}/api/3/action/${action}?${qs}`)
  if (!res.ok) throw new Error(`CKAN ${action} failed: ${res.status} ${res.statusText}`)
  const body = await res.json()
  if (!body?.success) throw new Error(`CKAN ${action} returned success=false`)
  return body.result
}

// The two-method surface the pages use. Add more actions (organization_list,
// datastore_search, …) here as you extend the portal.
export const ckan = {
  async packageSearch(
    args: SearchArgs = {}
  ): Promise<{ datasets: CkanPackage[]; count: number }> {
    const params: Record<string, string> = {
      start: String(args.offset ?? 0),
      rows: String(args.limit ?? MAX_DATASETS),
    }
    const fq = buildFq(args)
    if (fq) params.fq = fq
    const result = await ckanAction('package_search', params)
    return { datasets: result.results ?? [], count: result.count ?? 0 }
  },
  async getDatasetDetails(slug: string): Promise<CkanPackage> {
    return ckanAction('package_show', { id: slug })
  },
}

// A card is the serializable shape passed to client components from the
// server-side data functions (never pass the raw CKAN responses around unfiltered).
export type DatasetCard = {
  slug: string
  namespace: string
  name: string
  description?: string
}

// Canonical showcase URL — keeps the template's /@<namespace>/<slug> structure.
// The CKAN organization name is the namespace (it groups datasets by publisher,
// i.e. the 'owner' namespace mode); falls back to 'dataset' when an org is absent.
export function datasetHref(d: { namespace: string; slug: string }): string {
  return `/@${d.namespace}/${d.slug}`
}
```

Substitute `CKAN_URL` with the real URL and fill `ORG_FILTER`/`GROUP_FILTER` with quoted
org/group names (e.g. `['my-org']`), or leave them as `[]` if no filter was given.

> **Keep CKAN calls server-side.** Reference `ckan`, `DMS`, and the filters only inside
> `getStaticProps`/`getStaticPaths`, and pass plain serializable props to components. The
> fetch wrapper has no client cost, but keeping data-fetching server-side preserves the SSG
> model (everything pre-rendered, statically hostable).

### 5. Generate the CKAN-backed catalog at `/search`

The home page (`pages/index.tsx`) stays the search-first landing — its search box and chips
already navigate to `/search`. Wire the **catalog list** at `PORTAL_DIR/pages/search.tsx`
to read from CKAN instead of `datasets.json`. It lists datasets from `package_search` and
links each to its showcase at `/@<namespace>/<slug>` via `datasetHref` (namespace = CKAN
org name; slug = CKAN package `name`).

```tsx
import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { ckan, datasetHref, ORG_FILTER, GROUP_FILTER, MAX_DATASETS, type DatasetCard } from '../lib/ckan'

export const getStaticProps: GetStaticProps<{ datasets: DatasetCard[]; count: number }> = async () => {
  const { datasets, count } = await ckan.packageSearch({
    offset: 0,
    limit: MAX_DATASETS,
    tags: [],
    orgs: ORG_FILTER,
    groups: GROUP_FILTER,
  })
  const cards: DatasetCard[] = datasets.map((d) => ({
    slug: d.name,
    namespace: d.organization?.name || 'dataset',
    name: d.title || d.name,
    description: d.notes ? d.notes.slice(0, 200) : '',
  }))
  return { props: { datasets: cards, count } }
}

export default function Search({ datasets, count }: { datasets: DatasetCard[]; count: number }) {
  return (
    <>
      <Head><title>Search — __PROJECT_NAME__</title></Head>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-8">
          <nav className="mb-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">/</span>
            <span>Search</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">Datasets</h1>
          <p className="mt-1 text-sm text-gray-400">{count} datasets in catalog</p>
        </header>

        {datasets.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
            <p className="text-lg font-medium">No datasets found</p>
            <p className="mt-1 text-sm">Check the CKAN backend URL and any org/group filters in lib/ckan.ts.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {datasets.map((ds) => (
              <Link
                key={`${ds.namespace}/${ds.slug}`}
                href={datasetHref(ds)}
                className="block rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <h2 className="text-xl font-semibold text-gray-900">{ds.name}</h2>
                <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">@{ds.namespace}</p>
                {ds.description && <p className="mt-2 text-gray-500">{ds.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
```

Substitute `__PROJECT_NAME__` if the existing file still has the token. The CKAN list is
pre-rendered server-side, so the template's client-side `useMemo` filter is replaced — if
you want live text filtering over the CKAN results, keep a client-side filter over the
`datasets` prop (same pattern the static `search.tsx` uses) or wire it to
`package_search?q=` later. Leave `pages/index.tsx` as-is (it's the static search landing);
only swap the catalog's data source. Tell the user what you changed.

### 6. Generate the CKAN-backed showcase at `/@<namespace>/<slug>`

Overwrite `PORTAL_DIR/pages/[owner]/[slug].tsx` (the template's showcase route). It
pre-renders one page per dataset via `getStaticPaths` and fetches full details with
`package_show` in `getStaticProps`. The `owner` segment carries the `@` prefix so the URL
stays `/@<namespace>/<slug>` (namespace = CKAN org name). Tabular resources (CSV/TSV)
preview through the template's local `Table` component, which fetches the resource URL
client-side.

```tsx
import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { Table } from '../../components/Table'
import { ckan, ORG_FILTER, GROUP_FILTER, MAX_DATASETS } from '../../lib/ckan'

type ResourceView = { id: string; name: string; format: string; url: string; isTabular: boolean }
type DatasetView = { slug: string; namespace: string; title: string; notes: string; org: string; resources: ResourceView[] }

const TABULAR = ['csv', 'tsv']

export const getStaticPaths: GetStaticPaths = async () => {
  const { datasets } = await ckan.packageSearch({
    offset: 0,
    limit: MAX_DATASETS,
    tags: [],
    orgs: ORG_FILTER,
    groups: GROUP_FILTER,
  })
  return {
    // owner carries the leading `@`; slug is the CKAN package name. namespace = org name.
    paths: datasets.map((d) => ({
      params: { owner: '@' + (d.organization?.name || 'dataset'), slug: d.name },
    })),
    // false: only datasets present at build time are served. Rebuild to pick up new ones.
    // Switch to 'blocking' if you deploy to a Node server and want new datasets on demand.
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<{ dataset: DatasetView }> = async ({ params }) => {
  const namespace = String(params?.owner ?? '').replace(/^@/, '')
  const slug = String(params?.slug)
  try {
    const d = await ckan.getDatasetDetails(slug)
    const dataset: DatasetView = {
      slug: d.name,
      namespace,
      title: d.title || d.name,
      notes: d.notes || '',
      org: d.organization?.title || d.organization?.name || '',
      resources: (d.resources || []).map((r) => {
        const format = (r.format || '').toLowerCase()
        return {
          id: r.id,
          name: r.name || r.id,
          format: r.format || '',
          url: r.url || '',
          isTabular: TABULAR.includes(format),
        }
      }),
    }
    return { props: { dataset } }
  } catch {
    return { notFound: true }
  }
}

export default function DatasetPage({ dataset }: { dataset: DatasetView }) {
  return (
    <>
      <Head><title>{dataset.title}</title></Head>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/search" className="hover:text-gray-700">Datasets</Link>
          <span className="mx-2">/</span>
          <span>{dataset.title}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">{dataset.title}</h1>
        {dataset.org && <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">{dataset.org}</p>}
        {dataset.notes && <p className="text-gray-600 mb-8 whitespace-pre-line">{dataset.notes}</p>}

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resources</h2>
        {dataset.resources.length === 0 ? (
          <p className="text-gray-400">This dataset has no resources.</p>
        ) : (
          <div className="space-y-8">
            {dataset.resources.map((r) => (
              <section key={r.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">
                    {r.name}{' '}
                    {r.format && <span className="ml-1 text-xs uppercase text-gray-400">{r.format}</span>}
                  </h3>
                  {r.url && <a href={r.url} className="text-sm text-blue-600 underline">Download</a>}
                </div>
                {r.isTabular && r.url ? (
                  <Table url={r.url} />
                ) : (
                  <p className="text-sm text-gray-400">
                    Preview not available for this format.{' '}
                    {r.url && <a href={r.url} className="underline">Open resource</a>}
                  </p>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
```

> This overwrites the static showcase route `pages/[owner]/[slug].tsx` so CKAN becomes the
> single source of truth (the static `datasets.json` / `lib/datasets.ts` path is no longer
> read). Tell the user the static dataset route was replaced. The `/portaljs-add-chart` and
> `/portaljs-add-map` skills target the static showcase's Views section, so they don't apply to the
> CKAN-backed route as-is.

### 7. Verify the build

```bash
cd PORTAL_DIR
npx next build > /tmp/portaljs-connect-ckan-build.log 2>&1
BUILD_EXIT=$?
tail -30 /tmp/portaljs-connect-ckan-build.log
```

If `BUILD_EXIT` is non-zero, print the log and fix the error before reporting success. Do
not report success while the build is failing. Common causes: a typo in the substituted
`CKAN_URL`, or an org/group filter name that doesn't exist on the instance (the catalog
comes back empty).

> **Build time scales with dataset count.** Each dataset is one `package_show` request and
> one static page. On large instances the build can be slow — `MAX_DATASETS` in `lib/ckan.ts`
> caps it. If the cap is hit, tell the user how many datasets were rendered vs. the catalog
> total and that they can raise `MAX_DATASETS`.

### 8. Report success

```
✓ Connected to CKAN: CKAN_URL
  - Client:    lib/ckan.ts (fetch wrapper, no dependency; DMS overridable via env var)
  - Home:      pages/index.tsx → unchanged search landing (search box → /search)
  - Catalog:   pages/search.tsx → lists datasets from package_search, links to /@<ns>/<slug>
  - Showcase:  pages/[owner]/[slug].tsx → package_show, CSV/TSV preview via <Table>
  - Filters:   orgs=[...]  groups=[...]   (edit lib/ckan.ts to change)
  - Build:     N static dataset pages generated (catalog has M)

Next: run `npm run dev` and visit http://localhost:3000, or run /portaljs-deploy to publish.
```

## Notes

- **Data freshness vs. static deploy.** Default is SSG (`getStaticProps` + `fallback: false`):
  fast, statically hostable, but data is fixed at build time — rebuild to pick up new CKAN
  datasets. For always-live data, deploy to a Node host and either switch the pages to
  `getServerSideProps` or set `getStaticPaths` `fallback: 'blocking'`.
- **No runtime dependency.** `lib/ckan.ts` is a plain `fetch` wrapper — nothing is added to
  `package.json`, so there's no version to track and nothing to bundle. Keep CKAN calls in
  server-side data functions (never reference `ckan`/`DMS` in component bodies) to preserve
  the pre-rendered SSG model.
- **DMS env var.** `lib/ckan.ts` reads `process.env.DMS` first, falling back to the URL you
  provided. Set `DMS` in the deploy environment to point at a different CKAN instance without
  editing code.
- **Slugs are CKAN package `name`s** — already lowercase, URL-safe, and unique. The CKAN
  organization name becomes the `@<namespace>` segment, giving the template's
  `/@<namespace>/<slug>` URLs. Datasets with no org fall back to the `@dataset` namespace.
- **CORS for resource previews.** The `<Table>` preview fetches resource URLs from the
  browser. If a CKAN resource host blocks cross-origin requests, the table shows a load
  error while the Download link still works. Datastore-backed resources are the most reliable.
- **Extending the client.** `lib/ckan.ts` wraps two REST actions (`package_search`,
  `package_show`). To build filter UIs or query the datastore, add more actions the same way
  via the `ckanAction` helper — e.g. `organization_list`, `group_list`, `tag_list`,
  `datastore_search?resource_id=…`. Each is one `ckanAction('<name>', { … })` call.
```
