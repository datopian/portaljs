import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { upsertCrmSignup } from '../src/crm'

// upsertCrmSignup pipes a completed /build signup into Twenty as a `person` with
// source=PORTALJS_BUILD (po-jdr). It must: respect the CRM_ENABLED switch at the call site,
// look up before writing (idempotent), match on email when present and on login when not, and
// NEVER throw — a CRM failure must not be able to fail sign-in.
describe('upsertCrmSignup (po-jdr)', () => {
  const realFetch = globalThis.fetch
  let calls: Array<{ url: string; init: any }>

  beforeEach(() => {
    calls = []
    globalThis.fetch = vi.fn(async (url: any, init: any) => {
      calls.push({ url: String(url), init })
      return { ok: true, json: async () => ({ data: { people: [] } }) } as any
    }) as any
  })
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  it('no-ops (no HTTP call) when CRM_ENABLED is unset — the staging default', async () => {
    await upsertCrmSignup({ TWENTY_API_TOKEN: 'tok' }, { email: 'a@example.com' })
    expect(calls).toHaveLength(0)
  })

  it('no-ops when CRM_ENABLED is anything other than the literal "true"', async () => {
    await upsertCrmSignup({ TWENTY_API_TOKEN: 'tok', CRM_ENABLED: 'yes' }, { email: 'a@example.com' })
    expect(calls).toHaveLength(0)
  })

  it('logs but never throws when enabled with no token configured', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      upsertCrmSignup({ CRM_ENABLED: 'true' }, { email: 'a@example.com' })
    ).resolves.toBeUndefined()
    expect(calls).toHaveLength(0)
    expect(errSpy).toHaveBeenCalled()
    errSpy.mockRestore()
  })

  it('looks up by email, then POSTs a create when no match is found', async () => {
    await upsertCrmSignup({ TWENTY_API_TOKEN: 'tok', CRM_ENABLED: 'true' }, { email: 'new@example.com' })
    expect(calls).toHaveLength(2)
    expect(calls[0].url).toContain('/rest/people?filter=')
    expect(decodeURIComponent(calls[0].url)).toContain('emails.primaryEmail[eq]:"new@example.com"')
    expect(calls[1].url).toBe('https://crm.datopian.com/rest/people')
    expect(calls[1].init.method).toBe('POST')
    const body = JSON.parse(calls[1].init.body)
    expect(body.emails.primaryEmail).toBe('new@example.com')
    expect(body.source).toBe('PORTALJS_BUILD')
  })

  it('PATCHes the existing person id when the lookup finds a match (idempotent)', async () => {
    globalThis.fetch = vi.fn(async (url: any, init: any) => {
      calls.push({ url: String(url), init })
      if (String(url).includes('/people?filter=')) {
        return { ok: true, json: async () => ({ data: { people: [{ id: 'person-1' }] } }) } as any
      }
      return { ok: true } as any
    }) as any
    await upsertCrmSignup({ TWENTY_API_TOKEN: 'tok', CRM_ENABLED: 'true' }, { email: 'existing@example.com' })
    expect(calls).toHaveLength(2)
    expect(calls[1].url).toBe('https://crm.datopian.com/rest/people/person-1')
    expect(calls[1].init.method).toBe('PATCH')
  })

  it('matches on GitHub login + source when email is absent', async () => {
    await upsertCrmSignup({ TWENTY_API_TOKEN: 'tok', CRM_ENABLED: 'true' }, { login: 'octocat' })
    expect(decodeURIComponent(calls[0].url)).toContain('name.firstName[eq]:"octocat"')
    expect(decodeURIComponent(calls[0].url)).toContain('source[eq]:"PORTALJS_BUILD"')
    const body = JSON.parse(calls[1].init.body)
    expect(body.name).toEqual({ firstName: 'octocat', lastName: '' })
    expect(body.source).toBe('PORTALJS_BUILD')
  })

  it('logs and skips when both email and login are absent', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await upsertCrmSignup({ TWENTY_API_TOKEN: 'tok', CRM_ENABLED: 'true' }, {})
    expect(calls).toHaveLength(0)
    expect(errSpy).toHaveBeenCalled()
    errSpy.mockRestore()
  })

  it('never throws when the network fails', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network down')
    }) as any
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      upsertCrmSignup({ TWENTY_API_TOKEN: 'tok', CRM_ENABLED: 'true' }, { email: 'a@example.com' })
    ).resolves.toBeUndefined()
    errSpy.mockRestore()
  })

  it('never throws and logs on a non-2xx write response', async () => {
    globalThis.fetch = vi.fn(async (url: any) => {
      if (String(url).includes('/people?filter=')) return { ok: true, json: async () => ({ data: { people: [] } }) } as any
      return { ok: false, status: 500, text: async () => 'boom' } as any
    }) as any
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      upsertCrmSignup({ TWENTY_API_TOKEN: 'tok', CRM_ENABLED: 'true' }, { email: 'a@example.com' })
    ).resolves.toBeUndefined()
    expect(errSpy).toHaveBeenCalled()
    errSpy.mockRestore()
  })
})
