---
description: Migrate a whole ArcGIS Hub site (opendata.arcgis.com or a Hub Premium custom domain) into a PortalJS Arc portal end-to-end. Harvests the Hub /data.json (DCAT-US) inventory, exports every FeatureService layer through the ArcGIS REST query API (resultOffset paging), converts each to the serverless dual tier (PMTiles render + GeoParquet query) with tabular items to Parquet, pushes everything to Cloudflare R2 via Git LFS, appends dual-tier datasets.json entries, and writes a source-vs-derived parity report. The reusable arcgis-to-portaljs migrator.
allowed-tools: Read, Write, Edit, Bash(ogr2ogr:*), Bash(ogrinfo:*), Bash(tippecanoe:*), Bash(duckdb:*), Bash(git:*), Bash(curl:*), Bash(jq:*), Bash(npx:*), Bash(node:*), Bash(mkdir:*), Bash(cp:*), Bash(wc:*), Bash(zip:*), Bash(command:*), WebFetch
---

# /arcgis-to-portaljs

Migrate an entire **ArcGIS Hub** open-data site into a **PortalJS Arc** portal in one pass.
Every Hub site is machine-readable — a DCAT-US catalog at `/data.json`, and every dataset
behind it is an ArcGIS REST FeatureService with a documented query API — so migration is a
**harvest → export → convert → publish → verify** pipeline that is almost fully automated.
The tooling is the reusable **`arcgis-to-portaljs` migrator**: input = a Hub URL, output = a
ready-to-deploy PortalJS catalog + a parity report. This is the repeatable asset, not a
one-off.

Input is one Hub URL (e.g. `https://hub-lewisville.opendata.arcgis.com` or
`https://streamwaterdata.co.uk`). Output: `datasets.json` entries, data on R2, and
`arcgis-parity-report.md`.

## What this composes — do NOT reinvent

This skill is the **ArcGIS-Hub-specialized orchestrator**. It reuses three existing pieces
and adds two ArcGIS-specific steps (the REST export loop and the parity report):

| Step | Owned by | This skill's role |
|------|----------|-------------------|
| Harvest `/data.json` (DCAT-US → canonical) | `/portaljs-migrate` (`dcat` source) | Reuse its DCAT-US field map; add Hub item **classification** (FeatureService vs table vs non-data). |
| **Export FeatureService → GeoJSON** (REST paging) | **new here** | `/portaljs-migrate`'s `arcgis` mode only *links* the query URL; this **downloads** the features so they can be converted and served serverless. |
| Convert → PMTiles + GeoParquet (dual tier) | `/portaljs-add-geo` | Reuse its exact `ogr2ogr`/`tippecanoe`/`duckdb` recipes per layer. |
| Publish: bulk Git-LFS → R2 + `datasets.json` | `/portaljs-migrate` (`download` mode) + `/portaljs-add-geo` (§10 dual-tier entry) | Reuse the bulk Giftless push; emit dual-tier entries. |
| **Parity report** (source vs derived) | **new here** | Record counts, bbox, attribute schema, geometry validity per layer. |

> **Naming note (Phase 0, for review):** the bead names the deliverable `arcgis-to-portaljs`
> (a directional, pitch-friendly asset name). The rest of the suite is prefixed `portaljs-`.
> Renaming to `portaljs-migrate-arcgis` for suite consistency is a trivial follow-up if the
> reviewer prefers it — the skeleton is name-agnostic.

## Scope — Phase 0 skeleton

Per the migration epic (po-0qe §6), Phase 0 delivers the **automatable core** — the pipeline
above, proven runnable. Explicitly **out of scope here** (tracked as child beads under
po-0qe, do not build in this pass):

- **Content pages / branding** (Hub layout pages → MDX) — Phase 2 (Stream).
- **Multi-publisher org structure** (one namespace/repo per publisher) — Phase 2 (Stream).
- **Scheduled sync + cutover playbook** (re-harvest on cadence, redirect map, DNS flip) — Phase 3.
- **Koop FeatureServer-compat adapter** (keep old REST consumers working) — Phase 4 (optional).
- **3D scenes / StoryMaps / drone imagery** — no serverless open equivalent; link-out only.

## Required input — ask, don't error

- **Hub URL** (required) — the site root, e.g. `https://hub-lewisville.opendata.arcgis.com`
  or a Hub Premium custom domain (`https://streamwaterdata.co.uk`). The skill appends
  `/data.json` itself; accept either the root or a full `/data.json` URL.
