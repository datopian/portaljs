import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { Table } from '../../components/Table'
import {
  DATA_QUERY,
  NAMESPACE_TYPE,
  resourceUrl,
  resourceLabel,
  type Dataset,
  type Resource,
  type ResourceVersion,
  type ActivityEntry,
} from '../../lib/datasets'
import { provider } from '../../lib/providers'
import { withHistory } from '../../lib/history'
import { formatDate } from '../../lib/format'

// DuckDB only runs in the browser, so load the query view client-side. The chunk
// (and DuckDB-Wasm) is only fetched when a resource actually needs it — flat
// portals never pay for it.
const DataExplorer = dynamic(() => import('../../components/DataExplorer'), {
  ssr: false,
})

// MapLibre GL touches `window` at module scope, so the map is client-only. The
// chunk (maplibre + pmtiles, and lazily @duckdb/duckdb-wasm) loads only when a
// dataset actually has a geo resource. ONE component carries both geo tiers: the
// PMTiles render layer AND the GeoParquet + DuckDB-Wasm query engine bound to the
// same map viewport — a dual-tier dataset gets one map, not two.
const MapPreview = dynamic(() => import('../../components/MapPreview'), {
  ssr: false,
})

type PageProps = {
  dataset: Dataset
  resources: Resource[]
  activity: ActivityEntry[]
}

