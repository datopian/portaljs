---
description: Migrate (harvest) datasets between open-data platforms. Reads CKAN, a DCAT-US /data.json catalog (DKAN, ArcGIS Hub, data.gov), a DCAT / DCAT-AP RDF feed (JSON-LD, Turtle, or RDF/XML — data.europa.eu, national DCAT-AP portals, GeoDCAT-AP), Socrata, OpenDataSoft, or an ArcGIS FeatureServer, and writes them to a static PortalJS catalog (datasets.json, link-by-URL or download data files into Cloudflare R2 via Git LFS / Giftless) or pushes them into a CKAN instance over its API.
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
target.

**Sources:**

| Source | `--source` | How it's read | Covers |
| ------ | ---------- | ------------- | ------ |
| **CKAN** | `ckan` | REST API (`package_search` / `package_show`) | any CKAN instance |
| **DCAT-US `/data.json`** | `dcat` | one catalog document (plain JSON) | **DKAN, ArcGIS Hub, data.gov**, other DCAT-US publishers |
| **DCAT / DCAT-AP RDF feed** | `dcat-rdf` | RDF catalog in JSON-LD, Turtle, or RDF/XML | **data.europa.eu**, national **DCAT-AP** portals (SE/CH/DE), GeoDCAT-AP, any DCAT 2/3 RDF feed |
| **Socrata** | `socrata` | Discovery API + per-dataset resource exports | Socrata-powered open-data sites |
| **OpenDataSoft** | `ods` | Explore API v2 catalog + exports | ODS-powered portals |
| **ArcGIS FeatureServer / MapServer** | `arcgis` | layer metadata + GeoJSON query | individual ArcGIS map/feature services |

