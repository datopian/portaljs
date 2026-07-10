---
description: Migrate a whole ArcGIS Hub site (opendata.arcgis.com or a Hub Premium custom domain) into a PortalJS Arc portal end-to-end. Harvests the Hub /data.json (DCAT-US) inventory, exports every FeatureService layer through the ArcGIS REST query API (resultOffset paging), converts each to the serverless dual tier (PMTiles render + GeoParquet query) with tabular items to Parquet, pushes everything to Cloudflare R2 via Git LFS, appends dual-tier datasets.json entries, and writes a source-vs-derived parity report. The reusable arcgis-to-portaljs migrator.
allowed-tools: Read, Write, Edit, Bash(ogr2ogr:*), Bash(ogrinfo:*), Bash(tippecanoe:*), Bash(duckdb:*), Bash(git:*), Bash(curl:*), Bash(jq:*), Bash(npx:*), Bash(node:*), Bash(mkdir:*), Bash(cp:*), Bash(wc:*), Bash(command:*), WebFetch
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
| **vector** | a distribution `accessURL`/`downloadURL` matching `/FeatureServer/\d+` or `/MapServer/\d+`, or `format` in {GeoService, GeoJSON, Shapefile, File Geodatabase, GeoPackage} | REST export (§5) → dual tier (§6) |
| **table** | only tabular distributions (CSV/Excel), no geometry | download → Parquet (§6b) |
| **non-data** | web map, 3D scene, dashboard, StoryMap, imagery, or an Esri basemap reference (`type` ∈ {Web Map, Web Scene, Dashboard, StoryMap, Image Service} or publisher = Esri) | **skip** — log to the report as "link-out / out of scope", do not migrate |

Record per item: the FeatureServer layer URL (strip to `…/FeatureServer/<id>`), geometry
type, `format` list offered, `modified` (drives future sync — Phase 3), and publisher (the
namespace under `--namespace-mode owner`). **Cross-check completeness:** `/data.json` can omit
unshared items — note in the report that the harvest reflects only what the Hub published.

### 5. Export each vector layer via the ArcGIS REST query API

For each **vector** item, page the FeatureService `query` endpoint into one GeoJSON file.
`maxRecordCount` is typically 1000–2000; page with `resultOffset`/`resultRecordCount` until a
short page returns. Prefer `f=geojson` (Hub FeatureServers support it); fall back to `f=json`
(Esri JSON) + `ogr2ogr` if geojson is disabled.

```bash
LAYER="…/FeatureServer/0"                       # from step 4
OUT="data/$NS/$SLUG.source.geojson"
# Discover paging + expected count up front (used by the parity report, §8):
MAX=$(curl -fsS "$LAYER?f=json" | jq -r '.maxRecordCount // 1000')
TOTAL=$(curl -fsS "$LAYER/query?where=1%3D1&returnCountOnly=true&f=json" | jq -r '.count')
# Page and concatenate features:
node - "$LAYER" "$MAX" "$OUT" <<'NODE'
const [,,layer,maxStr,out] = process.argv
const max = parseInt(maxStr,10) || 1000
;(async () => {
  const feats = []
  for (let off = 0; ; off += max) {
    const u = `${layer}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson`
           + `&resultOffset=${off}&resultRecordCount=${max}`
    const r = await fetch(u); const j = await r.json()
    const page = j.features || []
    feats.push(...page)
    if (page.length < max) break
  }
  require('fs').writeFileSync(out, JSON.stringify(
    { type:'FeatureCollection', features: feats }))
  console.error(`${out}: ${feats.length} features`)
})()
NODE
```

- **`exceededTransferLimit` / server caps:** if a page hits a hard cap regardless of
  `resultRecordCount`, switch to `orderByFields=<oid>` + `where=<oid> > <last>` keyset paging.
- **Very large layers** (parcels, contours, LiDAR): paging is slow. **Ask the customer for a
  File Geodatabase export** — as the data owner they generate one from ArcGIS Pro in seconds,
  and `ogr2ogr` reads the `.gdb` directly, skipping paging entirely. Support an override:
  `--fgdb <slug>=<path.gdb>` to feed a local dump in place of the REST export.
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

Preserve **both** the native-CRS original (as downloaded) and the normalized derivative, per
the plan (§3 practical notes).

### 7. Publish — bulk Git-LFS → R2 + `datasets.json`

Reuse `/portaljs-migrate` §5 **download mode** mechanics, applied to every derived file
(`.pmtiles`, `.parquet`, originals): `git lfs track "data/**"`, one commit, claim the slug +
mint the Arc JWT, `git config lfs.url`, one push (bytes → Giftless/R2, no GitHub remote
required), `git lfs prune`. Then build each absolute R2 URL
(`$R2_PUBLIC_BASE/lfs/datopian/$PROJECT_SLUG/<oid>`, `R2_PUBLIC_BASE` default
`https://data.portaljs.com`).

Append `datasets.json` entries (**upsert** on `(namespace, slug)` so re-runs are idempotent):
- **vector** → the dual-tier entry from `/portaljs-add-geo` §10 (`tiles` pmtiles + `geo`
  geoparquet + `source` original; fill the `query` bbox from the layer extent).
- **table** → a plain resource entry (`format: parquet` + original `csv`), per `/portaljs-add-dataset`.

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
| **Geometry validity** | — | `duckdb -c "SELECT count(*) FROM … WHERE NOT ST_IsValid(geometry)"` | 0 invalid |

Emit a per-dataset **PASS / WARN** table plus the inventory accounting (migrated vs skipped
vs failed, with reasons). Also list every **non-data** item (web maps, 3D, imagery) so the
customer sees exactly what was and wasn't carried over. A parity report is the deliverable
even when a few layers fail — never suppress a mismatch.

### 9. Report success

```
✓ ArcGIS Hub migrated: <SITE_ROOT>
  - Inventory:   <N> items  (<V> vector, <T> table, <X> non-data skipped)
  - Migrated:    <M> datasets → datasets.json  (dual-tier vector + parquet tables)
  - Data:        R2 via Git LFS  (<size> across pmtiles/geoparquet/originals)
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
