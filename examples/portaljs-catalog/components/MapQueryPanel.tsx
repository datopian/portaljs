import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_QUERY,
  attributeColumns,
  buildFilterSql,
  exampleQueries,
  operatorsForType,
  opTakesValue,
  quoteIdent,
  isNumericType,
  type Filter,
  type FilterOp,
  type LogicalColumn,
} from '../lib/query/logical'

// The query surface under the dataset map — the part of epic po-0qe.6.3 §4/§4b
// that makes a spatial dataset queryable by a NON-technical visitor, not just a
// SQL writer. It sits below <MapPreview>'s map and drives it: every query paints
// its matches as the highlight overlay on that same map (via the `run` prop) and
// fills the Table/Chart tabs here.
//
// Three surfaces, in ascending expertise:
//   • FILTER BUILDER (default) — pick a column (by its human alias), an operator,
//     and a value; chips compose into a query with NO SQL. A "limit to map view"
//     checkbox clips to the current viewport (replacing the old baked-in bbox
//     predicate).
//   • EXAMPLE QUERIES — per-dataset starters generated from the schema.
//   • SQL (advanced) — the raw editor, with a click-to-insert schema panel beside
//     it and human-readable errors. Hidden behind its own tab so casual users
//     never see a WHERE clause.
//
// The Table tab is the DEFAULT and shows aliased columns + a row count; the map
// stays the primary render above.

export type RunResult = { columns: string[]; rows: Record<string, unknown>[] }

type SortState = { col: string; dir: 'asc' | 'desc' } | null
type Tab = 'table' | 'chart' | 'sql'

