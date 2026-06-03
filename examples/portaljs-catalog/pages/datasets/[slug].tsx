import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { Table } from '../../components/Table'
import { getDataset, getDatasets, type Dataset } from '../../lib/datasets'

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getDatasets().map((d) => ({ params: { slug: d.slug } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const dataset = getDataset(String(params?.slug))
  if (!dataset) return { notFound: true }
  return { props: { dataset } }
}

export default function DatasetPage({ dataset }: { dataset: Dataset }) {
  const url = `/data/${dataset.file}`
  const tabular = dataset.format === 'csv' || dataset.format === 'tsv'

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
          <span>{dataset.name}</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{dataset.name}</h1>
        {dataset.description && (
          <p className="text-gray-500 mb-8">{dataset.description}</p>
        )}

        {tabular ? (
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

        <p className="mt-6 text-sm text-gray-400">
          <a href={url} className="underline">
            Download {dataset.file}
          </a>
        </p>
      </main>
    </>
  )
}
