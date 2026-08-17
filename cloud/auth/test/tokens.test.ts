import { describe, it, expect, beforeEach } from 'vitest'
import { generateToken, upsertUser, createToken, listTokens, revokeToken } from '../src/tokens'
import { sha256Hex } from '../src/util'

interface UserRow {
  id: string
  github_id: number | null
  login: string | null
  email: string | null
  auth_provider: string | null
  email_verified_at: string | null
}

// Minimal D1 fake supporting the exact statements tokens.ts issues. It also enforces the
// users.email UNIQUE index (0003_email_auth.sql) — without that, the collision paths in
// upsertUser would silently "pass" here and fail in production (po-rxf).
class FakeD1 {
  users: UserRow[] = []
  tokens: { id: string; user_id: string; hash: string; label: string; created_at: string; revoked_at: string | null }[] = []
  prepare(sql: string) {
    return new Stmt(this, sql)
  }
  assertEmailFree(email: string | null, selfId?: string) {
    if (email === null) return
    if (this.users.some((u) => u.email === email && u.id !== selfId)) {
      throw new Error('UNIQUE constraint failed: users.email')
    }
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
    if (this.sql.includes('FROM users WHERE email')) {
      return (this.db.users.find((u) => u.email === this.args[0]) ?? null) as any
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
      const [id, github_id, login, email, email_verified_at] = this.args
      this.db.assertEmailFree(email ?? null)
      const existing = this.db.users.find((u) => u.github_id === github_id)
      if (existing) {
        existing.login = login // ON CONFLICT(github_id) DO UPDATE SET login
      } else {
        this.db.users.push({
          id,
          github_id,
          login,
          email: email ?? null,
          auth_provider: email ? 'github' : null,
          email_verified_at: email_verified_at ?? null,
        })
      }
    } else if (this.sql.startsWith('UPDATE users SET email')) {
      const [email, verifiedAt, id] = this.args
      const u = this.db.users.find((x) => x.id === id)
      if (u) {
        this.db.assertEmailFree(email, id)
        u.email = email
        u.auth_provider = u.auth_provider ?? 'github'
        u.email_verified_at = verifiedAt
      }
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

  it('upsert creates then reuses a user (isNew reflects create vs reuse)', async () => {
    const first = await upsertUser(d as any, 42, 'octocat')
    const second = await upsertUser(d as any, 42, 'octocat-renamed')
    expect(first.id).toBe(second.id)
    expect(first.isNew).toBe(true) // created
    expect(second.isNew).toBe(false) // reused
    expect(d.users).toHaveLength(1)
    expect(d.users[0].login).toBe('octocat-renamed')
  })

  // po-rxf — GitHub OAuth signups used to leave users.email NULL (6 of 8 prod users), which
  // blocks every follow-up: enhanced conversions, ICP classification, contacting anyone.
  it('persists the verified GitHub email on a new signup', async () => {
    const { id } = await upsertUser(d as any, 42, 'octocat', 'me@example.com', '2026-08-17T00:00:00Z')
    expect(d.users[0]).toMatchObject({
      id,
      email: 'me@example.com',
      auth_provider: 'github',
      email_verified_at: '2026-08-17T00:00:00Z',
    })
  })

  it('backfills a NULL email on the next sign-in of an existing user', async () => {
    await upsertUser(d as any, 42, 'octocat') // legacy row: no email captured
    expect(d.users[0].email).toBeNull()
    await upsertUser(d as any, 42, 'octocat', 'me@example.com', '2026-08-17T00:00:00Z')
    expect(d.users).toHaveLength(1)
    expect(d.users[0].email).toBe('me@example.com')
    expect(d.users[0].email_verified_at).toBe('2026-08-17T00:00:00Z')
  })

  it('keeps the stored email when a later sign-in supplies none', async () => {
    await upsertUser(d as any, 42, 'octocat', 'me@example.com', '2026-08-17T00:00:00Z')
    await upsertUser(d as any, 42, 'octocat') // user revoked user:email, or lookup failed
    expect(d.users[0].email).toBe('me@example.com')
  })

  it('refreshes the email when the GitHub primary changes', async () => {
    await upsertUser(d as any, 42, 'octocat', 'old@example.com', '2026-08-17T00:00:00Z')
    await upsertUser(d as any, 42, 'octocat', 'new@example.com', '2026-08-18T00:00:00Z')
    expect(d.users).toHaveLength(1)
    expect(d.users[0].email).toBe('new@example.com')
    expect(d.users[0].email_verified_at).toBe('2026-08-18T00:00:00Z')
  })

  it('signs in anyway when the address belongs to another (email-provider) account', async () => {
    // An email-provider row already owns the address; users.email is UNIQUE, so claiming it
    // would violate the index. Sign-in must still succeed — linking is po-5ai's call.
    d.users.push({
      id: 'email-user',
      github_id: null,
      login: null,
      email: 'me@example.com',
      auth_provider: 'email',
      email_verified_at: '2026-08-01T00:00:00Z',
    })
    const { id, isNew } = await upsertUser(d as any, 42, 'octocat', 'me@example.com', '2026-08-17T00:00:00Z')
    expect(isNew).toBe(true)
    expect(id).not.toBe('email-user')
    expect(d.users).toHaveLength(2)
    expect(d.users.find((u) => u.id === id)?.email).toBeNull() // not claimed, not crashed
    expect(d.users.find((u) => u.id === 'email-user')?.email).toBe('me@example.com') // untouched
  })

  it('does not steal an address from another account on a RETURN sign-in either', async () => {
    await upsertUser(d as any, 42, 'octocat')
    d.users.push({
      id: 'email-user',
      github_id: null,
      login: null,
      email: 'me@example.com',
      auth_provider: 'email',
      email_verified_at: '2026-08-01T00:00:00Z',
    })
    const { id, isNew } = await upsertUser(d as any, 42, 'octocat', 'me@example.com', '2026-08-17T00:00:00Z')
    expect(isNew).toBe(false)
    expect(d.users.find((u) => u.id === id)?.email).toBeNull()
  })

  it('createToken stores the sha256 hash (matches the API contract), returns clear text once', async () => {
    const { id: uid } = await upsertUser(d as any, 1, 'u')
    const token = await createToken(d as any, uid, 'laptop')
    expect(token.startsWith('arc_')).toBe(true)
    expect(d.tokens).toHaveLength(1)
    expect(d.tokens[0].hash).toBe(await sha256Hex(token)) // hash, never clear text
    expect(d.tokens[0].label).toBe('laptop')
  })

  it('list + revoke (scoped to owner)', async () => {
    const { id: uid } = await upsertUser(d as any, 1, 'u')
    await createToken(d as any, uid, 'a')
    const [row] = await listTokens(d as any, uid)
    expect(row.revoked_at).toBeNull()
    await revokeToken(d as any, 'someone-else', row.id) // wrong owner — no-op
    expect((await listTokens(d as any, uid))[0].revoked_at).toBeNull()
    await revokeToken(d as any, uid, row.id)
    expect((await listTokens(d as any, uid))[0].revoked_at).not.toBeNull()
  })
})
