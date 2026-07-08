---
description: Auto-ingest a geospatial file (GeoJSON, Shapefile, GeoPackage, KML/KMZ, FlatGeobuf, CSV-with-geometry) into a PortalJS portal — on your own machine, no server. Normalizes CRS to EPSG:4326, derives a PMTiles render tier + a GeoParquet query tier, pushes all three to R2 via Git LFS, and emits one dual-tier datasets.json entry the showcase renders with <MapPreview> + <GeoQuery>.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /portaljs-add-geo

Turn one geospatial upload into a **dual-tier** PortalJS dataset entirely on the user's
machine — **no server-side container compute**, keeping the zero-backend bet end-to-end.
From a single source file this produces two derivatives plus the preserved original:

- **PMTiles** — the **render tier**. A single vector-tile archive `<MapPreview>` renders
  with MapLibre GL over HTTP range requests: any dataset size pans/zooms with no tile server.
- **GeoParquet** — the **query tier**. A GeoParquet 1.1 file (covering `bbox` column,
  Hilbert-sorted) `<GeoQuery>` runs spatial SQL over in place via DuckDB-Wasm.
- **Original** — the untouched upload in its native CRS, kept downloadable as the source
  artifact.

All three land on Cloudflare R2 (via Git LFS → Giftless), and the skill appends **one**
`datasets.json` entry whose `resources[]` are exactly the shape the showcase auto-renders
(PR #1647 / the `@reference/world-boundaries` demo): a `pmtiles` resource → `<MapPreview>`,
a `geoparquet` resource → `<GeoQuery>`, and the original as a download. No page edits — the
dynamic showcase route `pages/[owner]/[slug].tsx` renders each resource by its `format`.

This automates the manual `tippecanoe` / `duckdb` recipes documented in the template README
(the interim ingest path). Use it whenever the source is a **vector geo format**; for plain
tabular data use `/portaljs-add-dataset`, and for a Leaflet view over small GeoJSON use
`/portaljs-add-map`.

## Runtime — native shell-out, detect-or-instruct

This runs **native CLIs on the user's machine** (locked direction, 2026-07-08 — overrides
po-6sr §7's server-compute sketch). No container, no cloud job. tippecanoe has no mature
WASM build, so the PMTiles tier fundamentally needs the native binary; skills already shell
out to git-lfs and npm, so native geo deps fit the model. Three tools:

| Tool | Role | Why this tool |
|------|------|---------------|
| **GDAL** (`ogr2ogr`, `ogrinfo`) | Read **every** vector input; reproject → EPSG:4326; emit the normalized GeoJSON intermediate | Widest driver set (SHP, GPKG, KML/KMZ, FGB, CSV-geom) |
| **tippecanoe** | normalized GeoJSON → PMTiles (render tier) | The de-facto tiler; no WASM equivalent |
| **duckdb** (+ `spatial`) | normalized GeoJSON → GeoParquet 1.1 with covering `bbox` + Hilbert sort (query tier) | The **proven** writer — PR #1647 verified `<GeoQuery>` against duckdb output; ogr2ogr's Parquet driver won't cleanly emit the covering-bbox column + Hilbert ordering the bbox-first query needs to prune |

## Required input — ask, don't error

- **Source** — a local geo file path or a public URL. Supported: `.geojson`/`.json`
  (GeoJSON), `.zip` (zipped Shapefile), `.gpkg`, `.kml`/`.kmz`, `.fgb`, `.csv` with a
  geometry/lat-lon column. Raster (`.tif`/`.tiff`) is **out of scope** (COG is a later phase).
- **Portal directory** — path to the portal project (defaults to current directory).
- **Namespace** — the dataset's namespace value (subject for `'theme'` portals, publisher
  for `'owner'` portals).

**If the source is missing, ask for it — never dead-end.** The user can say "use defaults".

## Steps

### 1. Gather input from `$ARGUMENTS` (interview if thin)

Extract:
- `SOURCE` — geo file path or URL
- `PORTAL_DIR` — portal directory (default: `.`)
- `DATASET_NAME` — human name (default: derived from filename)
- `DATASET_SLUG` — URL slug (default: lowercase hyphenated filename without extension)
- `DESCRIPTION` — optional one-line description
- `NAMESPACE` — namespace value (default: read the first existing entry's `namespace`
  from `datasets.json`, else `reference`)

