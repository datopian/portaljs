import { useEffect, useMemo, useRef, useState } from 'react'
import type { Map as MapLibreMap, MapMouseEvent, StyleSpecification } from 'maplibre-gl'
import LoadingSpinner from './ui/LoadingSpinner'
import { DuckDbQuery } from '../lib/query/duckdb'
import { resourceUrl, type Resource } from '../lib/datasets'

// <GeoQuery> — spatial SQL over a remote GeoParquet, rendered as a live overlay
// on a MapLibre map. DuckDB-Wasm (with the `spatial` extension) reads the file IN
// PLACE over HTTP range requests: a bbox-first WHERE prunes Parquet row groups via
// the file's column stats, then ST_Intersects refines to the exact predicate, so a
// query pulls a few MB out of an arbitrarily large file — no server, no download.
// Results are converted to GeoJSON (ST_AsGeoJSON) and drawn as a MapLibre GeoJSON
// overlay; the same rows are also available as a table and a quick chart.
//
// This is the QUERY tier for geometry — the geospatial analog of the DuckDB SQL
// editor (components/DataExplorer.tsx) — and composes with <MapPreview> (the
// render tier, PMTiles) when a dataset ships both artifacts.
//
// Import via next/dynamic with { ssr: false }: maplibre-gl and @duckdb/duckdb-wasm
// both touch browser globals, and the libraries load via dynamic import so the
// chunk lands in the browser only when a GeoParquet resource actually renders.

// Terracotta accent from tailwind.config.js (matches MapPreview).
const ACCENT = '#9d4a2c'
const GEOJSON_COL = 'geojson'
const MAX_RESULTS = 5000

// Default geometry / covering-bbox column names for the demo GeoParquet. A
// dataset with different names ships its own `resource.query` (which overrides
// the generated SQL entirely).
const GEOM = 'geometry'
const BBOX = 'bbox'

const BASE_CSS = `
.maplibregl-map{overflow:hidden;position:relative;-webkit-tap-highlight-color:rgba(0,0,0,0)}
.maplibregl-canvas-container{height:100%;width:100%}
.maplibregl-canvas{left:0;position:absolute;top:0}
.maplibregl-canvas-container.maplibregl-interactive{cursor:grab;user-select:none}
.maplibregl-canvas-container.maplibregl-interactive:active{cursor:grabbing}
`

