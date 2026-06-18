---
description: Add a chart (line, bar, area, pie, or scatter) to a dataset's showcase in a PortalJS portal. Installs recharts, writes a reusable Chart component, and renders it in the showcase Views section.
allowed-tools: Read, Write, Edit, Bash
---

# /portaljs-add-chart

Add a visualization to a dataset's **showcase** in a `portaljs-catalog` portal. Installs
`recharts` (added directly — **not** `@portaljs/components`), writes a reusable
client-side `Chart` component into the portal's `components/`, and renders a `<Chart />`
into the **Views** section of the showcase route `pages/[owner]/[slug].tsx` for the chosen
dataset.

Use this after the dataset is registered in `datasets.json` (e.g. via `/portaljs-add-dataset`). The
chart reads the same `/public/data/<file>` the showcase's `<Table />` already uses — no
data is duplicated.

## Required input — ask, don't error

- **Dataset** — which dataset to chart, by **slug** (e.g. `co2-emissions`) or `slug`
  within a namespace. It must already be an entry in `datasets.json`.
- **X axis column** — the column name for the category/X axis (e.g. `year`).
- **Y axis column(s)** — one or more numeric column names to plot (e.g. `population`
  or `imports,exports`).
- **Portal directory** — path to the portal project (defaults to current directory).
- **Chart type** — `line` (default), `bar`, `area`, `pie`, or `scatter`.

**If the target dataset isn't specified, ask which one (by name/slug) — never dead-end
with a missing-input error.**

## Steps

### 1. Gather input from `$ARGUMENTS` (interview if thin)

Extract:
- `DATASET` — dataset slug (required)
- `X` — x-axis column name (required)
- `Y` — comma-separated y-axis column name(s) (required)
- `TYPE` — chart type, one of `line|bar|area|pie|scatter` (default: `line`)
- `PORTAL_DIR` — portal directory (default: `.`)
- `TITLE` — chart heading (default: derived from Y columns, e.g. "Population over Year")

If the dataset (or X/Y) is missing, **ask** and wait. When the user doesn't know the slug,
read `PORTAL_DIR/datasets.json` and list the available datasets (`name` → `slug`) so they
can pick one:
```
To add a chart I need:
1. Which dataset? (slug — your catalog has: <name (slug)>, …)
2. X axis column (e.g. year)
3. Y axis column(s), comma-separated (e.g. population or imports,exports)
4. Chart type [line] (line|bar|area|pie|scatter)
5. Portal directory (Enter for current directory)
```

Validate `TYPE` is one of the five supported values. If not, tell the user and ask them to
pick line, bar, area, pie, or scatter.

### 2. Resolve the dataset from the manifest and its data source

- Read `PORTAL_DIR/datasets.json` and find the entry whose `slug` matches `DATASET`
  (if multiple namespaces share the slug, ask which `namespace`). Capture its
  `namespace`, `file`, and `format`.