If `SOURCE` is missing, ask (one focused prompt) and wait:
```
To add a geospatial dataset I need:
1. Source: a local geo file path or public URL (required) —
   GeoJSON, zipped Shapefile (.zip), GeoPackage (.gpkg), KML/KMZ, FlatGeobuf (.fgb),
   or a CSV with a geometry/lat-lon column.
2. Portal directory (Enter for current directory)
3. Dataset name (Enter to use the filename)
4. Namespace value — the group this dataset belongs to
   (subject if the portal is "theme" mode, publisher if "owner" mode; Enter to reuse the catalog's existing namespace)
```

Read `NAMESPACE_TYPE` from `PORTAL_DIR/lib/datasets.ts` so you can phrase the namespace
question correctly ("subject" vs "publisher").

### 2. Check the native tools (detect-or-instruct — hard gate)

Do this **before touching data**. Missing tools stop the run with a one-line install — never
silently skip a tier.

```bash
MISSING=""
for t in ogr2ogr tippecanoe duckdb; do
  command -v "$t" >/dev/null 2>&1 || MISSING="$MISSING $t"
done
```

If `MISSING` is non-empty, print the install for the user's OS and STOP:

```
ERROR: [add-geo] MISSING_TOOLS Missing:<MISSING>. Install then re-run:
  macOS:         brew install gdal tippecanoe duckdb
  Debian/Ubuntu: sudo apt-get install -y gdal-bin duckdb    # tippecanoe: apt where available,
                 else build from source — https://github.com/felt/tippecanoe
  Windows:       not supported natively — use WSL (Ubuntu) and follow the Debian steps.
```

Detect Windows-native (`$OSTYPE` = `msys`/`win32`, or `uname` shows MINGW/MSYS) and print the
WSL note prominently — this is a documented first-cut limitation, not a bug.

Verify the duckdb `spatial` extension can load (it auto-installs on first use, needs network
once): `duckdb -c "INSTALL spatial; LOAD spatial; SELECT 1;"` — if this fails, report it as
`MISSING_TOOLS` (duckdb spatial) with the same stop behavior.

### 3. Validate the portal directory

Confirm `PORTAL_DIR/datasets.json`, `PORTAL_DIR/package.json`, and
`PORTAL_DIR/pages/[owner]/[slug].tsx` exist. If `datasets.json` is missing, tell the user
this isn't the `portaljs-catalog` template (it may be an older single-page template) and ask
how to proceed rather than failing silently.

