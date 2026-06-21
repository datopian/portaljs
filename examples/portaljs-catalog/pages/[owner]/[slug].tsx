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
// (and DuckDB-Wasm) is only fetched when DATA_QUERY === 'duckdb' and a showcase
// actually renders it — flat portals never pay for it.
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

export default function DatasetPage({ dataset }: { dataset: Dataset }) {
  const resources = getResources(dataset)
  const namespaceLabel = NAMESPACE_TYPE === 'owner' ? 'Owner' : 'Theme'

  return (
    <>
      <Head>
        <title>{dataset.name}</title>
      </Head>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/search" className="hover:text-gray-700">
            Search
          </Link>
          <span className="mx-2">/</span>
          <span>{dataset.name}</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {dataset.name}
        </h1>
        {dataset.description && (
          <p className="text-gray-500 mb-8">{dataset.description}</p>
        )}

        {/* Metadata block */}
        <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {namespaceLabel}
            </dt>
            <dd className="mt-1 text-sm text-gray-800">@{dataset.namespace}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Resources
            </dt>
            <dd className="mt-1 text-sm text-gray-800">
              {resources.length} file{resources.length === 1 ? '' : 's'}
            </dd>
          </div>
          {dataset.version && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Version
              </dt>
              <dd className="mt-1 text-sm text-gray-800">{dataset.version}</dd>
            </div>
          )}
          {dataset.modified && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Modified
              </dt>
              <dd className="mt-1 text-sm text-gray-800">{dataset.modified}</dd>
            </div>
          )}
        </dl>

        {/* Keywords */}
        {dataset.keywords && dataset.keywords.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {dataset.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Data — one section per resource (a single-file dataset has exactly
            one; multi-resource datasets render a section for each file). */}
        {resources.map((r, i) => (
          <ResourceSection
            key={r.name + i}
            resource={r}
            showHeading={resources.length > 1}
          />
        ))}

        {/* Sources & license — Data Package descriptor fields. */}
        {((dataset.licenses && dataset.licenses.length > 0) ||
          (dataset.sources && dataset.sources.length > 0)) && (
          <section className="mt-10 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Sources &amp; license
            </h2>
            {dataset.sources && dataset.sources.length > 0 && (
              <div className="mt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Sources
                </h3>
                <ul className="mt-1 text-sm text-gray-700">
                  {dataset.sources.map((s) => (
                    <li key={s.title}>
                      {s.path ? (
                        <a
                          href={s.path}
                          className="text-blue-600 underline hover:text-blue-700"
                        >
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
              <div className="mt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  License
                </h3>
                <ul className="mt-1 text-sm text-gray-700">
                  {dataset.licenses.map((l) => (
                    <li key={l.name ?? l.title ?? l.path}>
                      {l.path ? (
                        <a
                          href={l.path}
                          className="text-blue-600 underline hover:text-blue-700"
                        >
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

        {/* Views placeholder — charts and maps are added here by the
            /portaljs-add-chart and /portaljs-add-map skills. */}
        <section className="mt-10 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Views</h2>
          <p className="mt-2 text-sm text-gray-400">
            No views yet. Charts and maps for this dataset are added here.
          </p>
        </section>
      </main>
    </>
  )
}

// One resource within a dataset: preview (flat <Table /> or the DuckDB SQL view),
// its Frictionless Table Schema, and a download / API line. A single-file dataset
// renders exactly one of these (getResources synthesizes it); multi-resource
// datasets render one per file, each with its own heading.
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
  // Parquet resource always gets the query view, regardless of the DATA_QUERY
  // flag; CSV/TSV get it only when the portal opts into the 'duckdb' engine.
  const useQueryView = resource.format === 'parquet' || (tabular && DATA_QUERY === 'duckdb')
  return (
    <section className="mt-10 border-t border-gray-200 pt-6 first:mt-2 first:border-t-0 first:pt-0">
      {showHeading && (
        <div className="mb-3 flex items-baseline gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {resource.title ?? resource.name}
          </h2>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs uppercase tracking-wide text-gray-500">
            {resource.format}
          </span>
        </div>
      )}
      {showHeading && resource.description && (
        <p className="mb-3 text-sm text-gray-500">{resource.description}</p>
      )}

      {useQueryView ? (
        <DataExplorer resource={resource} />
      ) : tabular ? (
        <Table url={url} fullWidth />
      ) : (
        <p className="text-gray-500">
          Preview not available for {resource.format} files.{' '}
          <a href={url} className="underline">
            Download the file
          </a>
          .
        </p>
      )}

      {/* Per-resource Frictionless Table Schema (degrades cleanly when absent). */}
      {resource.schema?.fields && resource.schema.fields.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Schema
          </h3>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="py-2 pr-4 font-semibold">Field</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 font-semibold">Description</th>
                  <th className="py-2 font-semibold">Constraints</th>
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
                    <tr key={f.name} className="border-b border-gray-100 align-top">
                      <td className="py-2 pr-4 font-mono text-gray-800">{f.name}</td>
                      <td className="py-2 pr-4 text-gray-600">{f.type ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-600">
                        {f.description ?? f.title ?? ''}
                      </td>
                      <td className="py-2 text-gray-500">{tags.join(', ')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {resource.schema.primaryKey && (
            <p className="mt-2 text-xs text-gray-400">
              Primary key:{' '}
              <code className="rounded bg-gray-100 px-1">
                {Array.isArray(resource.schema.primaryKey)
                  ? resource.schema.primaryKey.join(', ')
                  : resource.schema.primaryKey}
              </code>
            </p>
          )}
        </div>
      )}

      {/* Download + API for this resource. */}
      <p className="mt-4 text-sm">
        <a href={url} className="text-blue-600 underline hover:text-blue-700">
          Download {resource.path}
        </a>
        <span className="text-gray-500">
          {' '}
          — served statically at{' '}
          <code className="bg-gray-100 px-1 rounded">{url}</code> for programmatic
          access.
        </span>
      </p>
    </section>
  )
}
