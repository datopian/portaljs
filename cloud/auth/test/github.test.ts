import { describe, it, expect, afterEach, vi } from 'vitest'
import { fetchGitHubUser, fetchVerifiedEmail, pickVerifiedEmail, isNoReplyEmail } from '../src/github'
import worker, { type Env } from '../src/index'

// Stub global fetch with a route table: { url-substring: () => Response }
function stubFetch(routes: Record<string, () => Response | Promise<Response>>) {
  const spy = vi.fn(async (input: any) => {
    const url = typeof input === 'string' ? input : input.url
    for (const [needle, handler] of Object.entries(routes)) {
      if (url.includes(needle)) return handler()
    }
    throw new Error(`unstubbed fetch: ${url}`)
  })
  globalThis.fetch = spy as any
  return spy
}
const jsonRes = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

describe('pickVerifiedEmail (po-rxf)', () => {
  it('prefers the primary verified address', () => {
    expect(
      pickVerifiedEmail([
        { email: 'alt@example.com', primary: false, verified: true },
        { email: 'me@example.com', primary: true, verified: true },
      ])
    ).toBe('me@example.com')
  })

  it('falls back to the first verified address when none is primary', () => {
    expect(
      pickVerifiedEmail([
        { email: 'alt@example.com', primary: false, verified: true },
        { email: 'other@example.com', primary: false, verified: true },
      ])
    ).toBe('alt@example.com')
  })

  it('NEVER returns an unverified address — even the primary one', () => {
    expect(
      pickVerifiedEmail([
        { email: 'unverified@example.com', primary: true, verified: false },
        { email: 'verified@example.com', primary: false, verified: true },
      ])
    ).toBe('verified@example.com')
    expect(pickVerifiedEmail([{ email: 'nope@example.com', primary: true, verified: false }])).toBeNull()
  })

  it('skips GitHub no-reply addresses (undeliverable, worse than NULL)', () => {
    expect(
      pickVerifiedEmail([
        { email: '1234+octocat@users.noreply.github.com', primary: true, verified: true },
        { email: 'real@example.com', primary: false, verified: true },
      ])
    ).toBe('real@example.com')
    expect(
      pickVerifiedEmail([{ email: '1234+octocat@users.noreply.github.com', primary: true, verified: true }])
    ).toBeNull()
    expect(isNoReplyEmail('1234+octocat@users.noreply.github.com')).toBe(true)
    expect(isNoReplyEmail('me@example.com')).toBe(false)
  })

  it('normalizes case and whitespace so it matches the users.email unique index', () => {
    expect(pickVerifiedEmail([{ email: '  ME@Example.COM ', primary: true, verified: true }])).toBe(
      'me@example.com'
    )
  })

  it('tolerates junk payloads (403 body, empty list, missing fields)', () => {
    expect(pickVerifiedEmail({ message: 'Requires authentication' })).toBeNull()
    expect(pickVerifiedEmail([])).toBeNull()
    expect(pickVerifiedEmail([{ primary: true, verified: true }])).toBeNull()
    expect(pickVerifiedEmail(null)).toBeNull()
  })
})

describe('fetchVerifiedEmail (po-rxf)', () => {
  it('reads the primary verified address from /user/emails', async () => {
    const spy = stubFetch({
      '/user/emails': () =>
        jsonRes([
          { email: 'alt@example.com', primary: false, verified: true },
          { email: 'me@example.com', primary: true, verified: true },
        ]),
    })
    expect(await fetchVerifiedEmail('tok')).toBe('me@example.com')
    expect(spy.mock.calls[0][0]).toBe('https://api.github.com/user/emails')
  })

  it('degrades to null when the scope is missing (403) instead of failing sign-in', async () => {
    stubFetch({ '/user/emails': () => jsonRes({ message: 'Requires authentication' }, 403) })
    expect(await fetchVerifiedEmail('tok')).toBeNull()
  })

  it('degrades to null when the network throws', async () => {
    globalThis.fetch = (() => {
      throw new Error('boom')
    }) as any
    expect(await fetchVerifiedEmail('tok')).toBeNull()
  })
})

describe('fetchGitHubUser', () => {
  it('returns id + login', async () => {
    stubFetch({ '/user': () => jsonRes({ id: 42, login: 'octocat', email: null }) })
    expect(await fetchGitHubUser('tok')).toEqual({ id: 42, login: 'octocat' })
  })

  it('returns null on a non-2xx or incomplete profile', async () => {
    stubFetch({ '/user': () => jsonRes({ message: 'Bad credentials' }, 401) })
    expect(await fetchGitHubUser('tok')).toBeNull()
    stubFetch({ '/user': () => jsonRes({ login: 'octocat' }) })
    expect(await fetchGitHubUser('tok')).toBeNull()
  })
})

