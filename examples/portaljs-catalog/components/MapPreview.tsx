import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  Map as MapLibreMap,
  MapMouseEvent,
  StyleSpecification,
  LngLatBoundsLike,
} from 'maplibre-gl'
import { DuckDbQuery } from '../lib/query/duckdb'
import { resourceUrl, type Resource } from '../lib/datasets'

// The dataset-page map — ONE MapLibre instance that carries both serverless geo
// tiers of a dataset:
//
//   • RENDER tier (PMTiles) — MapLibre GL reads the single .pmtiles archive
//     straight from its URL via HTTP range requests, so a multi-GB dataset pans
//     and zooms with no tile server; only the tiles in view are fetched. This is
//     the base layer and is interactive within ~1s of load.
//
//   • QUERY tier (GeoParquet + DuckDB-Wasm) — the SAME map's viewport drives
//     spatial SQL over a remote GeoParquet read IN PLACE (bbox pre-filter to
//     prune Parquet row groups, then ST_Intersects). Results paint as a HIGHLIGHT
//     overlay ON TOP of the PMTiles layer — not a second map. DuckDB-Wasm is
//     LAZY: it spins up only when the visitor first runs a query, so the render
//     tier is never held up by the ~10 MB wasm bundle.
//
// A dual-tier dataset ships both a `pmtiles` resource (passed as `url`) and a
// `geoparquet` resource (passed as `queryResource`); this component composes them
// into one interaction model. It also degrades to either tier alone.
//
// Import via next/dynamic with { ssr: false }: maplibre-gl (and, lazily,
// @duckdb/duckdb-wasm) touch browser globals, and the libraries are dynamic-
// imported so the chunk loads in the browser only when a map actually renders
// (flat portals never pay for it).
//
// Make PMTiles from GeoJSON/Shapefile with tippecanoe (see README "Maps"):
//   tippecanoe -zg --drop-densest-as-needed -o out.pmtiles in.geojson

// Terracotta accent from tailwind.config.js (oklch(0.48 0.12 40)) — MapLibre
// paint needs a literal color, not a Tailwind class. The PMTiles base layer uses
// this.
const ACCENT = '#9d4a2c'

// A high-contrast blue for the query-result HIGHLIGHT overlay, so features
// returned by a spatial query pop clearly on top of the terracotta base render
// and the light basemap. Deliberately NOT the accent — the highlight has to read
// as "these are the rows your query matched", distinct from the full render.
const HIGHLIGHT = '#1d4ed8'

// GeoParquet query plumbing (mirrors lib/query): the emitted GeoJSON column, the
// result cap, and the default geometry / covering-bbox column names for the demo
// GeoParquet. A dataset with different names ships its own `resource.query`.
const GEOJSON_COL = 'geojson'
const MAX_RESULTS = 5000
const GEOM = 'geometry'
const BBOX = 'bbox'

// Light, neutral, keyless vector basemap (Carto Positron via OpenFreeMap),
// loaded at runtime in the browser only. Low-contrast greys/whites so the data
// layer reads first — the old MapLibre demo style painted land solid green,
// which a large point layer disappeared into. If the style is unreachable the
// map falls back to a plain background and still renders the data layer, so
// previews (and offline dev) never break on the basemap.
const BASEMAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'

// Basemap credit — always shown (the OpenFreeMap/Carto style is built from
// OpenStreetMap data, whose licence requires attribution). The data-source
// credit from the `attribution` prop is appended after it.
const BASEMAP_ATTRIBUTION = '© OpenStreetMap · Carto'

// The handful of maplibre-gl.css rules the canvas needs to lay out correctly,
// inlined so no global CSS import has to be wired through next.config. The
// stock stylesheet mostly styles controls/popups, which this component
// replaces with its own overlays — but the scale control IS a stock control,
// so its rules are included below.
const BASE_CSS = `
.maplibregl-map{overflow:hidden;position:relative;-webkit-tap-highlight-color:rgba(0,0,0,0)}
.maplibregl-canvas-container{height:100%;width:100%}
.maplibregl-canvas{left:0;position:absolute;top:0}
.maplibregl-canvas-container.maplibregl-interactive{cursor:grab;user-select:none}
.maplibregl-canvas-container.maplibregl-interactive:active{cursor:grabbing}
.maplibregl-ctrl-bottom-left{position:absolute;bottom:0;left:0;z-index:2;pointer-events:none}
.maplibregl-ctrl-scale{background:rgba(247,244,236,0.8);border:1px solid rgba(43,40,38,0.25);border-top:none;color:#2b2826;font:10px/1.4 ui-sans-serif,system-ui,sans-serif;padding:1px 5px;white-space:nowrap}
`

