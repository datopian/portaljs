import React, { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, MapMouseEvent, StyleSpecification } from "maplibre-gl";

// <MapPreview> — serverless preview of any-size vector tileset stored as a
// single PMTiles archive on R2 / any static HTTP host. MapLibre GL fetches
// only the tiles in view via HTTP range requests (the pmtiles protocol), so a
// multi-GB dataset pans and zooms without a tile server.
//
// SSR-safe by construction: maplibre-gl and pmtiles touch `window`/`document`
// at module scope, so both are loaded with dynamic import() inside useEffect —
// the component renders an empty shell on the server and hydrates the map in
// the browser. No next/dynamic wrapper is required (but consumers may still
// use one to defer the chunk).

export interface MapPreviewProps {
  /** URL of the .pmtiles archive (absolute, or relative to the page origin). */
  url: string;
  /** Initial view. When omitted the map auto-fits the tileset bounds from the PMTiles header. */
  center?: [number, number];
  zoom?: number;
  /**
   * Basemap style: a MapLibre style JSON URL, or `false` for a plain
   * background (fully offline — no external requests). Defaults to the free,
   * keyless MapLibre demo tiles style; if it fails to load the map degrades
   * to the plain background so the data layer always renders.
   */
  basemap?: string | false;
  /** Accent color for the rendered features. */
  color?: string;
  /** CSS height of the map container. */
  height?: string | number;
  /** Attribution line rendered bottom-right (set to match your data source). */
  attribution?: string;
}

const DEFAULT_BASEMAP = "https://demotiles.maplibre.org/style.json";
const DEFAULT_COLOR = "#2f6f4f";

// The handful of maplibre-gl.css rules the map canvas actually needs to lay
// out correctly. Inlined so consumers don't have to wire a global CSS import
// through their bundler (the full stylesheet mostly styles controls/popups,
// which this component replaces with its own React overlays).
const BASE_CSS = `
.maplibregl-map{overflow:hidden;position:relative;-webkit-tap-highlight-color:rgba(0,0,0,0)}
.maplibregl-canvas-container{height:100%;width:100%}
.maplibregl-canvas{left:0;position:absolute;top:0}
.maplibregl-map:fullscreen{height:100%;width:100%}
.maplibregl-canvas-container.maplibregl-interactive{cursor:grab;user-select:none}
.maplibregl-canvas-container.maplibregl-interactive:active{cursor:grabbing}
`;

function injectBaseCss() {
  const id = "portaljs-map-preview-css";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = BASE_CSS;
  document.head.appendChild(style);
}

