import type { DataQuery, QueryResult, QuerySource } from './types'

// DuckDB-Wasm data-query engine: runs SQL over a dataset's CSV/TSV/Parquet
// entirely in the browser — no server, no datastore. The wasm + worker bundles
// are fetched on demand from jsDelivr (DuckDB's published CDN bundles), and
// `@duckdb/duckdb-wasm` is imported dynamically, so nothing is added to the app
// bundle until a query view actually mounts.
//
// Two execution paths, chosen by the source (see open()):
//
//   • Range query (remote Parquet) — when the file is a remote Parquet URL (e.g.
//     a dataset published to R2, epic po-g9y), DuckDB reads it IN PLACE over HTTP
//     range requests via its built-in HTTP filesystem. The table `data` is a VIEW
//     over read_parquet(url), so every query pushes projection + predicate down to
//     the file: only the Parquet footer plus the row groups / columns a query
//     actually touches are fetched, never the whole file. This is the no-download
//     tier — a phone can query a multi-GB file by pulling a few MB. R2 must serve
//     range requests + CORS (configured + verified in giftless/r2-cors.json).
//
//   • Buffered (everything else) — local/bundled files and CSV/TSV are fetched
//     once and registered as an in-memory buffer, then materialized as a TABLE.
//     Simplest and fastest for small data; the whole file lands in Wasm memory
//     (~4 GB ceiling), so it's the wrong tier for large remote data.
//
// This is the client-side rung of the compute spectrum. The same DataQuery
// interface can later be implemented by a server-side / remote DuckDB (for data
// too big for the browser) or a backend datastore, without changing the UI that
// consumes it — see lib/query/README.md for the device-tier / fallback guidance.
export class DuckDbQuery implements DataQuery {
  readonly engine = 'duckdb-wasm'

  private db: any = null
  private conn: any = null
  private worker: Worker | null = null
  // True when open() took the remote-Parquet range path. The UI reads this to
  // tell the visitor the file is queried in place rather than downloaded.
  private _ranged = false

  // Whether the open source is queried over HTTP range requests (remote Parquet)
  // rather than fully buffered into memory.
  get ranged(): boolean {
    return this._ranged
  }

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
      this.conn = await this.db.connect()

      const isParquet = source.format === 'parquet'
      const isRemote = /^https?:\/\//i.test(source.url)
      this._ranged = isParquet && isRemote

      if (this._ranged) {
        // Range path: register the URL (HTTP protocol) and expose it as a VIEW so
        // projection/predicate pushdown reaches the file over range requests —
        // nothing is buffered up front. Reading the Parquet footer alone gives an
        // accurate count(*), so the preview stays cheap.
        await this.db.registerFileURL(
          'data.parquet',
          source.url,
          duckdb.DuckDBDataProtocol.HTTP,
          false
        )
        await this.conn.query(
          `CREATE OR REPLACE VIEW data AS SELECT * FROM read_parquet('data.parquet')`
        )
        return
      }

      // Buffered path: fetch the file once and register it in DuckDB's virtual
      // filesystem, then materialize the table `data`. read_csv_auto sniffs the
      // schema; TSV is the same reader with a tab delimiter; Parquet is read
      // directly.
      const res = await fetch(source.url)
      if (!res.ok) {
        throw new Error(`Failed to fetch ${source.url} (${res.status})`)
      }
      const buf = new Uint8Array(await res.arrayBuffer())
      const fname = isParquet ? 'data.parquet' : 'data.csv'
      await this.db.registerFileBuffer(fname, buf)

      const reader = isParquet
        ? `read_parquet('${fname}')`
        : source.format === 'tsv'
        ? `read_csv_auto('${fname}', delim='\t')`
        : `read_csv_auto('${fname}')`

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
      this._ranged = false
    }
  }
}
