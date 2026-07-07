import { useEffect, useRef, useState } from 'react'
import type { Map as MapLibreMap, MapMouseEvent, StyleSpecification } from 'maplibre-gl'

// Serverless map preview for a PMTiles resource. MapLibre GL reads the single
// .pmtiles archive straight from its URL (bundled /data file, R2, any static
// host) via HTTP range requests — only the tiles in view are fetched, so a
// multi-GB dataset pans and zooms with no tile server. Import via next/dynamic
// with { ssr: false }: maplibre-gl touches `window` at module scope, and the
// libraries below are dynamic-imported so the chunk loads in the browser only
// when a map actually renders (flat portals never pay for it).
//
// Make PMTiles from GeoJSON/Shapefile with tippecanoe (see README "Maps"):
//   tippecanoe -zg --drop-densest-as-needed -o out.pmtiles in.geojson

// Terracotta accent from tailwind.config.js (oklch(0.48 0.12 40)) — MapLibre
// paint needs a literal color, not a Tailwind class.
const ACCENT = '#9d4a2c'

// Free, keyless basemap style. Loaded at runtime in the browser only; if it is
// unreachable the map falls back to a plain background and still renders the
// data layer, so previews (and offline dev) never break on the basemap.
const BASEMAP_STYLE = 'https://demotiles.maplibre.org/style.json'

// The handful of maplibre-gl.css rules the canvas needs to lay out correctly,
// inlined so no global CSS import has to be wired through next.config. The
// stock stylesheet mostly styles controls/popups, which this component
// replaces with its own overlays.
const BASE_CSS = `
.maplibregl-map{overflow:hidden;position:relative;-webkit-tap-highlight-color:rgba(0,0,0,0)}
.maplibregl-canvas-container{height:100%;width:100%}
.maplibregl-canvas{left:0;position:absolute;top:0}
.maplibregl-canvas-container.maplibregl-interactive{cursor:grab;user-select:none}
.maplibregl-canvas-container.maplibregl-interactive:active{cursor:grabbing}
`

function injectBaseCss() {
  const id = 'portaljs-map-preview-css'
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = BASE_CSS
  document.head.appendChild(style)
}

type Inspected = {
  lngLat: [number, number]
  properties: Record<string, unknown>
  sourceLayer: string
}

