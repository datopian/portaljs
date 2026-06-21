import { useEffect, useMemo, useState } from 'react'
import LoadingSpinner from './ui/LoadingSpinner'
import { DuckDbQuery } from '../lib/query/duckdb'
import { resourceUrl, type Resource } from '../lib/datasets'

// A DuckDB-Wasm-backed data view for a single resource. Loads the file into an
// in-browser DuckDB, previews it, and lets the visitor run SQL against the table
// `data` — all client-side, no server. Rendered in place of the flat <Table />
// when the portal's DATA_QUERY engine is 'duckdb' (see lib/datasets.ts). Import it
// via next/dynamic with { ssr: false } so DuckDB only loads in the browser.

const PREVIEW_LIMIT = 50

export default function DataExplorer({ resource }: { resource: Resource }) {
  // resourceUrl() returns the bundled /data/<file> path for local files and the
  // absolute URL untouched for remote ones (e.g. a Parquet file on R2) — the
  // latter is what lets DuckDB range-query it in place.
  const url = resourceUrl(resource)
  const defaultSql = `SELECT * FROM data LIMIT ${PREVIEW_LIMIT}`

  // One engine instance per source file.
  const engine = useMemo(() => new DuckDbQuery(), [url])

  const [draft, setDraft] = useState(defaultSql)
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [ranged, setRanged] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Open the file once, then run the default preview + a row count.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        await engine.open({ url, format: resource.format })
        const count = await engine.query('SELECT count(*) AS n FROM data')
        const res = await engine.query(defaultSql)
        if (cancelled) return
        setTotal(Number(count.rows[0]?.n ?? 0))
        setRanged(engine.ranged)
        setColumns(res.columns)
        setRows(res.rows)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
      void engine.close()
    }
  }, [engine, url, resource.format, defaultSql])

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await engine.query(draft)
      setColumns(res.columns)
      setRows(res.rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <label htmlFor="sql" className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          SQL
        </label>
        {total !== null && (
          <span className="text-xs text-gray-400">
            {total.toLocaleString()} rows in <code className="bg-gray-100 px-1 rounded">data</code>
          </span>
        )}
        {ranged && (
          <span
            title="Parquet queried in place over HTTP range requests — only the bytes a query touches are fetched, never the whole file."
            className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700"
          >
            queried in place · range requests
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <textarea
          id="sql"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Cmd/Ctrl+Enter runs the query.
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run()
          }}
          rows={2}
          spellCheck={false}
          className="w-full flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="h-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running…' : 'Run'}
        </button>
      </div>

      <p className="mt-1 text-xs text-gray-400">
        Query the dataset as the table <code className="bg-gray-100 px-1 rounded">data</code> — runs
        in your browser with DuckDB-Wasm. ⌘/Ctrl + Enter to run.
        {ranged
          ? ' This Parquet file is queried directly on object storage; add a WHERE / column list so only the rows and columns you need are fetched.'
          : ' Keep a LIMIT on exploratory queries so large results don’t overwhelm the browser.'}
      </p>

      <div className="mt-4">
        {error ? (
          <pre className="overflow-x-auto rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </pre>
        ) : loading && rows.length === 0 ? (
          <LoadingSpinner />
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400">No rows.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c}
                      className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {columns.map((c) => (
                      <td key={c} className="px-3 py-2 text-gray-800 whitespace-nowrap">
                        {formatCell(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