function injectBaseCss() {
  const id = 'portaljs-map-preview-css'
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = BASE_CSS
  document.head.appendChild(style)
}

// Rough initial zoom for a lon/lat span, so the map opens framed on the data
// (never the world view) before the precise fitBounds on load. Derived from the
// Web-Mercator relationship zoom ≈ log2(360 / span); clamped to sane bounds.
function zoomForSpan(lonSpan: number, latSpan: number): number {
  const span = Math.max(lonSpan, latSpan, 1e-6)
  const z = Math.log2(360 / span) - 0.5
  return Math.min(16, Math.max(1, z))
}

type Bounds = { minX: number; minY: number; maxX: number; maxY: number }

// bbox-first viewport query: prune row groups on the covering bbox (cheap,
// Parquet stats), THEN refine with the exact ST_Intersects predicate on the
// survivors, and emit GeoJSON for the overlay.
function buildViewportSql(b: Bounds): string {
  const env = `ST_MakeEnvelope(${b.minX}, ${b.minY}, ${b.maxX}, ${b.maxY})`
  return (
    `SELECT * EXCLUDE ("${GEOM}", "${BBOX}"), ST_AsGeoJSON("${GEOM}") AS ${GEOJSON_COL}\n` +
    `FROM data\n` +
    `WHERE "${BBOX}".xmin <= ${b.maxX} AND "${BBOX}".xmax >= ${b.minX}\n` +
    `  AND "${BBOX}".ymin <= ${b.maxY} AND "${BBOX}".ymax >= ${b.minY}\n` +
    `  AND ST_Intersects("${GEOM}", ${env})\n` +
    `LIMIT ${MAX_RESULTS}`
  )
}

type Inspected = {
  lngLat: [number, number]
  properties: Record<string, unknown>
  sourceLayer: string
}
type ViewMode = 'table' | 'chart'
type FeatureCollection = { type: 'FeatureCollection'; features: unknown[] }
type Output = {
  columns: string[]
  rows: Record<string, unknown>[]
  featureCollection: FeatureCollection | null
}

// Overlay layer ids for the query-result highlight, painted on top of the base
// render layers.
const OVERLAY_SOURCE = 'portaljs-query'
const OVERLAY_LAYERS = ['query-fill', 'query-line', 'query-point'] as const

