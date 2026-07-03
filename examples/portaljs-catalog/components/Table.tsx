import React, { useEffect, useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
  type PaginationState,
} from '@tanstack/react-table'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'
import DebouncedInput from './ui/DebouncedInput'
import LoadingSpinner from './ui/LoadingSpinner'
import { parseCsv } from './ui/parseCsv'

type Row = Record<string, string | number>
type Col = { key: string; name: string }

export interface TableProps {
  data?: Row[]
  cols?: Col[]
  csv?: string
  url?: string
  fullWidth?: boolean
}

const globalFilterFn: FilterFn<Row> = (row, columnId, filterValue: string) => {
  const value = String(row.getValue(columnId) ?? '').toLowerCase()
  return value.includes(filterValue.toLowerCase())
}

export function Table({ data: initialData = [], cols: initialCols = [], csv = '', url = '', fullWidth = false }: TableProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const [data, setData] = useState<Row[]>(() => {
    if (csv) return parseCsv(csv).rows
    return initialData
  })
  const [columns, setColumns] = useState<Col[]>(() => {
    if (csv) return parseCsv(csv).fields
    return initialCols
  })

  // Keep state in sync when non-URL props change
  useEffect(() => {
    if (url) return
    if (csv) {
      const parsed = parseCsv(csv)
      setData(parsed.rows)
      setColumns(parsed.fields)
    } else {
      setData(initialData)
      setColumns(initialCols)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csv, url, JSON.stringify(initialData), JSON.stringify(initialCols)])

  useEffect(() => {
    if (!url) return
    setIsLoading(true)
    setError(null)
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${r.statusText}`)
        return r.text()
      })
      .then((text) => {
        const { rows, fields } = parseCsv(text)
        setData(rows)
        setColumns(fields)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [url])

  const columnHelper = createColumnHelper<Row>()
  const tableCols = useMemo(
    () => columns.map((c) => columnHelper.accessor(c.key, { header: () => c.name, cell: (i) => i.getValue() })),
    [columns]
  )

  const table = useReactTable({
    data,
    columns: tableCols,
    state: { globalFilter, pagination: { pageIndex, pageSize } },
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-300 bg-red-50 p-4 font-mono text-sm text-red-700">
        Failed to load data: {error}
      </div>
    )
  }

  const filteredRows = table.getFilteredRowModel().rows.length

  return (
    <div className={fullWidth ? 'ml-[calc(50%-45vw)] w-[90vw]' : 'w-full'}>
      <div className="mb-3.5 flex items-baseline justify-end">
        <DebouncedInput
          value={globalFilter}
          onChange={(v) => setGlobalFilter(String(v))}
          className="w-[190px] border-0 border-b border-ink/30 bg-transparent pb-1.5 font-serif text-sm italic text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
          placeholder="Search all columns…"
        />
      </div>
      <div className="overflow-x-auto border border-ink/[0.18]">
        <table className="w-full border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="cursor-pointer select-none whitespace-nowrap bg-cream-panel px-4 py-3 text-left font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/60"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === 'asc' && <ArrowUpIcon className="ml-1 inline h-3 w-3" />}
                    {h.column.getIsSorted() === 'desc' && <ArrowDownIcon className="ml-1 inline h-3 w-3" />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id} className="border-t border-ink/[0.1] hover:bg-cream-panel/50">
                {r.getVisibleCells().map((c) => (
                  <td key={c.id} className="px-4 py-3 font-sans text-[13.5px] text-ink">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2.5 flex items-center justify-between font-sans text-xs font-medium text-ink/45">
        <span>
          Showing {table.getRowModel().rows.length} of {filteredRows} rows
        </span>
        {table.getPageCount() > 1 && (
          <span className="flex items-center gap-2">
            {[
              { Icon: ChevronDoubleLeftIcon, action: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage() },
              { Icon: ChevronLeftIcon, action: () => table.previousPage(), disabled: !table.getCanPreviousPage() },
              { Icon: ChevronRightIcon, action: () => table.nextPage(), disabled: !table.getCanNextPage() },
              { Icon: ChevronDoubleRightIcon, action: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() },
            ].map(({ Icon, action, disabled }, i) => (
              <button
                key={i}
                onClick={action}
                disabled={disabled}
                className={`h-4 w-4 text-ink ${disabled ? 'opacity-25' : 'opacity-100 hover:text-accent'}`}
              >
                <Icon />
              </button>
            ))}
            <span className="ml-1">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}
