import Head from 'next/head'
import Link from 'next/link'

// Populated by /portaljs-add-dataset. Each entry: { slug, name, description }
const datasets: { slug: string; name: string; description?: string }[] = []

export default function Home() {
  return (
    <>
      <Head>
        <title>__PROJECT_NAME__</title>
      </Head>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">__PROJECT_NAME__</h1>
          <p className="mt-3 text-lg text-gray-500">__DESCRIPTION__</p>
        </header>

        {datasets.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
            <p className="text-lg font-medium">No datasets yet</p>
            <p className="mt-1 text-sm">
              Run <code className="bg-gray-100 px-1 rounded">/portaljs-add-dataset</code> to add your first dataset.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {datasets.map((ds) => (
              <Link
                key={ds.slug}
                href={`/datasets/${ds.slug}`}
                className="block rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <h2 className="text-xl font-semibold text-gray-900">{ds.name}</h2>
                {ds.description && (
                  <p className="mt-1 text-gray-500">{ds.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
