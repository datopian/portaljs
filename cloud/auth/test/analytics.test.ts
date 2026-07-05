import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { captureServerEvent } from '../src/analytics'

// captureServerEvent posts the server-side signup-completion event straight to PostHog's
// HTTP ingestion API (po-zbx). It must: no-op when unconfigured, post a well-formed payload
// when configured, and NEVER throw — auth must not fail because analytics did.
describe('captureServerEvent (po-zbx)', () => {
  const realFetch = globalThis.fetch
  let calls: Array<{ url: string; init: RequestInit }>

  beforeEach(() => {
    calls = []
    globalThis.fetch = vi.fn(async (url: any, init: any) => {
      calls.push({ url: String(url), init })
      return { ok: true } as Response
    }) as any
  })
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  it('no-ops (no HTTP call) when POSTHOG_KEY is unset', async () => {
    const ok = await captureServerEvent({}, { event: 'arc_signup_completed', distinctId: 'u1' })
    expect(ok).toBe(false)
    expect(calls).toHaveLength(0)
  })

  it('no-ops when there is no distinct id to attribute to', async () => {
    const ok = await captureServerEvent({ POSTHOG_KEY: 'phc_x' }, { event: 'arc_signup_completed', distinctId: '' })
    expect(ok).toBe(false)
    expect(calls).toHaveLength(0)
  })

  it('posts a well-formed capture payload to the configured host', async () => {
    const ok = await captureServerEvent(
      { POSTHOG_KEY: 'phc_x', POSTHOG_HOST: 'https://eu.i.posthog.com' },
      {
        event: 'arc_signup_completed',
        distinctId: 'anon-abc',
        properties: { auth_provider: 'email', has_org: true },
        timestamp: '2026-07-05T00:00:00.000Z',
      }
    )
    expect(ok).toBe(true)
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('https://eu.i.posthog.com/capture/')
    const body = JSON.parse(calls[0].init.body as string)
    expect(body.api_key).toBe('phc_x')
    expect(body.event).toBe('arc_signup_completed')
    expect(body.distinct_id).toBe('anon-abc')
    expect(body.properties.auth_provider).toBe('email')
    expect(body.properties.has_org).toBe(true)
    expect(body.properties.$lib).toBe('arc-auth-worker') // tags the source lib
    expect(body.timestamp).toBe('2026-07-05T00:00:00.000Z')
  })

  it('defaults to the EU ingestion host and strips a trailing slash', async () => {
    await captureServerEvent({ POSTHOG_KEY: 'phc_x' }, { event: 'e', distinctId: 'u' })
    expect(calls[0].url).toBe('https://eu.i.posthog.com/capture/')
    calls.length = 0
    await captureServerEvent(
      { POSTHOG_KEY: 'phc_x', POSTHOG_HOST: 'https://eu.i.posthog.com/' },
      { event: 'e', distinctId: 'u' }
    )
    expect(calls[0].url).toBe('https://eu.i.posthog.com/capture/')
  })

  it('never throws and returns false when the network fails', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network down')
    }) as any
    const ok = await captureServerEvent({ POSTHOG_KEY: 'phc_x' }, { event: 'e', distinctId: 'u' })
    expect(ok).toBe(false)
  })

  it('returns false on a non-2xx response', async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false }) as Response) as any
    const ok = await captureServerEvent({ POSTHOG_KEY: 'phc_x' }, { event: 'e', distinctId: 'u' })
    expect(ok).toBe(false)
  })
})