export default function MapPreview({
  url,
  attribution,
}: {
  url: string
  attribution?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [inspected, setInspected] = useState<Inspected | null>(null)
  // Pixel position of the popup, re-projected from lngLat on every map move.
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    let map: MapLibreMap | undefined

    ;(async () => {
      const [maplibre, pmtiles] = await Promise.all([
        import('maplibre-gl'),
        import('pmtiles'),
      ])
      if (cancelled || !containerRef.current) return
      const maplibregl = maplibre.default

      injectBaseCss()

      // The pmtiles:// protocol is registered process-wide in maplibre — once.
      const gl = maplibregl as unknown as { __pmtilesProtocol?: boolean }
      if (!gl.__pmtilesProtocol) {
        maplibregl.addProtocol('pmtiles', new pmtiles.Protocol().tile)
        gl.__pmtilesProtocol = true
      }

      // Tile URLs inside the pmtiles:// wrapper must be absolute, so resolve
      // the bundled /data/<file> path against the page origin.
      const absoluteUrl = new URL(url, window.location.href).toString()

      // The archive header carries the tileset bounds (for auto-fit) and the
      // embedded metadata lists the vector layers tippecanoe wrote.
      const archive = new pmtiles.PMTiles(absoluteUrl)
      let header: Awaited<ReturnType<typeof archive.getHeader>>
      let vectorLayers: { id: string }[]
      try {
        header = await archive.getHeader()
        const metadata = (await archive.getMetadata()) as {
          vector_layers?: { id: string }[]
        }
        vectorLayers = metadata?.vector_layers ?? []
      } catch {
        if (!cancelled) {
          setError(`Could not read the PMTiles archive at ${url}.`)
          setLoading(false)
        }
        return
      }
      if (cancelled || !containerRef.current) return

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
          center: [
            (header.minLon + header.maxLon) / 2,
            (header.minLat + header.maxLat) / 2,
          ],
          zoom: 1,
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
        if (!map.getSource('preview')) {
          map.addSource('preview', { type: 'vector', url: `pmtiles://${absoluteUrl}` })
        }
        // Each source-layer gets a fill/line/point trio filtered by geometry
        // type — sensible defaults whatever the tileset contains.
        for (const layer of vectorLayers) {
          if (map.getLayer(`preview-fill/${layer.id}`)) continue
          map.addLayer({
            id: `preview-fill/${layer.id}`,
            type: 'fill',
            source: 'preview',
            'source-layer': layer.id,
            filter: ['==', '$type', 'Polygon'],
            paint: { 'fill-color': ACCENT, 'fill-opacity': 0.22 },
          })
          map.addLayer({
            id: `preview-line/${layer.id}`,
            type: 'line',
            source: 'preview',
            'source-layer': layer.id,
            filter: ['!=', '$type', 'Point'],
            paint: { 'line-color': ACCENT, 'line-width': 1.1 },
          })
          map.addLayer({
            id: `preview-point/${layer.id}`,
            type: 'circle',
            source: 'preview',
            'source-layer': layer.id,
            filter: ['==', '$type', 'Point'],
            paint: {
              'circle-color': ACCENT,
              'circle-radius': 4,
              'circle-opacity': 0.85,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 1,
            },
          })
        }
      }

      // (Re-)add the data layers whenever a style finishes loading — covers
      // both the initial basemap and the offline fallback setStyle above.
      map.on('load', addDataLayers)
      map.on('styledata', addDataLayers)

      map.once('load', () => {
        if (!map) return
        setLoading(false)
        // Frame the tileset from the PMTiles header bounds.
        if (header.maxLon > header.minLon) {
          map.fitBounds(
            [
              [header.minLon, header.minLat],
              [header.maxLon, header.maxLat],
            ],
            { padding: 24, duration: 0 }
          )
        }
      })

      const previewLayerIds = () =>
        vectorLayers
          .flatMap((l) => [`preview-fill/${l.id}`, `preview-line/${l.id}`, `preview-point/${l.id}`])
          .filter((id) => map?.getLayer(id))

      // Click-to-inspect: tippecanoe preserves the source attributes on every
      // feature — surface them in a popup anchored to the click point.
      map.on('click', (e: MapMouseEvent) => {
        if (!map) return
        const feature = map.queryRenderedFeatures(e.point, { layers: previewLayerIds() })[0]
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
        const hit = map.queryRenderedFeatures(e.point, { layers: previewLayerIds() }).length > 0
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
      map?.remove()
    }
  }, [url])

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

  const entries = inspected ? Object.entries(inspected.properties) : []

  return (
    <div>
      <div className="mb-3.5 flex items-center gap-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
          Map preview
        </span>
        <span
          title="Vector tiles read from a single PMTiles archive over HTTP range requests — only the tiles in view are fetched, never the whole file."
          className="border border-accent/50 px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.06em] text-accent"
        >
          pmtiles · range requests
        </span>
      </div>

      <div className="relative h-[440px] w-full overflow-hidden border border-ink/[0.18] bg-cream-panel">
        {/* Sized with h/w-full, NOT absolute positioning: the injected
            .maplibregl-map rule sets position:relative, which would override
            Tailwind's `absolute` (same specificity, later in <head>) and
            collapse the div to zero height. */}
        <div ref={containerRef} className="h-full w-full" />

        {/* Zoom controls (custom, so none of maplibre's control CSS is needed). */}
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
        </div>

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
                        {String(v)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {attribution && (
          <div className="absolute bottom-0 right-0 z-[2] bg-cream/80 px-1.5 py-0.5 font-sans text-[10px] text-ink/60">
            {attribution}
          </div>
        )}

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

      <div className="mt-2 font-mono text-[11px] text-ink/40">
        Click a feature to inspect its properties · pan and zoom fetch only the tiles in view
      </div>
    </div>
  )
}
