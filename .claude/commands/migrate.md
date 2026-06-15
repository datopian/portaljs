---
description: Migrate (harvest) datasets from an external open-data platform into a static PortalJS catalog. Reads a CKAN instance or a DCAT-US /data.json catalog and writes datasets.json entries — link-by-URL by default, or download the files. The DKAN / ArcGIS Hub / data.gov path goes through the DCAT reader.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /migrate

Harvest datasets from an external open-data platform into an existing
`portaljs-catalog` portal. The source's datasets are read over its API, mapped to the
portal's canonical dataset shape, and written into `datasets.json` (the static catalog's
single source of truth) — so the `/search` catalog and the `/@<namespace>/<slug>`
showcases render them like any hand-added dataset.

This is the **copy-into-the-portal** path. It is the inverse of
[`/connect-ckan`](connect-ckan.md): connect-ckan keeps the source authoritative and reads
it live at build time; `/migrate` takes a one-time (re-runnable) snapshot into the static
catalog, so the portal stands alone and needs no backend.

## Hub-and-spoke model

Every source is read into one **canonical** shape (the template's `Dataset`/`Resource`
type — a Frictionless-aligned `{ slug, namespace, name, description, resources[] }`), then
written to the target from that canonical form. Add a source once and it migrates to every
target. v1 ships two readers and one writer.

**Sources (v1):**

| Source | How it's read | Covers |
| ------ | ------------- | ------ |
| **CKAN** | REST API (`package_search` / `package_show`) | any CKAN instance |
| **DCAT-US `/data.json`** | one catalog document | **DKAN, ArcGIS Hub, data.gov**, and other DCAT-US publishers |

> DKAN, ArcGIS Hub, and data.gov all expose a DCAT-US `/data.json` — use the **dcat**
> source for those. (Socrata, OpenDataSoft, and ArcGIS FeatureServer are planned; for now,
> if they expose a `/data.json`, the dcat reader works.)

**Target (v1):** the static `portaljs-catalog` (`datasets.json` + optional files in
`/public/data/`).

## Required input — ask, don't error

- **Source type** — `ckan` or `dcat` (auto-detected from the URL if omitted; see step 3).
- **Source URL** (required) — a CKAN base URL (e.g. `https://demo.dev.datopian.com`) or a
  DCAT `/data.json` URL (e.g. `https://hub.arcgis.com/data.json`).
- **Portal directory** (optional) — the target portal (default: current directory).
- **Filters** (optional, CKAN only) — org / group names to restrict the harvest.
- **Copy mode** (optional) — `link` (default) or `download` (see step 5).
- **`--dry-run`** (optional) — preview what would be written without touching `datasets.json`.
- **`--replace`** (optional) — clear existing `datasets.json` entries first (default: upsert
  alongside what's already there, e.g. the sample datasets).

**If the source URL is missing, ask for it (and the source type if unclear) — never
dead-end with a missing-input error.**

## Steps

### 1. Gather input from `$ARGUMENTS` (interview if thin)

Extract:
- `SOURCE_TYPE` — `ckan` | `dcat` (default: auto-detect in step 3).
- `SOURCE_URL` — required; strip any trailing slash.
- `PORTAL_DIR` — default `.`.
- `ORG_FILTER` / `GROUP_FILTER` — lists (CKAN only; default empty).
- `COPY_MODE` — `link` | `download` (default `link`).
- `DRY_RUN` — boolean (default false).
- `REPLACE` — boolean (default false).

If `SOURCE_URL` is missing, ask and wait:
```
To migrate datasets I need:
1. Source URL — a CKAN base URL, or a DCAT /data.json URL (required)
2. Source type — ckan or dcat (Enter to auto-detect)
3. Portal directory (Enter for current directory)
4. Copy mode — link (reference source URLs, default) or download (copy files in)
```

### 2. Validate the target portal

The target must be a `portaljs-catalog` portal. Confirm `PORTAL_DIR/datasets.json`,
`PORTAL_DIR/package.json`, and `PORTAL_DIR/pages/[owner]/[slug].tsx` exist. If
`datasets.json` is missing, tell the user this isn't the catalog template (it may be the
minimal single-page template) and ask how to proceed rather than failing silently.

