import { describe, it, expect } from 'vitest'
import { isAllowedOrigin } from '../src/index'

const BASE = 'https://arc.portaljs.com'

describe('isAllowedOrigin (CSRF guard for POST routes)', () => {
  it('allows the dashboard origin', () => {
    expect(isAllowedOrigin(BASE, BASE)).toBe(true)
  })
  it('allows a missing Origin (same-origin posts may omit it)', () => {
    expect(isAllowedOrigin(null, BASE)).toBe(true)
  })
  it('rejects a sibling tenant subdomain (the multi-tenant CSRF vector)', () => {
    expect(isAllowedOrigin('https://evil.arc.portaljs.com', BASE)).toBe(false)
  })
  it('rejects an unrelated origin', () => {
    expect(isAllowedOrigin('https://attacker.example', BASE)).toBe(false)
  })
})
