import { describe, it, expect, vi, afterEach } from 'vitest'
import worker, { type Env } from '../src/index'

// po-4nu — an unhandled throw must come back READABLE, and cross-origin callers must be able
// to read it. Before this guard, a throw escaped as Cloudflare's bare "error code: 1101"
// page: status 500 with no CORS headers, so the browser blocked the response and the
// marketing site's /build form saw only a TypeError — indistinguishable from being offline.
// A missing D1 column (0005_ph_distinct_id unapplied on the prod DB) therefore 500'd every
// corporate-email sign-up for four weeks while reporting error_kind=network_error with no
// detail, and po-a69's http_error-5xx triage branch was unreachable by construction.

const BASE = 'https://arc.portaljs.com'
const SITE = 'https://www.portaljs.com'
const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext

// The exact failure mode that caused po-4nu: code live ahead of its schema.
const SCHEMA_DRIFT = 'D1_ERROR: no such column: ph_distinct_id'

// A DB whose every statement throws, standing in for an unmigrated D1.
const throwingDb = {
  prepare() {
    return {
      bind() {
        return this
      },
      first() {
        throw new Error(SCHEMA_DRIFT)
      },
      run() {
        throw new Error(SCHEMA_DRIFT)
      },
    }
  },
}

const env = {
  DB: throwingDb as any,
  GITHUB_CLIENT_ID: 'x',
  GITHUB_CLIENT_SECRET: 'x',
  SESSION_SECRET: 'test-secret-please-ignore',
  BASE_URL: BASE,
  RESEND_API_KEY: 'x',
  EMAIL_FROM: 'Arc <login@arc.portaljs.com>',
  // POSTHOG_KEY intentionally unset → captureServerEvent no-ops (no network in tests).
} as Env

// The guard console.errors so the fault shows up in `wrangler tail`; keep test output quiet.
afterEach(() => vi.restoreAllMocks())
const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {})

const startFromSite = (origin = SITE) =>
  worker.fetch(
    new Request(`${BASE}/email/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin },
      body: JSON.stringify({ email: 'someone@agency.gov' }),
    }),
    env,
    ctx
  )

describe('unhandled-error guard (po-4nu)', () => {
  it('answers a cross-origin /email/start throw with a 500 the browser can READ', async () => {
    quiet()
    const res = await startFromSite()
    expect(res.status).toBe(500)
    // Without this header the browser blocks the response and the client can only report a
    // TypeError — the exact reason po-4nu was undiagnosable. This is the assertion that matters.
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(res.headers.get('vary')).toBe('Origin')
    const body = (await res.json()) as { error: string; message: string }
    expect(body.error).toBe('internal_error')
    // The message names the actual fault, so http_error 5xx triage lands on the real cause.
    expect(body.message).toContain('ph_distinct_id')
  })

  it('logs the failure for `wrangler tail`', async () => {
    const spy = quiet()
    await startFromSite()
    expect(spy).toHaveBeenCalled()
    expect(spy.mock.calls[0].join(' ')).toContain('/email/start')
  })

  it('does not hand CORS headers to a non-allowlisted origin, but still answers 500', async () => {
    quiet()
    const res = await startFromSite('https://evil.example')
    // Rejected on origin before any DB work, so this one never reaches the guard…
    expect(res.status).toBe(403)
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
    // …while a same-origin throw gets the readable 500 with no CORS headers to leak.
    const same = await worker.fetch(
      new Request(`${BASE}/email/verify?token=whatever`), // GET → lookup() → throws
      env,
      ctx
    )
    expect(same.status).toBe(500)
    expect(same.headers.get('access-control-allow-origin')).toBeNull()
    expect(((await same.json()) as { error: string }).error).toBe('internal_error')
  })

  it('truncates a runaway message instead of echoing it whole', async () => {
    quiet()
    const long = {
      prepare() {
        return {
          bind() {
            return this
          },
          first(): never {
            throw new Error('x'.repeat(5000))
          },
          run(): never {
            throw new Error('x'.repeat(5000))
          },
        }
      },
    }
    const res = await worker.fetch(
      new Request(`${BASE}/email/verify?token=whatever`),
      { ...env, DB: long as any },
      ctx
    )
    expect(res.status).toBe(500)
    expect(((await res.json()) as { message: string }).message).toHaveLength(200)
  })

  it('still routes healthy requests normally (the guard is transparent)', async () => {
    const res = await worker.fetch(new Request(`${BASE}/healthz`), env, ctx)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('ok')
  })
})
