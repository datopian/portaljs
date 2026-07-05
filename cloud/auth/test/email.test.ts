import { describe, it, expect, beforeEach } from 'vitest'
import {
  normalizeEmail,
  isValidEmail,
  isFreeEmailDomain,
  createEmailLogin,
  peekEmailLogin,
  verifyEmailLogin,
  EMAIL_TOKEN_TTL,
} from '../src/email'
import { upsertEmailUser } from '../src/tokens'
import { sha256Hex } from '../src/util'
import worker, { type Env } from '../src/index'

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
  ph_distinct_id: string | null
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
      const [id, token_hash, email, full_name, org, return_path, status, created_at, expires_at, ph_distinct_id] =
        this.args
      this.db.logins.push({
        id,
        token_hash,
        email,
        full_name,
        org,
        return_path,
        status,
        created_at,
        expires_at,
        ph_distinct_id: ph_distinct_id ?? null,
      })
      return { meta: { changes: 1 } }
    }
    if (this.sql.startsWith('UPDATE email_logins SET expires_at')) {
      // Token cap (po-jwn): expire still-valid pending links for this email.
      const [newExpiry, email, nowSeconds] = this.args
      let changes = 0
      for (const l of this.db.logins) {
        if (l.email === email && l.status === 'pending' && l.expires_at >= nowSeconds) {
          l.expires_at = newExpiry
          changes++
        }
      }
      return { meta: { changes } }
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

describe('isFreeEmailDomain (corporate-email gate backstop)', () => {
  it('flags common consumer providers, case-insensitively', () => {
    expect(isFreeEmailDomain('a@gmail.com')).toBe(true)
    expect(isFreeEmailDomain('A@GMAIL.COM')).toBe(true)
    expect(isFreeEmailDomain('a@outlook.com')).toBe(true)
    expect(isFreeEmailDomain('a@hotmail.co.uk')).toBe(true)
    expect(isFreeEmailDomain('a@icloud.com')).toBe(true)
    expect(isFreeEmailDomain('a@proton.me')).toBe(true)
  })
  it('passes organization domains', () => {
    expect(isFreeEmailDomain('a@datopian.com')).toBe(false)
    expect(isFreeEmailDomain('jane@malmo.se')).toBe(false)
    expect(isFreeEmailDomain('gov@data.gov.au')).toBe(false)
  })
  it('treats a missing domain as not-free', () => {
    expect(isFreeEmailDomain('nope')).toBe(false)
    expect(isFreeEmailDomain('')).toBe(false)
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

  it('round-trips the client PostHog distinct-id through to verify (po-zbx)', async () => {
    const { token } = await createEmailLogin(db as any, 1000, 'a@b.co', {}, undefined, 'anon-abc-123')
    expect(db.logins[0].ph_distinct_id).toBe('anon-abc-123')
    const result = await verifyEmailLogin(db as any, 1000, token)
    expect(result).toMatchObject({ status: 'verified', distinctId: 'anon-abc-123' })
  })

  it('leaves distinct-id null when the client did not supply one (po-zbx)', async () => {
    const { token } = await createEmailLogin(db as any, 1000, 'a@b.co')
    expect(db.logins[0].ph_distinct_id).toBeNull()
    const result = await verifyEmailLogin(db as any, 1000, token)
    expect(result).toMatchObject({ status: 'verified', distinctId: null })
  })

  it('caps live links per email: requesting a new one invalidates the previous (po-jwn)', async () => {
    const { token: first } = await createEmailLogin(db as any, 1000, 'a@b.co')
    const { token: second } = await createEmailLogin(db as any, 1001, 'a@b.co')
    // The older link is now treated as expired in both peek and verify…
    expect((await peekEmailLogin(db as any, 1001, first)).status).toBe('expired')
    expect((await verifyEmailLogin(db as any, 1001, first)).status).toBe('expired')
    // …while the newest link still works exactly once.
    expect((await verifyEmailLogin(db as any, 1001, second)).status).toBe('verified')
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

// po-gq7 — end-to-end scanner/prefetch safety at the ROUTE level. Gov/enterprise mail
// security (Defender Safe Links, Proofpoint URL Defense, Mimecast, Barracuda) auto-opens
// links in email to scan them. The guarantee under test: a bare GET NEVER consumes the
// token or issues a session — only the explicit human POST does. This drives the real
// worker.fetch handler so the GET→peek / POST→verify wiring is exercised, not just the
// underlying functions.
describe('magic-link scanner/prefetch safety (route level, po-gq7)', () => {
  const BASE = 'https://arc.portaljs.com'
  // Real clock: the worker reads Date.now(), so mint the token against the same "now" the
  // handler will see (well inside the 30-min TTL). No fake timers needed.
  const t = Math.floor(Date.now() / 1000)
  const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext

  const envFor = (db: FakeD1): Env =>
    ({
      DB: db as any,
      GITHUB_CLIENT_ID: 'x',
      GITHUB_CLIENT_SECRET: 'x',
      SESSION_SECRET: 'test-secret-please-ignore',
      BASE_URL: BASE,
      RESEND_API_KEY: 'x',
      EMAIL_FROM: 'Arc <login@arc.portaljs.com>',
      // POSTHOG_KEY intentionally unset → captureServerEvent no-ops (no network in tests).
    }) as Env

  const getVerify = (env: Env, token: string) =>
    worker.fetch(new Request(`${BASE}/email/verify?token=${encodeURIComponent(token)}`), env, ctx)
  const postVerify = (env: Env, token: string) =>
    worker.fetch(
      new Request(`${BASE}/email/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: BASE },
        body: JSON.stringify({ token }),
      }),
      env,
      ctx
    )

  it('a scanner GET-prefetch does NOT consume the token or set a session cookie', async () => {
    const db = new FakeD1()
    const { token } = await createEmailLogin(db as any, t, 'user@agency.gov')
    // Simulate an aggressive scanner opening the link several times.
    for (let i = 0; i < 3; i++) {
      const res = await getVerify(envFor(db), token)
      expect(res.status).toBe(200)
      expect(res.headers.get('set-cookie')).toBeNull() // no session issued on GET
      expect(await res.text()).toContain('Continue as') // it's the confirm page
      expect(db.logins[0].status).toBe('pending') // token still unspent
    }
  })

  it('after any number of scanner GETs, the human POST still completes sign-in', async () => {
    const db = new FakeD1()
    const { token } = await createEmailLogin(db as any, t, 'user@agency.gov')
    for (let i = 0; i < 3; i++) await getVerify(envFor(db), token)
    const res = await postVerify(envFor(db), token)
    expect(res.status).toBe(302) // redirect into the dashboard
    expect(res.headers.get('set-cookie')).toContain('arc_session=') // session issued
    expect(db.logins[0].status).toBe('claimed')
    expect(db.users).toHaveLength(1) // user provisioned
  })

  it('the POST is single-use: a replay (double-click / prefetched POST) fails', async () => {
    const db = new FakeD1()
    const { token } = await createEmailLogin(db as any, t, 'user@agency.gov')
    const first = await postVerify(envFor(db), token)
    expect(first.status).toBe(302)
    const second = await postVerify(envFor(db), token)
    expect(second.status).toBe(400) // already-used → error page
    expect(second.headers.get('set-cookie')).toBeNull() // no second session
  })

  it('a GET on an already-consumed link shows the used-page, never re-issues a session', async () => {
    const db = new FakeD1()
    const { token } = await createEmailLogin(db as any, t, 'user@agency.gov')
    await postVerify(envFor(db), token) // human consumes it
    const res = await getVerify(envFor(db), token)
    expect(res.status).toBe(400)
    expect(res.headers.get('set-cookie')).toBeNull()
  })
})

describe('upsertEmailUser', () => {
  let db: FakeD1
  beforeEach(() => {
    db = new FakeD1()
  })

  it('creates a github-less email user', async () => {
    const { id, isNew } = await upsertEmailUser(db as any, 'a@b.co', { fullName: 'A B', org: 'Acme' }, '2026-07-03T00:00:00.000Z')
    expect(isNew).toBe(true)
    expect(db.users).toHaveLength(1)
    const u = db.users[0]
    expect(u.id).toBe(id)
    expect(u.email).toBe('a@b.co')
    expect(u.auth_provider).toBe('email')
    expect(u.full_name).toBe('A B')
    expect(u.email_verified_at).toBe('2026-07-03T00:00:00.000Z')
  })

  it('attaches to the existing account on repeat sign-in (no duplicate row)', async () => {
    const first = await upsertEmailUser(db as any, 'a@b.co', { fullName: 'A B' }, '2026-07-03T00:00:00.000Z')
    const second = await upsertEmailUser(db as any, 'a@b.co', { org: 'Acme' }, '2026-07-04T00:00:00.000Z')
    expect(second.id).toBe(first.id)
    expect(first.isNew).toBe(true) // created
    expect(second.isNew).toBe(false) // reused existing account
    expect(db.users).toHaveLength(1)
    const u = db.users[0]
    expect(u.full_name).toBe('A B') // preserved (not overwritten by a null)
    expect(u.org).toBe('Acme') // newly captured
    expect(u.email_verified_at).toBe('2026-07-04T00:00:00.000Z') // refreshed
  })
})
