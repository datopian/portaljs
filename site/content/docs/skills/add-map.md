---
metatitle: /add-map – Render a GeoJSON Dataset on an Interactive Map in PortalJS
metadescription: The /add-map skill installs react-leaflet, generates a reusable Map component, creates a map page, and registers it on the home page — rendering GeoJSON on an interactive Leaflet map.
title: /add-map
description: Render a GeoJSON dataset on an interactive Leaflet map and register it on the home page catalog.
---

`/add-map` adds an interactive map of a GeoJSON dataset to an existing PortalJS
portal. It copies the GeoJSON into `/public/data/`, installs `react-leaflet` /
`leaflet` (once), generates a reusable `Map` component, creates a map page, and
registers it on the home page catalog.

## When to use it

Use it when your data is geographic (points, lines, polygons) and you want a map
rather than the properties table that [`/add-dataset`](/docs/skills/add-dataset)
produces for GeoJSON. You can run both on the same file to offer both views — the
map page gets a `-map` suffix so the routes don't collide.

## Inputs

| Input | Required | Notes |
| ----- | -------- | ----- |
| Source | Yes | A local file path or public URL. Must be **GeoJSON** (a `Feature`, `FeatureCollection`, or geometry object). |
| Portal directory | No | Path to the portal project. Defaults to the current directory. |
| Map name | No | Human-readable name. Defaults to the filename. |
| Description | No | Optional one-line description shown on the page. |

The skill validates that the target is a PortalJS portal and that the source is
valid GeoJSON before doing anything; non-GeoJSON sources are rejected with a
pointer to `/add-dataset`.

## Example

```
/add-map ./data/auckland-suburbs.geojson
```

From a public URL with a name:

```
/add-map https://example.com/cities.geojson — Major cities
```

## What it produces

- The GeoJSON copied to `public/data/<slug>.geojson`.
- `react-leaflet` and `leaflet` added to `package.json` (installed once).
- A reusable `components/Map.tsx` plus `components/MapView.tsx` — split so Leaflet
  is loaded with `dynamic(..., { ssr: false })` and never reaches the server
  bundle. Every feature's `properties` become a click popup automatically.
- A map page at `pages/datasets/<slug>.tsx` that fetches the GeoJSON client-side.
- A new entry on the home page catalog (`pages/index.tsx`), preserving existing
  entries.

It runs the build before reporting success. When it finishes:

```
✓ Map added: Auckland suburbs
  - Data file: public/data/auckland-suburbs.geojson
  - Component: components/Map.tsx (+ MapView.tsx)
  - Page: pages/datasets/auckland-suburbs.tsx → http://localhost:3000/datasets/auckland-suburbs
  - Home page: updated
```

## Where to go next

- **[`/add-chart`](/docs/skills/add-chart)** — add a chart to a tabular dataset.
- **[`/deploy`](/docs/skills/deploy)** — publish the portal.

<DocsPagination prev="/docs/skills/add-chart" next="/docs/skills/connect-ckan" />
