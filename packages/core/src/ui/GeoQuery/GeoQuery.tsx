import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  Map as MapLibreMap,
  MapMouseEvent,
  StyleSpecification,
} from "maplibre-gl";

// <GeoQuery> — serverless spatial SQL over a remote GeoParquet, rendered as a
// live overlay on a MapLibre map. DuckDB-Wasm reads the GeoParquet IN PLACE over
// HTTP range requests (no server, no download): a bbox-first WHERE prunes Parquet
// row groups via the file's column statistics, then ST_Intersects refines to the
// exact predicate, so a query pulls a few MB out of an arbitrarily large file.
// Results are converted to GeoJSON (ST_AsGeoJSON) and drawn as a MapLibre GeoJSON
// overlay on top of the basemap; the same rows are also shown as a table and a
// quick bar chart. This is the QUERY tier of the GIS story — the analog of the
// CSV→Parquet + DuckDB-Wasm query view, for geometry — and composes with
// <MapPreview> (the render tier, PMTiles) on the same dataset.
//
// Overlay decode note: keep result sets small and let ST_AsGeoJSON run in DuckDB
// (the geometry decode is the slow path). For very large result sets, project to
// WKB / GeoArrow and decode with a GPU layer (e.g. deck.gl) instead of
// ST_AsGeoJSON-ing the whole set — see the README.
//
// SSR-safe by construction: maplibre-gl and @duckdb/duckdb-wasm both touch
// `window`/`Worker` at module scope, so both are loaded with dynamic import()
// inside useEffect — the component renders an empty shell on the server and
// hydrates the map + engine in the browser. Consumers may still wrap it in
// next/dynamic({ ssr: false }) to keep the chunk out of the server bundle.

export interface GeoQueryProps {
  /** URL of the GeoParquet file (absolute, or relative to the page origin). Must
   * be served with HTTP range requests + CORS (e.g. R2) for the no-download path. */
  url: string;
  /** Geometry column name in the file. DuckDB-spatial auto-decodes a GeoParquet
   * geometry column to the GEOMETRY type once `spatial` is loaded. */
  geometryColumn?: string;
  /** GeoParquet 1.1 "covering" bbox column — a STRUCT with xmin/ymin/xmax/ymax.
   * Used for the cheap row-group-pruning pre-filter before ST_Intersects. Pass
   * an empty string to disable the bbox pre-filter (ST_Intersects only). */
  bboxColumn?: string;
  /** A few attribute columns to select alongside the geometry (table + tooltip).
   * When omitted, every non-geometry / non-bbox column is selected. */
  columns?: string[];
  /** Starter SQL over the table `data`. When omitted a bbox-first viewport query
   * is generated. A query whose result includes a text column named `geojson`
   * (e.g. `ST_AsGeoJSON(geometry) AS geojson`) drives the map overlay; any other
   * result is shown as a table/chart only. */
  query?: string;
  /** Basemap style URL, or `false` for a plain background (fully offline). */
  basemap?: string | false;
  /** Accent color for the rendered features + chart bars. */
  color?: string;
  /** CSS height of the map container. */
  height?: string | number;
  center?: [number, number];
  zoom?: number;
  /** Attribution line rendered bottom-right. */
  attribution?: string;
  /** LIMIT applied to generated viewport queries (guards huge ST_AsGeoJSON). */
  maxResults?: number;
}

const DEFAULT_BASEMAP = "https://demotiles.maplibre.org/style.json";
const DEFAULT_COLOR = "#2f6f4f";
const DEFAULT_GEOM = "geometry";
const DEFAULT_BBOX = "bbox";
const DEFAULT_MAX = 5000;
const GEOJSON_COL = "geojson";

const BASE_CSS = `
.maplibregl-map{overflow:hidden;position:relative;-webkit-tap-highlight-color:rgba(0,0,0,0)}
.maplibregl-canvas-container{height:100%;width:100%}
.maplibregl-canvas{left:0;position:absolute;top:0}
.maplibregl-map:fullscreen{height:100%;width:100%}
.maplibregl-canvas-container.maplibregl-interactive{cursor:grab;user-select:none}
.maplibregl-canvas-container.maplibregl-interactive:active{cursor:grabbing}
`;

function injectBaseCss() {
  const id = "portaljs-geoquery-css";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = BASE_CSS;
  document.head.appendChild(style);
}