> DKAN, ArcGIS Hub, and data.gov publish a DCAT-US `/data.json` — use the **dcat** source for
> those whole catalogs. Use **arcgis** for an individual FeatureServer/MapServer (each layer
> becomes a GeoJSON dataset, which `/data.json` doesn't expose).
>
> **`dcat` vs `dcat-rdf`.** `dcat` reads the flat DCAT-US **`/data.json`** (Project Open Data
> JSON — `dataset[]` with `distribution[]`). `dcat-rdf` reads a **DCAT / DCAT-AP RDF graph**
> serialized as JSON-LD (`.jsonld`), Turtle (`.ttl`), or RDF/XML (`.rdf`) — the form
> data.europa.eu and national DCAT-AP portals publish. This is the **inbound** counterpart of
> [`/portaljs-add-dcat`](portaljs-add-dcat.md) (which EXPOSES the portal as DCAT-AP RDF): the two
> make a portal a full **two-way DCAT interop node** — expose to, and harvest from, national
> DCAT-AP portals. Both read through the SAME profile registry (`lib/metadata/dcat-profiles.ts`),
> so expose and consume stay in sync.

**Targets:**

| Target | `--target` | Writes |
| ------ | ---------- | ------ |
| **Static PortalJS catalog** (default) | `static` | `datasets.json` in a `portaljs-catalog` portal (+ in `download` mode, data files pushed to Cloudflare R2 via Git LFS / Giftless) |
| **CKAN instance** | `ckan` | datasets/resources into a CKAN backend via `package_create` / `resource_create` (needs a write API key) |

The CKAN target enables platform-to-platform moves — **CKAN→CKAN** and **DKAN→CKAN** —
since any reader can feed any writer through the canonical shape.

## Required input — ask, don't error

**Source:**
- **Source type** — `ckan`, `dcat`, `dcat-rdf`, `socrata`, `ods`, or `arcgis` (auto-detected
  from the URL if omitted; see step 3).
- **Source URL** (required) — e.g. a CKAN base URL, a DCAT-US `/data.json` URL, a DCAT-AP RDF
  feed URL (`…/catalog.jsonld` / `.ttl` / `.rdf`, or a portal page that autodiscovers one via
  `<link rel="alternate">`), a Socrata or OpenDataSoft site root, or an ArcGIS
  `…/FeatureServer` (or `…/MapServer`) URL.
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
- `SOURCE_TYPE` — `ckan` | `dcat` | `dcat-rdf` | `socrata` | `ods` | `arcgis` (default: auto-detect in step 3).
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
- URL ends in `.jsonld`, `.ttl`, or `.rdf`, or contains `/catalog.` (an RDF feed) → **dcat-rdf**.
- URL ends in `.json` or contains `/data.json` → **dcat** (DCAT-US Project Open Data JSON).
- URL contains `/api/explore/` → **ods**; `/api/catalog/` → **socrata**.
- Otherwise probe CKAN: `curl -s -m 20 "SOURCE_URL/api/3/action/package_search?rows=1"` →
  if JSON with `"success": true`, it's **ckan**.
- Else probe in turn: `SOURCE_URL/api/explore/v2.1/catalog/datasets?limit=1` (ods),
  `SOURCE_URL/data.json` (dcat), then content-negotiate RDF:
  `curl -fsSL -H "Accept: application/ld+json,text/turtle,application/rdf+xml" SOURCE_URL` — if
  the body is JSON-LD/Turtle/RDF-XML (starts with `{`/`[`, `@prefix`/`PREFIX`, or `<?xml`/`<rdf:RDF`),
  it's **dcat-rdf**. For an HTML page, look for a feed `<link rel="alternate" type="application/ld+json"
  …>` (or `text/turtle` / `application/rdf+xml`) and follow its `href` — this is the autodiscovery
  target `/portaljs-add-dcat` emits, so a portal's homepage URL is enough.
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
  "description": "...",     // one paragraph (optional) — sanitized, never a placeholder
  "keywords": ["..."],      // optional
  "licenses": [             // optional; map from source, never fabricate (see hygiene below)
    { "name": "...", "title": "...", "path": "<url>" }
  ],
  "created": "...",         // optional ISO 8601 — source "issued"/first-published date
  "modified": "...",        // optional ISO 8601 — source "last-modified" date (the DATA's)
  "resources": [
    { "name": "...", "path": "<url-or-filename>", "format": "csv", "title": "..." }
  ]
}
```

`created`/`modified` are **source-provenance** dates copied from the origin — they describe
the data, and drive the showcase "Last updated". Never set them to the harvest time; when
you copy files in (`download` mode / a migrator), record the harvest time as `migratedAt`
instead, which the showcase renders as a separate "Migrated" field.

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
| `description` | `description` **sanitized** — fallback chain, never a placeholder (see hygiene) |
| `keywords` | `keyword[]` |
| `licenses` | `license` → `[{…}]` when present, else the "no license" sentinel (see hygiene) |
| `created` | `issued` (ISO 8601 — the data's first-published date) |
| `modified` | `modified` (ISO 8601 — the data's last-modified date) |
| `resources[].name` | distribution `title` \|\| derived from URL |
| `resources[].path` | distribution `downloadURL` \|\| `accessURL` (link mode) |
| `resources[].format` | distribution `format` \|\| `mediaType` → normalized (below) |

**DCAT-US metadata hygiene — license, description, dates (do NOT skip).** A raw DCAT-US feed
carries three fields that are wrong-by-default if copied verbatim; a demo reviewer spots all
three in the first minute:

- **License — map it, never fabricate.** DCAT-US `license` is a string (SPDX id or a license
  URL). When it is **present**, emit one `licenses[]` entry: if it's a URL →
  `{ path: <url>, title: <label from the SPDX/URL, e.g. "CC-BY 4.0"> }`; if it's an SPDX id →
  `{ name: <id> }`. When it is **empty/absent, emit the honest sentinel**
  `{ "name": "notspecified", "title": "No license provided" }` — the showcase renders that
  literally. **Never default to CC-BY (or any license) the source didn't assert** — a
  fabricated permissive license is a legal-exposure bug, the one metadata error with real
  consequences. If the source offers a rights/contact hint (DCAT `contactPoint`, or an ArcGIS
  item's `accessInformation`), you may add it as a `sources[]` attribution so users know whom
  to ask — but that is not a license.

- **Description — sanitize + fallback, never render a placeholder or a server path.** Hub and
  other publishers leave un-rendered template tokens (`{{description}}`, `{{default.summary}}`)
  and ArcGIS Server file paths (`F:\arcgisserver\…\map.mxd`, `\\SERVER\…`) in the `description`.
  These must never reach `datasets.json`. Run each candidate through this guard and walk a
  fallback chain, taking the first candidate that survives — **description → (source's short
  summary/snippet, if the source exposes one — see the ArcGIS enrichment in
  `/arcgis-to-portaljs` §4) → the dataset/layer `name`**:

  ```js
  // Reject Handlebars-style placeholders and map-document / server file paths outright.
  function cleanDescription(s) {
    if (!s) return null
    const t = String(s).trim()
    if (!t) return null
    if (/\{\{.*?\}\}/.test(t)) return null                 // {{description}}, {{default.x}}
    if (/\.(mxd|aprx|sd|msd|lyr|lyrx)\b/i.test(t)) return null  // ArcGIS map-doc paths
    if (/^[A-Za-z]:\\|^\\\\/.test(t)) return null          // C:\… or UNC \\SERVER\…
    return t
  }
  // description = cleanDescription(dcat.description) ?? cleanDescription(snippet) ?? name
  ```

- **Dates — preserve source provenance, keep the harvest time separate.** Map DCAT `issued` →
  `created` and `modified` → `modified` so the showcase "Last updated" shows the *data's* real
  date (e.g. 2021-08-25), not the harvest date. Record the migration time as `migratedAt`
  (ISO) on each entry you write — the showcase renders it as a separate "Migrated" field, so
  the copy's timestamp never masquerades as the data's freshness.

**DCAT / DCAT-AP RDF mapping** (`dcat-rdf`) — an RDF catalog graph in JSON-LD, Turtle, or
RDF/XML. Do **not** hand-parse RDF: reuse the portal's harvester
`lib/metadata/dcat-harvest.ts` — the inbound counterpart of the `lib/metadata/dcat-rdf.ts`
serializer `/portaljs-add-dcat` uses, so expose/consume round-trip through one profile
registry. It parses all three serializations into a triple graph and walks Catalog → Dataset
→ Distribution → the canonical shape. (If the target portal predates it — no
`lib/metadata/dcat-harvest.ts` — copy it and `dcat-profiles.ts` from
`examples/portaljs-catalog/lib/metadata/`, same as `/portaljs-add-dcat` step 3.)

Fetch the raw RDF (never a WebFetch summary — you need the bytes) and run the harvester:

```bash
cd PORTAL_DIR
curl -fsSL -H "Accept: application/ld+json,text/turtle,application/rdf+xml" \
  "SOURCE_URL" -o /tmp/portaljs-harvest-feed
# lib/metadata is TypeScript — run the harvester through tsx (already a devDependency):
npx tsx -e '
  import { readFileSync, writeFileSync } from "node:fs"
  import { harvest, toCanonicalEntry } from "./lib/metadata/dcat-harvest"
  const r = harvest(readFileSync("/tmp/portaljs-harvest-feed", "utf8"))  // format auto-detected
  console.error(`harvested ${r.datasets.length} datasets; profiles=[${r.profiles}]; warnings=${r.warnings.length}`)
  for (const w of r.warnings.slice(0, 10)) console.error("  ⚠ " + w)
  writeFileSync("/tmp/portaljs-harvest.json", JSON.stringify(r.datasets.map(toCanonicalEntry), null, 2))
'
```
The written `/tmp/portaljs-harvest.json` is the canonical dataset array to feed step 4's
in-memory list (then continue to step 5+ exactly as any other source).

`harvest(text, { format? })` auto-detects the serialization (Content-Type + payload sniff) —
pass `{ format: "ttl" | "rdf" | "jsonld" }` to force it. It returns
`{ catalog, datasets, profiles, warnings }`; `toCanonicalEntry(d)` yields exactly the
`datasets.json` entry shape. The RDF→canonical field map (see `dcat-harvest.ts`):

| Canonical | DCAT RDF term |
| --------- | ------------- |
| `slug` | tail of `dct:identifier` \|\| slugified `dct:title` (unique within namespace) |
| `namespace` | slugified `dct:publisher` → `foaf:name` (fallback first `dcat:theme` label, else `dataset`) |
| `name` | `dct:title` |
| `description` | `dct:description` |
| `keywords` | `dcat:keyword[]` |
| `resources[].path` | distribution `dcat:downloadURL` \|\| `dcat:accessURL` |
| `resources[].format` | distribution `dct:format` \|\| `dcat:mediaType` → normalized |
| `resources[].title` | distribution `dct:title` |

**Profiles read.** DCAT 2/3, DCAT-AP + national (SE/CH/DE), and **GeoDCAT-AP** (spatial fields
`dct:spatial` → `locn:geometry` / `dcat:bbox` are captured on the harvested dataset). The
feed's `dct:conformsTo` is mapped back to the profile id via the same registry
(`result.profiles`) so you can tell the user which profile the source claims. **Croissant**
(schema.org / MLCommons ML-dataset JSON-LD) is read best-effort through the JSON-LD path
(`schema:name`/`description`/`keywords`/`distribution` → canonical).

**Large / paginated catalogs.** A single feed URL is one RDF document. A whole national
catalog is usually paginated: follow `hydra:next` (or `dcat:Catalog` links / an `?page=` cursor
the portal documents) and concatenate the harvest across pages, deduping on
`(namespace, slug)`. As with CKAN, cap very large harvests and tell the user how many were
imported vs. available (thousands of datasets = thousands of static pages, slow build).

**Resilience.** The harvester skips datasets with no title/identifier and datasets with no
distribution or landing page (logged in `warnings`) rather than aborting — a partial or
slightly nonstandard feed still imports what it can. Surface `warnings` to the user.

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
| `description` | `cleanDescription(layer.description)` ?? layer `name` — layer `description` is often empty or a placeholder/server path, so sanitize and fall back (see the DCAT-US hygiene guard above) |
| `resources[].path` | `<service-url>/<layerId>/query?where=1%3D1&outFields=*&f=geojson` (link mode) |
| `resources[].format` | `geojson` |
| `recordCount` | `<service-url>/<layerId>/query?where=1=1&returnCountOnly=true&f=json` → `.count` (the showcase renders it as a "Records" field) |
| `schema.fields[]` | layer `?f=json` → `.fields[]`: `{name, title: alias (when it differs from name), type: <esri→frictionless>}` — carries the display aliases so the showcase field table reads "Property Type", not `PROP_TYPE` |

The layer `?f=json` you already fetch to enumerate `layers[]` carries `.maxRecordCount` and each
layer's `.fields[]` (name / type / **alias**); capture the aliases into `schema.fields[].title`
and the count via `returnCountOnly` — both are cheap and are the same UX wins `/arcgis-to-portaljs`
§6d/§7 make (Esri→Frictionless type map lives there). In **link** mode also offer a CSV pull
alongside the GeoJSON — add a second resource `…/query?where=1%3D1&outFields=*&f=csv`
(`format: csv`) so consumers aren't forced to take GeoJSON. (The full CSV/Shapefile/GeoPackage
export set is `/arcgis-to-portaljs`'s job, since it downloads + converts; link mode only exposes
what the server renders.)

A bare FeatureServer layer exposes no license or issued/modified metadata over the query API —
those live on the AGOL **item** (`…/sharing/rest/content/items/<id>?f=json` → `snippet`,
`licenseInfo`, `accessInformation`) and in the Hub `/data.json`. When migrating a whole Hub
site, `/arcgis-to-portaljs` §4 fetches the item and applies the license/description/date
hygiene above; for a standalone FeatureServer with no item id, emit the "no license" sentinel
and leave dates unset rather than guessing.

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
- **`download` (all files → Cloudflare R2 via Giftless):** copy every resource into the repo
  under **Git LFS**, so the portal is self-contained and the bytes live in R2 — not in git,
  not on the source. This is the same path `/portaljs-add-dataset` uses (see its **"Local
  file — R2 via Git LFS"** section for the full rationale + the OSS self-host fallback),
  applied in **bulk** to the whole harvest. Unlike a single add, migrate routes **every**
  file through LFS — no size threshold, no `public/data` inline split — for consistency
  across the catalog.

  1. **Download** each resource to `PORTAL_DIR/data/<namespace>/<slug>/<NN>-<safe-filename>`
     (note `data/`, the LFS-tracked path — **not** `public/data/`, which is the inline fence).
     `<NN>` is the resource's zero-padded index within the dataset; `<safe-filename>` is the
     URL basename sanitized to `[a-zA-Z0-9._-]` (default `data.<format>` when the URL has no
     usable basename). The index prefix is **required** — harvested datasets routinely expose
     several distributions sharing a basename (e.g. two `download.csv`s), and a bare filename
     would let later files overwrite earlier ones. Skip (with a logged warning) any file that
     fails to download rather than aborting the whole run.
  2. **Track + stage under LFS** — one glob for the whole harvest (not per-file, since every
     data file goes to R2):
     ```bash
     cd PORTAL_DIR
     git lfs track "data/**"          # appends `data/**` to .gitattributes
     git add .gitattributes data/
     ```
     Staging writes the ~130-byte LFS pointers; each pointer carries the file's `oid sha256`.
  3. **Authenticate + push once** (mirror `/portaljs-add-dataset` → "Authenticate git-lfs"):
     claim the portal slug, mint a scoped write token, set `git config lfs.url`, then commit +
     push — a single push uploads every object to R2 through Giftless. **No GitHub remote is
     required:** the bytes route to `lfs.url` regardless of any git remote (see the note below),
     so a local-only scaffold works.
     ```bash
     SLUG=<portal-slug>   # the portal's deploy slug (same one /portaljs-deploy uses)
     API="${PORTALJS_ARC_API:-https://api.arc.portaljs.com}"
     ARC_TOKEN="${PORTALJS_TOKEN:-$(node -e "try{process.stdout.write(JSON.parse(require('fs').readFileSync(process.env.HOME+'/.portaljs/credentials','utf8')).token||'')}catch{}")}"
     curl -fsS -X POST "$API/v1/repos/$SLUG/claim" -H "Authorization: Bearer $ARC_TOKEN" >/dev/null
     LFS_URL=$(curl -fsS -X POST "$API/v1/repos/$SLUG/lfs-token?actions=read,write,verify" \
       -H "Authorization: Bearer $ARC_TOKEN" \
       | node -e "process.stdin.on('data',d=>process.stdout.write(JSON.parse(d).lfs_url))")
     git config lfs.url "$LFS_URL"    # local only — never commit the token
     git commit -m "data: migrate <N> datasets from <source> via Giftless"
     # Push objects to R2 without requiring a GitHub remote (scaffolds are local-only):
     BRANCH=$(git rev-parse --abbrev-ref HEAD)
     if git remote get-url --push origin >/dev/null 2>&1; then
       git push -u origin "$BRANCH"                 # remote exists: commits + LFS bytes
     else
       git remote add r2-lfs . 2>/dev/null || true  # throwaway; lfs.url routes the bytes
       git -c lfs.locksverify=false lfs push r2-lfs "$BRANCH"
     fi
     git lfs prune                    # prune reclaims the local .git/lfs cache
     ```
     (OSS self-host without an Arc account: mint locally with `giftless/mint-token.py` — see
     the fallback in `/portaljs-add-dataset`. A GitHub remote is optional — collaboration only,
     not storage; see `giftless/README.md` → "Pushing objects without a Git remote".)
  4. **Set each `resources[].path` to the absolute R2 URL** so the browser fetches R2 directly
     (`resourceUrl()` passes absolute URLs through unchanged). The Giftless object key is
     `lfs/datopian/<portal-slug>/<oid>`:
     ```bash
     OID=$(git cat-file -p ":data/<namespace>/<slug>/<NN>-<file>" | sed -n 's/^oid sha256://p')
     # path = $R2_PUBLIC_BASE/lfs/datopian/<portal-slug>/<OID>
     ```
     `R2_PUBLIC_BASE` defaults to **`https://data.portaljs.com`** — the public read domain on
     the `portaljs-giftless` R2 bucket (GET/HEAD + range + CORS, edge-cached), so the browser
     fetches the data directly. Override only for an OSS self-host with its own bucket/domain.

  Self-contained portal, no runtime dependency on the source, and the repo stays tiny (only
  pointers) no matter how large the catalog — the bytes are in R2.

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
files are already tracked under `data/` and pushed to R2 via Giftless in step 5, and each
`resources[].path` is the absolute R2 URL.

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
  - Mode:     link  (resources reference source URLs)   | download (files in R2 via Giftless)
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
- **Two-way DCAT interop.** `--source dcat-rdf` is the harvest (inbound) half;
  [`/portaljs-add-dcat`](portaljs-add-dcat.md) is the expose (outbound) half. Together a PortalJS
  portal both **publishes to** and **harvests from** national/EU DCAT-AP portals. Both use the
  same `lib/metadata/dcat-profiles.ts` registry, so a feed this skill emits harvests back into
  the canonical shape with no field loss on what both sides support — verify with the round-trip
  test `examples/portaljs-catalog/scripts/harvest-roundtrip.test.ts`
  (`npx tsx scripts/harvest-roundtrip.test.ts`: serialize the sample catalog to all profiles ×
  serializations, harvest each back, assert fidelity). For a real source, harvest a
  data.europa.eu dataset feed or a national DCAT-AP portal's `catalog.rdf`/`.ttl`/`.jsonld`.
```
