---
description: Migrate (harvest) datasets between open-data platforms. Reads CKAN, a DCAT-US /data.json catalog (DKAN, ArcGIS Hub, data.gov), Socrata, OpenDataSoft, or an ArcGIS FeatureServer, and writes them to a static PortalJS catalog (datasets.json, link-by-URL or download) or pushes them into a CKAN instance over its API.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /portaljs-migrate

Harvest datasets from an external open-data platform into an existing
`portaljs-catalog` portal. The source's datasets are read over its API, mapped to the
portal's canonical dataset shape, and written into `datasets.json` (the static catalog's
single source of truth) — so the `/search` catalog and the `/@<namespace>/<slug>`
showcases render them like any hand-added dataset.

This is the **copy-into-the-portal** path. It is the inverse of
[`/portaljs-connect-ckan`](connect-ckan.md): connect-ckan keeps the source authoritative and reads
it live at build time; `/portaljs-migrate` takes a one-time (re-runnable) snapshot into the static
catalog, so the portal stands alone and needs no backend.

## Hub-and-spoke model

Every source is read into one **canonical** shape (the template's `Dataset`/`Resource`
type — a Frictionless-aligned `{ slug, namespace, name, description, resources[] }`), then
written to the target from that canonical form. Add a source once and it migrates to every
target. v1 ships two readers and one writer.

**Sources (v1):**

| Source | `--source` | How it's read | Covers |
| ------ | ---------- | ------------- | ------ |
| **CKAN** | `ckan` | REST API (`package_search` / `package_show`) | any CKAN instance |
| **DCAT-US `/data.json`** | `dcat` | one catalog document | **DKAN, ArcGIS Hub, data.gov**, other DCAT-US publishers |
| **Socrata** | `socrata` | Discovery API + per-dataset resource exports | Socrata-powered open-data sites |
| **OpenDataSoft** | `ods` | Explore API v2 catalog + exports | ODS-powered portals |
| **ArcGIS FeatureServer / MapServer** | `arcgis` | layer metadata + GeoJSON query | individual ArcGIS map/feature services |

> DKAN, ArcGIS Hub, and data.gov publish a DCAT-US `/data.json` — use the **dcat** source for
> those whole catalogs. Use **arcgis** for an individual FeatureServer/MapServer (each layer
> becomes a GeoJSON dataset, which `/data.json` doesn't expose).

**Targets:**

| Target | `--target` | Writes |
| ------ | ---------- | ------ |
| **Static PortalJS catalog** (default) | `static` | `datasets.json` (+ optional files in `/public/data/`) in a `portaljs-catalog` portal |
| **CKAN instance** | `ckan` | datasets/resources into a CKAN backend via `package_create` / `resource_create` (needs a write API key) |

The CKAN target enables platform-to-platform moves — **CKAN→CKAN** and **DKAN→CKAN** —
since any reader can feed any writer through the canonical shape.

## Required input — ask, don't error

**Source:**
- **Source type** — `ckan`, `dcat`, `socrata`, `ods`, or `arcgis` (auto-detected from the
  URL if omitted; see step 3).
- **Source URL** (required) — e.g. a CKAN base URL, a DCAT `/data.json` URL, a Socrata or
  OpenDataSoft site root, or an ArcGIS `…/FeatureServer` (or `…/MapServer`) URL.
- **Filters** (optional) — CKAN: org / group names. Socrata/ODS: pass a search term or
  category to scope large catalogs.

**Target** — `--target static` (default) or `--target ckan`:
- **static**: **Portal directory** (optional, default current dir); **copy mode** `link`
  (default) or `download` (step 5b).
- **ckan**: **target CKAN URL** (required) and a **write API key** read from the
  `CKAN_API_KEY` env var (required — never pass it on the command line or hardcode it); an
  optional **owner org** to file every dataset under (step 7b).

**Common:**
- **`--dry-run`** (optional) — preview what would be written, change nothing.
- **`--replace`** (optional, static target) — clear existing `datasets.json` entries first
  (default: upsert alongside what's already there, e.g. the sample datasets).

**If the source URL is missing, ask for it (and the source type if unclear) — never
dead-end with a missing-input error.** For `--target ckan`, if the target URL or
`CKAN_API_KEY` is missing, ask rather than failing.

## Steps

### 1. Gather input from `$ARGUMENTS` (interview if thin)

Extract:
- `SOURCE_TYPE` — `ckan` | `dcat` | `socrata` | `ods` | `arcgis` (default: auto-detect in step 3).
- `SOURCE_URL` — required; strip any trailing slash.
- `ORG_FILTER` / `GROUP_FILTER` — lists (CKAN source only; default empty).
- `TARGET` — `static` | `ckan` (default `static`).
- `PORTAL_DIR` — default `.` (static target).
- `COPY_MODE` — `link` | `download` (default `link`; static target).
- `TARGET_CKAN_URL` — required for `ckan` target; strip any trailing slash.
- `OWNER_ORG` — optional CKAN org to file datasets under (ckan target).
- `DRY_RUN` — boolean (default false).
- `REPLACE` — boolean (default false; static target).

The write API key for a `ckan` target is read from `process.env.CKAN_API_KEY` at run time —
never from `$ARGUMENTS`.

If `SOURCE_URL` is missing, ask and wait:
```
To migrate datasets I need:
1. Source URL — a CKAN base URL, or a DCAT /data.json URL (required)
2. Source type — ckan or dcat (Enter to auto-detect)
3. Portal directory (Enter for current directory)
4. Copy mode — link (reference source URLs, default) or download (copy files in)
```

### 2. Validate the target

**Static target (`--target static`).** Confirm `PORTAL_DIR/datasets.json`,
`PORTAL_DIR/package.json`, and `PORTAL_DIR/pages/[owner]/[slug].tsx` exist. If
`datasets.json` is missing, tell the user this isn't the catalog template (it may be the
minimal single-page template) and ask how to proceed rather than failing silently. Read
`NAMESPACE_TYPE` from `PORTAL_DIR/lib/datasets.ts` — it doesn't change the harvest (every
dataset still carries a `namespace`), but it tells you whether namespaces read as subjects
(`theme`) or publishers (`owner`) so you can explain the result.