export const getStaticPaths: GetStaticPaths = async () => {
  const datasets = await provider.listDatasets()
  return {
    // The `owner` segment carries the `@` prefix so the generated URL is
    // /@<namespace>/<slug> — namespacing datasets under `@` keeps them from
    // colliding with regular content/static pages (which never start with `@`).
    paths: datasets.map((d) => ({
      params: { owner: '@' + d.namespace, slug: d.slug },
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  // Strip the leading `@` from the owner segment to recover the namespace,
  // then resolve the dataset by its (namespace, slug) pair.
  const namespace = String(params?.owner ?? '').replace(/^@/, '')
  const dataset = await provider.getDataset(namespace, String(params?.slug))
  if (!dataset) return { notFound: true }
  // Capture git history for each resource (and the derived activity feed) at build
  // time — deployed portals are static exports with no git in out/. See lib/history.ts.
  const { resources, activity } = withHistory(dataset)
  return { props: { dataset, resources, activity } }
}

// Showcase surface (editorial design imported from the Claude Design mockups): an
// eyebrow + title + italic description, then a two-column body that follows the
// user's mental model — see it → query it → download it. First the data preview
// (ONE map for a geo dataset — PMTiles render + GeoParquet query on a single
// viewport, with Table/Chart/SQL tabs; a filterable table or DuckDB SQL editor for
// tabular datasets), then a single "Download & API" block (every file is a FORMAT
// of the one dataset — download + copy-URL + a DuckDB snippet, with sizes), then a
// portal activity feed and a Views slot — beside a metadata sidebar with the
// primary download.
export default function DatasetPage({ dataset, resources, activity }: PageProps) {
  const namespaceLabel = NAMESPACE_TYPE === 'owner' ? 'Owner' : 'Theme'
  const primary = resources[0]
  // The two serverless geo tiers render as ONE map (see MapPreview): the PMTiles
  // archive is the render layer, the GeoParquet twin is the query engine bound to
  // the same viewport. Pull both out of the per-resource preview loop so a
  // dual-tier dataset shows a single map instead of two. The files still appear
  // individually in the Resources download list above.
  const pmtilesResource = resources.find((r) => r.format === 'pmtiles')
  const geoparquetResource = resources.find((r) => r.format === 'geoparquet')
  const hasGeo = Boolean(pmtilesResource || geoparquetResource)
  const nonGeoResources = resources.filter(
    (r) => r.format !== 'pmtiles' && r.format !== 'geoparquet'
  )
  // Which resources get an INLINE preview. A geo dataset's non-geo files (GeoJSON,
  // CSV, GeoPackage, Shapefile) are alternate FORMATS of the data already shown on
  // the map, so they never preview — they only appear as download rows. A tabular
  // dataset previews its CSV/TSV (Table or SQL editor) and Parquet (SQL editor);
  // anything else is download-only.
  const previewResources = hasGeo
    ? []
    : nonGeoResources.filter(
        (r) => r.format === 'parquet' || r.format === 'csv' || r.format === 'tsv'
      )
  // Every file, ordered for the Download & API block: the two serverless geo tiers
  // first (GeoParquet for analysis, PMTiles for maps), then the source archive
  // (GeoJSON), then the remaining tabular/export formats.
  const orderedResources = [...resources].sort(
    (a, b) => downloadRank(a.format) - downloadRank(b.format)
  )
  // "Last updated" describes the DATA's freshness. The manifest's source-provenance
  // `modified` (preserved from the origin platform on migration) is the truth when
  // present — it must win over git activity, whose freshest commit for a migrated
  // dataset is the migration itself (that would wrongly show the harvest date as the
  // data's last-updated). Fall back to git history only for hand-added datasets that
  // carry no source `modified`.
  const lastUpdated = (dataset.modified && formatDate(dataset.modified)) ?? activity[0]?.date
  const created = dataset.created && formatDate(dataset.created)
  // Migration/sync time is provenance about the COPY, shown as its own field so it
  // never masquerades as the data's freshness.
  const migratedAt = dataset.migratedAt && formatDate(dataset.migratedAt)

  return (
    <>
      <Head>
        <title>{dataset.name}</title>
      </Head>
      <main className="mx-auto max-w-[940px] px-6 pb-24 sm:px-16">
        <nav className="pt-7 font-sans text-[13px] font-medium text-ink/50">
          <Link href="/" className="text-inherit no-underline hover:text-accent">
            Home
          </Link>{' '}
          /{' '}
          <Link href="/search" className="text-inherit no-underline hover:text-accent">
            Search
          </Link>{' '}
          <span className="text-ink">/ {dataset.name}</span>
        </nav>

        <header className="max-w-[640px] pb-10 pt-8">
          <div className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Dataset
          </div>
          <h1 className="mb-[18px] font-serif text-[42px] font-semibold leading-tight text-ink">
            {dataset.name}
          </h1>
          {dataset.description && (
            <p className="font-serif text-[19px] italic leading-[1.6] text-ink/70">
              {dataset.description}
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 gap-12 pb-6 lg:grid-cols-[1fr_280px] lg:gap-16">
          <div className="min-w-0">
            {/* Data preview — the "see it / query it" surface. A geo dataset gets
                ONE map (PMTiles render + GeoParquet query on a single viewport,
                with Table/Chart/SQL tabs). A tabular dataset gets a filterable
                Table or the DuckDB SQL editor per previewable file. Download-only
                formats never render here — they live in the Download & API block. */}
            <div className="border-t border-ink/[0.15] pt-[22px]">
              {hasGeo && (
                <GeoSection
                  pmtilesResource={pmtilesResource}
                  geoparquetResource={geoparquetResource}
                  showHeading={resources.length > 1}
                  mapAttribution={dataset.sources?.[0]?.title}
                />
              )}
              {previewResources.map((r, i) => (
                <ResourceSection
                  key={r.name + i}
                  resource={r}
                  showHeading={previewResources.length > 1}
                />
              ))}
            </div>

            {/* Download & API — every file is a FORMAT of the one dataset, not a
                separate resource: a single block, each row with its size, a
                copy-URL, and (for the columnar tiers) a ready-to-run DuckDB
                snippet. Dual-tier geo datasets get a one-line architecture note. */}
            <DownloadApiBlock
              resources={orderedResources}
              dualTier={Boolean(pmtilesResource && geoparquetResource)}
            />

            {/* Activity — every resource commit across the dataset, newest first. */}
            {activity.length > 0 && <ActivityFeed activity={activity} />}

            {/* Views placeholder — charts and maps are added here by the
                /portaljs-add-chart and /portaljs-add-map skills. */}
            <SectionLabel className="mt-11">Views</SectionLabel>
            <div className="border border-ink/[0.15] p-11 text-center">
              <div className="mb-2 font-serif text-[17px] italic text-ink/55">
                No views yet.
              </div>
              <div className="font-sans text-xs text-ink/40">
                Charts and maps for this dataset are added here.
              </div>
            </div>

            {/* Sources & license — Data Package descriptor fields. */}
            {((dataset.licenses && dataset.licenses.length > 0) ||
              (dataset.sources && dataset.sources.length > 0)) && (
              <section className="mt-11">
                <SectionLabel>Sources &amp; license</SectionLabel>
                {dataset.sources && dataset.sources.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/45">
                      Sources
                    </div>
                    <ul className="font-serif text-[15px] text-ink/80">
                      {dataset.sources.map((s) => (
                        <li key={s.title}>
                          {s.path ? (
                            <a href={s.path} className="text-accent underline underline-offset-2">
                              {s.title}
                            </a>
                          ) : (
                            s.title
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {dataset.licenses && dataset.licenses.length > 0 && (
                  <div>
                    <div className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/45">
                      License
                    </div>
                    <ul className="font-serif text-[15px] text-ink/80">
                      {dataset.licenses.map((l) => (
                        <li key={l.name ?? l.title ?? l.path}>
                          {l.path ? (
                            <a href={l.path} className="text-accent underline underline-offset-2">
                              {l.title ?? l.name}
                            </a>
                          ) : (
                            l.title ?? l.name
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Metadata sidebar. */}
          <aside className="flex h-fit flex-col gap-[18px] rounded-sm border border-ink/[0.18] p-[26px]">
            <SidebarField label={namespaceLabel} value={`@${dataset.namespace}`} />
            <SidebarField
              label="Resources"
              value={`${resources.length} file${resources.length === 1 ? '' : 's'}`}
            />
            {typeof dataset.recordCount === 'number' && (
              <SidebarField
                label="Records"
                value={dataset.recordCount.toLocaleString('en-US')}
              />
            )}
            {dataset.version && <SidebarField label="Version" value={dataset.version} />}
            {created && <SidebarField label="Created" value={created} />}
            {lastUpdated && <SidebarField label="Last updated" value={lastUpdated} />}
            {migratedAt && <SidebarField label="Migrated" value={migratedAt} />}
            {dataset.keywords && dataset.keywords.length > 0 && (
              <div>
                <div className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-ink/45">
                  Keywords
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dataset.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="bg-cream-panel px-2 py-0.5 font-sans text-[11px] text-ink/60"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {primary && (
              <div className="border-t border-ink/[0.15] pt-[18px]">
                <a
                  href={resourceUrl(primary)}
                  className="block rounded-sm bg-ink px-3 py-3 text-center font-sans text-xs font-semibold uppercase tracking-[0.06em] text-cream no-underline"
                >
                  Download {primary.format}
                </a>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}

// Uppercase Work Sans section label, matching the mockups' hairline dividers.
function SectionLabel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45 ${className}`}
    >
      {children}
    </div>
  )
}

function SidebarField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-ink/45">
        {label}
      </div>
      <div className="font-serif text-base font-semibold text-ink">{value}</div>
    </div>
  )
}

// Format-priority for the Download & API list: the serverless geo tiers lead
// (GeoParquet for analysis/SQL, PMTiles for maps), then the source archive
// (GeoJSON), then the remaining tabular/export formats. Unlisted formats sort last.
function downloadRank(format: string): number {
  const order = ['geoparquet', 'pmtiles', 'geojson', 'csv', 'tsv', 'parquet', 'json']
  const i = order.indexOf(format)
  return i === -1 ? order.length : i
}

// A tiny copy-to-clipboard button that flips to a "Copied" confirmation for a
// moment. Used for both the raw file URL and the ready-to-run DuckDB snippet.
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      className="whitespace-nowrap font-sans text-[11px] font-medium text-ink/55 underline underline-offset-2 hover:text-accent"
    >
      {copied ? 'Copied' : label}
    </button>
  )
}

// The single "Download & API" block: every file in the dataset presented as a
// FORMAT of one thing, not a separate resource. Each row carries its size, a
// direct download, a copy-URL (for files served from a public URL), and — for the
// columnar/query tiers — a ready-to-run DuckDB snippet. A dual-tier geo dataset
// gets a one-line architecture note (the vendor story, not the user's model).
function DownloadApiBlock({
  resources,
  dualTier,
}: {
  resources: Resource[]
  dualTier: boolean
}) {
  if (resources.length === 0) return null
  return (
    <section className="mt-11">
      <SectionLabel>Download &amp; API</SectionLabel>
      <div>
        {resources.map((r, i) => (
          <ResourceDownloadRow key={r.name + i} resource={r} />
        ))}
      </div>
      {dualTier && (
        <p className="mt-3 font-sans text-xs leading-relaxed text-ink/45">
          Rendered from PMTiles, queried in-browser from GeoParquet — no server.{' '}
          <a
            href="https://portaljs.com"
            className="text-accent underline underline-offset-2"
          >
            How this works
          </a>
        </p>
      )}
    </section>
  )
}

// One file in the Download & API block: label + format tag + size on the left,
// actions on the right (Download always; Copy URL when the file is served from a
// public URL; Copy DuckDB snippet for columnar formats). A short caption names the
// format's role — GeoJSON is flagged as the original export archive. Version
// history (when git captured any) stays available behind a per-row toggle.
function ResourceDownloadRow({ resource }: { resource: Resource }) {
  const [open, setOpen] = useState(false)
  const history = resource.history ?? []
  const url = resourceUrl(resource)
  const isPublicUrl = /^(https?:)?\/\//.test(resource.path)
  // Newest version first (see lib/history.ts), so history[0] is the current size.
  const size = history[0]?.size
  const isColumnar = resource.format === 'geoparquet' || resource.format === 'parquet'
  const caption = downloadCaption(resource.format)

  return (
    <div className="border-b border-dotted border-ink/25">
      <div className="flex items-start justify-between gap-4 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="min-w-0 truncate font-sans text-[15px] font-medium text-ink">
              {resourceLabel(resource)}
            </span>
            <span className="flex-shrink-0 border border-accent/50 px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.06em] text-accent">
              {resource.format}
            </span>
            {size && (
              <span className="flex-shrink-0 font-sans text-[11px] text-ink/40">{size}</span>
            )}
          </div>
          {caption && (
            <div className="mt-1 font-sans text-[12px] text-ink/50">{caption}</div>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
          <a
            href={url}
            className="whitespace-nowrap font-sans text-[11px] font-medium text-ink/55 underline underline-offset-2 hover:text-accent"
          >
            Download
          </a>
          {isPublicUrl && <CopyButton text={url} label="Copy URL" />}
          {isColumnar && isPublicUrl && (
            <CopyButton
              text={`SELECT * FROM read_parquet('${url}')`}
              label="Copy DuckDB snippet"
            />
          )}
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="whitespace-nowrap font-sans text-[11px] font-medium text-ink/55 hover:text-accent"
            >
              {open ? 'Hide history' : `History (${history.length})`}
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="mb-2 flex flex-col gap-5 border-l-2 border-ink/[0.15] py-1 pb-5 pl-[18px]">
          {history.map((v) => (
            <VersionEntry key={v.sha + v.version} version={v} />
          ))}
        </div>
      )}
    </div>
  )
}

// A short, human caption for a file's role in the dataset. GeoJSON is the full,
// unsimplified FeatureService export — flagged as an archive so visitors reach for
// GeoParquet (query) or PMTiles (maps) first. Returns '' for formats that need no
// caption (the format tag already says enough).
function downloadCaption(format: string): string {
  switch (format) {
    case 'geoparquet':
      return 'Columnar — query with DuckDB / SQL'
    case 'pmtiles':
      return 'Vector tiles — embed in a map'
    case 'geojson':
      return 'Original export (archive)'
    case 'parquet':
      return 'Columnar — query with DuckDB / SQL'
    case 'gpkg':
    case 'geopackage':
      return 'GeoPackage — GIS desktop (QGIS, ArcGIS)'
    case 'shp':
    case 'shapefile':
      return 'Shapefile — legacy GIS interchange'
    default:
      return ''
  }
}

// One commit in a resource's history timeline: version tag, date, download, message,
// sha + size, and — for raw-text files — an expandable line diff.
function VersionEntry({ version: v }: { version: ResourceVersion }) {
  const [showDiff, setShowDiff] = useState(false)
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11px] font-semibold text-accent">{v.version}</span>
          <span className="font-sans text-[11px] font-medium text-ink/45">{v.date}</span>
        </div>
        {v.downloadHref && (
          <a
            href={v.downloadHref}
            className="whitespace-nowrap font-sans text-[11px] font-medium text-ink/55 underline underline-offset-2 hover:text-accent"
          >
            Download {v.version}
          </a>
        )}
      </div>
      <div className="mt-[3px] font-serif text-sm italic leading-[1.35] text-ink">
        {v.message}
      </div>
      <div className="mt-[3px] font-mono text-[10.5px] text-ink/40">
        {v.sha}
        {v.size ? ` · ${v.size}` : ''}
      </div>
      {v.diffSummary && (
        <>
          <button
            type="button"
            onClick={() => setShowDiff((s) => !s)}
            className="mt-1.5 font-sans text-[11px] font-medium text-accent underline underline-offset-2"
          >
            {showDiff ? 'Hide diff' : 'View diff'}
          </button>
          {showDiff && (
            <div className="mt-2 border border-ink/[0.12] bg-cream-panel px-3.5 py-3">
              <div className="mb-2 font-sans text-[11px] font-semibold text-ink/55">
                {v.diffSummary}
              </div>
              {v.diffLines?.map((ln, i) => (
                <div
                  key={i}
                  className={`font-mono text-xs leading-[1.7] ${
                    ln.type === 'add' ? 'text-[#3a7d44]' : 'text-[#b3341f]'
                  }`}
                >
                  {ln.text}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// The portal activity feed: every resource commit across the dataset, newest first.
// Collapsed to the three most recent, with a toggle to reveal the rest.
function ActivityFeed({ activity }: { activity: ActivityEntry[] }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? activity : activity.slice(0, 3)
  const hasMore = activity.length > 3
  return (
    <div className="mb-11">
      <div className="mb-3.5 flex items-baseline justify-between">
        <SectionLabel className="mb-0">Activity</SectionLabel>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="font-sans text-xs font-medium text-accent underline underline-offset-2"
          >
            {expanded ? 'Show less' : 'Show all activity'}
          </button>
        )}
      </div>
      <div className="flex flex-col">
        {shown.map((a, i) => (
          <div
            key={a.sha + a.filename + i}
            className="flex items-baseline gap-3 border-b border-ink/[0.1] py-2.5"
          >
            <span className="w-[78px] flex-shrink-0 font-sans text-[11px] font-medium text-ink/40">
              {a.date}
            </span>
            <span className="flex-shrink-0 font-mono text-[11px] text-ink/45">
              {a.filename}
            </span>
            <span className="font-serif text-sm italic text-ink">{a.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// The geo tiers of a dataset, rendered as ONE map. PMTiles is the render layer
// (passed as `url`), GeoParquet is the query engine bound to the same viewport
// (passed as `queryResource`) — MapPreview composes them into a single MapLibre
// instance, so a dual-tier dataset never shows two maps. Either tier may be
// absent (render-only or query-only). Each tier's Frictionless schema (when
// present) is shown below the map.
function GeoSection({
  pmtilesResource,
  geoparquetResource,
  showHeading,
  mapAttribution,
}: {
  pmtilesResource?: Resource
  geoparquetResource?: Resource
  showHeading: boolean
  mapAttribution?: string
}) {
  const pmtilesUrl = pmtilesResource ? resourceUrl(pmtilesResource) : undefined
  return (
    <section className="mb-11">
      {showHeading && (
        <div className="mb-3 flex items-baseline gap-3">
          <h2 className="font-serif text-xl font-semibold text-ink">Map</h2>
          <span className="border border-accent/50 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.06em] text-accent">
            {pmtilesResource && geoparquetResource
              ? 'pmtiles + geoparquet'
              : pmtilesResource
                ? 'pmtiles'
                : 'geoparquet'}
          </span>
        </div>
      )}
      <MapPreview
        url={pmtilesUrl}
        queryResource={geoparquetResource}
        attribution={mapAttribution}
      />
      {pmtilesResource && <ResourceSchema resource={pmtilesResource} />}
      {geoparquetResource && <ResourceSchema resource={geoparquetResource} />}
    </section>
  )
}

// One PREVIEWABLE tabular resource: its data preview (the DuckDB SQL editor for
// Parquet / query-mode portals, otherwise the flat filterable Table) and its
// Frictionless Table Schema. Only previewable formats (CSV/TSV/Parquet) reach here
// — download-only formats live in the Download & API block, and geo resources are
// handled by <GeoSection>. A single-file dataset renders exactly one of these;
// multi-resource datasets render one per file, each with its own heading.
function ResourceSection({
  resource,
  showHeading,
}: {
  resource: Resource
  showHeading: boolean
}) {
  const url = resourceUrl(resource)
  const tabular = resource.format === 'csv' || resource.format === 'tsv'
  // Parquet has no flat preview (papaparse can't read it) — it's read through
  // DuckDB-Wasm, which also range-queries it in place when it lives on R2. So a
  // Parquet resource always gets the SQL editor, regardless of the DATA_QUERY
  // flag; CSV/TSV get it only when the portal opts into the 'duckdb' engine.
  const useQueryView = resource.format === 'parquet' || (tabular && DATA_QUERY === 'duckdb')
  return (
    <section className="mb-11">
      {showHeading && (
        <div className="mb-3 flex items-baseline gap-3">
          <h2 className="font-serif text-xl font-semibold text-ink">
            {resource.title ?? resource.name}
          </h2>
          <span className="border border-accent/50 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.06em] text-accent">
            {resource.format}
          </span>
        </div>
      )}
      {showHeading && resource.description && (
        <p className="mb-3 font-serif text-[15px] italic text-ink/60">
          {resource.description}
        </p>
      )}

      {useQueryView ? (
        <DataExplorer resource={resource} />
      ) : (
        <>
          <SectionLabel>Preview</SectionLabel>
          <Table url={url} />
        </>
      )}

      <ResourceSchema resource={resource} />
    </section>
  )
}

// Per-resource Frictionless Table Schema (degrades cleanly when absent).
function ResourceSchema({ resource }: { resource: Resource }) {
  if (!resource.schema?.fields || resource.schema.fields.length === 0) return null
  return (
    <div className="mt-6">
      <SectionLabel>Schema</SectionLabel>
      <div className="overflow-x-auto border border-ink/[0.18]">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-cream-panel text-left font-sans text-[11px] uppercase tracking-[0.06em] text-ink/60">
              <th className="px-4 py-3 font-semibold">Field</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Constraints</th>
            </tr>
          </thead>
          <tbody>
            {resource.schema.fields.map((f) => {
              const c = f.constraints
              const tags = [
                c?.required && 'required',
                c?.unique && 'unique',
                c?.enum && `enum(${c.enum.length})`,
              ].filter(Boolean) as string[]
              // Prefer the human field label (Frictionless `title` — e.g. the
              // ArcGIS field alias "Property Type") as the header, keeping the raw
              // database column name (PROP_TYPE) as a mono subtitle. Falls back to
              // the raw name alone when there's no distinct alias.
              const hasAlias = f.title && f.title !== f.name
              return (
                <tr key={f.name} className="border-t border-ink/[0.1] align-top">
                  <td className="px-4 py-3">
                    {hasAlias ? (
                      <>
                        <div className="font-sans text-ink/80">{f.title}</div>
                        <div className="font-mono text-[11px] text-ink/45">{f.name}</div>
                      </>
                    ) : (
                      <span className="font-mono text-ink/80">{f.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-sans text-ink/60">{f.type ?? '—'}</td>
                  <td className="px-4 py-3 font-sans text-ink/60">{f.description ?? ''}</td>
                  <td className="px-4 py-3 font-sans text-ink/50">{tags.join(', ')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {resource.schema.primaryKey && (
        <p className="mt-2 font-sans text-xs text-ink/45">
          Primary key:{' '}
          <code className="font-mono text-ink/70">
            {Array.isArray(resource.schema.primaryKey)
              ? resource.schema.primaryKey.join(', ')
              : resource.schema.primaryKey}
          </code>
        </p>
      )}
    </div>
  )
}
