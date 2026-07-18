import React, { useEffect, useRef, useState } from "react";
import type {
  Map as MapLibreMap,
  MapMouseEvent,
  StyleSpecification,
  LngLatBoundsLike,
} from "maplibre-gl";

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
   * Authoritative data extent [minLon, minLat, maxLon, maxLat] (e.g. from
   * dataset metadata / DCAT spatial). Wins over the PMTiles header bounds for
   * the initial framing and the reset-to-extent control. Ignored when an
   * explicit center/zoom is pinned.
   */
  bbox?: [number, number, number, number];
  /**
   * Basemap style: a MapLibre style JSON URL, or `false` for a plain
   * background (fully offline — no external requests). Defaults to the free,
   * keyless Carto Positron style served by OpenFreeMap — light, neutral
   * greys/whites so the data layer reads first; if it fails to load the map
   * degrades to the plain background so the data layer always renders.
   */
  basemap?: string | false;
  /** Accent color for the rendered features. */
  color?: string;
  /** CSS height of the map container. */
  height?: string | number;
  /** Attribution line rendered bottom-right (set to match your data source). */
  attribution?: string;
}

const DEFAULT_BASEMAP = "https://tiles.openfreemap.org/styles/positron";
const DEFAULT_COLOR = "#2f6f4f";

