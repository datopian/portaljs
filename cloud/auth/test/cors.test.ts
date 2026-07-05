import { describe, it, expect } from 'vitest'
import { isAllowedSiteOrigin } from '../src/index'

// /email/start is reachable cross-origin from the marketing site's /build sign-up form
// (po-76p). isAllowedSiteOrigin decides which origins get CORS access — nothing else does.
describe('isAllowedSiteOrigin (CORS allowlist for /email/start)', () => {
  it('allows the production marketing site', () => {
    expect(isAllowedSiteOrigin('https://portaljs.com')).toBe(true)
    expect(isAllowedSiteOrigin('https://www.portaljs.com')).toBe(true)
  })
  it('allows local development', () => {
    expect(isAllowedSiteOrigin('http://localhost:3000')).toBe(true)
  })
  it('rejects a missing origin (same-origin posts go through isAllowedOrigin instead)', () => {
    expect(isAllowedSiteOrigin(null)).toBe(false)
  })
  it('rejects look-alike and unrelated origins', () => {
    expect(isAllowedSiteOrigin('https://portaljs.com.evil.example')).toBe(false)
    expect(isAllowedSiteOrigin('http://portaljs.com')).toBe(false)
    expect(isAllowedSiteOrigin('https://evil.example')).toBe(false)
  })
})
