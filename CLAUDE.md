# PortalJS — AI Development Guide

PortalJS is a Next.js framework for building data portals and catalogs. This file teaches AI assistants the conventions, patterns, and idioms used across this repo.

## Core concepts — three surfaces

Every data portal is built from three surfaces. The template and routes map directly onto them; reason in these terms:

1. **Home** (`/`, `pages/index.tsx`) — what the portal is + a search box that routes to the catalog.
2. **Catalog** (`/search`, `pages/search.tsx`) — find/browse datasets. Static = full-text filter over `datasets.json`; scales to a search backend (CKAN/Solr) via `/portaljs-connect-ckan`.
3. **Showcase** (`/@<namespace>/<slug>`, `pages/[owner]/[slug].tsx`) — one dataset: metadata, a `Table` preview, download/API, and a Views slot for charts/maps.

Datasets are `@`-namespaced so they never collide with content pages. See `docs/core-concepts`.

## Repo structure

```
packages/
  core/                — layout/UI components (@portaljs/core)
  ckan/                — CKAN catalog UI + React components (@portaljs/ckan)
  ckan-api-client-js/  — pure CKAN API client (@portaljs/ckan-api-client-js)
examples/              — reference implementations (read these before building)
.claude/
  commands/     — Claude Code slash commands (OSS skills)
  datopian/     — Datopian-internal skills (require API keys)
  AUTHORING.md  — how to write new skills
```

## Component selection

The template ships its own lightweight components in `components/`. Do not add `@portaljs/components` — it bundles leaflet, vega, ag-grid, and pdf.js into a single non-tree-shakeable bundle and is not kept up to date with the local source.

| Need | Where |
|------|-------|
| Show tabular data (CSV/TSV/JSON) | `components/Table.tsx` — uses papaparse + @tanstack/react-table |
| Charts | Add a chart library directly (e.g. recharts, victory) — do not use @portaljs/components |
| Map (GeoJSON) | Add react-leaflet + leaflet directly if needed |
| Page layout, nav | Plain Tailwind — no layout package needed |
| CKAN catalog | `@portaljs/ckan` only if connecting to a CKAN backend |

## Data loading

**CSV or TSV from a local file:**
1. Place the file in `/public/data/filename.csv`
2. In the page: `<Table url="/data/filename.csv" />`

No server-side code needed. Next.js serves `/public/` statically. The `Table` component fetches via `url` prop using the browser's `fetch`.

**CSV string (inline data):**
```tsx
<Table csv={csvString} />
```

**JSON array:**
Pass as `data` prop:
```tsx
<Table data={rows} cols={[{ key: 'name', name: 'Name' }, ...]} />
```

**Remote URL (CORS-enabled):**
```tsx
<Table url="https://example.com/data.csv" />
```

**CKAN datastore:**
Use `datastoreConfig` prop — requires a running CKAN backend.

**Large files (>5MB):** Add a note in the page that loading may be slow. Consider server-side pagination via `datastoreConfig`.

## Page structure

Datasets themselves are manifest-driven and render via the showcase route (see Routing). A standalone content page looks like:

```tsx
// pages/about-the-data.tsx — datasets render via pages/[owner]/[slug].tsx from datasets.json
import { Table } from '../../components/Table'
import Head from 'next/head'

export default function DatasetPage() {
  return (
    <>
      <Head><title>Dataset Name</title></Head>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dataset Name</h1>
        <Table url="/data/filename.csv" />
      </main>
    </>
  )
}
```

**`_app.tsx`:**
```tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
```

**`styles/globals.css` — Tailwind directives:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Routing conventions

The three surfaces (see Core concepts):

- `/` — **home** (`pages/index.tsx`): hero + search box → `/search`
- `/search` — **catalog** (`pages/search.tsx`): full-text list over `datasets.json`
- `/@<namespace>/<slug>` — **showcase** (`pages/[owner]/[slug].tsx`): one dataset, manifest-driven
- `/api/` — server-side API routes (avoid for simple portals; use static data in `/public/`)