- If no entry matches, tell the user and list the available slugs (don't error out) — they
  may have meant a different one or need to run `/portaljs-add-dataset` first.
- The data source is the bare file served statically: `DATA_URL = /data/<file>`. The
  showcase route is `pages/[owner]/[slug].tsx`; the page rendered for this dataset is
  `/@<namespace>/<slug>`.

### 3. Validate the requested columns exist

- For CSV/TSV: read `PORTAL_DIR/public/data/<file>` first line for headers.
- For JSON: read the first object's keys from `PORTAL_DIR/public/data/<file>`.
- Confirm `X` and every `Y` column is present. If any is missing, tell the user which
  column wasn't found and list the available headers so they can correct it.
- Warn (do not fail) if a `Y` column's first non-empty value is non-numeric:
  ```
  Note: column "COL" looks non-numeric — chart values are coerced with Number(); non-numeric cells render as gaps.
  ```

### 4. Install recharts

```bash
cd PORTAL_DIR && npm install recharts@^2.15.0
```

Do **not** install `@portaljs/components`. If the install fails, tell the user (check
network and `package.json`) and retry.

### 5. Write the reusable Chart component

Write `PORTAL_DIR/components/Chart.tsx` **only if it does not already exist** (idempotent —
do not overwrite a customized component):

```tsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { parseCsv } from './ui/parseCsv'

type Row = Record<string, string | number>

export interface ChartProps {
  /** CSV file URL under /public, e.g. "/data/file.csv" */
  url?: string
  /** Pre-parsed rows (e.g. from an imported JSON array) */
  data?: Row[]
  type?: 'line' | 'bar' | 'area' | 'pie' | 'scatter'
  /** X-axis / category column key */
  x: string
  /** One or more numeric column keys to plot */
  y: string | string[]
  height?: number
}

const PALETTE = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#65a30d']

export function Chart({ url = '', data: initialData = [], type = 'line', x, y, height = 320 }: ChartProps) {
  const yKeys = useMemo(() => (Array.isArray(y) ? y : [y]), [y])
  const [raw, setRaw] = useState<Row[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setRaw(initialData)
      return
    }
    setIsLoading(true)
    setError(null)
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${r.statusText}`)
        return r.text()
      })
      .then((text) => setRaw(parseCsv(text).rows))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(initialData)])

  // Coerce y values to numbers; leave x untouched (categorical or numeric)
  const rows = useMemo(
    () =>
      raw.map((row) => {
        const out: Row = { [x]: row[x] }
        for (const k of yKeys) {
          const n = Number(row[k])
          out[k] = Number.isFinite(n) ? n : (NaN as unknown as number)
        }
        return out
      }),
    [raw, x, yKeys]
  )

  if (isLoading) return <div className="min-h-[200px] flex items-center justify-center text-gray-400">Loading chart…</div>
  if (error) return <div className="p-4 text-sm text-red-700 bg-red-50 rounded-md">Failed to load chart data: {error}</div>
  if (rows.length === 0) return <div className="p-4 text-sm text-gray-400">No data to chart.</div>

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
  const axes = (
    <>
      <XAxis dataKey={x} tick={{ fontSize: 12 }} stroke="#9ca3af" />
      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
    </>
  )

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={rows}>
            {grid}{axes}<Tooltip /><Legend />
            {yKeys.map((k, i) => <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} />)}
          </BarChart>
        ) : type === 'area' ? (
          <AreaChart data={rows}>
            {grid}{axes}<Tooltip /><Legend />
            {yKeys.map((k, i) => <Area key={k} type="monotone" dataKey={k} stroke={PALETTE[i % PALETTE.length]} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.2} />)}
          </AreaChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Tooltip /><Legend />
            <Pie data={rows} dataKey={yKeys[0]} nameKey={x} cx="50%" cy="50%" outerRadius={110} label>
              {rows.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
          </PieChart>
        ) : type === 'scatter' ? (
          <ScatterChart>
            {grid}
            <XAxis dataKey={x} type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis dataKey={yKeys[0]} type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <ZAxis range={[60, 60]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} /><Legend />
            <Scatter data={rows} fill={PALETTE[0]} />
          </ScatterChart>
        ) : (
          <LineChart data={rows}>
            {grid}{axes}<Tooltip /><Legend />
            {yKeys.map((k, i) => <Line key={k} type="monotone" dataKey={k} stroke={PALETTE[i % PALETTE.length]} dot={false} />)}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
```

Note: `Chart` reuses `components/ui/parseCsv.ts`, which ships with the template
(the same parser `Table` uses). If that file is absent the portal predates the
current template — copy `parseCsv.ts` from `examples/portaljs-catalog/components/ui/`.

### 6. Render the chart into the showcase's Views section

The showcase `pages/[owner]/[slug].tsx` renders **every** dataset, so a chart must be
applied **only for the chosen dataset** — gate it on the dataset's `(namespace, slug)` so
other datasets' showcases are unaffected. The route already has a **Views placeholder**:

```tsx
{/* Views placeholder — charts and maps are added here by the
    /portaljs-add-chart and /portaljs-add-map skills. */}
<section className="mt-10 border-t border-gray-200 pt-6">
  <h2 className="text-lg font-semibold text-gray-900">Views</h2>
  <p className="mt-2 text-sm text-gray-400">
    No views yet. Charts and maps for this dataset are added here.
  </p>
</section>
```

Edit `PORTAL_DIR/pages/[owner]/[slug].tsx`:

1. Add the import near the top (after the `Table` import):
   ```tsx
   import { Chart } from '../../components/Chart'
   ```
2. Replace the Views placeholder `<section>` so it conditionally renders the chart for the
   target dataset and keeps the "no views yet" message for every other dataset. Build
   `Y_PROP` as a single string `y="col"` for one column, or `y={['a','b']}` for several.
   The data URL is the dataset's file served statically (`/data/<file>`):

   ```tsx
   <section className="mt-10 border-t border-gray-200 pt-6">
     <h2 className="text-lg font-semibold text-gray-900">Views</h2>
     {dataset.namespace === 'NAMESPACE' && dataset.slug === 'SLUG' ? (
       <div className="mt-4">
         <h3 className="text-base font-medium text-gray-800 mb-3">TITLE</h3>
         <Chart url={`/data/${dataset.file}`} type="TYPE" x="X" Y_PROP />
       </div>
     ) : (
       <p className="mt-2 text-sm text-gray-400">
         No views yet. Charts and maps for this dataset are added here.
       </p>
     )}
   </section>
   ```

If a previous `/portaljs-add-chart` or `/portaljs-add-map` run already replaced this section with a
view-dispatch block, **extend** that block with another `dataset.namespace === … &&
dataset.slug === …` branch rather than overwriting it, so multiple datasets can each have
their own views.

### 7. Verify the build

```bash
cd PORTAL_DIR && npx tsc --noEmit
```

If type-checking fails, tell the user the first `tsc` error and fix it before reporting
success.

### 8. Report success

```
✓ Chart added to DATASET
  - Component: components/Chart.tsx (recharts)
  - Showcase:  pages/[owner]/[slug].tsx Views section — <Chart type="TYPE" x="X" y=...>
  - Renders at: /@NAMESPACE/SLUG
  - Dependency: recharts@^2.15.0 added to package.json

Next: run `npm run dev` and visit http://localhost:3000/@NAMESPACE/SLUG to verify the chart renders.
```

## Notes

- **Why recharts, not `@portaljs/components`:** the bundled package ships leaflet, vega,
  ag-grid, and pdf.js in one non-tree-shakeable 1.9 MB blob. `recharts` is ~100 KB
  gzipped and tree-shakes. Per `CLAUDE.md`, add a chart library directly.
- **Numeric coercion:** CSV cells are strings; the component runs `Number()` on every
  `y` value. Non-numeric cells become `NaN` and render as gaps (line/area) or skipped
  bars — clean the data if you see holes.
- **Pie/scatter use the first `y` only.** Pie maps `x` → slice name, `y[0]` → slice
  value. Scatter plots `x` (numeric) against `y[0]` (numeric). Pass extra `y` columns
  only for line/bar/area (multi-series).
- **One showcase route, many datasets:** `pages/[owner]/[slug].tsx` renders every dataset,
  so always gate a view on the dataset's `(namespace, slug)` — otherwise the chart would
  appear on every dataset's showcase.
- **Client-side rendering:** the chart fetches in the browser like `Table`, so it works
  with static export and needs no server code.
- **Large datasets:** recharts renders all points to SVG; over ~2,000 points gets
  sluggish. Pre-aggregate (e.g. yearly buckets) for big series.
```
