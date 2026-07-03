import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { Table } from '../../components/Table'
import {
  DATA_QUERY,
  NAMESPACE_TYPE,
  getResources,
  resourceUrl,
  type Dataset,
  type Resource,
} from '../../lib/datasets'
import { provider } from '../../lib/providers'

// DuckDB only runs in the browser, so load the query view client-side. The chunk
// (and DuckDB-Wasm) is only fetched when a resource actually needs it — flat
// portals never pay for it.
const DataExplorer = dynamic(() => import('../../components/DataExplorer'), {
  ssr: false,
})

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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // Strip the leading `@` from the owner segment to recover the namespace,
  // then resolve the dataset by its (namespace, slug) pair.
  const namespace = String(params?.owner ?? '').replace(/^@/, '')
  const dataset = await provider.getDataset(namespace, String(params?.slug))
  if (!dataset) return { notFound: true }
  return { props: { dataset } }
}

// Showcase surface (editorial design imported from the Claude Design mockups): an
// eyebrow + title + italic description, then a two-column body — resources, a
// data preview (simple filterable table for CSV/TSV, a DuckDB SQL editor for
// Parquet or query-mode portals), schema, and a Views slot — beside a metadata
// sidebar with the download.
export default function DatasetPage({ dataset }: { dataset: Dataset }) {
  const resources = getResources(dataset)
  const namespaceLabel = NAMESPACE_TYPE === 'owner' ? 'Owner' : 'Theme'
  const primary = resources[0]

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
            {/* Resource file list — every file in the dataset, each downloadable. */}
            <SectionLabel className="border-t border-ink/[0.15] pt-[22px]">
              Resources
            </SectionLabel>
            <div className="mb-11">
              {resources.map((r, i) => (
                <a
                  key={r.name + i}
                  href={resourceUrl(r)}
                  className="flex items-center justify-between border-b border-dotted border-ink/25 py-4 no-underline"
                >
                  <span className="font-sans text-[15px] font-medium text-ink">
                    {r.path}
                  </span>
                  <span className="border border-accent/50 px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.06em] text-accent">
                    {r.format}
                  </span>
                </a>
              ))}
            </div>

            {/* Data preview — one block per resource. A single-file dataset (the
                common case, and what the mockups show) renders exactly one; a
                multi-resource dataset renders one per file, each labelled. */}
            {resources.map((r, i) => (
              <ResourceSection
                key={r.name + i}
                resource={r}
                showHeading={resources.length > 1}
              />
            ))}

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
            {dataset.version && <SidebarField label="Version" value={dataset.version} />}
            {dataset.modified && <SidebarField label="Modified" value={dataset.modified} />}
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

// One resource within a dataset: its data preview (the DuckDB SQL editor for
// Parquet / query-mode portals, otherwise the flat filterable Table) and its
// Frictionless Table Schema. A single-file dataset renders exactly one of these;
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
      ) : tabular ? (
        <>
          <SectionLabel>Preview</SectionLabel>
          <Table url={url} />
        </>
      ) : (
        <p className="font-serif text-[15px] italic text-ink/60">
          Preview not available for {resource.format} files.{' '}
          <a href={url} className="text-accent underline underline-offset-2">
            Download the file
          </a>
          .
        </p>
      )}

      {/* Per-resource Frictionless Table Schema (degrades cleanly when absent). */}
      {resource.schema?.fields && resource.schema.fields.length > 0 && (
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
                  return (
                    <tr key={f.name} className="border-t border-ink/[0.1] align-top">
                      <td className="px-4 py-3 font-mono text-ink/80">{f.name}</td>
                      <td className="px-4 py-3 font-sans text-ink/60">{f.type ?? '—'}</td>
                      <td className="px-4 py-3 font-sans text-ink/60">
                        {f.description ?? f.title ?? ''}
                      </td>
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
      )}
    </section>
  )
}
