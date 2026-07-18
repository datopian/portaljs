# @portaljs/core

Core Portal.JS package containing components, styles, and utils.

## `<MapPreview>` — serverless preview of tiled geo data (PMTiles)

Renders a vector [PMTiles](https://docs.protomaps.com/pmtiles/) archive with
MapLibre GL straight from any static HTTP host (R2, S3, `/public`) via HTTP
range requests — only the tiles in view are fetched, so any-size datasets pan
and zoom with no tile server. Click a feature to inspect its properties.

```tsx
import { MapPreview } from "@portaljs/core";

<MapPreview
  url="https://example.com/data/boundaries.pmtiles" // or a relative path
  // center={[0, 20]} zoom={3}      — omit to auto-fit the tileset bounds
  // bbox={[-11, 35, 32, 61]}       — authoritative data extent (wins over the archive header)
  // basemap={false}                — offline mode; defaults to the keyless Carto Positron style (OpenFreeMap)
  // color="#2f6f4f" height={480}
  attribution="Natural Earth"
/>
```

SSR-safe by construction: `maplibre-gl` and `pmtiles` load via dynamic
`import()` in the browser only, so the component can be rendered by Next.js
pages without a `next/dynamic` wrapper (though wrapping with `{ ssr: false }`
still defers the chunk until a map actually mounts).

Make PMTiles from GeoJSON/Shapefile with
[tippecanoe](https://github.com/felt/tippecanoe):

```bash
tippecanoe -zg --drop-densest-as-needed -o out.pmtiles in.geojson
```

## `<GeoQuery>` — serverless spatial SQL over GeoParquet (DuckDB-Wasm)

The query counterpart to `<MapPreview>`: point DuckDB-Wasm (with the `spatial`
extension) at a remote **GeoParquet** file and run spatial SQL over it entirely
in the browser — no server, no download. The file is read IN PLACE over HTTP
range requests, results are drawn as a live MapLibre overlay, and the same rows
are available as a table and a quick bar chart. Click a feature for a DuckDB
point-in-polygon lookup of its full attributes. Composes with `<MapPreview>` on
the same dataset (PMTiles = render tier, GeoParquet = query tier).

```tsx
import { GeoQuery } from "@portaljs/core";

<GeoQuery
  url="https://example.com/data/countries.parquet" // remote GeoParquet on R2/S3
  geometryColumn="geometry"   // GEOMETRY once `spatial` is loaded (default)
  bboxColumn="bbox"           // GeoParquet 1.1 covering bbox STRUCT (default; "" to disable)
  // query="SELECT name, ST_AsGeoJSON(geometry) AS geojson FROM data WHERE …"
  // color="#2f6f4f" height={480} attribution="Natural Earth"
/>
```

`@duckdb/duckdb-wasm` is an **optional peer dependency** — install it in the app
that uses `<GeoQuery>` (`npm i @duckdb/duckdb-wasm`). Load the component with
`next/dynamic({ ssr: false })`.

### The bbox-first query pattern (why it's cheap)

Structure spatial queries as a **cheap filter first, exact predicate second**:

```sql
SELECT name, ST_AsGeoJSON(geometry) AS geojson
FROM data
WHERE bbox.xmin <= :maxx AND bbox.xmax >= :minx      -- 1. prune row groups (Parquet stats)
  AND bbox.ymin <= :maxy AND bbox.ymax >= :miny
  AND ST_Intersects(geometry, ST_MakeEnvelope(:minx,:miny,:maxx,:maxy))  -- 2. exact
LIMIT 5000
```

The bbox comparison hits the GeoParquet 1.1 **covering** column, whose per-row-group
min/max stats let DuckDB skip row groups that can't match — so a viewport query
fetches only a few MB out of an arbitrarily large file. `ST_Intersects` then runs
the exact (expensive) predicate only on the survivors. Build the file
Hilbert-sorted with a bbox covering column so spatially-near rows share row groups
and pruning is effective:

```sql
-- duckdb: CSV/Shapefile/GeoJSON → GeoParquet with a covering bbox + Hilbert order
LOAD spatial;
COPY (
  SELECT * EXCLUDE (geom),
    {'xmin': ST_XMin(geom), 'ymin': ST_YMin(geom),
     'xmax': ST_XMax(geom), 'ymax': ST_YMax(geom)} AS bbox,
    geom AS geometry
  FROM ST_Read('in.geojson')
  ORDER BY ST_Hilbert(geom, {'min_x':-180,'min_y':-90,'max_x':180,'max_y':90}::BOX_2D)
) TO 'out.parquet' (FORMAT PARQUET, ROW_GROUP_SIZE 25000);
```

### Overlay decode: GeoJSON vs WKB (the slow path)

Geometry decode, not the query, is the bottleneck. `ST_AsGeoJSON` is convenient
and fine for small result sets (keep a `LIMIT` / a WHERE), and `<GeoQuery>` reads
a `geojson` column to build the MapLibre overlay. **Do not `ST_AsGeoJSON` a huge
result set.** For large sets, project the geometry to WKB / GeoArrow and decode it
with a GPU layer (e.g. deck.gl's `GeoJsonLayer` fed from parsed WKB) instead of
serializing megabytes of GeoJSON text — or pre-aggregate / cap the result at
publish time. The range path means weak clients only process the bytes a query
touches, so lean on the bbox pre-filter and a tight `LIMIT`.
