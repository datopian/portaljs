import { describe, it, expect, beforeEach } from 'vitest'
import { handleUploadSource, handleListSources, handleGetSource, type Env } from '../src/index'
import { sha256Hex } from '../src/db'
import { FakeR2 } from './helpers'

// Fake covering the tokens⋈users and deployments⋈projects⋈users JOINs po-ce7's
// source-snapshot handlers issue (distinct from deploy.test.ts's FakeD1, which only
// exercises handleDeploy's simpler queries — same convention as lfs.test.ts).
class FakeD1 {
  users: { id: string; login: string; is_staff: number }[] = []
  tokens: { hash: string; user_id: string; revoked: boolean }[] = []
  projects: { id: string; user_id: string; slug: string }[] = []
  deployments: {
    id: string
    project_id: string
    status: string
    files: number
    bytes: number
    source_key: string | null
    source_bytes: number | null
    created_at: string
  }[] = []
  prepare(sql: string) {
    return new Stmt(this, sql)
  }
}

class Stmt {
  args: any[] = []
  constructor(private db: FakeD1, private sql: string) {}
  bind(...a: any[]) {
    this.args = a
    return this
  }
  async first<T = any>(): Promise<T | null> {
    const sql = this.sql
    if (sql.includes('FROM tokens t JOIN users u')) {
      const t = this.db.tokens.find((x) => x.hash === this.args[0] && !x.revoked)
      if (!t) return null
      const u = this.db.users.find((u) => u.id === t.user_id)
      return (u ? { id: u.id, login: u.login, is_staff: u.is_staff } : null) as any
    }
    if (sql.includes('FROM deployments d JOIN projects p ON p.id = d.project_id JOIN users u')) {
      const d = this.db.deployments.find((d) => d.id === this.args[0])
      if (!d) return null
      const p = this.db.projects.find((p) => p.id === d.project_id)
      const u = p && this.db.users.find((u) => u.id === p.user_id)
      if (!p || !u) return null
      return {
        id: d.id,
        project_id: d.project_id,
        slug: p.slug,
        user_id: p.user_id,
        owner_login: u.login,
        status: d.status,
        files: d.files,
        bytes: d.bytes,
        source_key: d.source_key,
        source_bytes: d.source_bytes,
        created_at: d.created_at,
      } as any
    }
    if (sql.includes('FROM projects WHERE slug')) {
      return (this.db.projects.find((p) => p.slug === this.args[0]) ?? null) as any
    }
    return null
  }
  async all<T = any>(): Promise<{ results: T[] }> {
    if (this.sql.includes('FROM deployments d JOIN projects p') && this.sql.includes('p.slug = ?')) {
      const slug = this.args[0]
      const rows = this.db.deployments
        .filter((d) => this.db.projects.find((p) => p.id === d.project_id)?.slug === slug && d.source_key)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .map((d) => ({ deployment_id: d.id, source_key: d.source_key, source_bytes: d.source_bytes, created_at: d.created_at }))
      return { results: rows as any }
    }
    return { results: [] }
  }
  async run() {
    if (this.sql.startsWith('UPDATE deployments SET source_key')) {
      const [key, bytes, id] = this.args
      const d = this.db.deployments.find((d) => d.id === id)
      if (d && d.source_key === null) {
        d.source_key = key
        d.source_bytes = bytes
        return { success: true, meta: { changes: 1 } } as any
      }
      return { success: true, meta: { changes: 0 } } as any
    }
    return { success: true, meta: { changes: 0 } } as any
  }
}

const OWNER_TOKEN = 'arc_owner_secret'
const OTHER_TOKEN = 'arc_other_secret'
const STAFF_TOKEN = 'arc_staff_secret'

