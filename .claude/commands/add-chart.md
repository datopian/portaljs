---
description: Add a chart (line, bar, area, pie, or scatter) to a PortalJS dataset page. Installs recharts, writes a reusable Chart component, and embeds the visualization in the page.
allowed-tools: Read, Write, Edit, Bash
---

# /add-chart

Add a visualization to an existing PortalJS dataset page. Installs `recharts` (added
directly — **not** `@portaljs/components`), writes a reusable client-side `Chart`
component into the portal's `components/`, and embeds a `<Chart />` into the target
dataset page next to its `<Table />`.

Use this after `/add-dataset` has created a dataset page. The chart reads the same
`/public/data/*.csv` (or `.json`) the table already uses — no data is duplicated.

## Required input

- **Dataset** — the dataset slug or page path to chart (e.g. `country-codes` or
  `pages/datasets/country-codes.tsx`). The page must already exist.
- **X axis column** — the column name for the category/X axis (e.g. `year`).
- **Y axis column(s)** — one or more numeric column names to plot (e.g. `population`
  or `imports,exports`).
- **Portal directory** — path to the portal project (defaults to current directory).
- **Chart type** — `line` (default), `bar`, `area`, `pie`, or `scatter`.

If the dataset is missing:
```
ERROR: [add-chart] MISSING_INPUT No dataset provided — give a dataset slug or page path, plus x and y columns.
```

## Steps

### 1. Parse arguments from `$ARGUMENTS`

Extract:
- `DATASET` — slug or page path (required)
- `X` — x-axis column name (required)
- `Y` — comma-separated y-axis column name(s) (required)
- `TYPE` — chart type, one of `line|bar|area|pie|scatter` (default: `line`)
- `PORTAL_DIR` — portal directory (default: `.`)
- `TITLE` — chart heading (default: derived from Y columns, e.g. "Population over Year")

If `$ARGUMENTS` is empty, ask:
```
To add a chart I need:
1. Dataset: slug or page path (e.g. country-codes)
2. X axis column (e.g. year)
3. Y axis column(s), comma-separated (e.g. population or imports,exports)
4. Chart type [line] (line|bar|area|pie|scatter)
5. Portal directory (press Enter for current directory)
```

Validate `TYPE` is one of the five supported values. Otherwise:
```
ERROR: [add-chart] UNSUPPORTED_TYPE TYPE is not supported — use line, bar, area, pie, or scatter.
```

### 2. Resolve the dataset page and data source

- Resolve `PAGE_PATH`: if `DATASET` ends in `.tsx`, use it; else use `PORTAL_DIR/pages/datasets/DATASET.tsx`.
- If the page does not exist:
  ```
  ERROR: [add-chart] PAGE_NOT_FOUND PAGE_PATH does not exist — run /add-dataset first, or check the slug.
  ```
- Read the page. Find the data source from the existing `<Table .../>`:
  - `url="/data/SLUG.csv"` → `DATA_URL = /data/SLUG.csv`, source is CSV-over-URL.
  - `data={...}` import from `public/data/SLUG.json` → JSON; the chart will import the same JSON.
- If no `<Table />` and no obvious data source is found, ask the user for the data file path under `/public/data/`.

### 3. Validate the requested columns exist

- For CSV: read `PORTAL_DIR/public/data/SLUG.csv` first line for headers.
- For JSON: read the first object's keys from `PORTAL_DIR/public/data/SLUG.json`.
- Confirm `X` and every `Y` column is present. If any is missing:
  ```
  ERROR: [add-chart] COLUMN_NOT_FOUND Column "COL" not in dataset — available: <comma-separated headers>.
  ```
- Warn (do not fail) if a `Y` column's first non-empty value is non-numeric:
  ```
  Note: column "COL" looks non-numeric — chart values are coerced with Number(); non-numeric cells render as gaps.
  ```

### 4. Install recharts

```bash
cd PORTAL_DIR && npm install recharts@^2.12.0
```

Do **not** install `@portaljs/components`. If the install fails, report:
```
ERROR: [add-chart] INSTALL_FAILED npm install recharts failed — check network and package.json, then retry.
```

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
current template — copy `parseCsv.ts` from `examples/portaljs-template/components/ui/`.

### 6. Embed the chart in the dataset page

Edit `PAGE_PATH`:

1. Add the import after the `Table` import:
   ```tsx
   import { Chart } from '../../components/Chart'
   ```
2. Insert the chart block above the `<Table .../>` (so the visual summary leads, the
   raw table follows). Build `Y_PROP` as a single string `y="col"` for one column, or
   `y={['a','b']}` for several.

   **CSV-over-URL source** (matches the existing `<Table url="..." />`):
   ```tsx
   <section className="mb-10">
     <h2 className="text-xl font-semibold text-gray-900 mb-4">TITLE</h2>
     <Chart url="/data/SLUG.csv" type="TYPE" x="X" Y_PROP />
   </section>
   ```

   **JSON source** (page already imports the array as `data`):
   ```tsx
   <section className="mb-10">
     <h2 className="text-xl font-semibold text-gray-900 mb-4">TITLE</h2>
     <Chart data={data} type="TYPE" x="X" Y_PROP />
   </section>
   ```

If the page has been heavily customized and no `<Table />` anchor is found, insert the
chart block directly after the `<h1>` heading instead, and tell the user where it landed.

### 7. Verify the build

```bash
cd PORTAL_DIR && npx tsc --noEmit
```

If type-checking fails, report the first error with the `ERROR:` format and stop:
```
ERROR: [add-chart] TYPECHECK_FAILED <first tsc error> — fix before running the portal.
```

### 8. Report success

```
✓ Chart added to DATASET
  - Component: components/Chart.tsx (recharts)
  - Page: PAGE_PATH — <Chart type="TYPE" x="X" y=...>
  - Dependency: recharts@^2.12.0 added to package.json

Next: run `npm run dev` and visit http://localhost:3000/datasets/SLUG to verify the chart renders.
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
- **Client-side rendering:** the chart fetches in the browser like `Table`, so it works
  with static export and needs no server code.
- **Large datasets:** recharts renders all points to SVG; over ~2,000 points gets
  sluggish. Pre-aggregate (e.g. yearly buckets) for big series.
```
