---
metatitle: /migrate – Harvest Datasets from CKAN or DCAT into a PortalJS Catalog
metadescription: The /migrate skill harvests datasets from a CKAN instance or a DCAT-US /data.json catalog (DKAN, ArcGIS Hub, data.gov) into a static PortalJS catalog — link by URL or download the files, as plain editable datasets.json entries.
title: /migrate
description: Harvest datasets from a CKAN instance or a DCAT /data.json catalog into the static PortalJS catalog — the copy-into-the-portal path.
---

`/migrate` harvests datasets from an external open-data platform **into** an existing
`portaljs-catalog` portal. It reads the source over its API, maps each dataset to the
template's canonical shape, and writes the results into `datasets.json` — so the `/search`
catalog and the `/@<namespace>/<slug>` showcases render them like any hand-added dataset.

It's the inverse of [`/connect-ckan`](/docs/skills/connect-ckan): connect-ckan keeps the
source authoritative and reads it live at build time; `/migrate` takes a one-time
(re-runnable) **snapshot** into the static catalog, so the portal stands alone with no
backend.

## Hub-and-spoke

Every source is read into one **canonical** shape (the Frictionless-aligned
`Dataset`/`Resource` type), then written to the target from that form — so a source is
added once and works with every target.

**Sources (v1):**

| Source | Read via | Covers |
| ------ | -------- | ------ |
| **CKAN** | `package_search` / `package_show` | any CKAN instance |
| **DCAT-US `/data.json`** | one catalog document | **DKAN, ArcGIS Hub, data.gov**, other DCAT-US publishers |

> DKAN, ArcGIS Hub, and data.gov publish a DCAT-US `/data.json` — use the **dcat** source
> for those. Native Socrata, OpenDataSoft, and ArcGIS FeatureServer readers are planned.

**Targets:**

| Target | `--target` | Writes |
| ------ | ---------- | ------ |
| **Static PortalJS catalog** (default) | `static` | `datasets.json` (+ optional files in `/public/data/`) |
| **CKAN instance** | `ckan` | datasets/resources into a CKAN backend via its action API |

The CKAN target enables platform-to-platform moves — **CKAN→CKAN** and **DKAN→CKAN** — since
any reader feeds any writer through the canonical shape.

## Inputs

| Input | Required | Notes |
| ----- | -------- | ----- |
| Source URL | Yes | A CKAN base URL, or a DCAT `/data.json` URL. |
| Source type | No | `ckan` or `dcat`; auto-detected from the URL if omitted. |
| Org / group filter | No | CKAN source only — restrict the harvest. |
| `--target` | No | `static` (default) or `ckan`. |
| Portal directory | No | Static target — defaults to the current directory. |
| Copy mode | No | Static target — `link` (default) or `download`. |
| Target CKAN URL | For `--target ckan` | The CKAN instance to write into. |
| `CKAN_API_KEY` (env) | For `--target ckan` | A **write** API key, read from the environment — never passed on the command line. |
| `--dry-run` | No | Preview what would be written, change nothing. |
| `--replace` | No | Static target — clear existing entries first (default: upsert). |

## Examples

Harvest a whole CKAN instance:

```
/migrate https://demo.dev.datopian.com
```

Harvest one CKAN organization, downloading the files into the repo:

```
/migrate https://demo.dev.datopian.com --org transport --download
```

Harvest a DCAT catalog (DKAN / ArcGIS Hub / data.gov):

```
/migrate https://hub.arcgis.com/data.json --source dcat
```

Move one CKAN instance's datasets into another CKAN (set the write key first):

```
export CKAN_API_KEY=…           # write key for the destination
/migrate https://source-ckan.example --target ckan --target-url https://dest-ckan.example --owner-org my-org
```

> Copy modes apply to the **static** target. For `--target ckan`, see *CKAN target* below.

## Copy modes (static target)

- **`link` (default)** — each resource's `path` is set to the **source file URL**. No files
  are copied; the catalog references the source's hosting. Fast and light, but previews and
  downloads depend on the source staying up and allowing cross-origin reads.
- **`download`** — files are pulled into `/public/data/<namespace>/<slug>/` and `path` is set
  to the local relative path. The portal is fully self-contained, at the cost of repo size.

Both produce the same `datasets.json`; only `resources[].path` differs. The template's
`resourceUrl()` returns absolute paths unchanged, which is what makes link mode work.

## What it produces

- **`datasets.json`** — the harvested datasets, upserted by `(namespace, slug)` (re-running
  refreshes changed datasets without duplicating them). Existing entries — including the
  template's samples — are kept unless you pass `--replace`.
- **`/public/data/…`** (download mode only) — the copied resource files.

It runs a full `npm run build` and reports how many datasets were imported and pages
generated before declaring success.

## CKAN target

With `--target ckan`, `/migrate` pushes the canonical datasets into a CKAN instance instead
of writing `datasets.json`: it ensures the owner organization exists, then `package_create`
(or `package_update` on re-run) for each dataset and `resource_create` for each resource,
authenticating with the `CKAN_API_KEY` env var. The slug becomes CKAN's package `name`;
`name`/`description`/`keywords` map to `title`/`notes`/`tags`. In `link` mode the resource
`url` references the source file (v1 does not re-upload bytes into CKAN). It stops on the
first auth/permission error rather than half-migrating.

## After migrating

- [`/check-data-quality`](/docs/skills/check-data-quality) — validate the harvested data.
- [`/define-schema`](/docs/skills/define-schema) — add Frictionless schemas (sources rarely
  ship them).
- [`/add-chart`](/docs/skills/add-chart) / [`/add-map`](/docs/skills/add-map) — they work on
  migrated datasets exactly as on hand-added ones.
- [`/deploy`](/docs/skills/deploy) — publish the catalog.

## Notes

- **Large catalogs** make many static pages and a slow build. Use the CKAN org/group filters
  (or a DCAT source already scoped to a site) to migrate a subset; the skill reports how many
  were imported vs. available.
- **Schemas** aren't inferred during the harvest — add them afterward with `/define-schema`.
- **Formats.** CSV/TSV/JSON/GeoJSON preview in the showcase; any other format is kept and
  shown as a download link.

## Where to go next

- **[`/connect-ckan`](/docs/skills/connect-ckan)** — the live read-through alternative.
- **[Backends](/docs/backends)** — integration notes per platform.

<DocsPagination prev="/docs/skills/connect-ckan" next="/docs/skills/define-schema" />