// Route-level wiring (po-rxf). The unit tests above prove the lookup; these prove the OAuth
// callback actually ASKS for the scope and PERSISTS what it gets — the two halves that were
// missing when 6 of 8 production users ended up with a NULL email.
interface UserRow {
  id: string
  github_id: number | null
  login: string | null
  email: string | null
  auth_provider: string | null
  email_verified_at: string | null
}
class FakeD1 {
  users: UserRow[] = []
  prepare(sql: string) {
    return new Stmt(this, sql)
  }
}
class Stmt {
  args: any[] = []
  constructor(
    private db: FakeD1,
    private sql: string
  ) {}
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
    return { results: [] }
  }
  async run() {
    if (this.sql.startsWith('INSERT INTO users')) {
      const [id, github_id, login, email, email_verified_at] = this.args
      this.db.users.push({
        id,
        github_id,
        login,
        email: email ?? null,
        auth_provider: email ? 'github' : null,
        email_verified_at: email_verified_at ?? null,
      })
    }
    return { meta: { changes: 1 } } as any
  }
}

describe('GitHub OAuth route wiring (po-rxf)', () => {
  const BASE = 'https://arc.portaljs.com'
  const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext
  const envFor = (db: FakeD1): Env =>
    ({
      DB: db as any,
      GITHUB_CLIENT_ID: 'client-id',
      GITHUB_CLIENT_SECRET: 'client-secret',
      SESSION_SECRET: 'test-secret-please-ignore',
      BASE_URL: BASE,
      RESEND_API_KEY: 'x',
      EMAIL_FROM: 'Arc <login@arc.portaljs.com>',
      // POSTHOG_KEY unset → captureServerEvent no-ops (no network in tests).
    }) as Env

  it('/auth/login requests the user:email scope', async () => {
    const res = await worker.fetch(new Request(`${BASE}/auth/login`), envFor(new FakeD1()), ctx)
    const authorize = new URL(res.headers.get('location') as string)
    expect(authorize.searchParams.get('scope')).toBe('read:user user:email')
  })

  it('the callback stores the primary verified email on the new user row', async () => {
    const db = new FakeD1()
    // Mint a state cookie the way /auth/login does, then replay it on the callback.
    const login = await worker.fetch(new Request(`${BASE}/auth/login`), envFor(db), ctx)
    const state = new URL(login.headers.get('location') as string).searchParams.get('state') as string
    stubFetch({
      'oauth/access_token': () => jsonRes({ access_token: 'gho_test' }),
      '/user/emails': () =>
        jsonRes([
          { email: 'noreply@users.noreply.github.com', primary: false, verified: true },
          { email: 'octocat@example.com', primary: true, verified: true },
        ]),
      '/user': () => jsonRes({ id: 42, login: 'octocat' }),
    })
    const res = await worker.fetch(
      new Request(`${BASE}/auth/callback?code=abc&state=${state}`, {
        headers: { cookie: `arc_oauth=${encodeURIComponent(state)}` },
      }),
      envFor(db),
      ctx
    )
    expect(res.status).toBe(302)
    expect(db.users).toHaveLength(1)
    expect(db.users[0].email).toBe('octocat@example.com')
    expect(db.users[0].auth_provider).toBe('github')
    expect(db.users[0].email_verified_at).not.toBeNull()
  })

  it('still signs the user in when the email lookup is refused (403)', async () => {
    const db = new FakeD1()
    const login = await worker.fetch(new Request(`${BASE}/auth/login`), envFor(db), ctx)
    const state = new URL(login.headers.get('location') as string).searchParams.get('state') as string
    stubFetch({
      'oauth/access_token': () => jsonRes({ access_token: 'gho_test' }),
      '/user/emails': () => jsonRes({ message: 'Requires authentication' }, 403),
      '/user': () => jsonRes({ id: 42, login: 'octocat' }),
    })
    const res = await worker.fetch(
      new Request(`${BASE}/auth/callback?code=abc&state=${state}`, {
        headers: { cookie: `arc_oauth=${encodeURIComponent(state)}` },
      }),
      envFor(db),
      ctx
    )
    expect(res.status).toBe(302)
    expect(res.headers.get('set-cookie')).toContain('arc_session=')
    expect(db.users[0].email).toBeNull() // no email captured, sign-in unaffected
  })
})