async function seeded() {
  const db = new FakeD1()
  const r2 = new FakeR2()
  db.users.push({ id: 'owner-1', login: 'octocat', is_staff: 0 })
  db.users.push({ id: 'other-1', login: 'mallory', is_staff: 0 })
  db.users.push({ id: 'staff-1', login: 'datopian-staff', is_staff: 1 })
  db.tokens.push({ hash: await sha256Hex(OWNER_TOKEN), user_id: 'owner-1', revoked: false })
  db.tokens.push({ hash: await sha256Hex(OTHER_TOKEN), user_id: 'other-1', revoked: false })
  db.tokens.push({ hash: await sha256Hex(STAFF_TOKEN), user_id: 'staff-1', revoked: false })
  db.projects.push({ id: 'proj-1', user_id: 'owner-1', slug: 'acme' })
  db.deployments.push({
    id: 'dep-1',
    project_id: 'proj-1',
    status: 'ready',
    files: 3,
    bytes: 100,
    source_key: null,
    source_bytes: null,
    created_at: '2026-08-20T00:00:00Z',
  })
  const env = { ASSETS: r2 as unknown as R2Bucket, DB: db as unknown as D1Database, ARC_HOST: 'staging.arc.portaljs.com' }
  return { env: env as Env, db, r2 }
}

function req(url: string, token?: string, body?: Uint8Array) {
  const headers: Record<string, string> = {}
  if (token) headers.authorization = `Bearer ${token}`
  return new Request(url, { method: 'POST', headers, body })
}

describe('handleUploadSource', () => {
  it('401 without a token', async () => {
    const { env } = await seeded()
    const res = await handleUploadSource(req('https://api/v1/deploy/dep-1/source'), env, 'dep-1')
    expect(res.status).toBe(401)
  })

  it('404 for an unknown deployment', async () => {
    const { env } = await seeded()
    const res = await handleUploadSource(
      req('https://api/v1/deploy/nope/source', OWNER_TOKEN, new Uint8Array([1, 2, 3])),
      env,
      'nope'
    )
    expect(res.status).toBe(404)
  })

  it("403 when the deployment belongs to another account", async () => {
    const { env } = await seeded()
    const res = await handleUploadSource(
      req('https://api/v1/deploy/dep-1/source', OTHER_TOKEN, new Uint8Array([1, 2, 3])),
      env,
      'dep-1'
    )
    expect(res.status).toBe(403)
  })

  it('200: uploads, records the R2 key, never overwrites (409 on a second upload)', async () => {
    const { env, db, r2 } = await seeded()
    const bytes = new Uint8Array([1, 2, 3, 4])
    const res = await handleUploadSource(req('https://api/v1/deploy/dep-1/source', OWNER_TOKEN, bytes), env, 'dep-1')
    expect(res.status).toBe(200)
    const body = (await res.json()) as any
    expect(body.key).toBe('sources/acme/dep-1.tar.gz')
    expect(r2.store.has('sources/acme/dep-1.tar.gz')).toBe(true)
    expect(db.deployments[0].source_key).toBe('sources/acme/dep-1.tar.gz')

    const res2 = await handleUploadSource(
      req('https://api/v1/deploy/dep-1/source', OWNER_TOKEN, new Uint8Array([9, 9, 9])),
      env,
      'dep-1'
    )
    expect(res2.status).toBe(409)
    // The original snapshot is untouched.
    expect(new TextDecoder().decode(r2.store.get('sources/acme/dep-1.tar.gz')!)).toBe(
      new TextDecoder().decode(bytes)
    )
  })

  it('413 when the upload exceeds MAX_SOURCE_BYTES', async () => {
    const { env } = await seeded()
    ;(env as any).MAX_SOURCE_BYTES = '2'
    const res = await handleUploadSource(
      req('https://api/v1/deploy/dep-1/source', OWNER_TOKEN, new Uint8Array([1, 2, 3, 4])),
      env,
      'dep-1'
    )
    expect(res.status).toBe(413)
  })

  it('staff may upload a source snapshot for a deployment they do not own', async () => {
    const { env } = await seeded()
    const res = await handleUploadSource(
      req('https://api/v1/deploy/dep-1/source', STAFF_TOKEN, new Uint8Array([1])),
      env,
      'dep-1'
    )
    expect(res.status).toBe(200)
  })
})

