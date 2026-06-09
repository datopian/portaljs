import type { DataQuery, QueryResult, QuerySource } from './types'

// DuckDB-Wasm data-query engine: runs SQL over a dataset's CSV/TSV/Parquet
// entirely in the browser — no server, no datastore. The wasm + worker bundles
// are fetched on demand from jsDelivr (DuckDB's published CDN bundles), and
// `@duckdb/duckdb-wasm` is imported dynamically, so nothing is added to the app
// bundle until a query view actually mounts.
//
// This is the client-side rung of the compute spectrum. The same DataQuery
// interface can later be implemented by a server-side / remote DuckDB (for large
// data) or a backend datastore, without changing the UI that consumes it.
export class DuckDbQuery implements DataQuery {
  readonly engine = 'duckdb-wasm'

  private db: any = null
  private conn: any = null
  private worker: Worker | null = null

  async open(source: QuerySource): Promise<void> {
    // Tear down anything from a previous open() so a retry can't leak a worker
    // or DB handle.
    await this.close()

    const duckdb = await import('@duckdb/duckdb-wasm')
    let workerUrl: string | null = null
    try {
      // Pick the best wasm bundle for this browser and spin up the worker from a
      // Blob URL — avoids any bundler/worker configuration in the host app.
      const bundles = duckdb.getJsDelivrBundles()
      const bundle = await duckdb.selectBundle(bundles)
      workerUrl = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {
          type: 'text/javascript',
        })
      )
      this.worker = new Worker(workerUrl)
      const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING)
      this.db = new duckdb.AsyncDuckDB(logger, this.worker)
      await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker)

      // Fetch the file and register it in DuckDB's virtual filesystem.
      const res = await fetch(source.url)
      if (!res.ok) {
        throw new Error(`Failed to fetch ${source.url} (${res.status})`)
      }
      const buf = new Uint8Array(await res.arrayBuffer())
      const isParquet = source.format === 'parquet'
      const fname = isParquet ? 'data.parquet' : 'data.csv'
      await this.db.registerFileBuffer(fname, buf)

      // Materialize the file as the table `data`. read_csv_auto sniffs the
      // schema; TSV is the same reader with a tab delimiter; Parquet is read
      // directly.
      const reader = isParquet
        ? `read_parquet('${fname}')`
        : source.format === 'tsv'
        ? `read_csv_auto('${fname}', delim='\t')`
        : `read_csv_auto('${fname}')`

      this.conn = await this.db.connect()
      await this.conn.query(`CREATE OR REPLACE TABLE data AS SELECT * FROM ${reader}`)
    } catch (e) {
      // Don't leave a half-initialized engine behind on failure.
      await this.close()
      throw e
    } finally {
      if (workerUrl) URL.revokeObjectURL(workerUrl)
    }
  }

  async query(sql: string): Promise<QueryResult> {
    if (!this.conn) throw new Error('Query engine is not open')
    const table = await this.conn.query(sql)
    const columns: string[] = table.schema.fields.map((f: any) => f.name)
    const rows = table.toArray().map((row: any) => {
      const obj = row.toJSON() as Record<string, unknown>
      // Arrow returns BigInt for 64-bit ints; coerce so values render/serialize.
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'bigint') obj[key] = Number(obj[key])
      }
      return obj
    })
    return { columns, rows }
  }

  async close(): Promise<void> {
    try {
      await this.conn?.close()
      await this.db?.terminate()
      this.worker?.terminate()
    } finally {
      this.conn = null
      this.db = null
      this.worker = null
    }
  }
}