// SQL string literal (single-quote escaped). URLs/identifiers passed to DuckDB.
function sqlStr(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// The generated bbox-first viewport query: prune row groups on the covering bbox
// (cheap, uses Parquet stats), THEN refine with the exact ST_Intersects predicate
// (expensive, only on survivors), and emit GeoJSON for the overlay.
function buildViewportSql(
  b: Bounds,
  opts: { geom: string; bbox: string; columns: string[]; limit: number }
): string {
  const { geom, bbox, columns, limit } = opts;
  const select = columns.length ? columns.map((c) => `"${c}"`).join(", ") : "* EXCLUDE (" + `"${geom}"` + ")";
  const env = `ST_MakeEnvelope(${b.minX}, ${b.minY}, ${b.maxX}, ${b.maxY})`;
  const bboxFilter = bbox
    ? `"${bbox}".xmin <= ${b.maxX} AND "${bbox}".xmax >= ${b.minX} ` +
      `AND "${bbox}".ymin <= ${b.maxY} AND "${bbox}".ymax >= ${b.minY} AND `
    : "";
  return (
    `SELECT ${select}, ST_AsGeoJSON("${geom}") AS ${GEOJSON_COL}\n` +
    `FROM data\n` +
    `WHERE ${bboxFilter}ST_Intersects("${geom}", ${env})\n` +
    `LIMIT ${limit}`
  );
}

interface Inspected {
  lngLat: [number, number];
  properties: Record<string, unknown>;
}

type ViewMode = "map" | "table" | "chart";

// Rows returned from a query: the raw attribute records (geojson stripped) plus
// the parsed GeoJSON FeatureCollection for the overlay (null when the result has
// no `geojson` column).
interface QueryOutput {
  columns: string[];
  rows: Record<string, unknown>[];
  featureCollection: {
    type: "FeatureCollection";
    features: unknown[];
  } | null;
}

export const GeoQuery: React.FC<GeoQueryProps> = ({
  url,
  geometryColumn = DEFAULT_GEOM,
  bboxColumn = DEFAULT_BBOX,
  columns,
  query,
  basemap = DEFAULT_BASEMAP,
  color = DEFAULT_COLOR,
  height = 480,
  center,
  zoom,
  attribution,
  maxResults = DEFAULT_MAX,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  // The last FeatureCollection painted, re-applied whenever a style finishes
  // (re)loading — covers the offline-basemap fallback dropping the overlay source.
  const lastFcRef = useRef<QueryOutput["featureCollection"]>(null);
  // The DuckDB connection + a flag that the spatial view is ready to query.
  const connRef = useRef<any>(null);
  const dbRef = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("map");
  const [output, setOutput] = useState<QueryOutput>({
    columns: [],
    rows: [],
    featureCollection: null,
  });
  const [inspected, setInspected] = useState<Inspected | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  // The SQL currently in the editor. Seeded from `query`, or a whole-world
  // bbox-first query once we know the column defaults.
  const initialSql = useMemo(
    () =>
      query ??
      buildViewportSql(
        { minX: -180, minY: -85, maxX: 180, maxY: 85 },
        {
          geom: geometryColumn,
          bbox: bboxColumn,
          columns: columns ?? [],
          limit: maxResults,
        }
      ),
    [query, geometryColumn, bboxColumn, columns, maxResults]
  );
  const [draft, setDraft] = useState(initialSql);
  useEffect(() => setDraft(initialSql), [initialSql]);

  // Turn a query result into { table rows, FeatureCollection } — pulling out the
  // `geojson` column (if present) as the overlay geometry and coercing BigInt.
  const toOutput = (columnsOut: string[], rowsOut: Record<string, unknown>[]): QueryOutput => {
    const hasGeo = columnsOut.includes(GEOJSON_COL);
    const tableCols = columnsOut.filter((c) => c !== GEOJSON_COL);
    const features: unknown[] = [];
    const tableRows: Record<string, unknown>[] = [];
    for (const row of rowsOut) {
      const rec: Record<string, unknown> = {};
      for (const c of tableCols) {
        const v = row[c];
        rec[c] = typeof v === "bigint" ? Number(v) : v;
      }
      tableRows.push(rec);
      if (hasGeo && typeof row[GEOJSON_COL] === "string") {
        try {
          features.push({
            type: "Feature",
            geometry: JSON.parse(row[GEOJSON_COL] as string),
            properties: rec,
          });
        } catch {
          /* skip an unparseable geometry rather than fail the whole query */
        }
      }
    }
    return {
      columns: tableCols,
      rows: tableRows,
      featureCollection: hasGeo ? { type: "FeatureCollection", features } : null,
    };
  };

  // Run one query row-set through DuckDB and normalize it.
  const runQuery = async (sql: string): Promise<QueryOutput> => {
    const conn = connRef.current;
    if (!conn) throw new Error("Query engine is not ready");
    const table = await conn.query(sql);
    const cols: string[] = table.schema.fields.map((f: any) => f.name);
    const rows = table.toArray().map((r: any) => r.toJSON() as Record<string, unknown>);
    return toOutput(cols, rows);
  };

  // Paint the query result as a MapLibre GeoJSON overlay (a source + a
  // fill/line/circle layer trio, one filter per geometry type). Idempotent:
  // updates the source data on repeat calls, and (re)creates the layers after a
  // style (re)load. Remembers the last FeatureCollection so the overlay survives
  // the offline-basemap fallback swapping the style out from under it.
  const paintOverlay = (fc: QueryOutput["featureCollection"]) => {
    const map = mapRef.current;
    if (!map) return;
    lastFcRef.current = fc;
    const data = fc ?? { type: "FeatureCollection", features: [] };
    if (!map.isStyleLoaded()) return; // 'styledata' will re-run this once loaded
    const src = map.getSource("portaljs-geoquery") as any;
    if (src) {
      src.setData(data as any);
      return;
    }
    map.addSource("portaljs-geoquery", { type: "geojson", data: data as any });
    map.addLayer({
      id: "portaljs-geoquery-fill",
      type: "fill",
      source: "portaljs-geoquery",
      filter: ["==", "$type", "Polygon"],
      paint: { "fill-color": color, "fill-opacity": 0.24 },
    });
    map.addLayer({
      id: "portaljs-geoquery-line",
      type: "line",
      source: "portaljs-geoquery",
      filter: ["!=", "$type", "Point"],
      paint: { "line-color": color, "line-width": 1.1 },
    });
    map.addLayer({
      id: "portaljs-geoquery-point",
      type: "circle",
      source: "portaljs-geoquery",
      filter: ["==", "$type", "Point"],
      paint: {
        "circle-color": color,
        "circle-radius": 4,
        "circle-opacity": 0.85,
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 1,
      },
    });
  };

  // Run the editor's SQL, update the table/chart, and (when the result carries a
  // `geojson` column) repaint the overlay.
  const run = async (sql: string = draft) => {
    setLoading(true);
    setError(null);
    try {
      const out = await runQuery(sql);
      setOutput(out);
      paintOverlay(out.featureCollection);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  // Rewrite the editor query to the map's CURRENT viewport bounds and run it —
  // the headline "query only what you're looking at" interaction.
  const queryViewport = () => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    const sql = buildViewportSql(
      { minX: b.getWest(), minY: b.getSouth(), maxX: b.getEast(), maxY: b.getNorth() },
      { geom: geometryColumn, bbox: bboxColumn, columns: columns ?? [], limit: maxResults }
    );
    setDraft(sql);
    setView("map");
    void run(sql);
  };

  // --- init: map + DuckDB-spatial engine (both client-only) -----------------
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let map: MapLibreMap | undefined;

    (async () => {
      const [maplibre, duckdbMod] = await Promise.all([
        import("maplibre-gl"),
        import("@duckdb/duckdb-wasm"),
      ]);
      if (cancelled || !containerRef.current) return;
      const maplibregl = maplibre.default;
      injectBaseCss();

      const offlineStyle: StyleSpecification = {
        version: 8,
        sources: {},
        layers: [
          { id: "background", type: "background", paint: { "background-color": "#e6e2d8" } },
        ],
      };

      // --- map ---
      try {
        map = new maplibregl.Map({
          container: containerRef.current,
          style: basemap === false ? offlineStyle : basemap,
          center: center ?? [0, 20],
          zoom: zoom ?? 1,
          attributionControl: false,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not initialize the map.");
        return;
      }
      mapRef.current = map;

      // A missing basemap must never take the overlay down: swap to the offline
      // background on network-shaped style errors before the style is up.
      let degraded = false;
      map.on("error", (e: { error?: Error }) => {
        const message = e.error?.message ?? "";
        if (!degraded && basemap !== false && !map?.isStyleLoaded() && /fetch|network|ajax/i.test(message)) {
          degraded = true;
          map?.setStyle(offlineStyle);
        }
      });

      // Re-apply the overlay whenever a style finishes loading (initial load and
      // the offline-fallback setStyle both drop any previously-added sources).
      map.on("styledata", () => {
        if (lastFcRef.current !== null || map?.getSource("portaljs-geoquery")) {
          paintOverlay(lastFcRef.current);
        }
      });

      // --- DuckDB-Wasm + spatial ---
      let workerUrl: string | null = null;
      try {
        const bundles = duckdbMod.getJsDelivrBundles();
        const bundle = await duckdbMod.selectBundle(bundles);
        workerUrl = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" })
        );
        const worker = new Worker(workerUrl);
        const logger = new duckdbMod.ConsoleLogger(duckdbMod.LogLevel.WARNING);
        const db = new duckdbMod.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        const conn = await db.connect();
        workerRef.current = worker;
        dbRef.current = db;
        connRef.current = conn;

        // The spatial extension gives ST_*; it loads in WASM from the extension
        // repository. Once loaded, read_parquet auto-decodes the GeoParquet
        // geometry column to the GEOMETRY type.
        await conn.query("INSTALL spatial; LOAD spatial;");

        // Register the remote file over HTTP and expose it as the VIEW `data` so
        // projection + predicate pushdown reach the file over range requests —
        // directIO=true reads it in place (footer + touched row groups only),
        // never downloading the whole file.
        const absoluteUrl = new URL(url, window.location.href).toString();
        await db.registerFileURL(
          "geo.parquet",
          absoluteUrl,
          duckdbMod.DuckDBDataProtocol.HTTP,
          true
        );
        await conn.query(
          `CREATE OR REPLACE VIEW data AS SELECT * FROM read_parquet(${sqlStr("geo.parquet")})`
        );
      } catch (e) {
        if (workerUrl) URL.revokeObjectURL(workerUrl);
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not open the query engine.");
        return;
      } finally {
        if (workerUrl) URL.revokeObjectURL(workerUrl);
      }
      if (cancelled) return;

      // Click-to-inspect: a MapLibre click gives a lng/lat; DuckDB does the exact
      // point-in-polygon and returns the FULL attribute row (not just the columns
      // the overlay query selected).
      map.on("click", async (e: MapMouseEvent) => {
        const conn = connRef.current;
        if (!conn) return;
        try {
          const sql =
            `SELECT * EXCLUDE ("${geometryColumn}"${bboxColumn ? `, "${bboxColumn}"` : ""}) ` +
            `FROM data WHERE ST_Intersects("${geometryColumn}", ST_Point(${e.lngLat.lng}, ${e.lngLat.lat})) LIMIT 1`;
          const table = await conn.query(sql);
          const arr = table.toArray();
          if (!arr.length) {
            setInspected(null);
            return;
          }
          const props = arr[0].toJSON() as Record<string, unknown>;
          for (const k of Object.keys(props)) {
            if (typeof props[k] === "bigint") props[k] = Number(props[k]);
          }
          setInspected({ lngLat: [e.lngLat.lng, e.lngLat.lat], properties: props });
          setAnchor({ x: e.point.x, y: e.point.y });
        } catch {
          /* a failed inspect lookup shouldn't surface as a fatal error */
        }
      });

      map.once("load", () => {
        if (cancelled) return;
        setReady(true);
        void run(query ?? initialSql);
      });
    })().catch((e) => {
      if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load the map libraries.");
    });

    return () => {
      cancelled = true;
      mapRef.current = null;
      lastFcRef.current = null;
      void connRef.current?.close?.();
      void dbRef.current?.terminate?.();
      workerRef.current?.terminate();
      connRef.current = null;
      dbRef.current = null;
      workerRef.current = null;
      map?.remove();
    };
    // Rebuild everything when the source or view config changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, basemap, center?.[0], center?.[1], zoom]);

  // Keep the inspect popup glued to its geographic anchor while panning/zooming.
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

  const inspectEntries = inspected ? Object.entries(inspected.properties) : [];

  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* SQL panel. */}
      <div style={{ border: "1px solid rgba(0,0,0,0.18)", marginBottom: 10 }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void run();
          }}
          rows={5}
          spellCheck={false}
          disabled={!ready}
          style={{
            display: "block",
            width: "100%",
            resize: "vertical",
            border: 0,
            boxSizing: "border-box",
            padding: "12px 14px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 13,
            lineHeight: 1.5,
            color: "#1c1c1c",
            background: "#f6f4ee",
            outline: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            borderTop: "1px solid rgba(0,0,0,0.15)",
            padding: "8px 12px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", fontFamily: "ui-monospace, monospace" }}>
            DuckDB-Wasm + spatial · queried in place over HTTP range requests · ⌘/Ctrl+Enter
          </span>
          <span style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={queryViewport}
              disabled={!ready || loading}
              style={btnStyle(false, color)}
              title="Rewrite the query to the current map viewport (bbox pre-filter → ST_Intersects)"
            >
              Query viewport
            </button>
            <button type="button" onClick={() => void run()} disabled={!ready || loading} style={btnStyle(true, color)}>
              {loading ? "Running…" : "Run ▶"}
            </button>
          </span>
        </div>
      </div>

      {/* View switcher. */}
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {(["map", "table", "chart"] as ViewMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setView(m)}
            style={{
              border: "1px solid rgba(0,0,0,0.2)",
              background: view === m ? color : "#fff",
              color: view === m ? "#fff" : "#333",
              padding: "4px 12px",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            {m}
          </button>
        ))}
        <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: 11, color: "rgba(0,0,0,0.4)", fontFamily: "ui-monospace, monospace" }}>
          {output.rows.length} rows
        </span>
      </div>

      {error && (
        <pre
          style={{
            overflowX: "auto",
            border: "1px solid #f0b4b4",
            background: "#fdf1f1",
            color: "#a33",
            padding: 12,
            fontSize: 12,
            fontFamily: "ui-monospace, monospace",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
      )}

      {/* Map view. */}
      <div
        style={{
          position: "relative",
          height,
          width: "100%",
          overflow: "hidden",
          background: "#e6e2d8",
          display: view === "map" ? "block" : "none",
        }}
      >
        <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 1, zIndex: 2 }}>
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
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <strong style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Feature</strong>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setInspected(null)}
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0, color: "#666" }}
              >
                ×
              </button>
            </div>
            {inspectEntries.length === 0 ? (
              <div style={{ color: "#666", fontStyle: "italic" }}>No properties</div>
            ) : (
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <tbody>
                  {inspectEntries.map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ padding: "2px 8px 2px 0", color: "#666", verticalAlign: "top", whiteSpace: "nowrap" }}>{k}</td>
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
              color: "#333",
            }}
          >
            {attribution}
          </div>
        )}
      </div>

      {/* Table view. */}
      {view === "table" && <ResultTable columns={output.columns} rows={output.rows} />}

      {/* Chart view. */}
      {view === "chart" && <ResultChart columns={output.columns} rows={output.rows} color={color} />}
    </div>
  );
};

