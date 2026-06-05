---
metatitle: /add-chart – Add a Line, Bar, Area, Pie, or Scatter Chart to PortalJS
metadescription: The /add-chart skill installs recharts, writes a reusable Chart component, and embeds a visualization into a dataset page — reading the same data the table already uses.
title: /add-chart
description: Add a line, bar, area, pie, or scatter chart to a dataset page, reading the same data the table already uses.
---

`/add-chart` adds a visualization to an existing dataset page. It installs
`recharts`, writes a reusable client-side `Chart` component into the portal's
`components/`, and embeds a `<Chart />` into the target page next to its `<Table />`.
The chart reads the same `/public/data/*` file the table already uses — no data is
duplicated.

## When to use it

Run it after [`/add-dataset`](/docs/skills/add-dataset) has created the dataset
page you want to chart.

## Inputs

| Input | Required | Notes |
| ----- | -------- | ----- |
| Dataset | Yes | The dataset slug or page path (e.g. `country-codes`). The page must already exist. |
| X axis column | Yes | The column for the category / X axis (e.g. `year`). |
| Y axis column(s) | Yes | One or more numeric columns to plot (e.g. `population` or `imports,exports`). |
| Chart type | No | `line` (default), `bar`, `area`, `pie`, or `scatter`. |
| Portal directory | No | Path to the portal project. Defaults to the current directory. |
| Title | No | Chart heading. Defaults to one derived from the Y columns. |

The skill validates that the requested columns exist in the data and warns if a Y
column looks non-numeric (values are coerced with `Number()`). Pie and scatter use
the first Y column only; pass extra Y columns for multi-series line, bar, or area
charts.

## Example

```
/add-chart country-codes --x year --y population --type line
```

In natural language:

```
/add-chart the population dataset — plot population over year as a line chart
```

## What it produces

- `recharts` added to `package.json` (installed directly — not the heavier
  `@portaljs/components` bundle).
- A reusable `components/Chart.tsx` (written once; an existing customized component
  is never overwritten).
- A `<Chart />` block inserted into the dataset page above the `<Table />`, so the
  visual summary leads and the raw table follows.

It type-checks the project (`tsc --noEmit`) before reporting success. When it
finishes:

```
✓ Chart added to country-codes
  - Component: components/Chart.tsx (recharts)
  - Page: pages/datasets/country-codes.tsx — <Chart type="line" x="year" y="population">
  - Dependency: recharts@^2.12.0 added to package.json
```

## Where to go next

- **[`/add-map`](/docs/skills/add-map)** — render geographic data on a map instead.
- **[`/deploy`](/docs/skills/deploy)** — publish the portal once it looks right.

<DocsPagination prev="/docs/skills/add-dataset" next="/docs/skills/add-map" />