Read `NAMESPACE_TYPE` from `PORTAL_DIR/lib/datasets.ts` — it doesn't change the harvest
(every dataset still carries a `namespace`), but it tells you whether namespaces read as
subjects (`theme`) or publishers (`owner`) so you can explain the result.

### 3. Detect the source type and verify it's reachable

If `SOURCE_TYPE` is unset, auto-detect:
- If the URL ends in `.json` (or contains `/data.json`), treat as **dcat**.
- Otherwise probe CKAN: `curl -s -m 20 "SOURCE_URL/api/3/action/package_search?rows=1"` →
  if JSON with `"success": true`, it's **ckan**.
- If neither, try fetching `SOURCE_URL/data.json` as a DCAT catalog.
- If still nothing resolves, tell the user the URL didn't look like a CKAN API or a DCAT
  catalog, and ask them to confirm the URL / pick the type — don't dead-end.

For **ckan** with an `ORG_FILTER`, validate each org exists via
`organization_show?id=ORG`; if one is missing, list valid orgs (`organization_list`) and
ask which they meant or to drop the filter.

### 4. Read the source into canonical datasets

Use `WebFetch` or `curl` for requests. Build an in-memory list of **canonical** entries
shaped like the template's `Dataset`:

```jsonc
{
  "slug": "...",            // URL-safe, unique within a namespace
  "namespace": "...",       // groups the dataset (CKAN org / DCAT publisher or theme)
  "name": "...",            // human title
  "description": "...",     // one paragraph (optional)
  "keywords": ["..."],      // optional
  "resources": [
    { "name": "...", "path": "<url-or-filename>", "format": "csv", "title": "..." }
  ]
}
```

A single-file dataset may instead use the `file`/`format` sugar, but prefer `resources[]`
so multi-file datasets are uniform.

**CKAN mapping** (`package_search` paginated by `rows`/`start`, then per dataset the
search result already carries `resources`, so a second `package_show` is only needed if a
field is missing):

| Canonical | CKAN field |
| --------- | ---------- |
| `slug` | `name` (already URL-safe) |
| `namespace` | `organization.name` (fallback `dataset`) |
| `name` | `title` \|\| `name` |
| `description` | `notes` |
| `keywords` | `tags[].name` |
| `resources[].name` | resource `name` \|\| `id` |
| `resources[].path` | resource `url` (link mode) |
| `resources[].format` | resource `format` lowercased |

Page with `rows=200` until you've read `count` (or a sane cap — tell the user if you cap).
Apply `ORG_FILTER`/`GROUP_FILTER` via the `fq` query
(`organization:("a" OR "b") groups:("c")`).

**DCAT-US mapping** (one GET of the `/data.json`; datasets live under `dataset[]`):

| Canonical | DCAT field |
| --------- | ---------- |
| `slug` | slugified `identifier` \|\| slugified `title` |
| `namespace` | slugified `publisher.name` (fallback first `theme`, else `dataset`) |
| `name` | `title` |
| `description` | `description` |
| `keywords` | `keyword[]` |
| `resources[].name` | distribution `title` \|\| derived from URL |
| `resources[].path` | distribution `downloadURL` \|\| `accessURL` (link mode) |
| `resources[].format` | distribution `format` \|\| `mediaType` → normalized (below) |

**Format normalization.** Lowercase and map to the formats the showcase can preview
(`csv`, `tsv`, `json`, `geojson`); keep any other format string as-is (the showcase shows a
download link instead of a preview for non-tabular formats). Map common media types:
`text/csv→csv`, `application/json→json`, `application/geo+json→geojson`,
`text/tab-separated-values→tsv`. Drop distributions with no usable URL.

Ensure `slug` is unique within its `namespace` (suffix `-2`, `-3`, … on collision).