function btnStyle(primary: boolean, color: string): React.CSSProperties {
  return {
    border: primary ? "none" : "1px solid rgba(0,0,0,0.25)",
    background: primary ? color : "#fff",
    color: primary ? "#fff" : "#333",
    padding: "6px 14px",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    cursor: "pointer",
  };
}

function ResultTable({ columns, rows }: { columns: string[]; rows: Record<string, unknown>[] }) {
  if (!rows.length) return <p style={{ fontStyle: "italic", color: "rgba(0,0,0,0.55)" }}>No rows.</p>;
  return (
    <div style={{ overflowX: "auto", border: "1px solid rgba(0,0,0,0.18)" }}>
      <table style={{ minWidth: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                style={{
                  whiteSpace: "nowrap",
                  background: "#f0ede5",
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "rgba(0,0,0,0.6)",
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
              {columns.map((c) => (
                <td key={c} style={{ whiteSpace: "nowrap", padding: "8px 14px", fontFamily: "ui-monospace, monospace", fontSize: 12.5 }}>
                  {formatCell(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// A dependency-free horizontal bar chart: first text column = labels, first
// numeric column = values. Renders nothing useful when the result has no numeric
// column (a hint is shown instead).
function ResultChart({ columns, rows, color }: { columns: string[]; rows: Record<string, unknown>[]; color: string }) {
  const numericCol = columns.find((c) => rows.some((r) => typeof r[c] === "number"));
  const labelCol = columns.find((c) => c !== numericCol && rows.some((r) => typeof r[c] === "string")) ?? columns[0];
  if (!numericCol || !rows.length) {
    return <p style={{ fontStyle: "italic", color: "rgba(0,0,0,0.55)" }}>Add a numeric column to chart the result (e.g. an aggregate).</p>;
  }
  const values = rows.map((r) => Number(r[numericCol]) || 0);
  const max = Math.max(...values, 1);
  const shown = rows.slice(0, 30);
  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.18)", padding: 14 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(0,0,0,0.5)", marginBottom: 10 }}>
        {numericCol} by {labelCol}
      </div>
      {shown.map((r, i) => {
        const v = Number(r[numericCol]) || 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ width: 130, flexShrink: 0, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {String(r[labelCol] ?? "")}
            </span>
            <span style={{ flex: 1, background: "#eee", height: 16, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(v / max) * 100}%`, background: color }} />
            </span>
            <span style={{ width: 90, flexShrink: 0, textAlign: "right", fontSize: 12, fontFamily: "ui-monospace, monospace" }}>
              {v.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "object") {
    const s = String(value);
    return s === "[object Object]" ? JSON.stringify(value) : s;
  }
  return String(value);
}
