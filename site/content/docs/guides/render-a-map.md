---
metatitle: Render a Map in PortalJS – Interactive GeoJSON Maps
metadescription: Render a GeoJSON dataset on an interactive Leaflet map in your PortalJS portal — with /portaljs-add-map, or by hand with react-leaflet and a client-only Map component.
title: Render a map
description: Put a GeoJSON dataset on an interactive map — with /portaljs-add-map, or by hand with react-leaflet.
---

**Goal:** render a GeoJSON dataset (points, lines, or polygons) on an interactive map
as a view in the dataset's showcase.

> [!info] Before you start
> You need a portal scaffolded with [`/portaljs-new-portal`](/docs/skills/portaljs-new-portal). The
> source must be **GeoJSON** — a `Feature`, `FeatureCollection`, or geometry object.
> For tabular data, see [Add tabular data](/docs/guides/add-tabular-data).

## The AI path — `/portaljs-add-map`

Point [`/portaljs-add-map`](/docs/skills/portaljs-add-map) at a local file or a public URL:

```
/portaljs-add-map ./data/regions.geojson — Auckland region boundaries
```

It validates the GeoJSON, copies it into `/public/data/`, installs
`react-leaflet`/`leaflet` (once), generates a reusable client-only `Map` component, and
adds the map as a view in the dataset's showcase (`pages/[owner]/[slug].tsx`, in the
Views section). It runs a full `next build` before reporting success.

> [!note] Map and table of the same file
> `/portaljs-add-dataset` renders GeoJSON as a properties table; `/portaljs-add-map` renders it on a
> map. Run both on the same dataset to offer both views in the same showcase.

## The by-hand path

Drop the file into `/public/data/`, then install Leaflet directly:

```bash
npm install react-leaflet@^4 leaflet@^1.9 && npm install -D @types/leaflet
```

> [!note] Why react-leaflet v4
> v4 targets React 18 (the template's React). Don't install v5 (React 19) unless
> you've upgraded the portal to React 19.

Leaflet touches `window` at module load, so it **must not** be server-rendered. Split
the component in two: a `MapView.tsx` holding the Leaflet code, and a thin `Map.tsx`
wrapper that loads it with `dynamic(() => import('./MapView'), { ssr: false })`. Only
the prop type is imported across the boundary, so Leaflet never reaches the server
bundle.

Render the `Map` as a view in the dataset's showcase (`pages/[owner]/[slug].tsx`),
passing the GeoJSON as a `url` so the component fetches it client-side (the file is
served statically from `/public/data/`), which sidesteps `.geojson` import quirks:

```tsx
import Map from '../../components/Map';
// …in the showcase's Views section:
<Map url="/data/regions.geojson" />
```

The dataset itself is registered in `datasets.json`, so it already appears in the
`/search` catalog — no home-page link to add.

## Notes

- **Coordinate order:** GeoJSON is `[longitude, latitude]`. Leaflet's `GeoJSON` layer
  handles this — don't pre-swap.
- **CRS:** Leaflet assumes WGS84 (EPSG:4326). Reproject projected data first or it
  lands in the wrong place.
- **Large files (>5MB):** thousands of features render slowly — simplify geometries
  (e.g. with `mapshaper`) first.

## Where to go next

- **[Connect a CKAN backend](/docs/guides/connect-a-ckan-backend)** — serve datasets
  from a live catalog instead of static files.
- **[Deploy](/docs/guides/deploy)** — publish the portal.

<DocsPagination prev="/docs/guides/add-a-chart" next="/docs/guides/connect-a-ckan-backend" />