### 5. Resolve resource paths by copy mode

- **`link` (default):** set each `resources[].path` to the **source file URL** as-is. The
  template's `resourceUrl()` returns absolute paths unchanged, so no files are copied —
  fast, light, and the catalog stays in sync with the source's hosting. Trade-off: previews
  and downloads depend on the source staying up and allowing cross-origin reads.
- **`download`:** for each resource, download the file into
  `PORTAL_DIR/public/data/<namespace>/<slug>/<filename>` and set `path` to the **relative**
  `"<namespace>/<slug>/<filename>"`. Self-contained portal, no runtime dependency on the
  source — but a large catalog balloons the repo. Skip (with a logged warning) any file
  that fails to download rather than aborting the whole run.

### 6. Dry-run preview

Always print a summary before writing:
```
Source:   <type> <url>   (<N> datasets, <R> resources)
Target:   PORTAL_DIR/datasets.json   (mode: link|download, replace|upsert)
Sample:
  @<ns>/<slug>  "<name>"  — <k> resource(s): csv, json
  …(up to 5)
```
If `DRY_RUN` is set, stop here — write nothing.

### 7. Write `datasets.json`

Read the existing `PORTAL_DIR/datasets.json` (a JSON array). Then:
- If `REPLACE`: start from an empty array (tell the user the samples were removed).
- Otherwise **upsert**: replace any existing entry with the same `(namespace, slug)`, append
  the rest. This keeps the sample datasets and makes re-runs idempotent.

Write the merged array back as formatted JSON (2-space indent). For `download` mode, the
files are already in `/public/data/` from step 5.

### 8. Verify the build

```bash
cd PORTAL_DIR
npm run build > /tmp/migrate-build.log 2>&1
BUILD_EXIT=$?
tail -30 /tmp/migrate-build.log
```
If `BUILD_EXIT` is non-zero, print the log and fix before reporting success — do not report
success on a failing build. A common cause is a malformed `datasets.json` entry (missing
`slug`/`namespace`/`name`).

### 9. Report success

```
✓ Migrated <N> datasets from <type>: <url>
  - Target:   PORTAL_DIR/datasets.json  (<total> entries now, <N> new/updated)
  - Mode:     link  (resources reference source URLs)   | download (files in /public/data)
  - Namespaces: @ns-a (12), @ns-b (3), …
  - Build:    <pages> static pages generated

Next:
  npm run dev                     # browse the imported catalog
  /check-data-quality             # validate the harvested data
  /deploy                         # publish it
```

## Notes

- **link vs download.** `link` is the default because it's instant and keeps the repo small;
  the catalog references the source's file URLs. Switch to `download` when you want a fully
  self-contained portal (the source may disappear, or you're archiving). Both write the same
  `datasets.json` — only `resources[].path` differs (remote URL vs local relative path).
- **Re-running is safe.** Upsert keys on `(namespace, slug)`, so re-running the same
  migration refreshes changed datasets without duplicating them. Use `--replace` to start
  clean.
- **Schemas aren't inferred here.** Sources rarely ship Frictionless Table Schemas. After
  migrating, run [`/check-data-quality`](check-data-quality.md) to validate and
  [`/define-schema`](define-schema.md) to add schemas to the resources you care about.
- **Charts/maps.** [`/add-chart`](add-chart.md) and [`/add-map`](add-map.md) work on the
  migrated datasets exactly as on hand-added ones — they target the static showcase.
- **Large catalogs.** Harvesting thousands of datasets makes thousands of static pages and
  a slow build. Use the CKAN org/group filters (or a DCAT source already scoped to a site)
  to migrate a subset, and tell the user how many were imported vs. available.
- **DKAN / ArcGIS Hub / data.gov.** These are DCAT-US publishers — point `/migrate` at their
  `/data.json` with `--source dcat`. A native Socrata/OpenDataSoft/ArcGIS-FeatureServer
  reader is planned for richer metadata.
```