Confirm the template renders the geo tiers: `components/MapPreview.tsx` and
`components/GeoQuery.tsx` should exist (they shipped in PR #1647). If they don't, the portal
predates the dual-tier showcase — tell the user to update the template first.

### 4. Fetch (if URL) and detect the input format

**If SOURCE is a URL:** download it to a temp path (geo derivatives are computed locally, so
unlike `/portaljs-add-dataset` there is no passthrough option here):
```bash
curl -fL "$SOURCE" -o "/tmp/$DATASET_SLUG.$EXT"
```
If the fetch fails, report the HTTP status and ask the user to confirm the URL is public.

**If SOURCE is a local path:** check it exists; if not, report and ask for a correct path.

**Detect the format** from extension + content:

| Input | Detect on | ogr2ogr source spec |
|-------|-----------|---------------------|
| GeoJSON | `.geojson`, or `.json` whose parsed `type` is `FeatureCollection`/`Feature`/a geometry | the file path |
| Zipped Shapefile | `.zip` containing `.shp` + `.dbf` + `.shx` (+ `.prj` for CRS) | `/vsizip/<abs-path>.zip` |
| GeoPackage | `.gpkg` | the file path (multi-layer → Step 5a) |
| KML / KMZ | `.kml`, `.kmz` | the file path (GDAL LIBKML driver reads KMZ directly) |
| FlatGeobuf | `.fgb` | the file path |
| CSV + geometry | `.csv` with a WKT geometry column **or** lat/lon columns | see Step 5 CSV note |
| Raster | `.tif`, `.tiff` | **UNSUPPORTED** — stop (see below) |

Guards:
- **Raster** → `ERROR: [add-geo] UNSUPPORTED_FORMAT Raster .tif/.tiff (COG tier) is out of scope. Use /portaljs-add-dataset for tabular data, or wait for the COG phase.`
- **Bare `.shp`** (not zipped) → `ERROR: [add-geo] SHAPEFILE_NOT_ZIPPED A shapefile is multi-file (.shp/.dbf/.shx/.prj). Zip the whole set and pass the .zip.`
- **Plain CSV with no geometry** → suggest `/portaljs-add-dataset` (tabular path).

### 5. Preserve the original + normalize CRS → EPSG:4326

Work in a scratch dir; keep the original untouched as artifact #1.

```bash
cd PORTAL_DIR && mkdir -p data
SRC="<the source spec from Step 4>"          # file path, /vsizip/..., etc.
# Report the source CRS (for the record; also catches missing .prj early):
ogrinfo -so -al "$SRC" | grep -iE "EPSG|GEOGCS|PROJCS" | head -3

# Normalize to EPSG:4326 RFC7946 GeoJSON (the intermediate both tools ingest):
ogr2ogr -f GeoJSON -t_srs EPSG:4326 -lco RFC7946=YES \
  "data/$DATASET_SLUG.4326.geojson" "$SRC"
```

**5a. Multi-layer sources (GPKG/KML).** If `ogrinfo` lists more than one layer, list them and
ask which to ingest (or accept a layer name), then add it as the last `ogr2ogr` arg:
`ogr2ogr ... "data/$DATASET_SLUG.4326.geojson" "$SRC" "<layer-name>"`.
`ERROR: [add-geo] MULTI_LAYER` if you must stop for the choice.

**5b. CSV with geometry.** Point ogr2ogr at the geometry columns via open options:
```bash
# WKT geometry column named e.g. "geom":
ogr2ogr -f GeoJSON -t_srs EPSG:4326 -oo GEOM_POSSIBLE_NAMES=geom -oo KEEP_GEOM_COLUMNS=NO \
  "data/$DATASET_SLUG.4326.geojson" "$SRC"
# or lat/lon columns:
ogr2ogr -f GeoJSON -t_srs EPSG:4326 -oo X_POSSIBLE_NAMES=lon,lng,longitude \
  -oo Y_POSSIBLE_NAMES=lat,latitude -oo KEEP_GEOM_COLUMNS=NO \
  "data/$DATASET_SLUG.4326.geojson" "$SRC"
```

Guards:
- ogr2ogr non-zero → `ERROR: [add-geo] REPROJECTION_FAILED <stderr>. If the source CRS is
  unknown (missing .prj), re-run adding -s_srs EPSG:<code>.`
- Zero features in the output (`ogrinfo -so` feature count is 0) →
  `ERROR: [add-geo] EMPTY_OUTPUT Normalized GeoJSON has no features — check the geometry
  column / CRS.`

Then also copy the **original** into the repo under its native extension for the download
resource: `cp "<original source file>" "data/$DATASET_SLUG.<origext>"` (for a URL source, the
`/tmp` download; for a zipped shapefile, keep the `.zip`).

### 6. Size escape hatch (measure the normalized GeoJSON — what both tools ingest)

Threshold on the **normalized GeoJSON bytes** (format-independent; it's exactly what
tippecanoe and duckdb read) with feature count as a secondary signal. These are heuristics
for an ~8–16 GB laptop — document them as tunable, not hard limits.

```bash
BYTES=$(wc -c < "data/$DATASET_SLUG.4326.geojson")
```

- **< 500 MB** → proceed normally (both tiers).
- **500 MB – 2 GB** (or ≥ ~5M features) → **soft warn**: "This is large; local tiling +
  Parquet may take several minutes and multiple GB of RAM." Proceed.
- **> 2 GB** → **skip PMTiles**, emit **GeoParquet-only** (duckdb streams row groups and
  stays practical where tippecanoe's memory/time do not). Print exactly what was skipped and
  the two ways to still get a render tier — **no silent truncation**:
  ```
  ⚠ PMTiles skipped: normalized GeoJSON is <BYTES> (> 2 GB). The query tier (GeoParquet)
    is included. To add the render tier later, either:
      (a) keep it query-only (GeoQuery works without PMTiles), or
      (b) run `tippecanoe -zg --drop-densest-as-needed -o out.pmtiles in.geojson` on a
          bigger machine, then attach it with /portaljs-add-resource (format: pmtiles).
  ```

This documented degradation is the ONE place the original "needs big compute" concern lives
— as a warning + manual fallback, never a container dependency.

### 7. Derive the PMTiles render tier (unless skipped in Step 6)

```bash
tippecanoe -zg --drop-densest-as-needed --extend-zooms-if-still-dropping --force \
  -o "data/$DATASET_SLUG.pmtiles" "data/$DATASET_SLUG.4326.geojson"
```
- `-zg` auto-picks max zoom from feature density; `--drop-densest-as-needed` keeps tiles
  under the size limit for dense data; attributes are preserved by default (click-to-inspect).
- Small reference layers (e.g. country boundaries) can instead cap zoom: `-z5`. Prefer the
  `-zg` default unless the user asks.
- tippecanoe non-zero → `ERROR: [add-geo] TILING_FAILED <stderr>`.

### 8. Derive the GeoParquet query tier (duckdb — covering bbox + Hilbert)

The generalized form of the README recipe. `ST_Read` yields a geometry column named `geom`;
we write a GeoParquet 1.1 covering `bbox` STRUCT and Hilbert-sort rows so row-group bbox
stats prune well for the bbox-first query.

```bash
duckdb -c "LOAD spatial;
  COPY (
    SELECT * EXCLUDE (geom),
      {'xmin': ST_XMin(geom), 'ymin': ST_YMin(geom),
       'xmax': ST_XMax(geom), 'ymax': ST_YMax(geom)} AS bbox,
      geom AS geometry
    FROM ST_Read('data/$DATASET_SLUG.4326.geojson')
    ORDER BY ST_Hilbert(geom, {'min_x':-180,'min_y':-90,'max_x':180,'max_y':90}::BOX_2D)
  ) TO 'data/$DATASET_SLUG.parquet' (FORMAT PARQUET, ROW_GROUP_SIZE 25000);"
```

Verify DuckDB can range-read it (this is the exact access `<GeoQuery>` uses):
```bash
duckdb -c "LOAD spatial; SELECT count(*) FROM read_parquet('data/$DATASET_SLUG.parquet');"
```
- duckdb non-zero → `ERROR: [add-geo] GEOPARQUET_FAILED <stderr>`.

Capture the data's overall extent for the default query (Step 10):
```bash
duckdb -c "LOAD spatial; SELECT min(bbox.xmin), min(bbox.ymin), max(bbox.xmax), max(bbox.ymax)
  FROM read_parquet('data/$DATASET_SLUG.parquet');"   # → XMIN YMIN XMAX YMAX
```

### 9. Push original + GeoParquet + PMTiles to R2 via Git LFS

Identical mechanics to `/portaljs-add-dataset` §4c, applied to **all three files**. The
committed pointers are tiny; the bytes stream to Cloudflare R2 through Giftless, and the
browser fetches them directly from `data.portaljs.com`.

```bash
cd PORTAL_DIR
FILES="data/$DATASET_SLUG.pmtiles data/$DATASET_SLUG.parquet data/$DATASET_SLUG.<origext>"
# (drop the .pmtiles from FILES if Step 6 skipped it)

# Install LFS filters for THIS repo (idempotent; brew install git-lfs does NOT auto-run this,
# and without it `git add` commits raw bytes instead of a ~134 B pointer):
git config --get filter.lfs.clean >/dev/null 2>&1 || git lfs install --local

for f in $FILES; do git lfs track "$f"; done
git add .gitattributes $FILES
git commit -m "data: add $DATASET_SLUG geo tiers (pmtiles+geoparquet+original) via LFS"
```

**Authenticate git-lfs (mint an Arc JWT — the issuer holds the signer, no key on your
machine).** Reuse the same Arc token `/portaljs-deploy` resolves (`PORTALJS_TOKEN`, else
`~/.portaljs/credentials`); if you have neither, run `/portaljs-deploy`'s sign-in once. Use
the `_jwt` HTTP Basic piggyback — do **not** set a broad `http.extraHeader` (git-lfs would
replay it onto the presigned R2 PUT → `400`).

```bash
API="${PORTALJS_ARC_API:-https://api.arc.portaljs.com}"
ARC_TOKEN="${PORTALJS_TOKEN:-$(node -e "try{process.stdout.write(JSON.parse(require('fs').readFileSync(process.env.HOME+'/.portaljs/credentials','utf8')).token||'')}catch{}")}"
# Claim the slug (idempotent; minting never creates a slug). 403 = slug owned by another account.
curl -fsS -X POST "$API/v1/repos/<project-slug>/claim" -H "Authorization: Bearer $ARC_TOKEN" >/dev/null
LFS_URL=$(curl -fsS -X POST "$API/v1/repos/<project-slug>/lfs-token?actions=read,write,verify" \
  -H "Authorization: Bearer $ARC_TOKEN" \
  | node -e "process.stdin.on('data',d=>process.stdout.write(JSON.parse(d).lfs_url))")
git config lfs.url "$LFS_URL"     # local only — carries the token, never committed
```

> **OSS self-host fallback.** No Arc account? Sign locally with the issuer's private key:
> `TOKEN=$(python3 ../../giftless/mint-token.py --org datopian --repo <project-slug> --ttl 3600 --algorithm RS256 --key-file ../../giftless/jwt_private_key)`
> then `git config lfs.url "https://_jwt:$TOKEN@lfs.portaljs.com/datopian/<project-slug>"`.

**Push the bytes (no GitHub remote required), then reclaim disk:**
```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if git remote get-url --push origin >/dev/null 2>&1; then
  git push -u origin "$BRANCH"     # carries commits + pointers to GitHub AND streams bytes to R2
else
  git remote add r2-lfs . 2>/dev/null || true   # local-only scaffold (the default)
  git -c lfs.locksverify=false lfs push r2-lfs "$BRANCH"   # bytes → Giftless/R2 via lfs.url
fi
git lfs prune
```
- Any LFS failure → `ERROR: [add-geo] LFS_PUSH_FAILED <stderr>` with the auth remediation
  from `/portaljs-add-dataset` §4c.

**Build the absolute R2 URL for each artifact** (`R2_PUBLIC_BASE` defaults to
`https://data.portaljs.com`; object key = `lfs/datopian/<project-slug>/<oid>`):
```bash
for f in $FILES; do
  OID=$(git cat-file -p ":$f" | sed -n 's/^oid sha256://p')
  echo "$f -> $R2_PUBLIC_BASE/lfs/datopian/<project-slug>/$OID"
done
```
Record `PMTILES_URL`, `GEOPARQUET_URL`, `ORIGINAL_URL`.

### 10. Emit the dual-tier `datasets.json` entry

Append **one** entry (keep all existing ones). This is the exact shape the showcase
auto-renders — `pmtiles` → `<MapPreview>`, `geoparquet` → `<GeoQuery>`, the original → a
download. Fill the `geoparquet` resource's `query` with a bbox-first query over the data's
own extent (from Step 8), so `<GeoQuery>` opens on a meaningful result:

```json
{
  "slug": "DATASET_SLUG",
  "namespace": "NAMESPACE",
  "name": "DATASET_NAME",
  "description": "DESCRIPTION",
  "resources": [
    {
      "name": "tiles",
      "title": "DATASET_NAME (PMTiles — render tier)",
      "description": "Vector tiles rendered by MapLibre GL over HTTP range requests; only the tiles in view are fetched, so any dataset size pans and zooms with no tile server.",
      "path": "PMTILES_URL",
      "format": "pmtiles"
    },
    {
      "name": "geo",
      "title": "DATASET_NAME (GeoParquet — query tier)",
      "description": "GeoParquet 1.1 (Hilbert-sorted, covering bbox column) queried in place with DuckDB-Wasm + spatial. Pan the map and \"Query viewport\" to fetch only the features in view; click a feature for its full attributes.",
      "path": "GEOPARQUET_URL",
      "format": "geoparquet",
      "query": "-- bbox-first: the covering bbox prunes Parquet row groups (cheap),\n-- then ST_Intersects refines to the exact predicate (only on survivors).\nSELECT * EXCLUDE (geometry, bbox), ST_AsGeoJSON(geometry) AS geojson\nFROM data\nWHERE bbox.xmin <= XMAX AND bbox.xmax >= XMIN\n  AND bbox.ymin <= YMAX AND bbox.ymax >= YMIN\n  AND ST_Intersects(geometry, ST_MakeEnvelope(XMIN, YMIN, XMAX, YMAX))"
    },
    {
      "name": "source",
      "title": "Original upload (ORIGFORMAT)",
      "description": "The original file as uploaded, in its native CRS. Preserved as the source artifact.",
      "path": "ORIGINAL_URL",
      "format": "ORIGFORMAT"
    }
  ],
  "keywords": ["geospatial", "pmtiles", "geoparquet", "duckdb"]
}
```

- Substitute `XMIN/YMIN/XMAX/YMAX` (Step 8) into both the `query` WHERE and `ST_MakeEnvelope`.
- If Step 6 skipped PMTiles, omit the `tiles` resource entirely.
- `ORIGFORMAT` is one of `geojson`/`json` etc.; if the original extension isn't a known
  `DataFormat` (e.g. `.zip`, `.gpkg`, `.kml`), omit the `source` resource's preview
  expectation — the showcase shows a download link for any non-previewable format.
- `(namespace, slug)` must be **unique** across the manifest — if it clashes, ask for a
  different slug or namespace.

`getStaticPaths` in `pages/[owner]/[slug].tsx` picks up the new pair at build time. **Do not
edit any page** — the showcase renders each resource by `format`.

### 11. Verify

Type-check only (never `next build` against a live dev server — it corrupts `.next/`):
```bash
cd PORTAL_DIR
npx tsc --noEmit > /tmp/portaljs-add-geo-verify.log 2>&1 || tail -20 /tmp/portaljs-add-geo-verify.log
```
Confirm the R2 URLs serve range reads (the access both viewers use):
```bash
curl -sI -H "Range: bytes=0-0" "$GEOPARQUET_URL" | head -1   # expect: HTTP/… 206
```
If either check fails, print the output and fix it (commonly malformed `datasets.json` or an
LFS push that didn't land) before reporting success.

### 12. Report success

```
✓ Geospatial dataset added: DATASET_NAME
  - Source:     <original format> (CRS <detected>) → normalized to EPSG:4326
  - Render tier: PMTiles  → data/DATASET_SLUG.pmtiles  (R2)  [or: skipped — see size note]
  - Query tier:  GeoParquet → data/DATASET_SLUG.parquet (R2, Hilbert + covering bbox)
  - Original:    data/DATASET_SLUG.<origext> (R2, downloadable)
  - Manifest:    datasets.json (one dual-tier entry appended)
  - Showcase:    /@NAMESPACE/DATASET_SLUG — <MapPreview> (render) + <GeoQuery> (query) compose
  - Catalog:     appears in /search automatically
```
Remind the user the bytes are on R2 and `git lfs prune` reclaimed local disk. Then:
```
Next: run `npm run dev` and open http://localhost:3000/@NAMESPACE/DATASET_SLUG — the map
renders the PMTiles, and the query panel runs spatial SQL over the GeoParquet in place.
```

## Notes

- **Zero backend, end-to-end.** Every step runs on the user's machine; the browser then
  fetches the derivatives straight from R2. No server compute is introduced.
- **Two derivatives, not three.** PMTiles (render) + GeoParquet (query) are the two canonical
  artifacts; the original is preserved for download. FlatGeobuf is intentionally **not**
  emitted — it adds a format without adding a showcase view.
- **duckdb, not ogr2ogr, writes the GeoParquet.** ogr2ogr can emit Parquet, but the covering
  `bbox` STRUCT + Hilbert ordering the bbox-first query relies on to prune row groups are
  clean in duckdb and match what `<GeoQuery>` was verified against (PR #1647).
- **CRS is normalized to EPSG:4326** for the derivatives; the original keeps its native CRS.
  `<MapPreview>`/`<GeoQuery>` assume 4326.
- **The showcase needs no edits.** Unlike `/portaljs-add-map` (which wires a component into
  the Views section), the dual-tier resources render purely from their `format` — this skill
  only writes data + one manifest entry.
- **Windows** is unsupported first-cut; use WSL. **Raster** (`.tif`) → COG is a later phase.
