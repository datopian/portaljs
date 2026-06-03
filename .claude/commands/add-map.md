---
description: Render a GeoJSON dataset on an interactive Leaflet map in an existing PortalJS portal. Installs react-leaflet, generates a Map component, creates a map page, and registers it on the home page.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /add-map

Add an interactive map of a GeoJSON dataset to an existing PortalJS portal. Copies the GeoJSON to `/public/data/`, installs `react-leaflet`/`leaflet` (once), generates a reusable `Map` component, creates a map page, and registers it on the home page catalog.

Use this when the data is geographic (points, lines, polygons) and the user wants a map rather than the table that `/add-dataset` produces for GeoJSON.

## Required input

- **Source** — a local file path (`./data/file.geojson`) or a public URL (`https://example.com/file.geojson`). Must be **GeoJSON** (a `Feature`, `FeatureCollection`, or geometry object).
- **Portal directory** — path to the portal project (defaults to current directory)

If source is missing:
```
ERROR: [add-map] MISSING_INPUT No GeoJSON source provided — provide a local file path or public URL.
```

## Steps

### 1. Parse arguments from `$ARGUMENTS`

Extract:
- `SOURCE` — file path or URL
- `PORTAL_DIR` — portal directory (default: `.`)
- `MAP_NAME` — human-readable name (default: derived from filename)
- `MAP_SLUG` — URL slug (default: lowercase hyphenated filename without extension)
- `DESCRIPTION` — optional one-line description

If `$ARGUMENTS` is empty, ask:
```
To add a map I need:
1. Source: local file path or public URL to a GeoJSON file
2. Portal directory (press Enter for current directory)
3. Map name (press Enter to use filename)
```

### 2. Validate the portal directory

The target must be a PortalJS portal. Check `PORTAL_DIR/package.json` and `PORTAL_DIR/pages` exist:
```
ERROR: [add-map] NOT_A_PORTAL PORTAL_DIR is not a PortalJS portal (no package.json/pages) — run /new-portal first.
```

### 3. Fetch/copy and validate the GeoJSON

**If SOURCE is a URL:**
- Fetch it. If the status is not 200:
  ```
  ERROR: [add-map] FETCH_FAILED Could not fetch SOURCE (HTTP STATUS) — check the URL is publicly accessible and supports CORS.
  ```

**If SOURCE is a local file path:**
- Check the file exists. If not:
  ```
  ERROR: [add-map] FILE_NOT_FOUND SOURCE does not exist — check the path and retry.
  ```

**Validate it is GeoJSON.** Parse the content as JSON and confirm `type` is one of
`FeatureCollection`, `Feature`, `GeometryCollection`, `Point`, `MultiPoint`,
`LineString`, `MultiLineString`, `Polygon`, or `MultiPolygon`. If parsing fails or
`type` is none of these:
```
ERROR: [add-map] NOT_GEOJSON SOURCE is not valid GeoJSON — /add-map only renders GeoJSON. For tabular data use /add-dataset.
```

**Copy to portal:**
```bash
mkdir -p PORTAL_DIR/public/data
cp SOURCE PORTAL_DIR/public/data/MAP_SLUG.geojson
# or for URLs: curl -L SOURCE -o PORTAL_DIR/public/data/MAP_SLUG.geojson
```

### 4. Install map dependencies (once)

The template does not bundle a map component. Install Leaflet directly. Check whether
`react-leaflet` is already in `PORTAL_DIR/package.json` — if so, skip this step.

```bash
cd PORTAL_DIR && npm install react-leaflet@^4 leaflet@^1.9 && npm install -D @types/leaflet
```

Tell the user first: `Installing map dependencies (react-leaflet, leaflet)...`

If install fails:
```
ERROR: [add-map] INSTALL_FAILED npm install failed — check Node.js >=18 and network access, then retry.
```

> Why `react-leaflet@^4`: v4 targets React 18 (the template's React). Do not install v5 (React 19) unless the portal has been upgraded to React 19.

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

### 6. Choose the page path (avoid clobbering `/add-dataset`)

Map pages live under `pages/datasets/` so they share the home-page catalog with
`/add-dataset`. If `PORTAL_DIR/pages/datasets/MAP_SLUG.tsx` already exists (e.g. a table
page from `/add-dataset` for the same data), use `MAP_SLUG-map` for both the page slug
and the route so both views can coexist. Call the final value `PAGE_SLUG`.

### 7. Generate the map page

Write `PORTAL_DIR/pages/datasets/PAGE_SLUG.tsx`. The page passes the GeoJSON `url` —
the `Map` component fetches it client-side (the file is served statically from
`/public/data/`), which sidesteps the fact that `.geojson` imports are not covered by
`resolveJsonModule`.

```tsx
import Head from 'next/head'
import Map from '../../components/Map'

export default function MapPage() {
  return (
    <>
      <Head><title>MAP_NAME</title></Head>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-500">
          <a href="/" className="hover:text-gray-700">Home</a>
          <span className="mx-2">/</span>
          <span>MAP_NAME</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MAP_NAME</h1>
        {DESCRIPTION && <p className="text-gray-500 mb-8">DESCRIPTION</p>}
        <Map url="/data/MAP_SLUG.geojson" />
        <p className="mt-6 text-sm text-gray-400">
          <a href="/data/MAP_SLUG.geojson" className="underline">Download GeoJSON</a>
        </p>
      </main>
    </>
  )
}
```

When writing the file, substitute `MAP_NAME`, `MAP_SLUG`, and `DESCRIPTION` with the real
values. Drop the `{DESCRIPTION && ...}` line entirely if there is no description.

### 8. Register on the home page

Open `PORTAL_DIR/pages/index.tsx` and find the `datasets` array:
```tsx
const datasets: { slug: string; name: string; description?: string }[] = []
```

Append an entry (keep existing entries):
```tsx
{ slug: 'PAGE_SLUG', name: 'MAP_NAME', description: 'DESCRIPTION' },
```

If the `datasets` array is not found (home page has been customised):
- Keep the map page; skip registration.
- Tell the user: "Map page created at /datasets/PAGE_SLUG. Add it to your home page manually."

### 9. Verify the build

```bash
cd PORTAL_DIR
npx next build > /tmp/add-map-build.log 2>&1
BUILD_EXIT=$?
tail -20 /tmp/add-map-build.log
```

If `BUILD_EXIT` is non-zero, print the log and fix the error before reporting success.
Do not report success while the build is failing.

### 10. Report success

```
✓ Map added: MAP_NAME
  - Data file: public/data/MAP_SLUG.geojson
  - Component: components/Map.tsx (+ MapView.tsx)
  - Page: pages/datasets/PAGE_SLUG.tsx → http://localhost:3000/datasets/PAGE_SLUG
  - Home page: updated

Next: run `npm run dev` and visit http://localhost:3000/datasets/PAGE_SLUG to verify.
```

## Notes

- **Tabular vs. map:** `/add-dataset` renders GeoJSON as a properties table; `/add-map`
  renders it on a map. Run both on the same file to offer both views — the `-map` suffix
  keeps the routes distinct.
- **Property popups:** every feature's `properties` become a click popup automatically.
- **Coordinate order:** GeoJSON is `[longitude, latitude]`. Leaflet handles this for you
  via the `GeoJSON` layer — do not pre-swap coordinates.
- **CRS:** Leaflet assumes WGS84 (EPSG:4326) lon/lat, the GeoJSON default. Data in a
  projected CRS will land in the wrong place — reproject to WGS84 first.
- **Large files (>5MB):** thousands of features can be slow to render. Consider
  simplifying geometries (e.g. `mapshaper`) before adding.