// A clicked feature held for the inspect popup: geographic anchor + properties.
interface Inspected {
  lngLat: [number, number];
  properties: Record<string, unknown>;
  sourceLayer: string;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  url,
  center,
  zoom,
  basemap = DEFAULT_BASEMAP,
  color = DEFAULT_COLOR,
  height = 480,
  attribution,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inspected, setInspected] = useState<Inspected | null>(null);
  // Pixel position of the popup anchor, re-projected on every map move.
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let map: MapLibreMap | undefined;

    (async () => {
      // Client-only libraries — see the SSR note in the component docblock.
      const [maplibre, pmtiles] = await Promise.all([
        import("maplibre-gl"),
        import("pmtiles"),
      ]);
      if (cancelled || !containerRef.current) return;
      const maplibregl = maplibre.default;

      injectBaseCss();

      // The pmtiles:// protocol is process-wide in maplibre; register it once.
      const anyGl = maplibregl as unknown as {
        __portaljsPmtilesProtocol?: boolean;
      };
      if (!anyGl.__portaljsPmtilesProtocol) {
        maplibregl.addProtocol("pmtiles", new pmtiles.Protocol().tile);
        anyGl.__portaljsPmtilesProtocol = true;
      }

      // Normalize a relative archive path against the page origin — the tile
      // URLs below must be absolute inside the pmtiles:// wrapper.
      const absoluteUrl = new URL(url, window.location.href).toString();

      // Read the archive header + embedded metadata up front: the header gives
      // the tileset bounds/zoom range (for auto-fit), the metadata lists the
      // vector layers tippecanoe wrote (each needs its own style layers).
      const archive = new pmtiles.PMTiles(absoluteUrl);
      let header: Awaited<ReturnType<typeof archive.getHeader>>;
      let vectorLayers: { id: string }[];
      try {
        header = await archive.getHeader();
        const metadata = (await archive.getMetadata()) as {
          vector_layers?: { id: string }[];
        };
        vectorLayers = metadata?.vector_layers ?? [];
      } catch {
        if (!cancelled) setError(`Could not read PMTiles archive at ${url}`);
        return;
      }
      if (cancelled || !containerRef.current) return;

      const offlineStyle: StyleSpecification = {
        version: 8,
        sources: {},
        layers: [
          { id: "background", type: "background", paint: { "background-color": "#e6e2d8" } },
        ],
      };

      try {
        map = new maplibregl.Map({
          container: containerRef.current,
          style: basemap === false ? offlineStyle : basemap,
          center: center ?? [
            (header.minLon + header.maxLon) / 2,
            (header.minLat + header.maxLat) / 2,
          ],
          zoom: zoom ?? 1,
          attributionControl: false,
        });
      } catch (e) {
        // Most commonly WebGL being unavailable (old hardware, disabled in
        // the browser) — say so instead of a generic failure.
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not initialize the map.");
        return;
      }
      mapRef.current = map;

      // A missing/unreachable basemap must never take the data layer down
      // with it: swap to the offline background and carry on. Match only
      // network-shaped failures before the style is up — internal maplibre
      // errors (e.g. "Style is not done loading") must NOT trigger it.
      let degraded = false;
      map.on("error", (e: { error?: Error & { status?: number } }) => {
        const message = e.error?.message ?? "";
        if (
          !degraded &&
          basemap !== false &&
          !map?.isStyleLoaded() &&
          /fetch|network|ajax/i.test(message)
        ) {
          degraded = true;
          map?.setStyle(offlineStyle);
        }
      });

      const layerIds = [
        "portaljs-preview-fill",
        "portaljs-preview-line",
        "portaljs-preview-point",
      ];

      const addDataLayers = () => {
        // 'styledata' fires repeatedly while a style is still loading, and
        // addSource/addLayer throw until it finishes — wait for the real thing.
        if (!map || !map.isStyleLoaded()) return;
        if (!map.getSource("portaljs-preview")) {
          map.addSource("portaljs-preview", {
            type: "vector",
            url: `pmtiles://${absoluteUrl}`,
          });
        }
        for (const layer of vectorLayers) {
          if (map.getLayer(`portaljs-preview-fill/${layer.id}`)) continue;
          // Sensible defaults per geometry type; tippecanoe layers can mix
          // types, so each source-layer gets a fill/line/point trio filtered
          // by geometry.
          map.addLayer({
            id: `portaljs-preview-fill/${layer.id}`,
            type: "fill",
            source: "portaljs-preview",
            "source-layer": layer.id,
            filter: ["==", "$type", "Polygon"],
            paint: { "fill-color": color, "fill-opacity": 0.22 },
          });
          map.addLayer({
            id: `portaljs-preview-line/${layer.id}`,
            type: "line",
            source: "portaljs-preview",
            "source-layer": layer.id,
            filter: ["!=", "$type", "Point"],
            paint: { "line-color": color, "line-width": 1.1 },
          });
          map.addLayer({
            id: `portaljs-preview-point/${layer.id}`,
            type: "circle",
            source: "portaljs-preview",
            "source-layer": layer.id,
            filter: ["==", "$type", "Point"],
            paint: {
              "circle-color": color,
              "circle-radius": 4,
              "circle-opacity": 0.85,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 1,
            },
          });
        }
      };

      // (Re-)add the data layers whenever a style finishes loading — covers
      // the initial load and the offline-fallback setStyle above.
      map.on("load", addDataLayers);
      map.on("styledata", addDataLayers);

      map.once("load", () => {
        if (!map) return;
        // Auto-fit the tileset bounds from the PMTiles header unless the
        // caller pinned an explicit view.
        if (!center && zoom === undefined && header.maxLon > header.minLon) {
          map.fitBounds(
            [
              [header.minLon, header.minLat],
              [header.maxLon, header.maxLat],
            ],
            { padding: 24, duration: 0 }
          );
        }
      });

      const previewLayerIds = () =>
        vectorLayers.flatMap((l) => layerIds.map((p) => `${p}/${l.id}`)).filter((id) => map?.getLayer(id));

      // Click-to-inspect: surface the clicked feature's properties (tippecanoe
      // preserves source attributes) in a popup anchored to the click point.
      map.on("click", (e: MapMouseEvent) => {
        if (!map) return;
        const features = map.queryRenderedFeatures(e.point, { layers: previewLayerIds() });
        const f = features[0];
        if (!f) {
          setInspected(null);
          return;
        }
        setInspected({
          lngLat: [e.lngLat.lng, e.lngLat.lat],
          properties: (f.properties ?? {}) as Record<string, unknown>,
          sourceLayer: (f as unknown as { sourceLayer?: string }).sourceLayer ?? "",
        });
        setAnchor({ x: e.point.x, y: e.point.y });
      });

      map.on("mousemove", (e: MapMouseEvent) => {
        if (!map) return;
        const hit = map.queryRenderedFeatures(e.point, { layers: previewLayerIds() }).length > 0;
        map.getCanvas().style.cursor = hit ? "pointer" : "";
      });
    })().catch(() => {
      if (!cancelled) setError("Failed to load the map libraries.");
    });

    return () => {
      cancelled = true;
      mapRef.current = null;
      map?.remove();
    };
    // The map is fully rebuilt when the archive or view config changes.
  }, [url, basemap, color, center?.[0], center?.[1], zoom]);

  // Keep the popup glued to its geographic anchor while the user pans/zooms.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !inspected) return;
    const reproject = () => {
      const p = map.project(inspected.lngLat);
      setAnchor({ x: p.x, y: p.y });
    };
    reproject();
    map.on("move", reproject);
    return () => {
      map.off("move", reproject);
    };
  }, [inspected]);

  const zoomBy = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.zoomTo(map.getZoom() + delta, { duration: 200 });
  };

  const entries = inspected ? Object.entries(inspected.properties) : [];

  return (
    <div
      style={{
        position: "relative",
        height,
        width: "100%",
        overflow: "hidden",
        background: "#e6e2d8",
      }}
    >
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {/* Zoom controls (custom, so the component needs none of maplibre's control CSS). */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          zIndex: 2,
        }}
      >
        {[
          { label: "+", title: "Zoom in", delta: 1 },
          { label: "−", title: "Zoom out", delta: -1 },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            aria-label={b.title}
            title={b.title}
            onClick={() => zoomBy(b.delta)}
            style={{
              width: 28,
              height: 28,
              border: "1px solid rgba(0,0,0,0.25)",
              background: "#fff",
              color: "#222",
              fontSize: 16,
              lineHeight: "26px",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Click-to-inspect popup. */}
      {inspected && anchor && (
        <div
          style={{
            position: "absolute",
            left: anchor.x,
            top: anchor.y,
            transform: "translate(-50%, calc(-100% - 10px))",
            zIndex: 3,
            maxWidth: 280,
            maxHeight: 220,
            overflow: "auto",
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            padding: "8px 10px",
            fontSize: 12,
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <strong style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {inspected.sourceLayer || "Feature"}
            </strong>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setInspected(null)}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
                padding: 0,
                color: "#666",
              }}
            >
              ×
            </button>
          </div>
          {entries.length === 0 ? (
            <div style={{ color: "#666", fontStyle: "italic" }}>No properties</div>
          ) : (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <tbody>
                {entries.map(([k, v]) => (
                  <tr key={k}>
                    <td
                      style={{
                        padding: "2px 8px 2px 0",
                        color: "#666",
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {k}
                    </td>
                    <td style={{ padding: "2px 0", wordBreak: "break-word" }}>{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {attribution && (
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            zIndex: 2,
            background: "rgba(255,255,255,0.75)",
            padding: "2px 6px",
            fontSize: 10,
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
            color: "#333",
          }}
        >
          {attribution}
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 4,
            background: "rgba(230,226,216,0.9)",
            color: "#444",
            fontSize: 13,
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
            padding: 16,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
