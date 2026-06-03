---
description: Wire a scaffolded PortalJS portal to a CKAN backend over its API. Installs @portaljs/ckan, generates a CKAN-backed catalog home and dynamic dataset pages as plain editable code, and verifies the build.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /connect-ckan

Connect an existing PortalJS portal to a live CKAN backend. The portal stops reading
static files from `/public/data/` and instead lists and renders datasets straight from a
CKAN instance's REST API (`package_search` / `package_show`) using the `@portaljs/ckan`
client. Output is plain, editable Next.js code — no opaque framework wiring.

Use this for the "decoupled / any backend" path: the user has a CKAN data management
system (their own or a public one) and wants a browseable portal in front of it.

The generated pages fetch CKAN **server-side** in `getStaticProps`/`getStaticPaths`, so
the `@portaljs/ckan` bundle never reaches the browser — the client stays lean and the
site can be statically deployed.

## Required input

- **CKAN base URL** (required) — e.g. `https://demo.dev.datopian.com`. The root of the
  CKAN instance; the skill appends `/api/3/action/...` itself. Must be publicly reachable.
- **Org filter** (optional) — one or more CKAN organization names to restrict the catalog to.
- **Group filter** (optional) — one or more CKAN group names to restrict the catalog to.
- **Portal directory** (optional) — path to the portal project (default: current directory).

If the CKAN base URL is missing:
```
ERROR: [connect-ckan] MISSING_INPUT No CKAN base URL provided — pass the root URL of a CKAN instance, e.g. https://demo.dev.datopian.com.
```

## Steps

### 1. Parse arguments from `$ARGUMENTS`

Extract:
- `CKAN_URL` — base URL, with any trailing slash stripped.
- `ORG_FILTER` — list of org names (default: empty = all orgs).
- `GROUP_FILTER` — list of group names (default: empty = all groups).
- `PORTAL_DIR` — portal directory (default: `.`).

If `$ARGUMENTS` is empty, ask once and stop:
```
To connect a CKAN backend I need:
1. CKAN base URL (e.g. https://demo.dev.datopian.com)
2. Optional org filter (press Enter for all organizations)
3. Optional group filter (press Enter for all groups)
4. Portal directory (press Enter for current directory)
```

### 2. Validate the portal directory

The target must be a PortalJS portal. Confirm `PORTAL_DIR/package.json` and
`PORTAL_DIR/pages` exist:
```
ERROR: [connect-ckan] NOT_A_PORTAL PORTAL_DIR is not a PortalJS portal (no package.json/pages) — run /new-portal first.
```

### 3. Verify the CKAN backend is reachable

Hit `package_search` with a tiny page to confirm the URL is a working CKAN API:
```bash
curl -s -m 20 "CKAN_URL/api/3/action/package_search?rows=1"
```
The response must be JSON with `"success": true`. If the request fails, times out, or
`success` is not `true`:
```
ERROR: [connect-ckan] CKAN_UNREACHABLE Could not reach a CKAN API at CKAN_URL (api/3/action/package_search) — check the URL is a CKAN root and is publicly accessible.
```

If `ORG_FILTER` is set, validate each org exists:
```bash
curl -s -m 20 "CKAN_URL/api/3/action/organization_show?id=ORG"
```
If any returns `success: false`, warn the user and list valid orgs from
`organization_list`, then stop:
```
ERROR: [connect-ckan] ORG_NOT_FOUND Organization 'ORG' not found on CKAN_URL — check the org name (see api/3/action/organization_list).
```

### 4. Install `@portaljs/ckan` (once)

Tell the user first: `Installing @portaljs/ckan...`

```bash
cd PORTAL_DIR && npm install @portaljs/ckan@^0.1.0
```

If install fails:
```
ERROR: [connect-ckan] INSTALL_FAILED npm install failed — check Node.js >=18 and network access, then retry.
```

### 5. Patch `tsconfig.json` so TypeScript resolves the CKAN types

