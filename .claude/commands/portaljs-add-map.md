---
description: Render a GeoJSON dataset on an interactive Leaflet map in the Views section of a dataset's showcase. Installs react-leaflet and a Map component, then renders the map for the chosen dataset.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /portaljs-add-map

Add an interactive Leaflet map as a **view on a dataset's showcase** in a
`portaljs-catalog` portal. Installs `react-leaflet`/`leaflet` (once), generates a reusable
`Map` component, and renders the map into the **Views** section of the showcase route
`pages/[owner]/[slug].tsx` for the chosen GeoJSON dataset.

Use this when a dataset's data is geographic (points, lines, polygons) and you want a map
view in addition to the showcase's default metadata + download. The dataset should already
be registered in `datasets.json` (e.g. via `/portaljs-add-dataset`) with `format: "geojson"`; if
it isn't yet, this skill can copy the file and add the entry first.

## Required input — ask, don't error

- **Dataset** — which dataset to map, by **slug**. It should be a `geojson` entry in
  `datasets.json`. If a source file/URL is given for a not-yet-registered dataset, the
  skill copies it into `/public/data/` and appends a manifest entry.
- **Portal directory** — path to the portal project (defaults to current directory).
- **Source** (only if the dataset isn't registered yet) — a local file path
  (`./data/file.geojson`) or public URL. Must be **GeoJSON** (a `Feature`,
  `FeatureCollection`, or geometry object).

**If the target dataset isn't specified, ask which one (by name/slug) — never dead-end
with a missing-input error.**

## Steps

### 1. Gather input from `$ARGUMENTS` (interview if thin)

Extract:
- `DATASET` — dataset slug (the map target)
- `SOURCE` — file path or URL (only needed if the dataset isn't already in the manifest)
- `PORTAL_DIR` — portal directory (default: `.`)
- `MAP_SLUG` — slug for a new dataset (default: lowercase hyphenated filename)
- `MAP_NAME` — human-readable name (default: derived from filename)
- `NAMESPACE` — namespace for a new dataset (default: the catalog's existing namespace)
- `DESCRIPTION` — optional one-line description

If neither a dataset nor a source is given, **ask** and wait. When the user doesn't know
the slug, read `PORTAL_DIR/datasets.json` and list the GeoJSON datasets so they can pick:
```
To add a map I need either:
1. Which existing dataset to map? (slug — GeoJSON datasets in your catalog: <name (slug)>, …)
   …or a GeoJSON source to add and map:
2. Source: local file path or public URL to a GeoJSON file
3. Portal directory (Enter for current directory)
```

### 2. Validate the portal directory

The target must be a `portaljs-catalog` portal. Confirm `PORTAL_DIR/datasets.json`,
`PORTAL_DIR/package.json`, and `PORTAL_DIR/pages/[owner]/[slug].tsx` exist. If they don't,
tell the user this isn't the catalog template and ask how to proceed rather than failing
silently.

### 3. Resolve (or register) the GeoJSON dataset

**If `DATASET` is already in `datasets.json`:** read its entry and capture `namespace`,
`slug`, and `file` (must be served from `/public/data/<file>`). Confirm `format` is
`geojson`; if it's tabular, tell the user `/portaljs-add-map` only renders GeoJSON and ask whether
they meant a different dataset (or `/portaljs-add-chart`).

**If a `SOURCE` was given for a not-yet-registered dataset:** fetch/copy and validate it,
then append a manifest entry so the showcase exists:

- URL: fetch it; if the status isn't 200, tell the user (with the HTTP status) and ask
  them to confirm the URL is publicly accessible / supports CORS.
- Local path: if the file doesn't exist, tell the user and ask for a correct path.
- **Validate it is GeoJSON:** parse as JSON and confirm `type` is one of
  `FeatureCollection`, `Feature`, `GeometryCollection`, `Point`, `MultiPoint`,
  `LineString`, `MultiLineString`, `Polygon`, or `MultiPolygon`. If not, tell the user it
  isn't valid GeoJSON (for tabular data use `/portaljs-add-dataset`) and stop.
- Copy and register:
  ```bash
  mkdir -p PORTAL_DIR/public/data
  cp SOURCE PORTAL_DIR/public/data/MAP_SLUG.geojson
  # or for URLs: curl -L SOURCE -o PORTAL_DIR/public/data/MAP_SLUG.geojson
  ```
  Then append to `datasets.json` (matching the `Dataset` shape in `lib/datasets.ts`):
  ```json
  {
    "slug": "MAP_SLUG",
    "namespace": "NAMESPACE",
    "name": "MAP_NAME",
    "description": "DESCRIPTION",
    "file": "MAP_SLUG.geojson",
    "format": "geojson"
  }
  ```

Capture the final `NAMESPACE`, `SLUG`, and `FILE` for use when rendering the map.

### 4. Install map dependencies (once)

The template does not bundle a map component. Install Leaflet directly. Check whether
`react-leaflet` is already in `PORTAL_DIR/package.json` — if so, skip this step.

```bash
cd PORTAL_DIR && npm install react-leaflet@^5 leaflet@^1.9 && npm install -D @types/leaflet
```

Tell the user first: `Installing map dependencies (react-leaflet, leaflet)...`

If install fails, tell the user (check Node.js >=18 and network access) and retry.

> Why `react-leaflet@^5`: v5 targets React 19, which the catalog template uses. (If a
> portal is still on React 18, install `react-leaflet@^4` instead — its peer dep requires
> React 18.)

### 5. Generate the `Map` component (once)

Leaflet touches `window` at module load, so it **must not** be server-rendered. The
component is split in two: `MapView.tsx` holds the Leaflet code, and `Map.tsx` is a thin
wrapper that loads it with `dynamic(..., { ssr: false })`. Only the type is imported
across the boundary (erased at build), so Leaflet never reaches the server bundle.

Skip this step if `PORTAL_DIR/components/Map.tsx` already exists.

Write `PORTAL_DIR/components/MapView.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { GeoJsonObject } from 'geojson'
import 'leaflet/dist/leaflet.css'

// Fits the viewport to the data once it loads.
function FitBounds({ data }: { data: GeoJsonObject }) {
  const map = useMap()
  useEffect(() => {
    const bounds = L.geoJSON(data).getBounds()
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] })
  }, [data, map])
  return null
}

export interface MapProps {
  /** URL of a GeoJSON file (e.g. /data/cities.geojson) */
  url?: string
  /** Inline GeoJSON, used if no url is given */
  data?: GeoJsonObject
  /** Map height in pixels (default 500) */
  height?: number
}

export default function MapView({ url, data: initialData, height = 500 }: MapProps) {
  const [data, setData] = useState<GeoJsonObject | null>(initialData ?? null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${r.statusText}`)
        return r.json()
      })
      .then((json) => setData(json as GeoJsonObject))
      .catch((e: Error) => setError(e.message))
  }, [url])

  if (error) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-50 rounded-md">
        Failed to load map data: {error}
      </div>
    )
  }

  return (
    <MapContainer
      style={{ height, width: '100%' }}
      center={[0, 0]}
      zoom={2}
      scrollWheelZoom={false}
      className="rounded-lg border border-gray-200"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data && (
        <>
          {/* circleMarker avoids Leaflet's broken default marker-icon URLs under bundlers */}
          <GeoJSON
            data={data}
            style={{ color: '#2563eb', weight: 2, fillOpacity: 0.2 }}
            pointToLayer={(_feature, latlng) =>
              L.circleMarker(latlng, {
                radius: 6,
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.8,
                weight: 2,
              })
            }
            onEachFeature={(feature, layer) => {
              const props = feature.properties
              if (props && Object.keys(props).length) {
                layer.bindPopup(
                  Object.entries(props)
                    .map(([k, v]) => `<strong>${k}</strong>: ${String(v)}`)
                    .join('<br/>')
                )
              }
            }}
          />
          <FitBounds data={data} />
        </>
      )}
    </MapContainer>
  )
}
```

Write `PORTAL_DIR/components/Map.tsx`:
```tsx
import dynamic from 'next/dynamic'
import type { MapProps } from './MapView'

