import { describe, it, expect, beforeEach } from 'vitest'
import { generateToken, upsertUser, createToken, listTokens, revokeToken } from '../src/tokens'
import { sha256Hex } from '../src/util'

// Minimal D1 fake supporting the exact statements tokens.ts issues.
class FakeD1 {
  users: { id: string; github_id: number; login: string }[] = []
  tokens: { id: string; user_id: string; hash: string; label: string; created_at: string; revoked_at: string | null }[] = []
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
    if (this.sql.includes('FROM users WHERE github_id')) {
      return (this.db.users.find((u) => u.github_id === this.args[0]) ?? null) as any
    }
    return null
  }
  async all<T = any>(): Promise<{ results: T[] }> {
    if (this.sql.includes('FROM tokens WHERE user_id')) {
      return { results: this.db.tokens.filter((t) => t.user_id === this.args[0]) as any }
    }
    return { results: [] }
  }
  async run() {
    if (this.sql.startsWith('INSERT INTO users')) {
      const [id, github_id, login] = this.args
      this.db.users.push({ id, github_id, login })
    } else if (this.sql.startsWith('UPDATE users SET login')) {
      const [login, id] = this.args
      const u = this.db.users.find((x) => x.id === id)
      if (u) u.login = login
    } else if (this.sql.startsWith('INSERT INTO tokens')) {
      const [id, user_id, hash, label] = this.args
      this.db.tokens.push({ id, user_id, hash, label, created_at: 'now', revoked_at: null })
    } else if (this.sql.startsWith('UPDATE tokens SET revoked_at')) {
      const [id, user_id] = this.args
      const t = this.db.tokens.find((x) => x.id === id && x.user_id === user_id)
      if (t) t.revoked_at = 'now'
    }
    return { success: true } as any
  }
}

const db = () => new FakeD1() as unknown as D1Database

describe('generateToken', () => {
  it('is prefixed and url-safe', () => {
    const t = generateToken()
    expect(t.startsWith('arc_')).toBe(true)
    expect(t).toMatch(/^arc_[A-Za-z0-9_-]+$/)
  })
  it('is unique', () => {
    expect(generateToken()).not.toBe(generateToken())
  })
})

describe('users + tokens', () => {
  let d: FakeD1
  beforeEach(() => {
    d = new FakeD1()
  })

  it('upsert creates then reuses a user', async () => {
    const id1 = await upsertUser(d as any, 42, 'octocat')
    const id2 = await upsertUser(d as any, 42, 'octocat-renamed')
    expect(id1).toBe(id2)
    expect(d.users).toHaveLength(1)
    expect(d.users[0].login).toBe('octocat-renamed')
  })

  it('createToken stores the sha256 hash (matches the API contract), returns clear text once', async () => {
    const uid = await upsertUser(d as any, 1, 'u')
    const token = await createToken(d as any, uid, 'laptop')
    expect(token.startsWith('arc_')).toBe(true)
    expect(d.tokens).toHaveLength(1)
    expect(d.tokens[0].hash).toBe(await sha256Hex(token)) // hash, never clear text
    expect(d.tokens[0].label).toBe('laptop')
  })

  it('list + revoke (scoped to owner)', async () => {
    const uid = await upsertUser(d as any, 1, 'u')
    await createToken(d as any, uid, 'a')
    const [row] = await listTokens(d as any, uid)
    expect(row.revoked_at).toBeNull()
    await revokeToken(d as any, 'someone-else', row.id) // wrong owner — no-op
    expect((await listTokens(d as any, uid))[0].revoked_at).toBeNull()
    await revokeToken(d as any, uid, row.id)
    expect((await listTokens(d as any, uid))[0].revoked_at).not.toBeNull()
  })
})
