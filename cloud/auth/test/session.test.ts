import { describe, it, expect } from 'vitest'
import { signSession, verifySession } from '../src/session'

const SECRET = 'test-signing-secret'
const MAX_AGE = 1000

describe('session', () => {
  it('round-trips a uid', async () => {
    const t = await signSession('user-1', SECRET, 100)
    expect(await verifySession(t, SECRET, MAX_AGE, 200)).toBe('user-1')
  })

  it('rejects a tampered payload', async () => {
    const t = await signSession('user-1', SECRET, 100)
    const [, sig] = t.split('.')
    const forged = `${Buffer.from('{"uid":"admin","iat":100}').toString('base64url')}.${sig}`
    expect(await verifySession(forged, SECRET, MAX_AGE, 200)).toBeNull()
  })

  it('rejects a wrong secret', async () => {
    const t = await signSession('user-1', SECRET, 100)
    expect(await verifySession(t, 'other-secret', MAX_AGE, 200)).toBeNull()
  })

  it('rejects an expired session', async () => {
    const t = await signSession('user-1', SECRET, 100)
    expect(await verifySession(t, SECRET, MAX_AGE, 100 + MAX_AGE + 1)).toBeNull()
  })

  it('rejects a future-dated session', async () => {
    const t = await signSession('user-1', SECRET, 10_000)
    expect(await verifySession(t, SECRET, MAX_AGE, 100)).toBeNull()
  })

  it('rejects garbage', async () => {
    expect(await verifySession('not-a-token', SECRET, MAX_AGE, 200)).toBeNull()
    expect(await verifySession('', SECRET, MAX_AGE, 200)).toBeNull()
  })
})