// ssr: false — Leaflet accesses window and cannot run during server rendering.
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
      style={{ height: 500 }}
    >
      <span className="text-sm text-gray-400">Loading map…</span>
    </div>
  ),
})

export default function Map(props: MapProps) {
  return <MapView {...props} />
}
```

### 6. Render the map into the showcase's Views section

The showcase `pages/[owner]/[slug].tsx` renders **every** dataset, so the map must be
applied **only for the chosen dataset** — gate it on the dataset's `(namespace, slug)`. The
route already has a **Views placeholder**:

```tsx
{/* Views placeholder — charts and maps are added here by the
    /portaljs-add-chart and /portaljs-add-map skills. */}
<section className="mt-10 border-t border-gray-200 pt-6">
  <h2 className="text-lg font-semibold text-gray-900">Views</h2>
  <p className="mt-2 text-sm text-gray-400">
    No views yet. Charts and maps for this dataset are added here.
  </p>
</section>
```

Edit `PORTAL_DIR/pages/[owner]/[slug].tsx`. The `Map` component fetches the GeoJSON
client-side from `/data/<file>` (the file is served statically from `/public/data/`),
which sidesteps the fact that `.geojson` imports are not covered by `resolveJsonModule`.

1. Add the import near the top (after the other component imports):
   ```tsx
   import Map from '../../components/Map'
   ```
2. Replace the Views placeholder `<section>` so it conditionally renders the map for the
   target dataset and keeps the "no views yet" message for every other dataset:

   ```tsx
   <section className="mt-10 border-t border-gray-200 pt-6">
     <h2 className="text-lg font-semibold text-gray-900">Views</h2>
     {dataset.namespace === 'NAMESPACE' && dataset.slug === 'SLUG' ? (
       <div className="mt-4">
         <Map url={`/data/${dataset.file}`} />
       </div>
     ) : (
       <p className="mt-2 text-sm text-gray-400">
         No views yet. Charts and maps for this dataset are added here.
       </p>
     )}
   </section>
   ```

If a previous `/portaljs-add-chart` or `/portaljs-add-map` run already replaced this section with a
view-dispatch block, **extend** that block with another `dataset.namespace === … &&
dataset.slug === …` branch (or add the `<Map />` alongside an existing `<Chart />` for the
same dataset) rather than overwriting it.

### 7. Verify

Type-check (do NOT run `next build` here). `next build` writes to `.next/`, the same
directory a running `npm run dev` uses — building over a live dev server corrupts it.
`tsc` writes nothing to `.next/`, so it's safe while the user's portal is running:

```bash
cd PORTAL_DIR
npx tsc --noEmit > /tmp/portaljs-add-map-verify.log 2>&1
VERIFY_EXIT=$?
tail -20 /tmp/portaljs-add-map-verify.log
```

If `VERIFY_EXIT` is non-zero, print the log and fix the error before reporting success.
Do not report success while type-checking still fails.

### 8. Report success

```
✓ Map added to DATASET
  - Data file: public/data/SLUG.geojson (manifest entry: format "geojson")
  - Component: components/Map.tsx (+ MapView.tsx)
  - Showcase:  pages/[owner]/[slug].tsx Views section
  - Renders at: /@NAMESPACE/SLUG

Next: run `npm run dev` and visit http://localhost:3000/@NAMESPACE/SLUG to verify the map renders.
```

## Notes

- **One showcase route, many datasets:** `pages/[owner]/[slug].tsx` renders every dataset,
  so always gate the map on the dataset's `(namespace, slug)` — otherwise it would appear
  on every dataset's showcase.
- **Table vs. map:** the showcase already shows tabular data via `<Table />` and offers a
  download; `/portaljs-add-map` adds the geographic view in the Views section. A GeoJSON dataset
  shows a download link by default (no table), so the map is its primary preview.
- **Property popups:** every feature's `properties` become a click popup automatically.
- **Coordinate order:** GeoJSON is `[longitude, latitude]`. Leaflet handles this for you
  via the `GeoJSON` layer — do not pre-swap coordinates.
- **CRS:** Leaflet assumes WGS84 (EPSG:4326) lon/lat, the GeoJSON default. Data in a
  projected CRS will land in the wrong place — reproject to WGS84 first.
- **Large files (>5MB):** thousands of features can be slow to render. Consider
  simplifying geometries (e.g. `mapshaper`) before adding.