describe('handleListSources', () => {
  it('401 without a token', async () => {
    const { env } = await seeded()
    const res = await handleListSources(req('https://api/v1/repos/acme/sources', undefined), env, 'acme')
    expect(res.status).toBe(401)
  })

  it('400 on a bad slug', async () => {
    const { env } = await seeded()
    const res = await handleListSources(req('https://api/v1/repos/Bad_Slug/sources', OWNER_TOKEN), env, 'Bad_Slug')
    expect(res.status).toBe(400)
  })

  it('404 for a slug with no project', async () => {
    const { env } = await seeded()
    const res = await handleListSources(req('https://api/v1/repos/ghost/sources', OWNER_TOKEN), env, 'ghost')
    expect(res.status).toBe(404)
  })

  it("403 when another account asks for someone else's slug", async () => {
    const { env } = await seeded()
    const res = await handleListSources(req('https://api/v1/repos/acme/sources', OTHER_TOKEN), env, 'acme')
    expect(res.status).toBe(403)
  })

  it('200: owner sees their snapshot history', async () => {
    const { env } = await seeded()
    await handleUploadSource(req('https://api/v1/deploy/dep-1/source', OWNER_TOKEN, new Uint8Array([1, 2])), env, 'dep-1')
    const res = await handleListSources(req('https://api/v1/repos/acme/sources', OWNER_TOKEN), env, 'acme')
    expect(res.status).toBe(200)
    const body = (await res.json()) as any
    expect(body.snapshots).toHaveLength(1)
    expect(body.snapshots[0].deployment_id).toBe('dep-1')
  })

  it("200: staff sees another account's snapshot history", async () => {
    const { env } = await seeded()
    await handleUploadSource(req('https://api/v1/deploy/dep-1/source', OWNER_TOKEN, new Uint8Array([1, 2])), env, 'dep-1')
    const res = await handleListSources(req('https://api/v1/repos/acme/sources', STAFF_TOKEN), env, 'acme')
    expect(res.status).toBe(200)
  })
})

describe('handleGetSource', () => {
  it('404 when no snapshot has been recorded yet', async () => {
    const { env } = await seeded()
    const res = await handleGetSource(req('https://api/v1/repos/acme/sources/dep-1', OWNER_TOKEN), env, 'acme', 'dep-1')
    expect(res.status).toBe(404)
  })

  it("403 when another account requests someone else's snapshot", async () => {
    const { env } = await seeded()
    await handleUploadSource(req('https://api/v1/deploy/dep-1/source', OWNER_TOKEN, new Uint8Array([5, 6])), env, 'dep-1')
    const res = await handleGetSource(req('https://api/v1/repos/acme/sources/dep-1', OTHER_TOKEN), env, 'acme', 'dep-1')
    expect(res.status).toBe(403)
  })

  it('200: streams back exactly the uploaded bytes for the owner', async () => {
    const { env } = await seeded()
    const bytes = new Uint8Array([5, 6, 7])
    await handleUploadSource(req('https://api/v1/deploy/dep-1/source', OWNER_TOKEN, bytes), env, 'dep-1')
    const res = await handleGetSource(req('https://api/v1/repos/acme/sources/dep-1', OWNER_TOKEN), env, 'acme', 'dep-1')
    expect(res.status).toBe(200)
    const got = new Uint8Array(await res.arrayBuffer())
    expect([...got]).toEqual([5, 6, 7])
  })

  it('200: staff can also fetch the bytes', async () => {
    const { env } = await seeded()
    const bytes = new Uint8Array([5, 6, 7])
    await handleUploadSource(req('https://api/v1/deploy/dep-1/source', OWNER_TOKEN, bytes), env, 'dep-1')
    const res = await handleGetSource(req('https://api/v1/repos/acme/sources/dep-1', STAFF_TOKEN), env, 'acme', 'dep-1')
    expect(res.status).toBe(200)
  })
})
