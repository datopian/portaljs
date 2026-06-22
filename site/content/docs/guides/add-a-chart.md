---
metatitle: Add a Chart to PortalJS – Line, Bar, Area, Pie, Scatter
metadescription: Add a visualization to a PortalJS dataset page — line, bar, area, pie, or scatter — with /portaljs-add-chart, or by hand with a small charting library. Reads the same data the table uses.
title: Add a chart
description: Add a line, bar, area, pie, or scatter chart to a dataset page — with /portaljs-add-chart, or by hand.
---

**Goal:** add a chart to an existing dataset page, reading the same `/public/data/`
file the table already uses — no data duplicated.

> [!info] Before you start
> Run [`/portaljs-add-dataset`](/docs/guides/add-tabular-data) first so the dataset page
> exists. You'll chart it by its slug (e.g. `country-codes`).

## The AI path — `/portaljs-add-chart`

Tell [`/portaljs-add-chart`](/docs/skills/portaljs-add-chart) which dataset, which columns, and the
chart type:

```
/portaljs-add-chart country-codes --x year --y population --type line
```

…or in natural language:

```
/portaljs-add-chart the population dataset — plot population over year as a line chart
```

It validates that the columns exist, installs a lightweight charting library, writes a
reusable `components/Chart.tsx` (only if one doesn't already exist), and inserts a
`<Chart />` block **above** the `<Table />` so the visual summary leads and the raw
table follows. It type-checks the project before reporting success.

Supported types: **line** (default), **bar**, **area**, **pie**, **scatter**. Pass
several Y columns for multi-series line/bar/area charts; pie and scatter use the first
Y column only.

## The by-hand path

The chart is just a small client component that reads the same data file. Install a
lightweight, tree-shakeable charting library (the skill standardizes on a single
small library rather than a heavy all-in-one bundle), add a `Chart` component to
`components/`, and render it on the dataset page above the `<Table />`:

```tsx
import { Chart } from '../../components/Chart';
// …inside the page, above <Table />:
<section className="mb-10">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Population over year</h2>
  <Chart url="/data/population.csv" type="line" x="year" y="population" />
</section>
```

The component fetches the CSV in the browser (reusing the template's `parseCsv`
helper), coerces the Y columns to numbers, and renders with a `ResponsiveContainer`.
Because it renders client-side like `Table`, it works under static export with no
server code.

> [!note] Why a small library, not a mega-bundle
> The skill deliberately avoids the heavy all-in-one `@portaljs/components` blob
> (which ships Leaflet, Vega, ag-grid, and pdf.js together). A single small,
> tree-shakeable chart library keeps the bundle lean. If you prefer a different
> charting library — Observable Plot, for instance — the by-hand path is the same:
> install it and write your own `Chart` component.

## Notes

- **Numeric coercion:** CSV cells are strings; Y values run through `Number()`.
  Non-numeric cells render as gaps — clean the data if you see holes.
- **Large series:** SVG charts get sluggish past ~2,000 points. Pre-aggregate (e.g.
  yearly buckets) for big datasets.

## Where to go next

- **[Render a map](/docs/guides/render-a-map)** — for geographic data.
- **[Deploy](/docs/guides/deploy)** — publish once it looks right.

<DocsPagination prev="/docs/guides/scaling-data" next="/docs/guides/render-a-map" />
