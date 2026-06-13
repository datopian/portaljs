---
metatitle: /add-resource – Add Another File to a PortalJS Dataset
metadescription: The /add-resource skill attaches an extra file (data dictionary, methodology, additional data) to an existing dataset. The dataset becomes multi-resource and its showcase renders a section per file.
title: /add-resource
description: Attach another file to an existing dataset — a data dictionary, methodology, or additional data. The showcase then renders one section per resource.
---

`/add-resource` adds a **resource** (an additional file) to a dataset that already exists in
your portal. Where [`/add-dataset`](/docs/skills/add-dataset) creates a *new* dataset from
one file, `/add-resource` attaches a file to an *existing* one — for datasets that are more
than a single file: data + a data dictionary + methodology, or quarterly/yearly files under
one dataset.

It follows the Frictionless **Data Package** model: a dataset holds a `resources[]` array,
and the showcase at `/@<namespace>/<slug>` renders **one section per resource** (preview,
schema, download). A single-file dataset is migrated to `resources[]` automatically the
first time you add a second file — no data is lost.

## When to use it

When a dataset is conceptually one thing but ships as several files. Keep them as one
dataset (one showcase page, shared metadata) rather than splitting into separate datasets.

## Inputs

| Input | Required | Notes |
| ----- | -------- | ----- |
| Target dataset | No | Which dataset, by `slug` (or `namespace/slug`). Asked — with a list — if missing. |
| Source | No | Local file path or public URL for the new file. Asked if missing. |
| Portal directory | No | Defaults to the current directory. |
| Resource name / title | No | Short id + human title; defaults derived from the filename. |

Supported formats: **CSV, TSV, JSON (array), GeoJSON**.

## What it produces

- The file copied into `/public/data/`.
- The dataset's `datasets.json` entry updated: the new resource appended to `resources[]`
  (migrating a single-file dataset to `resources[]` on the first add, losslessly).
- A new **section on the showcase** for that resource — preview, its Frictionless schema
  (if defined via [`/define-schema`](/docs/skills/define-schema)), and a download link.

## Example

```
/add-resource orders ./data/orders-data-dictionary.csv
```

Attaches a data dictionary to the existing `orders` dataset. If `orders` was a single CSV,
it becomes a two-resource dataset (the data + the dictionary) and its showcase renders a
section for each. With no arguments, the skill lists your datasets and asks which one.

## Where to go next

- **[`/define-schema`](/docs/skills/define-schema)** — describe a resource's fields.
- **[`/add-chart`](/docs/skills/add-chart)** / **[`/add-map`](/docs/skills/add-map)** — add a view.

<DocsPagination prev="/docs/skills/add-dataset" next="/docs/skills/add-chart" />