- **Portal directory** — path to the target PortalJS portal (default: current directory). If
  none exists, tell the user to run `/portaljs-new-portal` first.
- **Project slug** — the Arc deploy slug for the R2 push (same slug `/portaljs-deploy` uses).

Optional flags: `--limit N` (cap datasets, for a trial run), `--only <slug,slug>` (migrate a
subset by Hub slug), `--dry-run` (harvest + plan + print, write nothing), `--namespace-mode
theme|owner` (default `owner` — one namespace per Hub publisher; see `/portaljs-migrate`).

**If the Hub URL is missing, ask for it — never dead-end.** Example:
```
I need an ArcGIS Hub site URL to migrate. Provide the site root, e.g.
  https://hub-lewisville.opendata.arcgis.com
(a Hub Premium custom domain like https://streamwaterdata.co.uk also works.)
```

## Runtime — native shell-out

Same native stack as `/portaljs-add-geo` (GDAL, tippecanoe, duckdb+spatial) plus `jq` for
JSON slicing and `node`/`curl` for the REST paging. No server, no container — the whole
migration runs on the operator's machine, keeping PortalJS's zero-backend bet.

## Steps

### 1. Gather input (interview if thin)

From `$ARGUMENTS` extract `HUB_URL`, `PORTAL_DIR` (default `.`), `PROJECT_SLUG`, and the
optional flags. Normalize `HUB_URL`: strip a trailing `/data.json` and any trailing slash to
get `SITE_ROOT`; `DATA_JSON="$SITE_ROOT/data.json"`. If `HUB_URL` is absent, emit the prompt
above and stop.

### 2. Check native tools (hard gate)

Delegate to `/portaljs-add-geo` §2 — detect `ogr2ogr`, `tippecanoe`, `duckdb` (+ `spatial`),
and additionally `jq`. Any missing → print the per-OS install and stop with
`ERROR: [arcgis-to-portaljs] MISSING_TOOLS <tools>`:
```bash
for t in ogr2ogr tippecanoe duckdb jq node; do
  command -v "$t" >/dev/null 2>&1 || MISSING="$MISSING $t"
done
# macOS:  brew install gdal tippecanoe duckdb jq node
# Debian: sudo apt-get install -y gdal-bin duckdb jq nodejs   # tippecanoe: build from source
duckdb -c "INSTALL spatial; LOAD spatial; SELECT 1;" >/dev/null 2>&1 || MISSING="$MISSING duckdb-spatial"
```

### 3. Validate the portal directory