**CKAN target (`--target ckan`).** Confirm `TARGET_CKAN_URL` is a working CKAN API and the
key authenticates: call `package_search?rows=1` (must be `success: true`), then verify the
key with an authenticated read such as `organization_list_for_user` (pass the key in the
`Authorization` header). If the key is missing or rejected, tell the user and stop — never
write without a confirmed key. If `OWNER_ORG` is set, confirm it exists
(`organization_show?id=OWNER_ORG`); offer to create it (step 7b) or pick an existing one.

### 3. Detect the source type and verify it's reachable

If `SOURCE_TYPE` is unset, auto-detect:
- URL contains `/FeatureServer` or `/MapServer` → **arcgis**.
- URL ends in `.json` or contains `/data.json` → **dcat**.
- URL contains `/api/explore/` → **ods**; `/api/catalog/` → **socrata**.
- Otherwise probe CKAN: `curl -s -m 20 "SOURCE_URL/api/3/action/package_search?rows=1"` →
  if JSON with `"success": true`, it's **ckan**.
- Else probe in turn: `SOURCE_URL/api/explore/v2.1/catalog/datasets?limit=1` (ods),
  `SOURCE_URL/data.json` (dcat).
- If still nothing resolves, tell the user the URL didn't look like a supported source and
  ask them to confirm the URL / pick the `--source` type — don't dead-end. (Socrata is read
  through the central Discovery API, so for a Socrata site pass `--source socrata` with the
  site root, e.g. `https://data.cityofnewyork.us`.)

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

**Socrata mapping** (Discovery API at the central host, then per-dataset file exports):

