// The data-query contract.
//
// Where the data-provider contract (lib/providers) is about *catalog metadata* —
// which datasets exist — this is about a dataset's *data*: running structured
// queries over it, beyond a flat-file preview.
//
// The flat/static default doesn't implement this (the showcase just previews the
// CSV). The DuckDB engine (lib/query/duckdb.ts) runs SQL over CSV/Parquet entirely
// in the browser; a backend datastore (e.g. CKAN's, or a server-side DuckDB) could
// implement the same interface. This is the "compute" slot on the storage+compute
// spectrum — see ROADMAP.md.

export type QueryResult = {
  columns: string[]
  rows: Record<string, unknown>[]
}

export type QuerySource = {
  // URL to the dataset file (e.g. /data/foo.csv, or a remote URL).
  url: string
  format: 'csv' | 'tsv' | 'json' | 'parquet' | string
}

export interface DataQuery {
  // Engine identifier, e.g. 'duckdb-wasm'.
  readonly engine: string

  // Load a dataset's file and expose it as the SQL table `data`.
  open(source: QuerySource): Promise<void>

  // Run SQL against the opened source and return rows + column order.
  query(sql: string): Promise<QueryResult>

  // Release engine resources.
  close(): Promise<void>
}