`@portaljs/ckan` ships its `index.d.ts` but its `package.json` `exports` field has no
`types` condition, so under the template's `moduleResolution: "bundler"` the build fails
with *"Could not find a declaration file for module '@portaljs/ckan'"*. Fix it by adding a
`paths` mapping to the declaration file.

Open `PORTAL_DIR/tsconfig.json` and add the `@portaljs/ckan` key to `compilerOptions.paths`
(keep any existing entries such as `"@/*"`):
```jsonc
"paths": {
  "@/*": ["./*"],
  "@portaljs/ckan": ["./node_modules/@portaljs/ckan/dist/index.d.ts"]
}
```
If there is no `paths` object yet, create one with both keys. This step is mandatory — the
build will not type-check without it.

### 6. Generate the CKAN client module

Write `PORTAL_DIR/lib/ckan.ts`. The provided URL becomes the default, overridable at deploy
time via the `DMS` env var. Org/group filters and the build-time page cap live here as
plain editable constants.

```ts
import { CKAN } from '@portaljs/ckan'

// CKAN backend base URL. Override at deploy time with the DMS env var.
export const DMS = (process.env.DMS || 'CKAN_URL').replace(/\/+$/, '')

// Filters baked in by /connect-ckan. Empty array = no filter.
export const ORG_FILTER: string[] = [/* ORG_FILTER */]
export const GROUP_FILTER: string[] = [/* GROUP_FILTER */]

// Max datasets to pre-render at build time (SSG). Raise for larger catalogs;
// note every dataset becomes one statically generated page.
export const MAX_DATASETS = 200

// Shared client. Used ONLY in getStaticProps/getStaticPaths (server side),
// so the @portaljs/ckan bundle never reaches the browser.
export const ckan = new CKAN(DMS)
```

Substitute `CKAN_URL` with the real URL and fill `ORG_FILTER`/`GROUP_FILTER` with quoted
org/group names (e.g. `['my-org']`), or leave them as `[]` if no filter was given.

> **Keep CKAN calls server-side.** Only reference `ckan`, `DMS`, and the filters inside
> `getStaticProps`/`getStaticPaths`. If a React component body imports them, Next.js bundles
> the whole `@portaljs/ckan` package into the client. Pass plain serializable props to
> components instead.

### 7. Generate the catalog home page

Overwrite `PORTAL_DIR/pages/index.tsx`. It lists datasets from `package_search` and links
each to `/datasets/[slug]` (slug = CKAN package `name`).

```tsx
import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { ckan, ORG_FILTER, GROUP_FILTER, MAX_DATASETS } from '../lib/ckan'

type DatasetCard = { slug: string; name: string; description?: string; org?: string }

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
    name: d.title || d.name,
    description: d.notes ? d.notes.slice(0, 200) : '',
    org: d.organization?.title || d.organization?.name || '',
  }))
  return { props: { datasets: cards, count } }
}

export default function Home({ datasets, count }: { datasets: DatasetCard[]; count: number }) {
  return (
    <>
      <Head><title>__PROJECT_NAME__</title></Head>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">__PROJECT_NAME__</h1>
          <p className="mt-3 text-lg text-gray-500">__DESCRIPTION__</p>
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
                key={ds.slug}
                href={`/datasets/${ds.slug}`}
                className="block rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <h2 className="text-xl font-semibold text-gray-900">{ds.name}</h2>
                {ds.org && <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">{ds.org}</p>}
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

Substitute `__PROJECT_NAME__` and `__DESCRIPTION__` with the portal's real values if the
existing `index.tsx` had them (read it before overwriting). If the home page was heavily
customised, preserve the layout and only swap the data source — do not blindly clobber a
hand-edited home page; tell the user what you changed.

### 8. Generate the dynamic dataset page

Create `PORTAL_DIR/pages/datasets/[slug].tsx` (make the `pages/datasets/` directory if
needed). It pre-renders one page per dataset via `getStaticPaths` and fetches full details
with `package_show` in `getStaticProps`. Tabular resources (CSV/TSV) preview through the
template's local `Table` component, which fetches the resource URL client-side.

```tsx
import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { Table } from '../../components/Table'
import { ckan, ORG_FILTER, GROUP_FILTER, MAX_DATASETS } from '../../lib/ckan'