Datasets are `@`-namespaced so they never collide with content pages. Pick one mode per portal — `theme` (single publisher, group by subject) or `owner` (multi-publisher, group by who published) — set via `NAMESPACE_TYPE` in `lib/datasets.ts`. Slug: lowercase, hyphenated, from the filename: `country-codes.csv` → `/@reference/country-codes`.

## Styling

- Tailwind CSS everywhere. Always include `@tailwindcss/typography` for prose content.
- Do not use inline styles. Do not use CSS modules unless the project already uses them.

Standard `tailwind.config.js`:
```js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/typography')],
}
```

## Standard `package.json` dependencies

Minimal portal:
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-table": "^8.0.0",
    "papaparse": "^5.0.0",
    "@heroicons/react": "^2.0.0"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/papaparse": "^5.0.0"
  }
}
```

Add `@portaljs/ckan` only if connecting to a CKAN backend.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DMS` | Only for CKAN portals | CKAN backend URL (e.g. `https://demo.dev.datopian.com`) |
| `GITHUB_PAT` | Only for GitHub-backed catalogs | GitHub personal access token |

Simple CSV portals need no environment variables.

## Key components — quick reference

All components live in `components/` inside the portal project (copied from `examples/portaljs-catalog/components/`).

### `<Table />` — `components/Table.tsx`
```tsx
import { Table } from '../components/Table'

// From CSV file in /public/
<Table url="/data/file.csv" />

// From CSV string
<Table csv="name,age\nAlice,30" />

// From data array
<Table data={[{name:'Alice',age:30}]} cols={[{key:'name',name:'Name'},{key:'age',name:'Age'}]} />

// Full-width layout
<Table url="/data/file.csv" fullWidth />
```

### Charts
Add a chart library directly — e.g. `npm install recharts`. No chart component is bundled in the template.

### Maps (GeoJSON)
Add `npm install react-leaflet leaflet @types/leaflet` and import directly. No map component is bundled in the template.

## Common mistakes

- **Importing from `@portaljs/components`:** do not install or import from this package. Use `components/Table.tsx` from the local template. The package bundles leaflet, vega, ag-grid, and pdf.js — 1.9 MB compressed.
- **Wrong import path for Table:** use `import { Table } from '../../components/Table'` (relative path), not a package import.
- **Using `/public/` paths in `getStaticProps`:** `fs.readFile` does not work in client components. For server-side data loading, use `getStaticProps`. For client-side, use `<Table url="..." />`.
- **Tailwind content array too narrow:** if custom component classes are missing in production, ensure `'./components/**/*.{js,ts,jsx,tsx}'` is in `tailwind.config.js` content.

## Skills

See `.claude/commands/` for available slash commands:
- `/portaljs-architect` — recommend a data architecture (storage/compute/catalog/access/hosting/metadata) from your needs, then hand off to the build skills (the advisory entry point)
- `/portaljs-new-portal` — scaffold a new PortalJS data portal from a brief
- `/portaljs-add-dataset` — add a dataset (CSV/TSV/JSON/GeoJSON) to an existing portal
- `/portaljs-add-chart` — add a chart (line/bar/area/pie/scatter) to a dataset page via recharts
- `/portaljs-add-map` — render a GeoJSON dataset on an interactive Leaflet map
- `/portaljs-deploy` — one-shot deploy to Vercel or static hosting
- `/portaljs-connect-ckan` — wire a portal to a CKAN backend over its API (decoupled / any backend)
- `/portaljs-check-data-quality` — audit a dataset for quality issues (schema, nulls, types)

The skills interview you for missing input (rounds of questions) rather than erroring, and build around the three surfaces. These skills run from any project, not just a clone of this repo — see
[`.claude/INSTALL.md`](.claude/INSTALL.md) for the three install paths (run-from-clone,
personal `~/.claude/commands/`, or Claude Code plugin).

See `.claude/AUTHORING.md` to write new skills.
