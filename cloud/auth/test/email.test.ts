import { describe, it, expect, beforeEach } from 'vitest'
import {
  normalizeEmail,
  isValidEmail,
  createEmailLogin,
  peekEmailLogin,
  verifyEmailLogin,
  EMAIL_TOKEN_TTL,
} from '../src/email'
import { upsertEmailUser } from '../src/tokens'
import { sha256Hex } from '../src/util'

interface EmailLoginRow {
  id: string
  token_hash: string
  email: string
  full_name: string | null
  org: string | null
  return_path: string | null
  status: string
  created_at: number
  expires_at: number
}
interface UserRow {
  id: string
  email: string | null
  auth_provider: string | null
  full_name: string | null
  org: string | null
  email_verified_at: string | null
}

// D1 fake covering exactly the statements email.ts + tokens.ts (upsertEmailUser) issue.
class FakeD1 {
  logins: EmailLoginRow[] = []
  users: UserRow[] = []
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
    if (this.sql.includes('FROM email_logins WHERE token_hash')) {
      return (this.db.logins.find((l) => l.token_hash === this.args[0]) ?? null) as any
    }
    if (this.sql.includes('SELECT id FROM users WHERE email')) {
      return (this.db.users.find((u) => u.email === this.args[0]) ?? null) as any
    }
    return null
  }
  async run() {
    if (this.sql.startsWith('INSERT INTO email_logins')) {
      const [id, token_hash, email, full_name, org, return_path, status, created_at, expires_at] = this.args
      this.db.logins.push({ id, token_hash, email, full_name, org, return_path, status, created_at, expires_at })
      return { meta: { changes: 1 } }
    }
    if (this.sql.startsWith("UPDATE email_logins SET status = 'claimed'")) {
      const [id] = this.args
      const row = this.db.logins.find((l) => l.id === id && l.status === 'pending')
      if (row) {
        row.status = 'claimed'
        return { meta: { changes: 1 } }
      }
      return { meta: { changes: 0 } }
    }
    if (this.sql.startsWith('UPDATE users SET full_name')) {
      const [fullName, org, verifiedAt, id] = this.args
      const u = this.db.users.find((x) => x.id === id)
      if (u) {
        if (fullName !== null) u.full_name = fullName
        if (org !== null) u.org = org
        u.email_verified_at = verifiedAt
      }
      return { meta: { changes: u ? 1 : 0 } }
    }
    if (this.sql.startsWith('INSERT INTO users')) {
      const [id, email, full_name, org, email_verified_at] = this.args
      this.db.users.push({ id, email, auth_provider: 'email', full_name, org, email_verified_at })
      return { meta: { changes: 1 } }
    }
    return { meta: { changes: 0 } }
  }
}

describe('email address helpers', () => {
  it('normalizes case and whitespace', () => {
    expect(normalizeEmail('  User@Example.COM ')).toBe('user@example.com')
  })
  it('accepts plausible addresses', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('first.last@sub.example.org')).toBe(true)
  })
  it('rejects junk', () => {
    expect(isValidEmail('nope')).toBe(false)
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('a @b.co')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('magic-link lifecycle', () => {
  let db: FakeD1
  beforeEach(() => {
    db = new FakeD1()
  })

  it('creates a pending login and stores only the token hash', async () => {
    const { token, expiresIn } = await createEmailLogin(db as any, 1000, 'a@b.co', { fullName: 'A B', org: 'Acme' })
    expect(expiresIn).toBe(EMAIL_TOKEN_TTL)
    expect(db.logins).toHaveLength(1)
    expect(db.logins[0].token_hash).toBe(await sha256Hex(token))
    expect(db.logins[0].token_hash).not.toContain(token)
    expect(db.logins[0].status).toBe('pending')
    expect(db.logins[0].full_name).toBe('A B')
  })

  it('peek reveals the address without consuming the token', async () => {
    const { token } = await createEmailLogin(db as any, 1000, 'a@b.co')
    const peek = await peekEmailLogin(db as any, 1000, token)
    expect(peek).toEqual({ status: 'valid', email: 'a@b.co' })
    expect(db.logins[0].status).toBe('pending') // untouched
  })

  it('verifies once then reports used on replay', async () => {
    const { token } = await createEmailLogin(db as any, 1000, 'a@b.co', {}, '/dashboard')
    const first = await verifyEmailLogin(db as any, 1000, token)
    expect(first).toMatchObject({ status: 'verified', email: 'a@b.co', returnPath: '/dashboard' })
    const second = await verifyEmailLogin(db as any, 1000, token)
    expect(second.status).toBe('used')
  })

  it('rejects an unknown token', async () => {
    expect((await verifyEmailLogin(db as any, 1000, 'bogus')).status).toBe('not_found')
    expect((await peekEmailLogin(db as any, 1000, 'bogus')).status).toBe('not_found')
    expect((await verifyEmailLogin(db as any, 1000, '')).status).toBe('not_found')
  })

  it('rejects an expired token', async () => {
    const { token } = await createEmailLogin(db as any, 1000, 'a@b.co')
    const later = 1000 + EMAIL_TOKEN_TTL + 1
    expect((await peekEmailLogin(db as any, later, token)).status).toBe('expired')
    expect((await verifyEmailLogin(db as any, later, token)).status).toBe('expired')
  })
})

describe('upsertEmailUser', () => {
  let db: FakeD1
  beforeEach(() => {
    db = new FakeD1()
  })

  it('creates a github-less email user', async () => {
    const id = await upsertEmailUser(db as any, 'a@b.co', { fullName: 'A B', org: 'Acme' }, '2026-07-03T00:00:00.000Z')
    expect(db.users).toHaveLength(1)
    const u = db.users[0]
    expect(u.id).toBe(id)
    expect(u.email).toBe('a@b.co')
    expect(u.auth_provider).toBe('email')
    expect(u.full_name).toBe('A B')
    expect(u.email_verified_at).toBe('2026-07-03T00:00:00.000Z')
  })

  it('attaches to the existing account on repeat sign-in (no duplicate row)', async () => {
    const id1 = await upsertEmailUser(db as any, 'a@b.co', { fullName: 'A B' }, '2026-07-03T00:00:00.000Z')
    const id2 = await upsertEmailUser(db as any, 'a@b.co', { org: 'Acme' }, '2026-07-04T00:00:00.000Z')
    expect(id2).toBe(id1)
    expect(db.users).toHaveLength(1)
    const u = db.users[0]
    expect(u.full_name).toBe('A B') // preserved (not overwritten by a null)
    expect(u.org).toBe('Acme') // newly captured
    expect(u.email_verified_at).toBe('2026-07-04T00:00:00.000Z') // refreshed
  })
})