Confirm `PORTAL_DIR` is a PortalJS portal: `datasets.json` (a JSON array) and the geo
showcase components (`components/MapPreview.tsx`, `components/GeoQuery.tsx`, PR #1647+) exist.
Missing → `ERROR: [arcgis-to-portaljs] NOT_A_PORTAL <dir> — run /portaljs-new-portal first,
then re-run.` Missing geo components → tell the user to update the template (the dual tier
needs them).

### 4. Harvest the Hub inventory (`/data.json` → canonical + classification)

One GET of the DCAT-US feed; datasets live under `dataset[]`. Reuse `/portaljs-migrate`'s
**DCAT-US mapping** verbatim (title/description/keywords/publisher/temporal/spatial map ~1:1)
to build the canonical list. Then **classify** each item by its distributions — this is the
Hub-specific step DCAT alone doesn't give you:

```bash
curl -fsSL "$DATA_JSON" -o /tmp/a2p-datajson.json
jq '.dataset | length' /tmp/a2p-datajson.json   # inventory size
```

Classify each `dataset[]` item:

| Class | Detect on | Migration path |
|-------|-----------|----------------|
| **vector** | a distribution `accessURL` matching `/FeatureServer/\d+$` or `/MapServer/\d+$` (note the **trailing layer index** — service-root URLs with no `/N` are web maps, not data) **and** the title is not a 3D/mesh/tile give-away | REST export (§5) → dual tier (§6) |
| **table** | only tabular distributions (CSV/Excel), no geometry | download → Parquet (§6b) |
| **non-data** | everything else: web maps (a REST distribution at the service root, no `/N`), 3D scenes/meshes/multipatch, `tiles.arcgis.com/.../MapServer` tile services, dashboards, StoryMaps, web apps, imagery, Esri basemaps | **skip** — log to the report as "link-out / out of scope", do not migrate |

> **`/data.json` does not carry an Esri item `type`.** DCAT-US gives you title, description,
> and distributions — *not* the AGOL item type (Web Map / Web Scene / Dashboard …). So classify
> on **distribution shape**, not a `type` field: the presence of a real `…/FeatureServer/<id>`
> (with the numeric layer index) is the signal that data can be exported. A distribution whose
> `accessURL` stops at the service root, or points at `tiles.arcgis.com`, or whose title screams
> 3D/mesh/LiDAR-colored/reprojected, is a viewer or tile cache — skip it. Then **probe each
> vector candidate** (`?f=json` → `geometryType`, `/query?returnCountOnly=true` → count): a real
> feature layer returns a point/line/polygon geometry type and a count; a 3D/multipatch or
> broken service does not. This probe is what separates a genuine vector layer from a
> REST-shaped non-data item. (Lewisville: 44 items → 7 real vector layers, 37 skipped.)

Record per item: the FeatureServer layer URL (strip to `…/FeatureServer/<id>`), geometry
type, `format` list offered, `issued`/`modified` (source dates — see §4b; `modified` also
drives future sync, Phase 3), and publisher (the namespace under `--namespace-mode owner`).
**Note duplicate layers:** a Hub often exposes the same underlying data twice (a hosted *view*
+ its source table — Lewisville has two identical 39-point benchmark items). Migrate each as
its own dataset (faithful to the Hub) but flag the duplication in the report. **Cross-check
completeness:** `/data.json` can omit unshared items — note in the report that the harvest
reflects only what the Hub published.

### 4b. Enrich + sanitize per-item metadata (license, description, dates)

**This is a P0 correctness step, not polish.** The Hub `/data.json` fields, copied verbatim,
produce three demo-blocking errors a city GIS manager spots in the first minute: a fabricated
license, a literal `{{description}}`, and the harvest date shown as the data's last-updated.
Apply `/portaljs-migrate`'s **DCAT-US metadata hygiene** rules (license sentinel, description
sanitizer + fallback chain, source-date preservation) to every migrated item. DCAT-US alone
is missing the short summary and item-level license, so **fetch the AGOL item** to complete
the chain.

Every Hub `dataset[]` item's `identifier` embeds the AGOL item id
(`https://www.arcgis.com/home/item.html?id=<ITEM_ID>&sublayer=<n>`). Extract it and GET the
item — it carries the `snippet` (the real short summary Hub hides from `/data.json`),
`licenseInfo`, and `accessInformation` (attribution):

```bash
ITEM_ID=$(jq -r '.identifier' <<<"$ITEM" | sed -nE 's/.*[?&]id=([0-9a-f]{32}).*/\1/p')
# Prefer the Hub's own portal host; www.arcgis.com works for public AGOL items.
curl -fsSL "https://www.arcgis.com/sharing/rest/content/items/$ITEM_ID?f=json" \
  -o "/tmp/a2p-item-$ITEM_ID.json"   # → .snippet .description .licenseInfo .accessInformation
```

Then build the canonical entry's metadata (reusing `cleanDescription()` from
`/portaljs-migrate`'s hygiene guard):

- **`description`** = first survivor of the chain:
  `cleanDescription(dcat.description)` → `cleanDescription(item.snippet)` →
  `cleanDescription(item.description)` → the layer/dataset `name`. (Lewisville *Trees From
  LiDAR*: DCAT `description` is the literal `"{{description}}"` → rejected → `item.snippet`
  `"Trees Layer extracted from LiDAR 2017"` wins.)
- **`licenses`** = the source license if asserted (DCAT `license`, else `item.licenseInfo`)
  → `[{…}]`; **otherwise the sentinel `{ "name": "notspecified", "title": "No license
  provided" }`**. Never emit CC-BY (or any license) the source didn't state — this is the one
  gap with legal exposure. (Lewisville: DCAT `license` `""` + `licenseInfo` `""` → sentinel.)
- **`sources`** = an attribution entry from `item.accessInformation` when present
  (Lewisville Parcels: `"City of Lewisville"`) — the "whom to ask for permission" hint, not a
  license.
- **`created`** = DCAT `issued`; **`modified`** = DCAT `modified` (the data's dates — preserved,
  never overwritten by the harvest time). Record the harvest time as **`migratedAt`** (§7).