export default function MapPreview({
  url,
  attribution,
  bbox,
  queryResource,
}: {
  // PMTiles archive URL — the render tier. Optional so the component can render
  // a GeoParquet-only dataset (query tier alone) on a plain basemap.
  url?: string
  attribution?: string
  // Authoritative initial extent [minLon, minLat, maxLon, maxLat] (e.g. from
  // dataset metadata / DCAT spatial). When omitted, the PMTiles header bounds
  // are used — accurate for any tippecanoe-built archive.
  bbox?: [number, number, number, number]
  // GeoParquet resource for the query tier. When present, the SAME map gets a
  // spatial-SQL engine (DuckDB-Wasm, lazy) whose results highlight on top of the
  // render layer. Absent for a render-only (PMTiles) dataset.
  queryResource?: Resource
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  // Data extent to (re)frame on — set once the map is up. Backs the
  // "reset to data extent" control.
  const boundsRef = useRef<LngLatBoundsLike | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [inspected, setInspected] = useState<Inspected | null>(null)
  // Pixel position of the popup, re-projected from lngLat on every map move.
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)

  // --- Query tier (GeoParquet + DuckDB-Wasm), all lazy ---
  const geoUrl = queryResource ? resourceUrl(queryResource) : null
  // The engine and its open() promise are created only on the FIRST query, never
  // at mount — the render tier must not wait for the DuckDB wasm bundle.
  const engineRef = useRef<DuckDbQuery | null>(null)
  const openedRef = useRef<Promise<void> | null>(null)
  // Last FeatureCollection painted; re-applied on every 'styledata' so the
  // overlay survives a basemap style (re)load (initial + offline fallback).
  const lastFcRef = useRef<FeatureCollection | null>(null)
  const initialSql = useMemo(
    () => queryResource?.query ?? buildViewportSql({ minX: -180, minY: -85, maxX: 180, maxY: 85 }),
    [queryResource]
  )
  const [draft, setDraft] = useState(initialSql)
  const [showSql, setShowSql] = useState(false)
  const [querying, setQuerying] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [ranged, setRanged] = useState(false)
  const [resultView, setResultView] = useState<ViewMode>('table')
  const [output, setOutput] = useState<Output>({ columns: [], rows: [], featureCollection: null })
  const [hasQueried, setHasQueried] = useState(false)

  // Normalize a query result into { table rows, FeatureCollection }, pulling the
  // `geojson` column (when present) out as the overlay geometry.
  const toOutput = (columns: string[], rows: Record<string, unknown>[]): Output => {
    const hasGeo = columns.includes(GEOJSON_COL)
    const tableCols = columns.filter((c) => c !== GEOJSON_COL)
    const features: unknown[] = []
    const tableRows: Record<string, unknown>[] = []
    for (const row of rows) {
      const rec: Record<string, unknown> = {}
      for (const c of tableCols) rec[c] = row[c]
      tableRows.push(rec)
      if (hasGeo && typeof row[GEOJSON_COL] === 'string') {
        try {
          features.push({ type: 'Feature', geometry: JSON.parse(row[GEOJSON_COL] as string), properties: rec })
        } catch {
          /* skip an unparseable geometry rather than fail the whole query */
        }
      }
    }
    return {
      columns: tableCols,
      rows: tableRows,
      featureCollection: hasGeo ? { type: 'FeatureCollection', features } : null,
    }
  }

  // Paint the query result as a highlight overlay (source + fill/line/circle
  // trio) ON TOP of the base render layers. Idempotent: updates source data on
  // repeat calls, (re)creates layers after a style (re)load. Remembers the last
  // FeatureCollection so the overlay survives the offline-basemap fallback.
  const paintOverlay = (fc: FeatureCollection | null) => {
    const map = mapRef.current
    if (!map) return
    lastFcRef.current = fc
    const data = fc ?? { type: 'FeatureCollection', features: [] }
    if (!map.isStyleLoaded()) return // 'styledata' re-runs this once loaded
    const src = map.getSource(OVERLAY_SOURCE) as
      | { setData: (d: unknown) => void }
      | undefined
    if (src) {
      src.setData(data)
      return
    }
    map.addSource(OVERLAY_SOURCE, { type: 'geojson', data: data as never })
    map.addLayer({
      id: 'query-fill',
      type: 'fill',
      source: OVERLAY_SOURCE,
      filter: ['==', '$type', 'Polygon'],
      paint: { 'fill-color': HIGHLIGHT, 'fill-opacity': 0.35 },
    })
    map.addLayer({
      id: 'query-line',
      type: 'line',
      source: OVERLAY_SOURCE,
      filter: ['!=', '$type', 'Point'],
      paint: { 'line-color': HIGHLIGHT, 'line-width': 2 },
    })
    map.addLayer({
      id: 'query-point',
      type: 'circle',
      source: OVERLAY_SOURCE,
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-color': HIGHLIGHT,
        'circle-radius': 5,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5,
      },
    })
  }

  // Open the DuckDB engine on first use (LOAD spatial + register the remote
  // GeoParquet as `data`). Returns the opened engine, or null when there's no
  // query resource. Subsequent calls reuse the same engine/open promise.
  const ensureEngine = async (): Promise<DuckDbQuery | null> => {
    if (!geoUrl) return null
    if (!openedRef.current) {
      const engine = new DuckDbQuery()
      engineRef.current = engine
      openedRef.current = engine
        .open({ url: geoUrl, format: 'geoparquet', spatial: true })
        .then(() => {
          setRanged(engine.ranged)
        })
    }
    await openedRef.current
    return engineRef.current
  }

  const runSql = async (sql: string) => {
    setQuerying(true)
    setQueryError(null)
    try {
      const engine = await ensureEngine()
      if (!engine) return
      const res = await engine.query(sql)
      const out = toOutput(res.columns, res.rows)
      setOutput(out)
      setHasQueried(true)
      paintOverlay(out.featureCollection)
    } catch (e) {
      setQueryError(e instanceof Error ? e.message : String(e))
    } finally {
      setQuerying(false)
    }
  }

  // Rewrite the query to the current map viewport (bbox pre-filter → ST_Intersects)
  // and paint the matches as the highlight overlay on this same map.
  const queryViewport = () => {
    const map = mapRef.current
    if (!map) return
    const b = map.getBounds()
    const sql = buildViewportSql({
      minX: b.getWest(),
      minY: b.getSouth(),
      maxX: b.getEast(),
      maxY: b.getNorth(),
    })
    setDraft(sql)
    void runSql(sql)
  }

  const clearHighlight = () => {
    setOutput({ columns: [], rows: [], featureCollection: null })
    setHasQueried(false)
    paintOverlay(null)
  }

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    let map: MapLibreMap | undefined

    ;(async () => {
      // maplibre-gl always; pmtiles only when there's a render tier.
      const maplibre = await import('maplibre-gl')
      const pmtiles = url ? await import('pmtiles') : null
      if (cancelled || !containerRef.current) return
      const maplibregl = maplibre.default

      injectBaseCss()

      // Resolve the render tier's absolute URL, archive header (bounds), and the
      // vector layers tippecanoe wrote. Skipped for a GeoParquet-only dataset.
      let absoluteUrl: string | null = null
      let vectorLayers: { id: string }[] = []
      let extent: [number, number, number, number] | null = bbox ?? null
      if (url && pmtiles) {
        // The pmtiles:// protocol is registered process-wide in maplibre — once.
        const gl = maplibregl as unknown as { __pmtilesProtocol?: boolean }
        if (!gl.__pmtilesProtocol) {
          maplibregl.addProtocol('pmtiles', new pmtiles.Protocol().tile)
          gl.__pmtilesProtocol = true
        }
        // Tile URLs inside the pmtiles:// wrapper must be absolute, so resolve
        // the bundled /data/<file> path against the page origin.
        absoluteUrl = new URL(url, window.location.href).toString()
        const archive = new pmtiles.PMTiles(absoluteUrl)
        try {
          const header = await archive.getHeader()
          const metadata = (await archive.getMetadata()) as {
            vector_layers?: { id: string }[]
          }
          vectorLayers = metadata?.vector_layers ?? []
          // The caller-supplied bbox wins (authoritative metadata), else the
          // archive header bounds.
          const hasHeaderBounds = header.maxLon > header.minLon
          if (!extent && hasHeaderBounds) {
            extent = [header.minLon, header.minLat, header.maxLon, header.maxLat]
          }
        } catch {
          if (!cancelled) {
            setError(`Could not read the PMTiles archive at ${url}.`)
            setLoading(false)
          }
          return
        }
      }
      if (cancelled || !containerRef.current) return

      if (extent) {
        boundsRef.current = [
          [extent[0], extent[1]],
          [extent[2], extent[3]],
        ]
      }

      const offlineStyle: StyleSpecification = {
        version: 8,
        sources: {},
        layers: [
          // Matches the cream-panel canvas so a basemap-less map still looks placed.
          { id: 'background', type: 'background', paint: { 'background-color': '#ece7db' } },
        ],
      }

      try {
        map = new maplibregl.Map({
          container: containerRef.current,
          style: BASEMAP_STYLE,
          // Open framed on the data (never the world) even before the precise
          // fitBounds on load fires.
          center: extent
            ? [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]
            : [0, 0],
          zoom: extent
            ? zoomForSpan(extent[2] - extent[0], extent[3] - extent[1])
            : 1,
          attributionControl: false,
        })
      } catch (e) {
        // Most commonly WebGL being unavailable (old hardware, disabled in
        // the browser) — say so instead of a generic failure.
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not initialize the map.')
          setLoading(false)
        }
        return
      }
      mapRef.current = map

      // Stock scale bar (bottom-left), styled by BASE_CSS above.
      map.addControl(new maplibregl.ScaleControl({ maxWidth: 90, unit: 'metric' }), 'bottom-left')

      // An unreachable basemap must never take the data layer down: swap to
      // the plain background and carry on. Match only network-shaped failures
      // before the style is up — internal maplibre errors (e.g. "Style is not
      // done loading") must NOT trigger the fallback.
      let degraded = false
      map.on('error', (e: { error?: Error }) => {
        const message = e.error?.message ?? ''
        if (!degraded && !map?.isStyleLoaded() && /fetch|network|ajax/i.test(message)) {
          degraded = true
          map?.setStyle(offlineStyle)
        }
      })

      const addDataLayers = () => {
        // 'styledata' fires repeatedly while a style is still loading, and
        // addSource/addLayer throw until it finishes — wait for the real thing.
        if (!map || !map.isStyleLoaded()) return
        if (absoluteUrl && !map.getSource('preview')) {
          map.addSource('preview', { type: 'vector', url: `pmtiles://${absoluteUrl}` })
        }
        // Each source-layer gets a geometry-aware stack, added ON TOP of the
        // basemap. Filtered by geometry type so a layer only paints what it
        // actually contains — sensible defaults whatever the tileset holds.
        for (const layer of vectorLayers) {
          // --- Polygons: semi-transparent fill + thin stroke ---
          if (!map.getLayer(`preview-fill/${layer.id}`)) {
            map.addLayer({
              id: `preview-fill/${layer.id}`,
              type: 'fill',
              source: 'preview',
              'source-layer': layer.id,
              filter: ['==', '$type', 'Polygon'],
              paint: { 'fill-color': ACCENT, 'fill-opacity': 0.22 },
            })
          }
          // --- Lines (and polygon outlines): thin stroke, no fill ---
          if (!map.getLayer(`preview-line/${layer.id}`)) {
            map.addLayer({
              id: `preview-line/${layer.id}`,
              type: 'line',
              source: 'preview',
              'source-layer': layer.id,
              filter: ['!=', '$type', 'Point'],
              paint: { 'line-color': ACCENT, 'line-width': 1.1 },
            })
          }
          // --- Points, low zoom: heatmap so a large layer (e.g. 376k trees)
          //     reads as density instead of a solid mass of dots. Fades out as
          //     the circles fade in around z12. ---
          if (!map.getLayer(`preview-heat/${layer.id}`)) {
            map.addLayer({
              id: `preview-heat/${layer.id}`,
              type: 'heatmap',
              source: 'preview',
              'source-layer': layer.id,
              filter: ['==', '$type', 'Point'],
              maxzoom: 13,
              paint: {
                'heatmap-weight': 0.6,
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 12, 1.4],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 12, 12, 22],
                // Transparent → accent ramp so density reads on the light basemap.
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(157,74,44,0)',
                  0.2, 'rgba(157,74,44,0.25)',
                  0.5, 'rgba(157,74,44,0.55)',
                  1, 'rgba(157,74,44,0.85)',
                ],
                // Fade the heatmap out over z11→13 as the circle layer fades in.
                'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.9, 13, 0],
              },
            })
          }
          // --- Points, high zoom: small graduated circles (never fixed-radius
          //     dots at city extent). Radius + opacity grow with zoom. ---
          if (!map.getLayer(`preview-point/${layer.id}`)) {
            map.addLayer({
              id: `preview-point/${layer.id}`,
              type: 'circle',
              source: 'preview',
              'source-layer': layer.id,
              filter: ['==', '$type', 'Point'],
              minzoom: 11,
              paint: {
                'circle-color': ACCENT,
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 1.5, 14, 3, 17, 6],
                'circle-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.5, 14, 0.85],
                'circle-stroke-color': '#ffffff',
                // Hairline stroke only once circles are big enough to carry it.
                'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 13, 0, 15, 1],
              },
            })
          }
        }
      }

      // (Re-)add the base data layers whenever a style finishes loading — covers
      // both the initial basemap and the offline fallback setStyle above — then
      // re-apply the query highlight overlay so it survives a style swap and
      // stays ON TOP of the freshly re-added base layers.
      const onStyle = () => {
        addDataLayers()
        if (lastFcRef.current !== null || map?.getSource(OVERLAY_SOURCE)) {
          paintOverlay(lastFcRef.current)
        }
      }
      map.on('load', onStyle)
      map.on('styledata', onStyle)

      map.once('load', () => {
        if (!map) return
        setLoading(false)
        // Frame the resolved data extent precisely (bbox prop, else header).
        if (boundsRef.current) {
          map.fitBounds(boundsRef.current, { padding: 24, duration: 0 })
        }
      })

      // Query targets for click-to-inspect: the base render layers PLUS the
      // query highlight overlay, so clicking either a rendered feature or a
      // matched feature surfaces its attributes.
      const clickableLayerIds = () =>
        [
          ...vectorLayers.flatMap((l) => [
            `preview-fill/${l.id}`,
            `preview-line/${l.id}`,
            `preview-point/${l.id}`,
          ]),
          ...OVERLAY_LAYERS,
        ].filter((id) => map?.getLayer(id))

      // Click-to-inspect — ONE interaction model for the whole map. A rendered
      // (PMTiles) feature carries the source attributes tippecanoe preserved; a
      // highlighted (query) feature carries the columns the query selected. Both
      // are read straight off the rendered feature (queryRenderedFeatures), which
      // is instant and — unlike a DuckDB point-in-polygon lookup — works for
      // point layers too (a click never lands exactly on a stored point's
      // coordinate), so DuckDB stays reserved for the query engine and the map is
      // interactive with no wasm on the critical path.
      map.on('click', (e: MapMouseEvent) => {
        if (!map) return
        const feature = map.queryRenderedFeatures(e.point, { layers: clickableLayerIds() })[0]
        if (!feature) {
          setInspected(null)
          return
        }
        setInspected({
          lngLat: [e.lngLat.lng, e.lngLat.lat],
          properties: (feature.properties ?? {}) as Record<string, unknown>,
          sourceLayer: (feature as unknown as { sourceLayer?: string }).sourceLayer ?? '',
        })
        setAnchor({ x: e.point.x, y: e.point.y })
      })

      map.on('mousemove', (e: MapMouseEvent) => {
        if (!map) return
        const hit = map.queryRenderedFeatures(e.point, { layers: clickableLayerIds() }).length > 0
        map.getCanvas().style.cursor = hit ? 'pointer' : ''
      })
    })().catch(() => {
      if (!cancelled) {
        setError('Failed to load the map libraries.')
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      mapRef.current = null
      boundsRef.current = null
      lastFcRef.current = null
      // Release the DuckDB engine if one was ever opened.
      void engineRef.current?.close()
      engineRef.current = null
      openedRef.current = null
      map?.remove()
    }
  }, [url, bbox, geoUrl])

  // Keep the popup glued to its geographic anchor while the user pans/zooms.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !inspected) return
    const reproject = () => {
      const p = map.project(inspected.lngLat)
      setAnchor({ x: p.x, y: p.y })
    }
    reproject()
    map.on('move', reproject)
    return () => {
      map.off('move', reproject)
    }
  }, [inspected])

  const zoomBy = (delta: number) => {
    const map = mapRef.current
    if (!map) return
    map.zoomTo(map.getZoom() + delta, { duration: 200 })
  }

  const resetExtent = () => {
    const map = mapRef.current
    if (!map || !boundsRef.current) return
    map.fitBounds(boundsRef.current, { padding: 24, duration: 400 })
  }

  const entries = inspected ? Object.entries(inspected.properties) : []
  const attributionLine = attribution
    ? `${BASEMAP_ATTRIBUTION} · ${attribution}`
    : BASEMAP_ATTRIBUTION

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
          Map
        </span>
        {url && (
          <span
            title="Vector tiles read from a single PMTiles archive over HTTP range requests — only the tiles in view are fetched, never the whole file."
            className="border border-accent/50 px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.06em] text-accent"
          >
            pmtiles · range requests
          </span>
        )}
        {queryResource && ranged && (
          <span
            title="GeoParquet queried in place over HTTP range requests — the bbox pre-filter prunes row groups, so only the bytes a query touches are fetched, never the whole file."
            className="border border-[#1d4ed8]/50 px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.06em] text-[#1d4ed8]"
          >
            geoparquet · queried in place
          </span>
        )}
      </div>

      <div className="relative h-[480px] w-full overflow-hidden border border-ink/[0.18] bg-cream-panel">
        {/* Sized with h/w-full, NOT absolute positioning: the injected
            .maplibregl-map rule sets position:relative, which would override
            Tailwind's `absolute` (same specificity, later in <head>) and
            collapse the div to zero height. */}
        <div ref={containerRef} className="h-full w-full" />

        {/* Map controls (custom, so none of maplibre's control CSS is needed):
            zoom, and reset-to-data-extent. */}
        <div className="absolute right-2.5 top-2.5 z-[2] flex flex-col gap-px">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => zoomBy(1)}
            className="h-7 w-7 border border-ink/25 bg-cream text-center font-sans text-base leading-none text-ink hover:text-accent"
          >
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => zoomBy(-1)}
            className="h-7 w-7 border border-ink/25 bg-cream text-center font-sans text-base leading-none text-ink hover:text-accent"
          >
            −
          </button>
          <button
            type="button"
            aria-label="Reset to data extent"
            title="Reset to data extent"
            onClick={resetExtent}
            className="mt-px flex h-7 w-7 items-center justify-center border border-ink/25 bg-cream font-sans text-[13px] leading-none text-ink hover:text-accent"
          >
            {/* framing-corners glyph — "fit to extent" */}
            ⤢
          </button>
        </div>

        {/* Query-in-progress indicator (top-left, out of the way of controls). */}
        {querying && (
          <div className="pointer-events-none absolute left-3 top-3 z-[2] bg-cream/80 px-2 py-1 font-mono text-[11px] text-ink/60">
            querying…
          </div>
        )}

        {/* Click-to-inspect popup: the clicked feature's properties. */}
        {inspected && anchor && (
          <div
            className="absolute z-[3] max-h-56 max-w-[280px] overflow-auto border border-ink/20 bg-cream px-3 py-2.5 shadow-md"
            style={{ left: anchor.x, top: anchor.y, transform: 'translate(-50%, calc(-100% - 10px))' }}
          >
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-ink/45">
                {inspected.sourceLayer || 'Feature'}
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setInspected(null)}
                className="font-sans text-sm leading-none text-ink/50 hover:text-accent"
              >
                ×
              </button>
            </div>
            {entries.length === 0 ? (
              <div className="font-serif text-xs italic text-ink/55">No properties</div>
            ) : (
              <table className="w-full border-collapse">
                <tbody>
                  {entries.map(([k, v]) => (
                    <tr key={k}>
                      <td className="whitespace-nowrap py-0.5 pr-2 align-top font-mono text-[11px] text-ink/50">
                        {k}
                      </td>
                      <td className="break-words py-0.5 font-sans text-xs text-ink">
                        {formatCell(v)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Attribution: basemap credit always, data source appended. Sits above
            the scale bar (bottom-left) at bottom-right. */}
        <div className="absolute bottom-0 right-0 z-[2] bg-cream/80 px-1.5 py-0.5 font-sans text-[10px] text-ink/60">
          {attributionLine}
        </div>

        {loading && !error && (
          <div className="absolute inset-0 z-[4] flex items-center justify-center bg-cream-panel/80">
            <span className="font-serif text-sm italic text-ink/55">Loading map…</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-[4] flex items-center justify-center bg-cream-panel/90 px-6 text-center">
            <span className="font-serif text-sm italic text-ink/60">{error}</span>
          </div>
        )}
      </div>

      {/* Query tier controls — only when the dataset ships a GeoParquet resource.
          These drive spatial SQL over the remote file and highlight the matches
          on the SAME map above; DuckDB-Wasm spins up on the first click here. */}
      {queryResource ? (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={queryViewport}
              disabled={querying}
              title="Run a spatial query over the current map viewport (bbox pre-filter → ST_Intersects) and highlight the matches on this map."
              className="bg-accent px-[18px] py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.06em] text-cream hover:opacity-90 disabled:opacity-50"
            >
              {querying ? 'Querying…' : 'Query viewport ▶'}
            </button>
            {hasQueried && (
              <button
                type="button"
                onClick={clearHighlight}
                disabled={querying}
                className="border border-ink/25 px-[14px] py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.06em] text-ink hover:border-accent hover:text-accent disabled:opacity-50"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowSql((s) => !s)}
              className="border border-ink/20 px-[14px] py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.06em] text-ink/70 hover:border-accent hover:text-accent"
            >
              {showSql ? 'Hide SQL' : 'Edit SQL'}
            </button>
            {hasQueried && (
              <span className="ml-auto font-mono text-[11px] text-ink/40">{output.rows.length} matched</span>
            )}
          </div>

          {showSql && (
            <div className="mt-3 border border-ink/[0.18]">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') void runSql(draft)
                }}
                rows={6}
                spellCheck={false}
                className="block w-full resize-y border-0 bg-cream-code px-4 py-4 font-mono text-[13.5px] leading-relaxed text-ink focus:outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/[0.15] px-4 py-2.5">
                <span className="font-mono text-[11px] text-ink/40">
                  DuckDB-Wasm + spatial · runs in your browser · ⌘/Ctrl + Enter
                </span>
                <button
                  type="button"
                  onClick={() => void runSql(draft)}
                  disabled={querying}
                  className="bg-accent px-[18px] py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.06em] text-cream hover:opacity-90 disabled:opacity-50"
                >
                  {querying ? 'Running…' : 'Run ▶'}
                </button>
              </div>
            </div>
          )}

          {queryError && (
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap border border-red-300 bg-red-50 p-3 font-mono text-sm text-red-700">
              {queryError}
            </pre>
          )}

          {/* Result rows (table / chart) — a supplementary view of the matched
              features; the map above is always the primary render. */}
          {hasQueried && output.rows.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                {(['table', 'chart'] as ViewMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setResultView(m)}
                    className={`border px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] ${
                      resultView === m
                        ? 'border-accent bg-accent text-cream'
                        : 'border-ink/20 bg-cream text-ink/70 hover:text-accent'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {resultView === 'table' ? (
                <ResultTable columns={output.columns} rows={output.rows} />
              ) : (
                <ResultChart columns={output.columns} rows={output.rows} />
              )}
            </div>
          )}

          <p className="mt-2 font-sans text-xs text-ink/45">
            Pan/zoom the map, then “Query viewport” to fetch only the features in view — the bbox pre-filter
            prunes Parquet row groups before ST_Intersects runs, and the matches highlight on this same map.
            Click any feature for its attributes.
          </p>
        </div>
      ) : (
        <div className="mt-2 font-mono text-[11px] text-ink/40">
          Click a feature to inspect its properties · pan and zoom fetch only the tiles in view
        </div>
      )}
    </div>
  )
}

function ResultTable({
  columns,
  rows,
}: {
  columns: string[]
  rows: Record<string, unknown>[]
}) {
  if (!rows.length) return <p className="mt-3 font-serif text-[15px] italic text-ink/55">No rows.</p>
  return (
    <div className="mt-3 overflow-x-auto border border-ink/[0.18]">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap bg-cream-panel px-4 py-3 text-left font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/60"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-ink/[0.1] hover:bg-cream-panel/50">
              {columns.map((c) => (
                <td key={c} className="whitespace-nowrap px-4 py-3 font-mono text-[13px] text-ink">
                  {formatCell(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Dependency-free horizontal bar chart: first text column = labels, first numeric
// column = values. Shows a hint when the result has no numeric column.
function ResultChart({ columns, rows }: { columns: string[]; rows: Record<string, unknown>[] }) {
  const numericCol = columns.find((c) => rows.some((r) => typeof r[c] === 'number'))
  const labelCol = columns.find((c) => c !== numericCol && rows.some((r) => typeof r[c] === 'string')) ?? columns[0]
  if (!numericCol || !rows.length) {
    return (
      <p className="mt-3 font-serif text-[15px] italic text-ink/55">
        Add a numeric column to chart the result (e.g. an aggregate like <code>sum(pop_est)</code>).
      </p>
    )
  }
  const values = rows.map((r) => Number(r[numericCol]) || 0)
  const max = Math.max(...values, 1)
  const shown = rows.slice(0, 30)
  return (
    <div className="mt-3 border border-ink/[0.18] p-4">
      <div className="mb-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/50">
        {numericCol} by {labelCol}
      </div>
      {shown.map((r, i) => {
        const v = Number(r[numericCol]) || 0
        return (
          <div key={i} className="mb-1 flex items-center gap-2.5">
            <span className="w-32 flex-shrink-0 truncate font-sans text-[12px] text-ink/80">
              {String(r[labelCol] ?? '')}
            </span>
            <span className="relative h-4 flex-1 bg-cream-panel">
              <span className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${(v / max) * 100}%` }} />
            </span>
            <span className="w-24 flex-shrink-0 text-right font-mono text-[12px] text-ink/70">{v.toLocaleString()}</span>
          </div>
        )
      })}
    </div>
  )
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'object') {
    const s = String(value)
    return s === '[object Object]' ? JSON.stringify(value) : s
  }
  return String(value)
}
