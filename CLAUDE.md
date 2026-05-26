# PortalJS — AI Development Guide

PortalJS is a Next.js framework for building data portals and catalogs. This file teaches AI assistants the conventions, patterns, and idioms used across this repo.

## Repo structure

```
packages/
  components/   — data viz React components (@portaljs/components)
  core/         — layout/UI components (@portaljs/core)
  ckan/         — CKAN backend integration (@portaljs/ckan)
  remark-*/     — remark plugins for markdown processing
examples/       — reference implementations (read these before building)
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

Standard data portal page:

```tsx
// pages/datasets/[slug].tsx
import { Table } from '@portaljs/components'
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

**`_app.tsx` — always import component styles:**
```tsx
import '@portaljs/components/styles.css'
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

- `/` — catalog/home (list of datasets)
- `/datasets/[slug]` — individual dataset page
- `/api/` — server-side API routes (avoid for simple portals; use static data in `/public/`)

Dataset slug: lowercase, hyphenated. Derived from filename: `country-codes.csv` → `/datasets/country-codes`.

## Styling

- Tailwind CSS everywhere. Always include `@tailwindcss/typography` for prose content.
- `tailwind.config.js` must include `node_modules/@portaljs/components/**/*.{js,ts,jsx,tsx}` in `content` array so component classes are not purged.
- Do not use inline styles. Do not use CSS modules unless the project already uses them.

Standard `tailwind.config.js`:
```js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@portaljs/components/**/*.{js,ts,jsx,tsx}',
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
    "@portaljs/components": "latest",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

Add `@portaljs/core` only if using Layout/Nav/Sidebar. Add `@portaljs/ckan` only if connecting to a CKAN backend.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DMS` | Only for CKAN portals | CKAN backend URL (e.g. `https://demo.dev.datopian.com`) |
| `GITHUB_PAT` | Only for GitHub-backed catalogs | GitHub personal access token |

Simple CSV portals need no environment variables.

## Key components — quick reference

### `<Table />`
```tsx
// From CSV file in /public/
<Table url="/data/file.csv" />

// From CSV string
<Table csv="name,age\nAlice,30" />

// From data array
<Table data={[{name:'Alice',age:30}]} cols={[{key:'name',name:'Name'},{key:'age',name:'Age'}]} />

// Full-width layout
<Table url="/data/file.csv" fullWidth />
```

### `<FlatUiTable />`
Richer table UI with column resizing. Same props as `Table`.

### `<LineChart />`
```tsx
<LineChart data={[{x:1,y:2},{x:2,y:4}]} xAxis="x" yAxis="y" />
```

### `<VegaLite />`
```tsx
<VegaLite spec={vegaLiteSpec} data={data} />
```

### `<Map />`
```tsx
<Map center={[51.5, -0.1]} zoom={10} />
```
GeoJSON layers added via props. See `packages/components/src/components/Map.tsx`.

## Common mistakes

- **Missing component CSS:** forgetting `import '@portaljs/components/styles.css'` in `_app.tsx` breaks Table styling.
- **Tailwind purging component classes:** forgetting `node_modules/@portaljs/components/**/*` in `tailwind.config.js` content array makes components unstyled in production.
- **Using `/public/` paths in `getStaticProps`:** `fs.readFile` does not work in client components. For server-side data loading, use `getStaticProps`. For client-side, use `<Table url="..." />`.
- **Importing from internal package paths:** always import from `@portaljs/components`, never from `../../packages/components/src/...`.

## Skills

See `.claude/commands/` for available slash commands:
- `/new-portal` — scaffold a new PortalJS data portal from a brief
- `/add-dataset` — add a dataset (CSV/TSV/JSON/GeoJSON) to an existing portal

See `.claude/AUTHORING.md` to write new skills.
