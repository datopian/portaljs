---
metatitle: /portaljs-add-dataset – Add a CSV, TSV, JSON, or GeoJSON Dataset to PortalJS
metadescription: The /portaljs-add-dataset skill copies your data into the portal and appends an entry to datasets.json, so the dataset's showcase renders automatically at /@<namespace>/<slug> — all as plain, editable code.
title: /portaljs-add-dataset
description: Add a CSV, TSV, JSON, or GeoJSON dataset — copies the data in and appends a datasets.json entry, so its showcase renders automatically.
---

`/portaljs-add-dataset` adds a dataset to an existing PortalJS portal. It copies the data
into `/public/data/` and appends an entry to the `datasets.json` manifest. The
showcase page then renders automatically at `/@<namespace>/<slug>` and the dataset
appears in the `/search` catalog — both are driven by the manifest, so no new page
file is created.

## When to use it

Run it after [`/portaljs-new-portal`](/docs/skills/portaljs-new-portal), once per dataset you want to
publish. For geographic data you'd rather show on a map, use
[`/portaljs-add-map`](/docs/skills/portaljs-add-map) instead (or in addition).

## Inputs

| Input | Required | Notes |
| ----- | -------- | ----- |
| Source | Yes | A local file path (`./data/file.csv`) or a public URL. |
| Portal directory | No | Path to the portal project. Defaults to the current directory. |
| Dataset name | No | Human-readable name. Defaults to the filename. |
| Description | No | Optional one-line description shown on the showcase. |
| Namespace | No | The `@`-prefixed namespace the dataset lives under (theme or owner). Defaults to a sensible value for the portal. |

**Supported formats:** CSV, TSV, JSON (array), and GeoJSON. Anything else is
rejected with a clear message to convert it first.

## Example

```
/portaljs-add-dataset ./data/air-quality.csv
```

With a name and description:

```
/portaljs-add-dataset ./data/population.csv — Auckland population by area
```

From a public URL:

```
/portaljs-add-dataset https://example.com/air-quality.csv — Air quality monitoring
```

## What it produces

- The data file copied to `public/data/<file>`.
- A new entry appended to the `datasets.json` manifest: `{ slug, name, description,
  file, format, namespace }`. Existing entries are preserved.

No page file is created. The template's showcase route (`pages/[owner]/[slug].tsx`)
renders every manifest entry automatically at `/@<namespace>/<slug>`, with a `Table`
preview for tabular data, and the `/search` catalog picks it up from the same
manifest.

When it finishes:

```
✓ Dataset added: Air quality monitoring
  - Data file: public/data/air-quality.csv
  - Manifest: datasets.json (entry appended)
  - Showcase: http://localhost:3000/@environment/air-quality
```

## Where to go next

- **[`/portaljs-add-chart`](/docs/skills/portaljs-add-chart)** — add a chart to the dataset's showcase.
- **[`/portaljs-add-map`](/docs/skills/portaljs-add-map)** — show geographic data on a map.

<DocsPagination prev="/docs/skills/portaljs-new-portal" next="/docs/skills/portaljs-add-resource" />