// Basemap credit for the default style — the OpenFreeMap/Carto style is built
// from OpenStreetMap data, whose licence requires attribution. Appended before
// the data-source credit from the `attribution` prop; not shown for a custom
// or disabled basemap (the consumer owns attribution there).
const BASEMAP_ATTRIBUTION = "© OpenStreetMap · Carto";

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
.maplibregl-ctrl-bottom-left{position:absolute;bottom:0;left:0;z-index:2;pointer-events:none}
.maplibregl-ctrl-scale{background:rgba(255,255,255,0.75);border:1px solid rgba(0,0,0,0.25);border-top:none;color:#333;font:10px/1.4 ui-sans-serif,system-ui,sans-serif;padding:1px 5px;white-space:nowrap}
`;

function injectBaseCss() {
  const id = "portaljs-map-preview-css";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = BASE_CSS;
  document.head.appendChild(style);
}

// Rough initial zoom for a lon/lat span, so the map opens framed on the data
// (never the world view) before the precise fitBounds on load. Derived from the
// Web-Mercator relationship zoom ≈ log2(360 / span); clamped to sane bounds.
function zoomForSpan(lonSpan: number, latSpan: number): number {
  const span = Math.max(lonSpan, latSpan, 1e-6);
  const z = Math.log2(360 / span) - 0.5;
  return Math.min(16, Math.max(1, z));
}

// The heatmap density ramp needs rgba() stops built from the accent color.
// Parses #rgb/#rrggbb; any other color format falls back to the default
// accent's channels so the ramp still renders.
function rgbaFromColor(color: string, alpha: number): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  const hex = m
    ? m[1].length === 3
      ? m[1].split("").map((c) => c + c).join("")
      : m[1]
    : DEFAULT_COLOR.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
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
  bbox,
  basemap = DEFAULT_BASEMAP,
  color = DEFAULT_COLOR,
  height = 480,
  attribution,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  // Data extent to (re)frame on — set once the map is up. Backs the
  // "reset to data extent" control.
  const boundsRef = useRef<LngLatBoundsLike | null>(null);
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

      // The caller-supplied bbox wins (authoritative metadata), else the
      // archive header bounds.
      const extent: [number, number, number, number] | null =
        bbox ??
        (header.maxLon > header.minLon
          ? [header.minLon, header.minLat, header.maxLon, header.maxLat]
          : null);
      if (extent) {
        boundsRef.current = [
          [extent[0], extent[1]],
          [extent[2], extent[3]],
        ];
      }

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
          // Open framed on the data (never the world) even before the precise
          // fitBounds on load fires.
          center:
            center ??
            (extent
              ? [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]
              : [0, 0]),
          zoom:
            zoom ??
            (extent
              ? zoomForSpan(extent[2] - extent[0], extent[3] - extent[1])
              : 1),
          attributionControl: false,
        });
      } catch (e) {
        // Most commonly WebGL being unavailable (old hardware, disabled in
        // the browser) — say so instead of a generic failure.
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not initialize the map.");
        return;
      }
      mapRef.current = map;

      // Stock scale bar (bottom-left), styled by BASE_CSS above.
      map.addControl(
        new maplibregl.ScaleControl({ maxWidth: 90, unit: "metric" }),
        "bottom-left"
      );

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

      // Clickable layers only — the heatmap layer is a density surface, not a
      // per-feature layer, so it stays out of the inspect targets.
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
        // Each source-layer gets a geometry-aware stack; tippecanoe layers can
        // mix types, so every layer is filtered by geometry and only paints
        // what it actually contains.
        for (const layer of vectorLayers) {
          if (map.getLayer(`portaljs-preview-fill/${layer.id}`)) continue;
          // --- Polygons: semi-transparent fill + thin stroke ---
          map.addLayer({
            id: `portaljs-preview-fill/${layer.id}`,
            type: "fill",
            source: "portaljs-preview",
            "source-layer": layer.id,
            filter: ["==", "$type", "Polygon"],
            paint: { "fill-color": color, "fill-opacity": 0.22 },
          });
          // --- Lines (and polygon outlines): thin stroke, no fill ---
          map.addLayer({
            id: `portaljs-preview-line/${layer.id}`,
            type: "line",
            source: "portaljs-preview",
            "source-layer": layer.id,
            filter: ["!=", "$type", "Point"],
            paint: { "line-color": color, "line-width": 1.1 },
          });
          // --- Points, low zoom: heatmap so a large layer (e.g. 376k trees)
          //     reads as density instead of a solid mass of dots. Fades out as
          //     the circles fade in around z12. ---
          map.addLayer({
            id: `portaljs-preview-heat/${layer.id}`,
            type: "heatmap",
            source: "portaljs-preview",
            "source-layer": layer.id,
            filter: ["==", "$type", "Point"],
            maxzoom: 13,
            paint: {
              "heatmap-weight": 0.6,
              "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 0.6, 12, 1.4],
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 12, 12, 22],
              // Transparent → accent ramp so density reads on the light basemap.
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0, rgbaFromColor(color, 0),
                0.2, rgbaFromColor(color, 0.25),
                0.5, rgbaFromColor(color, 0.55),
                1, rgbaFromColor(color, 0.85),
              ],
              // Fade the heatmap out over z11→13 as the circle layer fades in.
              "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0.9, 13, 0],
            },
          });
          // --- Points, high zoom: small graduated circles (never fixed-radius
          //     dots at city extent). Radius + opacity grow with zoom. ---
          map.addLayer({
            id: `portaljs-preview-point/${layer.id}`,
            type: "circle",
            source: "portaljs-preview",
            "source-layer": layer.id,
            filter: ["==", "$type", "Point"],
            minzoom: 11,
            paint: {
              "circle-color": color,
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 1.5, 14, 3, 17, 6],
              "circle-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0.5, 14, 0.85],
              "circle-stroke-color": "#ffffff",
              // Hairline stroke only once circles are big enough to carry it.
              "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 13, 0, 15, 1],
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
        // Frame the resolved data extent precisely (bbox prop, else header)
        // unless the caller pinned an explicit view.
        if (!center && zoom === undefined && boundsRef.current) {
          map.fitBounds(boundsRef.current, { padding: 24, duration: 0 });
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
      boundsRef.current = null;
      map?.remove();
    };
    // The map is fully rebuilt when the archive or view config changes.
  }, [
    url,
    basemap,
    color,
    center?.[0],
    center?.[1],
    zoom,
    bbox?.[0],
    bbox?.[1],
    bbox?.[2],
    bbox?.[3],
  ]);

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

  const resetExtent = () => {
    const map = mapRef.current;
    if (!map || !boundsRef.current) return;
    map.fitBounds(boundsRef.current, { padding: 24, duration: 400 });
  };

  const entries = inspected ? Object.entries(inspected.properties) : [];

  // Basemap credit is only asserted for the default style (whose licence we
  // know); a custom basemap's attribution is the consumer's to provide.
  const attributionLine =
    basemap === DEFAULT_BASEMAP
      ? attribution
        ? `${BASEMAP_ATTRIBUTION} · ${attribution}`
        : BASEMAP_ATTRIBUTION
      : attribution;

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
        <button
          type="button"
          aria-label="Reset to data extent"
          title="Reset to data extent"
          onClick={resetExtent}
          style={{
            width: 28,
            height: 28,
            border: "1px solid rgba(0,0,0,0.25)",
            background: "#fff",
            color: "#222",
            fontSize: 13,
            lineHeight: "26px",
            cursor: "pointer",
            padding: 0,
            marginTop: 1,
          }}
        >
          {/* framing-corners glyph — "fit to extent" */}
          ⤢
        </button>
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

      {attributionLine && (
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
          {attributionLine}
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