Page the catalog: `https://api.us.socrata.com/api/catalog/v1?domains=<host>&limit=100&offset=…`
(`<host>` is the site root's hostname, e.g. `data.cityofnewyork.us`). Use `&q=<term>` or
`&categories=<cat>` for the optional filter. Each `results[]` item has a `resource` object:

| Canonical | Socrata field |
| --------- | ------------- |
| `slug` | `resource.id` (the 4x4, e.g. `8wbx-tsch`) |
| `namespace` | slugified `classification.domain_category` (fallback `dataset`) |
| `name` | `resource.name` |
| `description` | `resource.description` |
| `keywords` | `classification.domain_tags` |
| `resources[].path` | `https://<host>/resource/<id>.csv` (tabular) or `.geojson` for map data (link mode) |
| `resources[].format` | `csv` (or `geojson` when the asset is geospatial) |

**OpenDataSoft mapping** (Explore API v2):

Page `https://<host>/api/explore/v2.1/catalog/datasets?limit=100&offset=…` (use `&where=…`
or `&refine=…` for filters). Each `results[]` item:

| Canonical | ODS field |
| --------- | --------- |
| `slug` | slugified `dataset_id` (ODS ids can contain `@`, which is the namespace sentinel) |
| `namespace` | slugified first `metas.default.theme` (fallback `dataset`) |
| `name` | `metas.default.title` |
| `description` | `metas.default.description` |
| `keywords` | `metas.default.keyword` |
| `resources[].path` | `https://<host>/api/explore/v2.1/catalog/datasets/<id>/exports/csv` (and `/exports/geojson` if the dataset has geo) (link mode) |
| `resources[].format` | `csv` (or `geojson`) |

**ArcGIS FeatureServer / MapServer mapping** (one service → many layers; each layer is a
GeoJSON dataset):

GET `<service-url>?f=json` to list `layers[]` (and `tables[]`). For each layer:

| Canonical | ArcGIS field |
| --------- | ------------ |
| `slug` | slugified `name` (fallback `layer-<id>`) |
| `namespace` | slugified service name (last path segment before `/FeatureServer`) |
| `name` | layer `name` |
| `description` | layer `description` (often empty) |
| `resources[].path` | `<service-url>/<layerId>/query?where=1%3D1&outFields=*&f=geojson` (link mode) |
| `resources[].format` | `geojson` |

**Format normalization.** Lowercase and map to the formats the showcase can preview
(`csv`, `tsv`, `json`, `geojson`); keep any other format string as-is (the showcase shows a
download link instead of a preview for non-tabular formats). Map common media types:
`text/csv→csv`, `application/json→json`, `application/geo+json→geojson`,
`text/tab-separated-values→tsv`. Drop distributions/resources with no usable URL.

Ensure `slug` is unique within its `namespace` (suffix `-2`, `-3`, … on collision).

### 5. (static target) Resolve resource paths by copy mode

> Steps 5–8 below describe the **static** target. For `--target ckan`, skip to step 7b.

- **`link` (default):** set each `resources[].path` to the **source file URL** as-is. The
  template's `resourceUrl()` returns absolute paths unchanged, so no files are copied —
  fast, light, and the catalog stays in sync with the source's hosting. Trade-off: previews
  and downloads depend on the source staying up and allowing cross-origin reads.
- **`download`:** for each resource, download the file into
  `PORTAL_DIR/public/data/<namespace>/<slug>/<NN>-<safe-filename>` and set `path` to the
  matching **relative** `"<namespace>/<slug>/<NN>-<safe-filename>"`. `<NN>` is the resource's
  zero-padded index within the dataset and `<safe-filename>` is the URL basename sanitized to
  `[a-zA-Z0-9._-]` (default `data.<format>` when the URL has no usable basename). The index
  prefix is **required** — harvested datasets routinely expose several distributions sharing a
  basename (e.g. two `download.csv`s), and a bare `<filename>` would let later files overwrite
  earlier ones. Self-contained portal, no runtime dependency on the source — but a large
  catalog balloons the repo. Skip (with a logged warning) any file that fails to download
  rather than aborting the whole run.

### 6. Dry-run preview

Always print a summary before writing:
```
Source:   <type> <url>   (<N> datasets, <R> resources)
Target:   static → PORTAL_DIR/datasets.json (mode: link|download, replace|upsert)
          —or— ckan → <TARGET_CKAN_URL> (owner org: <org>)
Sample:
  @<ns>/<slug>  "<name>"  — <k> resource(s): csv, json
  …(up to 5)
```
If `DRY_RUN` is set, stop here — write nothing (and for the CKAN target, make no POSTs).

### 7. (static target) Write `datasets.json`

Read the existing `PORTAL_DIR/datasets.json` (a JSON array). Then:
- If `REPLACE`: start from an empty array (tell the user the samples were removed).
- Otherwise **upsert**: replace any existing entry with the same `(namespace, slug)`, append
  the rest. This keeps the sample datasets and makes re-runs idempotent.

Write the merged array back as formatted JSON (2-space indent). For `download` mode, the
files are already in `/public/data/` from step 5.

### 7b. (CKAN target) Push to CKAN

For `--target ckan`, write the canonical datasets into the target CKAN over its action API.
Read the key once: `const key = process.env.CKAN_API_KEY` and send it as the
`Authorization: <key>` header on every write (POST, `Content-Type: application/json`).

For each canonical dataset:

1. **Organization.** Determine the owner org: `OWNER_ORG` if given, else the dataset's
   `namespace`. Ensure it exists — `organization_show?id=<org>`; if missing, create it with
   `organization_create` (`{ name: <org>, title: <org> }`). Cache the orgs you've ensured so
   you don't re-check each dataset.
2. **Upsert the package.** Map canonical → CKAN payload:

   | CKAN field | Canonical |
   | ---------- | --------- |
   | `name` | `slug` (CKAN's unique key; must be lowercase/`-`) |
   | `title` | `name` |
   | `notes` | `description` |
   | `owner_org` | the org from step 1 |
   | `tags` | `keywords.map(k => ({ name: k }))` |

   Check `package_show?id=<slug>`: if it exists, `package_update` (merge, preserving the
   `id`); otherwise `package_create`. Treat the slug as globally unique in CKAN — on a
   `name` collision with a different org, suffix the slug.
3. **Resources.** For each canonical resource, `resource_create` (or `resource_update` when
   re-running) with `{ package_id, name, url: <path>, format }`. In `link` mode `url` is the
   source file URL (CKAN references it); a `download`-style copy-into-CKAN upload is out of
   scope for v1 — note that to the user if they ask.

Stop and report the first auth/permission failure (HTTP 403 / `success:false`) rather than
half-migrating silently; on a per-dataset error, log it, skip that dataset, and continue.

### 8. (static target) Verify the build

```bash
cd PORTAL_DIR
npm run build > /tmp/portaljs-migrate-build.log 2>&1
BUILD_EXIT=$?
tail -30 /tmp/portaljs-migrate-build.log
```
If `BUILD_EXIT` is non-zero, print the log and fix before reporting success — do not report
success on a failing build. A common cause is a malformed `datasets.json` entry (missing
`slug`/`namespace`/`name`). For the **CKAN target**, verify instead with
`package_search?rows=1&fq=...` (or `package_show` on a few slugs) that the datasets landed.

### 9. Report success

Static target:
```text
✓ Migrated <N> datasets from <type>: <url>
  - Target:   PORTAL_DIR/datasets.json  (<total> entries now, <N> new/updated)
  - Mode:     link  (resources reference source URLs)   | download (files in /public/data)
  - Namespaces: @ns-a (12), @ns-b (3), …
  - Build:    <pages> static pages generated

Next:
  npm run dev                     # browse the imported catalog
  /portaljs-check-data-quality             # validate the harvested data
  /portaljs-deploy                         # publish it
```

CKAN target:
```text
✓ Migrated <N> datasets from <type>: <src-url>  →  CKAN: <target-url>
  - Created <c> / updated <u> packages, <R> resources
  - Orgs:    <org-a> (created), <org-b> (existing)
  - Skipped: <s> (see log)

Next: open <target-url> to review the imported datasets.
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
  migrating, run [`/portaljs-check-data-quality`](check-data-quality.md) to validate and
  [`/portaljs-define-schema`](define-schema.md) to add schemas to the resources you care about.
- **Charts/maps.** [`/portaljs-add-chart`](add-chart.md) and [`/portaljs-add-map`](add-map.md) work on the
  migrated datasets exactly as on hand-added ones — they target the static showcase.
- **Large catalogs.** Harvesting thousands of datasets makes thousands of static pages and
  a slow build. Use the CKAN org/group filters (or a DCAT source already scoped to a site)
  to migrate a subset, and tell the user how many were imported vs. available.
- **DKAN / ArcGIS Hub / data.gov.** These are DCAT-US publishers — point `/portaljs-migrate` at their
  whole-catalog `/data.json` with `--source dcat`. For one ArcGIS service (not a Hub site),
  use `--source arcgis` against its `…/FeatureServer` so each layer becomes a GeoJSON dataset.
```
