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
  // A query-first dataset can ship a starter query (resource.query) — otherwise
  // open on a generic preview. The in-browser table is always named `data`.
  const defaultSql = resource.query ?? `SELECT * FROM data LIMIT ${PREVIEW_LIMIT}`

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
      <div className="mb-3.5 flex items-center gap-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
          Query this dataset (SQL)
        </span>
        {total !== null && (
          <span className="font-mono text-[11px] text-ink/40">
            {total.toLocaleString()} rows in <code>data</code>
          </span>
        )}
        {ranged && (
          <span
            title="Parquet queried in place over HTTP range requests — only the bytes a query touches are fetched, never the whole file."
            className="border border-accent/50 px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.06em] text-accent"
          >
            queried in place · range requests
          </span>
        )}
      </div>

      <div className="border border-ink/[0.18]">
        <textarea
          id="sql"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Cmd/Ctrl+Enter runs the query.
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run()
          }}
          rows={4}
          spellCheck={false}
          className="block w-full resize-y border-0 bg-cream-code px-4 py-4 font-mono text-[13.5px] leading-relaxed text-ink focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-ink/[0.15] px-4 py-2.5">
          <span className="font-mono text-[11px] text-ink/40">
            DuckDB-Wasm · runs in your browser · ⌘/Ctrl + Enter
          </span>
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="bg-accent px-[18px] py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.06em] text-cream hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Running…' : 'Run ▶'}
          </button>
        </div>
      </div>

      <p className="mt-2 font-sans text-xs text-ink/45">
        {ranged
          ? 'This Parquet file is queried directly on object storage; add a WHERE / column list so only the rows and columns you need are fetched.'
          : 'Keep a LIMIT on exploratory queries so large results don’t overwhelm the browser.'}
      </p>

      <div className="mt-[18px]">
        {error ? (
          <pre className="overflow-x-auto border border-red-300 bg-red-50 p-3 font-mono text-sm text-red-700">
            {error}
          </pre>
        ) : loading && rows.length === 0 ? (
          <LoadingSpinner />
        ) : rows.length === 0 ? (
          <p className="font-serif text-[15px] italic text-ink/55">No rows.</p>
        ) : (
          <>
            <div className="overflow-x-auto border border-ink/[0.18]">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c}
                        className="whitespace-nowrap bg-cream-panel px-4 py-3 text-left font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/60"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t border-ink/[0.1] hover:bg-cream-panel/50">
                      {columns.map((c) => (
                        <td
                          key={c}
                          className="whitespace-nowrap px-4 py-3 font-mono text-[13px] text-ink"
                        >
                          {formatCell(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2.5 font-mono text-[11px] text-ink/40">
              {rows.length} rows returned
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  // DuckDB returns wide integers (a HUGEINT from SUM/COUNT, or a BIGINT) as a
  // BigInt or a small wrapper object whose toString() is the number — print that
  // rather than JSON.stringify, which would wrap it in escaped quotes.
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'object') {
    const s = String(value)
    return s === '[object Object]' ? JSON.stringify(value) : s
  }
  return String(value)
}
