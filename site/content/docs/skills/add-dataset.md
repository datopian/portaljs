---
metatitle: /add-dataset – Add a CSV, TSV, JSON, or GeoJSON Dataset to PortalJS
metadescription: The /add-dataset skill copies your data into the portal, generates a dataset page with a Table, and registers it on the home page catalog — all as plain, editable code.
title: /add-dataset
description: Add a CSV, TSV, JSON, or GeoJSON dataset — copies the data in, generates a dataset page, and registers it on the home page.
---

`/add-dataset` adds a dataset to an existing PortalJS portal. It copies the data
into `/public/data/`, generates a dataset page that renders the data as a table,
and registers the dataset on the home page catalog.

## When to use it

Run it after [`/new-portal`](/docs/skills/new-portal), once per dataset you want to
publish. For geographic data you'd rather show on a map, use
[`/add-map`](/docs/skills/add-map) instead (or in addition).

## Inputs

| Input | Required | Notes |
| ----- | -------- | ----- |
| Source | Yes | A local file path (`./data/file.csv`) or a public URL. |
| Portal directory | No | Path to the portal project. Defaults to the current directory. |
| Dataset name | No | Human-readable name. Defaults to the filename. |
| Description | No | Optional one-line description shown on the page. |

**Supported formats:** CSV, TSV, JSON (array), and GeoJSON. Anything else is
rejected with a clear message to convert it first.

## Example

```
/add-dataset ./data/air-quality.csv
```

With a name and description:

```
/add-dataset ./data/population.csv — Auckland population by area
```

From a public URL:

```
/add-dataset https://example.com/air-quality.csv — Air quality monitoring
```

## What it produces

- The data file copied to `public/data/<slug>.<ext>`.
- A dataset page at `pages/datasets/<slug>.tsx` — plain React that renders the data
  through the template's `Table` component (one file per dataset, so no dynamic
  routing is required).
- A new entry in the `datasets` array on the home page (`pages/index.tsx`) so the
  dataset appears in the catalog. Existing entries are preserved.

If the home page has been heavily customized and the catalog array can't be found,
the skill still creates the page and tells you to link it manually.

When it finishes:

```
✓ Dataset added: Air quality monitoring
  - Data file: public/data/air-quality.csv
  - Page: pages/datasets/air-quality.tsx → http://localhost:3000/datasets/air-quality
  - Home page: updated
```

## Where to go next

- **[`/add-chart`](/docs/skills/add-chart)** — add a chart to the dataset page.
- **[`/add-map`](/docs/skills/add-map)** — show geographic data on a map.

<DocsPagination prev="/docs/skills/new-portal" next="/docs/skills/add-chart" />