function injectBaseCss() {
  const id = 'portaljs-geoquery-css'
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = BASE_CSS
  document.head.appendChild(style)
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

type Inspected = { lngLat: [number, number]; properties: Record<string, unknown> }
type ViewMode = 'map' | 'table' | 'chart'
type FeatureCollection = { type: 'FeatureCollection'; features: unknown[] }
type Output = {
  columns: string[]
  rows: Record<string, unknown>[]
  featureCollection: FeatureCollection | null
}

const WORLD: Bounds = { minX: -180, minY: -85, maxX: 180, maxY: 85 }

export default function GeoQuery({
  resource,
  mapAttribution,
}: {
  resource: Resource
  mapAttribution?: string
}) {
  const url = resourceUrl(resource)
  const engine = useMemo(() => new DuckDbQuery(), [url])

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  // Last FeatureCollection painted; re-applied on every 'styledata' so the overlay
  // survives a basemap style (re)load (initial + offline fallback).
  const lastFcRef = useRef<FeatureCollection | null>(null)
  const openedRef = useRef<Promise<void> | null>(null)

  const initialSql = resource.query ?? buildViewportSql(WORLD)
  const [draft, setDraft] = useState(initialSql)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ranged, setRanged] = useState(false)
  const [view, setView] = useState<ViewMode>('map')
  const [output, setOutput] = useState<Output>({ columns: [], rows: [], featureCollection: null })
  const [inspected, setInspected] = useState<Inspected | null>(null)
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)

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
    return { columns: tableCols, rows: tableRows, featureCollection: hasGeo ? { type: 'FeatureCollection', features } : null }
  }

  // Paint the query result as a MapLibre GeoJSON overlay (source + fill/line/circle
  // trio). Idempotent: updates source data on repeat calls, (re)creates layers
  // after a style (re)load. Remembers the last FeatureCollection so the overlay
  // survives the offline-basemap fallback swapping the style out.
  const paintOverlay = (fc: FeatureCollection | null) => {
    const map = mapRef.current
    if (!map) return
    lastFcRef.current = fc
    const data = fc ?? { type: 'FeatureCollection', features: [] }
    if (!map.isStyleLoaded()) return // 'styledata' re-runs this once loaded
    const src = map.getSource('portaljs-geoquery') as any
    if (src) {
      src.setData(data as any)
      return
    }
    map.addSource('portaljs-geoquery', { type: 'geojson', data: data as any })
    map.addLayer({ id: 'gq-fill', type: 'fill', source: 'portaljs-geoquery', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': ACCENT, 'fill-opacity': 0.22 } })
    map.addLayer({ id: 'gq-line', type: 'line', source: 'portaljs-geoquery', filter: ['!=', '$type', 'Point'], paint: { 'line-color': ACCENT, 'line-width': 1.1 } })
    map.addLayer({ id: 'gq-point', type: 'circle', source: 'portaljs-geoquery', filter: ['==', '$type', 'Point'], paint: { 'circle-color': ACCENT, 'circle-radius': 4, 'circle-stroke-color': '#fff', 'circle-stroke-width': 1 } })
  }

  const run = async (sql: string = draft) => {
    if (!openedRef.current) return
    setLoading(true)
    setError(null)
    try {
      await openedRef.current
      const res = await engine.query(sql)
      const out = toOutput(res.columns, res.rows)
      setOutput(out)
      paintOverlay(out.featureCollection)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const queryViewport = () => {
    const map = mapRef.current
    if (!map) return
    const b = map.getBounds()
    const sql = buildViewportSql({ minX: b.getWest(), minY: b.getSouth(), maxX: b.getEast(), maxY: b.getNorth() })
    setDraft(sql)
    setView('map')
    void run(sql)
  }

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    let map: MapLibreMap | undefined

    // Open the engine once (LOAD spatial + register the remote GeoParquet as `data`).
    openedRef.current = engine
      .open({ url, format: 'geoparquet', spatial: true })
      .then(() => {
        if (!cancelled) setRanged(engine.ranged)
      })

    ;(async () => {
      const maplibre = await import('maplibre-gl')
      if (cancelled || !containerRef.current) return
      const maplibregl = maplibre.default
      injectBaseCss()

      const offlineStyle: StyleSpecification = {
        version: 8,
        sources: {},
        layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#ece7db' } }],
      }

      try {
        map = new maplibregl.Map({
          container: containerRef.current,
          style: 'https://demotiles.maplibre.org/style.json',
          center: [0, 20],
          zoom: 1,
          attributionControl: false,
        })
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not initialize the map.')
          setLoading(false)
        }
        return
      }
      mapRef.current = map

      let degraded = false
      map.on('error', (e: { error?: Error }) => {
        const message = e.error?.message ?? ''
        if (!degraded && !map?.isStyleLoaded() && /fetch|network|ajax/i.test(message)) {
          degraded = true
          map?.setStyle(offlineStyle)
        }
      })

      // Re-apply the overlay whenever a style finishes loading (initial + the
      // offline fallback both drop previously-added sources).
      map.on('styledata', () => {
        if (lastFcRef.current !== null || map?.getSource('portaljs-geoquery')) {
          paintOverlay(lastFcRef.current)
        }
      })

      // Click-to-inspect: a MapLibre click → DuckDB exact point-in-polygon → the
      // FULL attribute row (not just the columns the overlay query selected).
      map.on('click', async (e: MapMouseEvent) => {
        try {
          await openedRef.current
          const sql =
            `SELECT * EXCLUDE ("${GEOM}", "${BBOX}") FROM data ` +
            `WHERE ST_Intersects("${GEOM}", ST_Point(${e.lngLat.lng}, ${e.lngLat.lat})) LIMIT 1`
          const res = await engine.query(sql)
          if (!res.rows.length) {
            setInspected(null)
            return
          }
          setInspected({ lngLat: [e.lngLat.lng, e.lngLat.lat], properties: res.rows[0] })
          setAnchor({ x: e.point.x, y: e.point.y })
        } catch {
          /* a failed inspect lookup must not surface as a fatal error */
        }
      })

      map.once('load', () => {
        if (cancelled) return
        setReady(true)
        void run(initialSql)
      })
    })().catch((e) => {
      if (!cancelled) {
        setError(e instanceof Error ? e.message : 'Failed to load the map libraries.')
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      mapRef.current = null
      lastFcRef.current = null
      void engine.close()
      map?.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, url])

  // Keep the inspect popup glued to its geographic anchor while panning/zooming.
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

  const inspectEntries = inspected ? Object.entries(inspected.properties) : []

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
          Spatial query (SQL)
        </span>
        {ranged && (
          <span
            title="GeoParquet queried in place over HTTP range requests — the bbox pre-filter prunes row groups, so only the bytes a query touches are fetched, never the whole file."
            className="border border-accent/50 px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.06em] text-accent"
          >
            queried in place · range requests
          </span>
        )}
      </div>

      <div className="border border-ink/[0.18]">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') void run()
          }}
          rows={5}
          spellCheck={false}
          disabled={!ready}
          className="block w-full resize-y border-0 bg-cream-code px-4 py-4 font-mono text-[13.5px] leading-relaxed text-ink focus:outline-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/[0.15] px-4 py-2.5">
          <span className="font-mono text-[11px] text-ink/40">
            DuckDB-Wasm + spatial · runs in your browser · ⌘/Ctrl + Enter
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={queryViewport}
              disabled={!ready || loading}
              title="Rewrite the query to the current map viewport (bbox pre-filter → ST_Intersects)"
              className="border border-ink/25 px-[14px] py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.06em] text-ink hover:border-accent hover:text-accent disabled:opacity-50"
            >
              Query viewport
            </button>
            <button
              type="button"
              onClick={() => void run()}
              disabled={!ready || loading}
              className="bg-accent px-[18px] py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.06em] text-cream hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Running…' : 'Run ▶'}
            </button>
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {(['map', 'table', 'chart'] as ViewMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setView(m)}
            className={`border px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] ${
              view === m ? 'border-accent bg-accent text-cream' : 'border-ink/20 bg-cream text-ink/70 hover:text-accent'
            }`}
          >
            {m}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-ink/40">{output.rows.length} rows</span>
      </div>

      {error && (
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap border border-red-300 bg-red-50 p-3 font-mono text-sm text-red-700">
          {error}
        </pre>
      )}

      {/* Map view — always mounted (the map lives here); hidden when another view is active. */}
      <div
        className="relative mt-3 w-full overflow-hidden"
        style={{ height: 480, background: '#ece7db', display: view === 'map' ? 'block' : 'none' }}
      >
        <div ref={containerRef} className="h-full w-full" />

        {loading && (
          <div className="pointer-events-none absolute left-3 top-3 z-[2] bg-cream/80 px-2 py-1 font-mono text-[11px] text-ink/60">
            querying…
          </div>
        )}

        <div className="absolute right-2.5 top-2.5 z-[2] flex flex-col gap-px">
          {[
            { label: '+', title: 'Zoom in', delta: 1 },
            { label: '−', title: 'Zoom out', delta: -1 },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              aria-label={b.title}
              title={b.title}
              onClick={() => zoomBy(b.delta)}
              className="h-7 w-7 border border-ink/25 bg-white text-base leading-[26px] text-ink"
            >
              {b.label}
            </button>
          ))}
        </div>

        {inspected && anchor && (
          <div
            className="absolute z-[3] max-h-[220px] max-w-[280px] overflow-auto border border-ink/20 bg-white px-2.5 py-2 shadow-md"
            style={{ left: anchor.x, top: anchor.y, transform: 'translate(-50%, calc(-100% - 10px))' }}
          >
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <strong className="font-sans text-[11px] uppercase tracking-[0.05em]">Feature</strong>
              <button type="button" aria-label="Close" onClick={() => setInspected(null)} className="text-ink/50">
                ×
              </button>
            </div>
            {inspectEntries.length === 0 ? (
              <div className="italic text-ink/50">No properties</div>
            ) : (
              <table className="w-full border-collapse text-[12px]">
                <tbody>
                  {inspectEntries.map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-0.5 pr-2 align-top text-ink/50">{k}</td>
                      <td className="break-words py-0.5">{formatCell(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {mapAttribution && (
          <div className="absolute bottom-0 right-0 z-[2] bg-white/75 px-1.5 py-0.5 font-sans text-[10px] text-ink/70">
            {mapAttribution}
          </div>
        )}
      </div>

      {view === 'table' && <ResultTable columns={output.columns} rows={output.rows} loading={loading} />}
      {view === 'chart' && <ResultChart columns={output.columns} rows={output.rows} />}

      <p className="mt-2 font-sans text-xs text-ink/45">
        Pan/zoom the map, then “Query viewport” to fetch only the features in view — the bbox pre-filter prunes
        Parquet row groups before ST_Intersects runs. Click a feature for its full attributes (a DuckDB
        point-in-polygon lookup).
      </p>
    </div>
  )
}

function ResultTable({
  columns,
  rows,
  loading,
}: {
  columns: string[]
  rows: Record<string, unknown>[]
  loading: boolean
}) {
  if (loading && rows.length === 0) return <LoadingSpinner />
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
