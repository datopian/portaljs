---
description: Add a dataset (CSV, TSV, JSON, or GeoJSON) to an existing PortalJS portal. Creates a dataset page and adds it to the home page catalog.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /add-dataset

Add a dataset to an existing PortalJS portal. Copies the data to `/public/data/`, generates a dataset page, and registers it on the home page.

## Required input

- **Source** — a local file path (`./data/file.csv`) or a public URL (`https://example.com/data.csv`)
- **Portal directory** — path to the portal project (defaults to current directory)

Supported formats: **CSV, TSV, JSON (array), GeoJSON**

If source is missing:
```
ERROR: [add-dataset] MISSING_INPUT No dataset source provided — provide a local file path or public URL.
```

## Steps

### 1. Parse arguments from `$ARGUMENTS`

Extract:
- `SOURCE` — file path or URL
- `PORTAL_DIR` — portal directory (default: `.`)
- `DATASET_NAME` — human-readable name (default: derived from filename)
- `DATASET_SLUG` — URL slug (default: lowercase hyphenated filename without extension)
- `DESCRIPTION` — optional one-line description

If `$ARGUMENTS` is empty, ask:
```
To add a dataset I need:
1. Source: local file path or public URL
2. Portal directory (press Enter for current directory)
3. Dataset name (press Enter to use filename)
```

### 2. Detect format and fetch/copy data

**If SOURCE is a URL:**
- Fetch the URL and check status code. If not 200:
  ```
  ERROR: [add-dataset] FETCH_FAILED Could not fetch SOURCE (HTTP STATUS) — check the URL is publicly accessible and supports CORS.
  ```
- Detect format from Content-Type header or URL extension.

**If SOURCE is a local file path:**
- Check the file exists. If not:
  ```
  ERROR: [add-dataset] FILE_NOT_FOUND SOURCE does not exist — check the path and retry.
  ```
- Detect format from file extension.

**Format detection rules:**
- `.csv` or `text/csv` → CSV
- `.tsv` or `text/tab-separated-values` → TSV
- `.geojson` or `application/geo+json` or first char is `{` with `"type":"FeatureCollection"` → GeoJSON
- `.json` or `application/json` → JSON array
- Anything else:
  ```
  ERROR: [add-dataset] UNSUPPORTED_FORMAT FORMAT is not supported — convert to CSV, TSV, JSON array, or GeoJSON first.
  ```

**Copy to portal:**
```bash
mkdir -p PORTAL_DIR/public/data
cp SOURCE PORTAL_DIR/public/data/DATASET_SLUG.EXT
# or for URLs: curl -L SOURCE -o PORTAL_DIR/public/data/DATASET_SLUG.EXT
```

### 3. Detect column structure (CSV/TSV/JSON only)

For CSV/TSV: read the first line to get column headers.
For JSON: read the first object's keys.
For GeoJSON: skip — use Map component instead.

Extract up to 5 representative columns to show in the page preview. If there are more than 10 columns, add a note that the full table is paginated.

### 4. Generate the dataset page

Write to `PORTAL_DIR/pages/datasets/DATASET_SLUG.tsx`.

**For CSV/TSV:**
```tsx
import { Table } from '../../components/Table'
import Head from 'next/head'

export default function DatasetPage() {
  return (
    <>
      <Head><title>DATASET_NAME</title></Head>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-500">
          <a href="/" className="hover:text-gray-700">Home</a>
          <span className="mx-2">/</span>
          <span>DATASET_NAME</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DATASET_NAME</h1>
        {DESCRIPTION && <p className="text-gray-500 mb-8">DESCRIPTION</p>}
        <Table url="/data/DATASET_SLUG.csv" fullWidth />
      </main>
    </>
  )
}
```

**For JSON (array):**
```tsx
import { Table } from '../../components/Table'
import Head from 'next/head'
import data from '../../public/data/DATASET_SLUG.json'

export default function DatasetPage() {
  const cols = Object.keys(data[0] || {}).map(k => ({ key: k, name: k }))
  return (
    <>
      <Head><title>DATASET_NAME</title></Head>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-500">
          <a href="/" className="hover:text-gray-700">Home</a>
          <span className="mx-2">/</span>
          <span>DATASET_NAME</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DATASET_NAME</h1>
        {DESCRIPTION && <p className="text-gray-500 mb-8">DESCRIPTION</p>}
        <Table data={data} cols={cols} fullWidth />
      </main>
    </>
  )
}
```

Note: update `tsconfig.json` to include `"resolveJsonModule": true` if not already set.

**For GeoJSON:**

Extract feature properties from the GeoJSON file and render as a table. Read the file to get `features[0].properties` keys for column headers.

```tsx
import { Table } from '../../components/Table'
import Head from 'next/head'
import geojson from '../../public/data/DATASET_SLUG.geojson'

type GeoJSON = { features: { properties: Record<string, string> }[] }

const gj = geojson as GeoJSON
const rows = gj.features.map((f) => f.properties)
const cols = Object.keys(rows[0] ?? {}).map((k) => ({ key: k, name: k }))

export default function DatasetPage() {
  return (
    <>
      <Head><title>DATASET_NAME</title></Head>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-500">
          <a href="/" className="hover:text-gray-700">Home</a>
          <span className="mx-2">/</span>
          <span>DATASET_NAME</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DATASET_NAME</h1>
        {DESCRIPTION && <p className="text-gray-500 mb-8">DESCRIPTION</p>}
        <Table data={rows} cols={cols} fullWidth />
        <p className="mt-6 text-sm text-gray-400">
          <a href="/data/DATASET_SLUG.geojson" className="underline">Download GeoJSON</a>
          {' · '}
          {rows.length} features
        </p>
      </main>
    </>
  )
}
```

Note: update `tsconfig.json` to include `"resolveJsonModule": true` if not already set.

### 5. Register dataset on home page

Open `PORTAL_DIR/pages/index.tsx`. Find the `datasets` array:
```tsx
const datasets = [
  // populated by /add-dataset
]
```

Add an entry:
```tsx
const datasets = [
  // populated by /add-dataset
  { slug: 'DATASET_SLUG', name: 'DATASET_NAME', description: 'DESCRIPTION' },
]
```

If multiple datasets already exist, append without removing existing entries.

If the datasets array is not found (home page has been customised):
- Add the dataset page but skip home page registration
- Tell the user: "Dataset page created at /datasets/DATASET_SLUG. Add it to your home page manually."

### 6. Create datasets directory index if it doesn't exist

If `PORTAL_DIR/pages/datasets/` is new, Next.js needs the directory. No index file is required — individual dataset pages use the `[slug].tsx` pattern, OR you can write separate files per dataset (preferred for simplicity in v1).

Use separate files per dataset (not dynamic `[slug].tsx`) for v1. This avoids the need for `getStaticPaths`.

### 7. Report success

```
✓ Dataset added: DATASET_NAME
  - Data file: public/data/DATASET_SLUG.EXT
  - Page: pages/datasets/DATASET_SLUG.tsx → http://localhost:3000/datasets/DATASET_SLUG
  - Home page: updated

Next: run `npm run dev` and visit http://localhost:3000/datasets/DATASET_SLUG to verify.
If the data looks wrong, run /add-chart to add a visualization.
```

## Notes

- **File size warning:** datasets over 5MB will load slowly in the browser. Add this note to the page: `<!-- Large dataset: consider server-side pagination for production use -->`.
- **TSV files:** `<Table url="/data/file.tsv" />` — papaparse detects the delimiter automatically.
- **Column names with spaces:** papaparse preserves them. Tailwind table headers handle wrapping — no fix needed.