type ResourceView = { id: string; name: string; format: string; url: string; isTabular: boolean }
type DatasetView = { slug: string; title: string; notes: string; org: string; resources: ResourceView[] }

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
    paths: datasets.map((d) => ({ params: { slug: d.name } })),
    // false: only datasets present at build time are served. Rebuild to pick up new ones.
    // Switch to 'blocking' if you deploy to a Node server and want new datasets on demand.
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<{ dataset: DatasetView }> = async ({ params }) => {
  const slug = String(params?.slug)
  try {
    const d = await ckan.getDatasetDetails(slug)
    const dataset: DatasetView = {
      slug: d.name,
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

> If the portal already has a static `pages/datasets/[slug].tsx` (from the
> `portaljs-catalog` template or `/add-dataset`), this overwrites it — CKAN becomes the
> single source of truth. Tell the user the static dataset route was replaced.

### 9. Verify the build

```bash
cd PORTAL_DIR
npx next build > /tmp/connect-ckan-build.log 2>&1
BUILD_EXIT=$?
tail -30 /tmp/connect-ckan-build.log
```

If `BUILD_EXIT` is non-zero, print the log and fix the error before reporting success. Do
not report success while the build is failing. Common cause: missing tsconfig `paths` entry
(step 5).

> **Build time scales with dataset count.** Each dataset is one `package_show` request and
> one static page. On large instances the build can be slow — `MAX_DATASETS` in `lib/ckan.ts`
> caps it. If the cap is hit, tell the user how many datasets were rendered vs. the catalog
> total and that they can raise `MAX_DATASETS`.

### 10. Report success

```
✓ Connected to CKAN: CKAN_URL
  - Client:    lib/ckan.ts (DMS overridable via env var)
  - Home:      pages/index.tsx → lists datasets from package_search
  - Dataset:   pages/datasets/[slug].tsx → package_show, CSV/TSV preview via <Table>
  - Filters:   orgs=[...]  groups=[...]   (edit lib/ckan.ts to change)
  - Build:     N static dataset pages generated (catalog has M)

Next: run `npm run dev` and visit http://localhost:3000, or run /deploy to publish.
```

## Notes

- **Data freshness vs. static deploy.** Default is SSG (`getStaticProps` + `fallback: false`):
  fast, statically hostable, but data is fixed at build time — rebuild to pick up new CKAN
  datasets. For always-live data, deploy to a Node host and either switch the pages to
  `getServerSideProps` or set `getStaticPaths` `fallback: 'blocking'`.
- **Client bundle stays clean.** `@portaljs/ckan` (which bundles React UI components) is
  imported only in server-side data functions, so it is tree-shaken out of the browser
  bundle. Keep it that way — never reference `ckan`/`DMS` in component bodies.
- **DMS env var.** `lib/ckan.ts` reads `process.env.DMS` first, falling back to the URL you
  provided. Set `DMS` in the deploy environment to point at a different CKAN instance without
  editing code.
- **Slugs are CKAN package `name`s** — already lowercase and URL-safe and unique, so they map
  cleanly to a single `[slug]` route segment.
- **CORS for resource previews.** The `<Table>` preview fetches resource URLs from the
  browser. If a CKAN resource host blocks cross-origin requests, the table shows a load
  error while the Download link still works. Datastore-backed resources are the most reliable.
- **CKAN client API.** `lib/ckan.ts` exposes a `@portaljs/ckan` `CKAN` instance. Other useful
  methods for extending the portal: `getOrgsWithDetails()`, `getGroupsWithDetails()`,
  `getAllTags()` (build filter UIs), and `datastoreSearch(resourceId)` (query the datastore).
```
