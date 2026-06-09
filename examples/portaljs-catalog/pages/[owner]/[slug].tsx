import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { Table } from '../../components/Table'
import { DATA_QUERY, NAMESPACE_TYPE, type Dataset } from '../../lib/datasets'
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
  const url = `/data/${dataset.file}`
  const tabular = dataset.format === 'csv' || dataset.format === 'tsv'
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
            Datasets
          </Link>
          <span className="mx-2">/</span>
          <span>{dataset.name}</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{dataset.name}</h1>
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
              Format
            </dt>
            <dd className="mt-1 text-sm text-gray-800">{dataset.format}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              File
            </dt>
            <dd className="mt-1 text-sm text-gray-800">{dataset.file}</dd>
          </div>
        </dl>

        {/* Data preview — flat <Table /> by default, or a DuckDB-Wasm SQL
            query view when the portal's DATA_QUERY engine is 'duckdb'. */}
        {tabular && DATA_QUERY === 'duckdb' ? (
          <DataExplorer dataset={dataset} />
        ) : tabular ? (
          <Table url={url} fullWidth />
        ) : (
          <p className="text-gray-500">
            Preview not available for {dataset.format} files.{' '}
            <a href={url} className="underline">
              Download the file
            </a>
            .
          </p>
        )}

        {/* Download + API */}
        <section className="mt-10 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Download &amp; API</h2>
          <p className="mt-2 text-sm">
            <a href={url} className="text-blue-600 underline hover:text-blue-700">
              Download {dataset.file}
            </a>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            The raw file is served statically at{' '}
            <code className="bg-gray-100 px-1 rounded">{url}</code> — fetch it
            directly for programmatic / API access (e.g. <code className="bg-gray-100 px-1 rounded">fetch(&apos;{url}&apos;)</code>).
          </p>
        </section>

        {/* Views placeholder — charts and maps are added here by the
            /add-chart and /add-map skills. */}
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