export default function MapQueryPanel({
  columns,
  totalRows,
  run,
  clear,
}: {
  // Logical columns of the `data` view (null while the engine is still opening).
  columns: LogicalColumn[] | null
  // Total feature count in the dataset (for the "of N" row-count line).
  totalRows: number | null
  // Execute a logical query: MapPreview rebuilds the clipped `data` view, wraps
  // the query for the map, runs it, paints the overlay when `paint`, and returns
  // the table rows (or throws a HUMANIZED error string).
  run: (sql: string, opts: { limitToView: boolean; paint: boolean }) => Promise<RunResult>
  // Clear the map highlight overlay.
  clear: () => void
}) {
  const attrs = useMemo(() => (columns ? attributeColumns(columns) : []), [columns])
  const aliases = useMemo(() => attrs.map((c) => c.alias), [attrs])
  const examples = useMemo(() => (columns ? exampleQueries(columns) : []), [columns])

  const [tab, setTab] = useState<Tab>('table')
  const [filters, setFilters] = useState<Filter[]>([])
  const [limitToView, setLimitToView] = useState(false)
  const [draft, setDraft] = useState(DEFAULT_QUERY)
  const [result, setResult] = useState<RunResult>({ columns: [], rows: [] })
  const [sampleRow, setSampleRow] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [active, setActive] = useState(false) // a user query is driving the overlay
  const [sort, setSort] = useState<SortState>(null)
  const [examplesOpen, setExamplesOpen] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Run a query and route its outcome into the panel. `paint` decides whether the
  // map highlights the matches (off for the initial unfiltered preview, on once
  // the user filters/queries — the render layer already shows everything).
  const execute = async (
    sql: string,
    opts: { limitToView: boolean; paint: boolean; capturesSample?: boolean }
  ) => {
    setBusy(true)
    setError(null)
    try {
      const res = await run(sql, { limitToView: opts.limitToView, paint: opts.paint })
      setResult(res)
      setSort(null)
      setActive(opts.paint)
      // Keep the first full-row result as the schema panel's sample values.
      if (opts.capturesSample && res.rows.length) setSampleRow(res.rows[0])
    } catch (e) {
      setError(typeof e === 'string' ? e : e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  // Initial preview: once the columns resolve, load the first rows into the Table
  // tab (no overlay, no clip) so a visitor sees data without lifting a finger.
  useEffect(() => {
    if (!columns) return
    void execute(DEFAULT_QUERY, { limitToView: false, paint: false, capturesSample: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns])

  const applyFilters = () => {
    if (!columns) return
    const sql = buildFilterSql(filters, columns)
    setDraft(sql)
    void execute(sql, { limitToView, paint: true })
    setTab('table')
  }

  const viewAsSql = () => {
    if (!columns) return
    setDraft(buildFilterSql(filters, columns))
    setTab('sql')
  }

  const runEditor = () => {
    void execute(draft, { limitToView, paint: true })
  }

  const runExample = (sql: string, exampleLimitToView?: boolean) => {
    setExamplesOpen(false)
    setDraft(sql)
    setTab('sql')
    const clip = exampleLimitToView ?? false
    setLimitToView(clip)
    void execute(sql, { limitToView: clip, paint: true })
  }

  const clearAll = () => {
    setFilters([])
    setLimitToView(false)
    setActive(false)
    setError(null)
    clear()
    void execute(DEFAULT_QUERY, { limitToView: false, paint: false })
  }

  // Insert a quoted column identifier into the SQL editor at the caret.
  const insertColumn = (alias: string) => {
    setTab('sql')
    const ident = quoteIdent(alias)
    const ta = editorRef.current
    if (!ta) {
      setDraft((d) => `${d} ${ident}`)
      return
    }
    const start = ta.selectionStart ?? draft.length
    const end = ta.selectionEnd ?? draft.length
    const next = draft.slice(0, start) + ident + draft.slice(end)
    setDraft(next)
    requestAnimationFrame(() => {
      ta.focus()
      const caret = start + ident.length
      ta.setSelectionRange(caret, caret)
    })
  }

  const sortedRows = useMemo(() => {
    if (!sort) return result.rows
    const { col, dir } = sort
    const factor = dir === 'asc' ? 1 : -1
    return [...result.rows].sort((a, b) => {
      const av = a[col]
      const bv = b[col]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
      return String(av).localeCompare(String(bv)) * factor
    })
  }, [result.rows, sort])

  const toggleSort = (col: string) => {
    setSort((s) =>
      s && s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' }
    )
  }

  const loadingColumns = columns === null

  return (
    <div className="mt-4">
      {/* --- Query controls: filter builder + limit-to-view + examples --------- */}
      <div className="border border-ink/[0.18] bg-cream-panel/40 px-4 py-3.5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
            Filter this dataset
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setExamplesOpen((o) => !o)}
              disabled={loadingColumns || !examples.length}
              className="border border-ink/20 px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/70 hover:border-accent hover:text-accent disabled:opacity-40"
            >
              Examples ▾
            </button>
            {examplesOpen && (
              <div className="absolute right-0 z-10 mt-1 w-64 border border-ink/20 bg-cream shadow-md">
                {examples.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => runExample(ex.sql, ex.limitToView)}
                    className="block w-full px-3 py-2 text-left font-sans text-[13px] text-ink hover:bg-cream-panel hover:text-accent"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-col gap-2">
          {filters.map((f, i) => (
            <FilterRow
              key={i}
              filter={f}
              columns={attrs}
              onChange={(next) =>
                setFilters((fs) => fs.map((x, j) => (j === i ? next : x)))
              }
              onRemove={() => setFilters((fs) => fs.filter((_, j) => j !== i))}
            />
          ))}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              setFilters((fs) => [...fs, { column: aliases[0] ?? '', op: '=', value: '' }])
            }
            disabled={loadingColumns || !aliases.length}
            className="border border-ink/20 px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/70 hover:border-accent hover:text-accent disabled:opacity-40"
          >
            + Add filter
          </button>
          <label className="flex cursor-pointer items-center gap-1.5 font-sans text-[12px] text-ink/70">
            <input
              type="checkbox"
              checked={limitToView}
              onChange={(e) => setLimitToView(e.target.checked)}
              className="accent-accent"
            />
            Limit to map view
          </label>
          <div className="ml-auto flex items-center gap-2">
            {(filters.length > 0 || active) && (
              <button
                type="button"
                onClick={clearAll}
                disabled={busy}
                className="border border-ink/20 px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/60 hover:border-accent hover:text-accent disabled:opacity-40"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={viewAsSql}
              disabled={loadingColumns}
              className="border border-ink/20 px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/70 hover:border-accent hover:text-accent disabled:opacity-40"
            >
              View as SQL
            </button>
            <button
              type="button"
              onClick={applyFilters}
              disabled={busy || loadingColumns}
              className="bg-accent px-4 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-cream hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'Running…' : 'Apply'}
            </button>
          </div>
        </div>
      </div>

      {/* --- Tabs: Table (default) | Chart | SQL ------------------------------- */}
      <div className="mt-3 flex items-center gap-1.5">
        {(['table', 'chart', 'sql'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border px-3.5 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] ${
              tab === t
                ? 'border-accent bg-accent text-cream'
                : 'border-ink/20 bg-cream text-ink/70 hover:text-accent'
            }`}
          >
            {t === 'sql' ? 'SQL' : t}
          </button>
        ))}
        {tab !== 'sql' && (
          <span className="ml-auto font-mono text-[11px] text-ink/40">
            {loadingColumns
              ? 'loading…'
              : `${result.rows.length.toLocaleString()} row${result.rows.length === 1 ? '' : 's'}` +
                (totalRows != null && !active ? ` of ${totalRows.toLocaleString()}` : active ? ' matched' : '')}
          </span>
        )}
      </div>

      {error && tab !== 'sql' && <ErrorBox message={error} />}

      <div className="mt-3">
        {tab === 'table' && (
          <ResultTable
            columns={result.columns}
            rows={sortedRows}
            sort={sort}
            onSort={toggleSort}
            busy={busy}
            loadingColumns={loadingColumns}
          />
        )}
        {tab === 'chart' && <ResultChart columns={result.columns} rows={result.rows} />}
        {tab === 'sql' && (
          <SqlTab
            draft={draft}
            setDraft={setDraft}
            onRun={runEditor}
            busy={busy}
            error={error}
            columns={attrs}
            sampleRow={sampleRow}
            onInsert={insertColumn}
            editorRef={editorRef}
          />
        )}
      </div>

      <p className="mt-2.5 font-sans text-xs text-ink/45">
        Filter without SQL above, or open the SQL tab for full DuckDB. Matches highlight on the map;
        click any feature for its attributes.
      </p>
    </div>
  )
}

// One filter chip: column (by alias) + operator + value.
function FilterRow({
  filter,
  columns,
  onChange,
  onRemove,
}: {
  filter: Filter
  columns: LogicalColumn[]
  onChange: (f: Filter) => void
  onRemove: () => void
}) {
  const col = columns.find((c) => c.alias === filter.column)
  const ops = operatorsForType(col?.type ?? 'string')
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filter.column}
        onChange={(e) => onChange({ ...filter, column: e.target.value })}
        className="border border-ink/20 bg-cream px-2 py-1.5 font-sans text-[12px] text-ink"
      >
        {columns.map((c) => (
          <option key={c.raw} value={c.alias}>
            {c.alias}
          </option>
        ))}
      </select>
      <select
        value={filter.op}
        onChange={(e) => onChange({ ...filter, op: e.target.value as FilterOp })}
        className="border border-ink/20 bg-cream px-2 py-1.5 font-sans text-[12px] text-ink"
      >
        {ops.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {opTakesValue(filter.op) && (
        <input
          type={col && isNumericType(col.type) ? 'number' : 'text'}
          value={filter.value}
          onChange={(e) => onChange({ ...filter, value: e.target.value })}
          placeholder="value"
          className="min-w-[120px] flex-1 border border-ink/20 bg-cream px-2 py-1.5 font-sans text-[12px] text-ink"
        />
      )}
      <button
        type="button"
        aria-label="Remove filter"
        onClick={onRemove}
        className="px-2 py-1 font-sans text-sm leading-none text-ink/40 hover:text-accent"
      >
        ×
      </button>
    </div>
  )
}

// The SQL (advanced) tab: click-to-insert schema panel beside the raw editor,
// with human-readable errors below.
function SqlTab({
  draft,
  setDraft,
  onRun,
  busy,
  error,
  columns,
  sampleRow,
  onInsert,
  editorRef,
}: {
  draft: string
  setDraft: (s: string) => void
  onRun: () => void
  busy: boolean
  error: string | null
  columns: LogicalColumn[]
  sampleRow: Record<string, unknown> | null
  onInsert: (alias: string) => void
  editorRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
        <div className="min-w-0">
          <div className="border border-ink/[0.18]">
            <textarea
              ref={editorRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') onRun()
              }}
              rows={6}
              spellCheck={false}
              className="block w-full resize-y border-0 bg-cream-code px-4 py-4 font-mono text-[13.5px] leading-relaxed text-ink focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/[0.15] px-4 py-2.5">
              <span
                title="The bbox pre-filter that prunes Parquet row groups is injected by the engine when “Limit to map view” is on — you never write it."
                className="cursor-help font-mono text-[11px] text-ink/40"
              >
                DuckDB-Wasm + spatial · runs in your browser · ⌘/Ctrl + Enter
              </span>
              <button
                type="button"
                onClick={onRun}
                disabled={busy}
                className="bg-accent px-[18px] py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.06em] text-cream hover:opacity-90 disabled:opacity-50"
              >
                {busy ? 'Running…' : 'Run ▶'}
              </button>
            </div>
          </div>
          {error && <ErrorBox message={error} />}
        </div>

        {/* Schema panel — click a field to insert its (aliased) name. */}
        <div className="border border-ink/[0.18]">
          <div className="border-b border-ink/[0.12] bg-cream-panel px-3 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-ink/55">
            Columns · click to insert
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {columns.map((c) => (
              <button
                key={c.raw}
                type="button"
                onClick={() => onInsert(c.alias)}
                title={c.description}
                className="block w-full border-b border-ink/[0.08] px-3 py-2 text-left hover:bg-cream-panel"
              >
                <div className="font-sans text-[12px] font-medium text-ink">{c.alias}</div>
                {c.alias !== c.raw && (
                  <div className="font-mono text-[10.5px] text-ink/45">{c.raw}</div>
                )}
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="font-mono text-[10px] uppercase text-accent/80">{simpleType(c.type)}</span>
                  {sampleRow && sampleRow[c.alias] != null && (
                    <span className="truncate font-serif text-[11px] italic text-ink/50">
                      e.g. {String(sampleRow[c.alias])}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-3 border border-red-300 bg-red-50 px-3.5 py-2.5 font-sans text-[13px] leading-snug text-red-700">
      {message}
    </div>
  )
}

function ResultTable({
  columns,
  rows,
  sort,
  onSort,
  busy,
  loadingColumns,
}: {
  columns: string[]
  rows: Record<string, unknown>[]
  sort: SortState
  onSort: (col: string) => void
  busy: boolean
  loadingColumns: boolean
}) {
  if (loadingColumns || (busy && !rows.length)) {
    return <p className="font-serif text-[15px] italic text-ink/55">Loading data…</p>
  }
  if (!rows.length) return <p className="font-serif text-[15px] italic text-ink/55">No rows.</p>
  return (
    <div className="overflow-x-auto border border-ink/[0.18]">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((c) => {
              const arrow = sort?.col === c ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''
              return (
                <th
                  key={c}
                  onClick={() => onSort(c)}
                  className="cursor-pointer select-none whitespace-nowrap bg-cream-panel px-4 py-3 text-left font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/60 hover:text-accent"
                >
                  {c}
                  <span className="text-accent">{arrow}</span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-ink/[0.1] hover:bg-cream-panel/50">
              {columns.map((c) => (
                <td key={c} className="whitespace-nowrap px-4 py-3 font-mono text-[13px] text-ink">
                  {formatCell(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Dependency-free horizontal bar chart: first text column = labels, first numeric
// column = values (mirrors the map result chart).
function ResultChart({ columns, rows }: { columns: string[]; rows: Record<string, unknown>[] }) {
  const numericCol = columns.find((c) => rows.some((r) => typeof r[c] === 'number'))
  const labelCol =
    columns.find((c) => c !== numericCol && rows.some((r) => typeof r[c] === 'string')) ?? columns[0]
  if (!numericCol || !rows.length) {
    return (
      <p className="font-serif text-[15px] italic text-ink/55">
        Add a numeric column to chart the result — try an “Examples ▸ Count by …” query.
      </p>
    )
  }
  const values = rows.map((r) => Number(r[numericCol]) || 0)
  const max = Math.max(...values, 1)
  const shown = rows.slice(0, 30)
  return (
    <div className="border border-ink/[0.18] p-4">
      <div className="mb-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/50">
        {numericCol} by {labelCol}
      </div>
      {shown.map((r, i) => {
        const v = Number(r[numericCol]) || 0
        return (
          <div key={i} className="mb-1 flex items-center gap-2.5">
            <span className="w-32 flex-shrink-0 truncate font-sans text-[12px] text-ink/80">
              {String(r[labelCol] ?? '')}
            </span>
            <span className="relative h-4 flex-1 bg-cream-panel">
              <span className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${(v / max) * 100}%` }} />
            </span>
            <span className="w-24 flex-shrink-0 text-right font-mono text-[12px] text-ink/70">
              {v.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Shorten a DuckDB type for the schema panel (STRUCT(...)/DECIMAL(...) → head).
function simpleType(type: string): string {
  return (type.split('(')[0] || type).toLowerCase()
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'object') {
    const s = String(value)
    return s === '[object Object]' ? JSON.stringify(value) : s
  }
  return String(value)
}