Items with no resolvable item id (rare — a raw service with no AGOL item) fall back to the
DCAT/layer fields through the same sanitizer, with the license sentinel.

### 5. Export each vector layer via the ArcGIS REST query API

For each **vector** item, page the FeatureService `query` endpoint into one GeoJSON file.
`maxRecordCount` is typically 1000–2000; page with `resultOffset`/`resultRecordCount` until a
short page returns. Prefer `f=geojson` (Hub FeatureServers support it); fall back to `f=json`
(Esri JSON) + `ogr2ogr` if geojson is disabled.

```bash
LAYER="…/FeatureServer/0"                       # from step 4
OUT="data/$NS/$SLUG.source.geojson"
# Fetch the layer definition ONCE and reuse it (paging size, count, AND the field
# definitions — name/type/alias — which drive the schema + English headers, §6d):
curl -fsS "$LAYER?f=json" -o "/tmp/a2p-layerdef-$SLUG.json"
MAX=$(jq -r '.maxRecordCount // 1000' "/tmp/a2p-layerdef-$SLUG.json")
TOTAL=$(curl -fsS "$LAYER/query?where=1%3D1&returnCountOnly=true&f=json" | jq -r '.count')
# Page and concatenate features:
node - "$LAYER" "$MAX" "$OUT" <<'NODE'
const [,,layer,maxStr,out] = process.argv
const max = parseInt(maxStr,10) || 1000
// A bare fetch() will hang forever on a slow/stalled FeatureServer page (common on
// dense geometry like contours/parcels). Cap every request and retry — without this the
// whole run wedges on one bad page. This bit is load-bearing, not optional.
async function getJSON(url, tries = 5) {
  let err
  for (let i = 0; i < tries; i++) {
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 45000)
    try {
      const r = await fetch(url, { signal: ac.signal })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return await r.json()
    } catch (e) { err = e; await new Promise(r => setTimeout(r, 1500 * (i + 1))) }
    finally { clearTimeout(t) }
  }
  throw err
}
;(async () => {
  const fs = require('fs')
  const feats = []
  let off = 0
  for (;;) {
    const u = `${layer}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson`
           + `&resultOffset=${off}&resultRecordCount=${max}`
    const j = await getJSON(u)
    const page = j.features || []
    feats.push(...page)
    off += page.length            // advance by what actually returned, not by `max`
    if (page.length < max) break  // short page = last page
    process.stderr.write(`\r${out}: ${feats.length} `)
  }
  fs.writeFileSync(out, JSON.stringify({ type:'FeatureCollection', features: feats }))
  console.error(`\n${out}: ${feats.length} features`)
})()
NODE
```

- **Per-request timeout is mandatory, not a nicety.** ArcGIS FeatureServers routinely stall
  mid-page on dense geometry; a bare `fetch()` with no `AbortController` will hang the entire
  migration on a single layer. The snippet above caps each request at 45 s and retries 5×.
