// Build a minimal ustar tar and gzip it — used to exercise untar + the deploy handler
// without external fixtures. CompressionStream is available in Node 18+.

const enc = new TextEncoder()

function tarHeader(name: string, size: number, type = '0'): Uint8Array {
  const h = new Uint8Array(512)
  h.set(enc.encode(name).subarray(0, 100), 0)
  h.set(enc.encode('0000644\0'), 100) // mode
  h.set(enc.encode(size.toString(8).padStart(11, '0') + '\0'), 124) // size (octal, 12 bytes)
  h.set(enc.encode('00000000000\0'), 136) // mtime
  h[156] = type.charCodeAt(0)
  h.set(enc.encode('ustar\0'), 257)
  h.set(enc.encode('00'), 263)
  // checksum: computed with the checksum field filled with spaces
  for (let i = 148; i < 156; i++) h[i] = 0x20
  let sum = 0
  for (let i = 0; i < 512; i++) sum += h[i]
  h.set(enc.encode(sum.toString(8).padStart(6, '0') + '\0 '), 148)
  return h
}

export function makeTar(files: { name: string; data: string }[]): Uint8Array {
  const blocks: Uint8Array[] = []
  for (const f of files) {
    const d = enc.encode(f.data)
    blocks.push(tarHeader(f.name, d.length))
    const padded = new Uint8Array(Math.ceil(d.length / 512) * 512)
    padded.set(d)
    blocks.push(padded)
  }
  blocks.push(new Uint8Array(512), new Uint8Array(512)) // end marker
  const total = blocks.reduce((n, b) => n + b.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const b of blocks) {
    out.set(b, off)
    off += b.length
  }
  return out
}

export async function gzip(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip')
  const w = cs.writable.getWriter()
  w.write(data)
  w.close()
  const chunks: Uint8Array[] = []
  const r = cs.readable.getReader()
  for (;;) {
    const { done, value } = await r.read()
    if (done) break
    chunks.push(value)
  }
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const c of chunks) {
    out.set(c, off)
    off += c.length
  }
  return out
}

// Minimal fakes for R2 + D1, just enough for the deploy handler.
export class FakeR2 {
  store = new Map<string, Uint8Array>()
  async put(key: string, value: Uint8Array) {
    this.store.set(key, value)
  }
}

export class FakeD1 {
  tokens = new Map<string, string>() // hash -> user_id
  projects: { id: string; user_id: string; slug: string }[] = []
  deployments: any[] = []
  prepare(sql: string) {
    return new FakeStmt(this, sql)
  }
}

class FakeStmt {
  args: any[] = []
  constructor(private db: FakeD1, private sql: string) {}
  bind(...a: any[]) {
    this.args = a
    return this
  }
  async first<T = any>(): Promise<T | null> {
    if (this.sql.includes('FROM tokens')) {
      const u = this.db.tokens.get(this.args[0])
      return (u ? { user_id: u } : null) as any
    }
    if (this.sql.includes('FROM projects')) {
      return (this.db.projects.find((p) => p.slug === this.args[0]) ?? null) as any
    }
    if (this.sql.includes('FROM deployments')) {
      return (this.db.deployments.find((d) => d.id === this.args[0]) ?? null) as any
    }
    return null
  }
  async run() {
    if (this.sql.startsWith('INSERT INTO projects')) {
      const [id, user_id, slug] = this.args
      this.db.projects.push({ id, user_id, slug })
    } else if (this.sql.startsWith('INSERT INTO deployments')) {
      const [id, project_id, status, files, bytes] = this.args
      this.db.deployments.push({ id, project_id, status, files, bytes })
    }
    return { success: true } as any
  }
}