- **Capture the field definitions (name / type / alias) from the layer def** — this is the
  cheapest UX win in the whole migration and costs nothing extra (the `?f=json` you already
  fetched for `MAX` carries `.fields[]`). Each field has a raw DB `name` (`PROP_TYPE`), an Esri
  `type` (`esriFieldTypeString`), and a display `alias` (`"Property Type"`) — the human label
  Hub shows in its table. Persist this list per layer; §6d turns it into a Frictionless
  `schema.fields[]` (`name` + `title`=alias + mapped `type`) so the showcase renders English
  headers instead of raw DB names. Skip the geometry/OID housekeeping fields
  (`esriFieldTypeGeometry`, and `Shape__Area`/`Shape__Length`, which don't survive to GeoJSON):
  ```bash
  jq -c '[.fields[] | select(.name|test("^Shape__";"i")|not)
          | {name, type, alias}]' "/tmp/a2p-layerdef-$SLUG.json" > "/tmp/a2p-fields-$SLUG.json"
  ```
- **Resume, don't restart.** Large layers take minutes to page; write a manifest of completed
  slugs and skip them on re-run so a mid-run failure (or a killed session) doesn't re-page
  everything from zero.
- **`exceededTransferLimit` / server caps:** if a page hits a hard cap regardless of
  `resultRecordCount`, switch to keyset paging: discover the OID field from the layer metadata
  (`?f=json` → `.objectIdField`; **do not assume `OBJECTID`** — hosted views often rename it),
  then page `orderByFields=<oidField>` + `where=<oidField> > <last>`.
- **Page size must scale *down* with geometry weight, not up.** `maxRecordCount` is an upper
  bound, not a target. A 2 000-record page of dense polylines/polygons can be tens of MB and
  time out; the same page count of points is trivial. Tune `resultRecordCount` per layer by
  weight: points → the full `maxRecordCount` (e.g. 2000), dense lines/polygons → **200–500**.
  (Lewisville contours: 8 906 3D polylines total **514 MB** — at 2000/page the fat middle pages
  stalled every retry; at 200/page each page is ~11 MB and the layer completes.) A layer whose
  *total* export would exceed the local RAM/time budget is the "very large" case below.
- **Very large layers** (huge parcels/contours/LiDAR fabrics): even well-sized paging is slow,
  and the resulting GeoJSON can exceed the size escape hatch (§6). Two escapes: (a) **the Hub
  bulk download API** — `…/api/download/v1/items/<id>/geojson?layers=0` 302-redirects to a
  pre-generated file that returns the whole layer in one request (caveat: it comes back in the
  layer's **native CRS with Z coordinates** — e.g. Lewisville contours download as EPSG:3857 +
  Z — so always pipe it through `ogr2ogr -t_srs EPSG:4326 -dim XY`; and it can be enormous, 514 MB
  for contours, so use a long `curl --max-time`); or (b) **ask the customer for a File Geodatabase
  export** — as the data owner they generate one from ArcGIS Pro in seconds, and `ogr2ogr` reads
  the `.gdb` directly, skipping paging entirely. Support an override: `--fgdb <slug>=<path.gdb>`
  to feed a local dump in place of the REST export.
- Failure on one layer → log it to the report and **continue** (don't abort the whole run):
  `ERROR: [arcgis-to-portaljs] EXPORT_FAILED <layer> <status> — skipped, see report.`

### 6. Convert to the serverless tier(s)

**6a. Vector → dual tier.** Run `/portaljs-add-geo` §5–§8 on each `*.source.geojson`
(it is already EPSG:4326 from `outSR=4326`; still pass through `ogr2ogr -t_srs EPSG:4326
-lco RFC7946=YES` to normalize winding/precision). Produces `data/$NS/$SLUG.pmtiles` +
`data/$NS/$SLUG.parquet`; keep the source GeoJSON as the downloadable original. Apply
add-geo's **size escape hatch** unchanged (> 2 GB → GeoParquet-only, documented).

**6b. Table → Parquet.** For tabular items, reuse `scripts/csv-to-parquet.sh` (already in the
repo) or `duckdb -c "COPY (SELECT * FROM read_csv_auto('…')) TO '…parquet' (FORMAT PARQUET)"`.
Keep the original CSV as a download.

**6c. Additional download formats (CSV always; Shapefile + GeoPackage for the GIS crowd).**
Hub offers a whole download menu (CSV / Shapefile / GeoJSON / KML / FileGDB / Excel / GeoPackage);
PortalJS shipped only PMTiles + GeoParquet + the source GeoJSON, which forces every non-web
consumer to take GeoJSON. These are nearly free from the same normalized `*.4326.geojson` via
`ogr2ogr` — emit them as **extra download resources** (they get no showcase preview; they're
download-only artifacts, pushed to R2 alongside the tiers in §7):

```bash
GEO="data/$NS/$SLUG.4326.geojson"     # normalized EPSG:4326 (from §6a)
# CSV — attributes + geometry as WKT (universal; opens in any spreadsheet/DB):
ogr2ogr -f CSV "data/$NS/$SLUG.csv" "$GEO" -lco GEOMETRY=AS_WKT
# GeoPackage — single-file, modern, lossless (keeps long field names + types):
ogr2ogr -f GPKG "data/$NS/$SLUG.gpkg" "$GEO"
# Shapefile — legacy but still demanded; multi-file, so zip the set into one artifact:
mkdir -p "/tmp/a2p-shp-$SLUG" && ogr2ogr -f "ESRI Shapefile" "/tmp/a2p-shp-$SLUG/$SLUG.shp" "$GEO"
( cd "/tmp/a2p-shp-$SLUG" && zip -q "$OLDPWD/data/$NS/$SLUG.shp.zip" ./* )
```

- **CSV is the minimum** and always emitted. Shapefile + GeoPackage matter to GIS users;
  emit them by default and let `--formats csv,gpkg,shp` (default `csv,gpkg,shp`) trim the set.
- **Shapefile is lossy by design — flag it, don't hide it.** The DBF format truncates field
  names to 10 chars (`ABST_SUBD_NUM` → `ABST_SUBD_`, `ABST_SUBD_NAME` → `ABST_SUB_1`) and can't
  hold very long text. `ogr2ogr` prints `Warning 6: Normalized/laundered field name…` per
  collision — this is exactly why the **alias-carrying `schema` (§6d) travels on the GeoParquet
  and CSV**, not the shapefile. Note the truncation in the parity report; don't treat the
  warning as a failure.
- Skip a format cleanly if its `ogr2ogr` invocation fails (log it, continue) — a missing
  convenience export is never a hard stop.

**6d. Build the field schema (aliases → English headers).** Turn the captured field list
(`/tmp/a2p-fields-$SLUG.json`, §5) into a Frictionless `TableSchema`: raw `name`, `title`=alias
(only when the alias differs from the name — the showcase renders `title` as the header and the
raw name as a mono subtitle; an alias equal to the name is just noise, so drop it), and `type`
mapped from the Esri field type. This `schema` is attached to the GeoParquet and CSV resources
in §7 so the showcase's field table reads "Property Type" / "Address Number" instead of
`PROP_TYPE` / `SITUS_NUM`.

| Esri `type` | Frictionless `type` |
|-------------|---------------------|
| `esriFieldTypeString` / `esriFieldTypeGUID` / `esriFieldTypeGlobalID` | `string` |
| `esriFieldTypeOID` / `esriFieldTypeInteger` / `esriFieldTypeSmallInteger` / `esriFieldTypeBigInteger` | `integer` |
| `esriFieldTypeSingle` / `esriFieldTypeDouble` | `number` |
| `esriFieldTypeDate` / `esriFieldTypeDateOnly` / `esriFieldTypeTimestampOffset` | `datetime` (`date` if date-only) |
| anything else (`esriFieldTypeBlob`, `…Raster`, `…Geometry`) | omit the field |

```bash
jq -c '{fields: [ .[]
  | {name,
     title: (if .alias and .alias != .name then .alias else empty end),
     type: ( {"esriFieldTypeString":"string","esriFieldTypeGUID":"string",
              "esriFieldTypeGlobalID":"string","esriFieldTypeOID":"integer",
              "esriFieldTypeInteger":"integer","esriFieldTypeSmallInteger":"integer",
              "esriFieldTypeBigInteger":"integer","esriFieldTypeSingle":"number",
              "esriFieldTypeDouble":"number","esriFieldTypeDate":"datetime",
              "esriFieldTypeDateOnly":"date"}[.type] // "string" ) } ]}' \
  "/tmp/a2p-fields-$SLUG.json" > "/tmp/a2p-schema-$SLUG.json"
```

Optionally stamp the alias map into the GeoParquet's file-level metadata so it travels with the
data (DuckDB `COPY … (FORMAT PARQUET, KV_METADATA {aliases: '<json>'})`); the load-bearing
carrier for the UI, though, is the `schema` on the `datasets.json` entry (§7).

Preserve **both** the native-CRS original (as downloaded) and the normalized derivative, per
the plan (§3 practical notes).

### 7. Publish — bulk Git-LFS → R2 + `datasets.json`

Reuse `/portaljs-migrate` §5 **download mode** mechanics, applied to every derived file
(`.pmtiles`, `.parquet`, the source original, **and the §6c download formats
`.csv`/`.gpkg`/`.shp.zip`**): `git lfs track "data/**"`, one commit, claim the slug +
mint the Arc JWT, `git config lfs.url`, one push (bytes → Giftless/R2, no GitHub remote
required), `git lfs prune`. Then build each absolute R2 URL
(`$R2_PUBLIC_BASE/lfs/datopian/$PROJECT_SLUG/<oid>`, `R2_PUBLIC_BASE` default
`https://data.portaljs.com`).

Append `datasets.json` entries (**upsert** on `(namespace, slug)` so re-runs are idempotent):
- **vector** → the dual-tier entry from `/portaljs-add-geo` §10 (`tiles` pmtiles + `geo`
  geoparquet + `source` original; fill the `query` bbox from the layer extent).
- **table** → a plain resource entry (`format: parquet` + original `csv`), per `/portaljs-add-dataset`.

**Add the §6c download formats as extra `resources[]`** on the vector entry — download-only
artifacts (no showcase preview), each with its R2 URL. So a vector dataset's `resources[]`
becomes: `tiles` (pmtiles) + `geo` (geoparquet) + `source` (original geojson) + `csv` + `gpkg`
+ `shp` (the `.shp.zip`). Give each a plain `{name,title,path,format}`; the showcase renders a
download link for any format it can't preview. Set `format` to `csv`/`gpkg`/`shp` (the latter
two aren't previewable `DataFormat`s — that's fine, they list as downloads).

**Attach the §6d `schema` (aliases) to the queryable resources** — put it on the `geo`
(geoparquet) resource and the `csv` resource so the showcase field table renders English
headers. Read it from `/tmp/a2p-schema-$SLUG.json`. (Don't attach it to `tiles`/`source` —
they aren't the tabular preview.)

**Set `recordCount` on the entry** = `TOTAL` (the source feature count from §5). The showcase
renders it as a "Records" sidebar field. This is the count the parity report already gates on,
so the number shown to the user is provably the migrated row count, not an estimate.

**Merge the §4b metadata onto every entry** — `/portaljs-add-geo` §10's entry omits it:
`description` (sanitized), `licenses` (source license or the "No license provided" sentinel —
never CC-BY), `sources` (attribution from `accessInformation`), `created`/`modified` (source
`issued`/`modified`), and `migratedAt` (the harvest time — an ISO timestamp; the showcase
renders it as a separate "Migrated" field so it never masquerades as the data's last-updated).
Set `migratedAt` once per run from a fixed `date -u +%FT%TZ` captured at the start, so re-runs
are stable.

`--dry-run` stops before any write/push and prints the plan (mirror `/portaljs-migrate` §6).

### 8. Parity report (source vs derived) — the migration promise

Write `PORTAL_DIR/arcgis-parity-report.md`. For each migrated layer compare source (live
FeatureService) against the derived artifact — this is what lets you tell the customer the
migration is faithful:

| Check | Source | Derived | Pass if |
|-------|--------|---------|---------|
| **Record count** | `…/query?where=1=1&returnCountOnly=true` (`TOTAL`, §5) | `duckdb -c "SELECT count(*) FROM read_parquet('…parquet')"` | equal |
| **Extent (bbox)** | layer `?f=json` → `.extent` (reproject to 4326) | `duckdb` min/max of `bbox` struct | within tolerance |
| **Attribute schema** | layer `?f=json` → `.fields[].name` | parquet column names | source fields ⊆ derived |
| **Geometry validity** | — | `duckdb -c "SELECT count(*) FROM … WHERE NOT ST_IsValid(geometry)"` | see below |
| **Metadata** (license / description / dates — §4b) | DCAT + AGOL item | the emitted `datasets.json` entry | license reflects source (or "No license provided", never fabricated); description carries no `{{placeholder}}`/server path; `created`/`modified` are the source dates, `migratedAt` separate |
| **Field aliases** (§6d) | layer `?f=json` → `.fields[].alias` | `schema.fields[].title` on the geoparquet/csv resource | every source alias that differs from its raw name is carried as `title` (so the showcase shows "Property Type", not `PROP_TYPE`) |
| **Record count** displayed (§7) | `TOTAL` (returnCountOnly) | `datasets.json` entry `recordCount` | `recordCount` == source count == derived parquet count (all three equal) |
| **Download formats** (§6c) | Hub download menu | the entry's `resources[]` formats | at least `csv` present; `gpkg`/`shp` present unless trimmed by `--formats` |

For each dataset, print the resolved **license**, **description** (first ~120 chars),
**created / modified / migratedAt**, the **record count**, the **download formats emitted**,
and a **field-alias sample** (2–3 `name → title` pairs, e.g. `PROP_TYPE → Property Type`) —
the before/after that proves no CC-BY was fabricated, no `{{…}}` leaked, the count is shown,
English headers render, and GIS-friendly downloads exist. Note any Shapefile field-name
truncation (§6c) as a WARN, not a FAIL — it's an inherent DBF limit, and the untruncated names
survive on the GeoParquet/CSV.

**Verdict rules — a mismatched count is the only FAIL.** Record count is the hard gate: derived
≠ source ⇒ **FAIL** (paging dropped features). Everything else is a **WARN**, not a failure:
- **Invalid geometry is a WARN, never a FAIL.** Source ArcGIS layers routinely carry a handful
  of self-intersecting / zero-area rings (Lewisville parcels have 4 of 30,694). The migration
  preserved them faithfully — that is correct behavior, not a defect. Report the count; only if
  the customer needs strictly-valid output, offer `ST_MakeValid(geometry)` as an opt-in repair
  (it changes vertices, so never apply it silently).
- **Schema:** source fields ⊆ derived ⇒ PASS. Extra derived columns (`bbox`, `geometry`) are
  expected. A missing source field is a WARN (ArcGIS drops `Shape__Area`/`Shape__Length`-style
  computed fields from `f=geojson` — note them, they are not data loss).

Emit a per-dataset **PASS / WARN / FAIL** table plus the inventory accounting (migrated vs skipped
vs failed, with reasons). Also list every **non-data** item (web maps, 3D, imagery) so the
customer sees exactly what was and wasn't carried over. A parity report is the deliverable
even when a few layers fail — never suppress a mismatch.

### 9. Report success

```
✓ ArcGIS Hub migrated: <SITE_ROOT>
  - Inventory:   <N> items  (<V> vector, <T> table, <X> non-data skipped)
  - Migrated:    <M> datasets → datasets.json  (dual-tier vector + parquet tables)
  - Data:        R2 via Git LFS  (<size> across pmtiles/geoparquet/originals/csv/gpkg/shp)
  - Records:     feature count shown per dataset (e.g. Parcels 30,694; Trees 376,215)
  - Headers:     English field aliases carried (Property Type, Address Number, …)
  - Downloads:   CSV + GeoPackage + Shapefile per vector dataset (beyond PMTiles/GeoParquet/GeoJSON)
  - Parity:      <P> PASS / <W> WARN / <F> failed   → arcgis-parity-report.md
  - Showcase:    /@<namespace>/<slug> — <MapPreview> + <GeoQuery> per vector dataset
Next: review arcgis-parity-report.md, then `npm run dev` to click through the top datasets.
      Deploy with /portaljs-deploy. (Sync + cutover = Phase 3; see the child beads on po-0qe.)
```

## Error handling

```
ERROR: [arcgis-to-portaljs] MISSING_INPUT No Hub URL provided — pass the site root and retry.
ERROR: [arcgis-to-portaljs] MISSING_TOOLS <tools> — install (see step 2) and retry.
ERROR: [arcgis-to-portaljs] NOT_A_PORTAL <dir> — run /portaljs-new-portal first.
ERROR: [arcgis-to-portaljs] HARVEST_FAILED <url> <status> — check the /data.json is reachable.
ERROR: [arcgis-to-portaljs] EXPORT_FAILED <layer> <status> — skipped one layer, see report.
ERROR: [arcgis-to-portaljs] LFS_PUSH_FAILED <stderr> — re-mint the Arc JWT (see /portaljs-deploy).
```
Per-layer export/convert failures are logged and skipped (partial migration + honest report);
only missing input, missing tools, an unreachable feed, a non-portal target, or a failed push
are hard stops.

## Notes

- **Why the whole Hub is tractable:** every interface is documented and stable — DCAT-US
  (`/data.json`), ArcGIS REST (`query` paging), GDAL, tippecanoe, duckdb. The migrator is a
  thin orchestration over battle-tested tools.
- **`/data.json` completeness:** the DCAT feed can lag or omit private/unshared items;
  cross-check against the org's ArcGIS REST search API when the count looks low, and always
  say in the report that the harvest reflects only published items.
- **Licensing hygiene:** strip Esri basemaps/imagery references; migrate only content the
  customer owns (classified `non-data` → skipped, listed in the report).
- **AGOL stays upstream (Phase 3):** the migrator treats ArcGIS Online as an editing source
  of truth and the PortalJS site as a shadow that re-harvests on a schedule — you replace the
  *portal*, not (initially) the GIS editing environment. Sync/cutover is a separate bead.

Done. Next: review `arcgis-parity-report.md`, then `/portaljs-deploy` to publish the shadow
portal. Sync mode and cutover are Phase 3 (child beads under po-0qe).
