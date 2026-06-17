import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateDeviceCode,
  generateUserCode,
  normalizeUserCode,
  formatUserCode,
  deviceTokenLabel,
  createDeviceCode,
  approveDeviceCode,
  claimDeviceToken,
  DEVICE_CODE_TTL,
} from '../src/device'
import { sha256Hex } from '../src/util'

interface DeviceRow {
  id: string
  device_hash: string
  user_code: string
  user_id: string | null
  label: string | null
  status: string
  created_at: number
  expires_at: number
}

// D1 fake covering exactly the statements device.ts + tokens.ts (createToken) issue.
class FakeD1 {
  devices: DeviceRow[] = []
  tokens: { id: string; user_id: string; hash: string; label: string }[] = []
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
    if (this.sql.includes('FROM device_codes WHERE user_code')) {
      return (this.db.devices.find((d) => d.user_code === this.args[0]) ?? null) as any
    }
    if (this.sql.includes('FROM device_codes WHERE device_hash')) {
      return (this.db.devices.find((d) => d.device_hash === this.args[0]) ?? null) as any
    }
    return null
  }
  async run() {
    if (this.sql.startsWith('INSERT INTO device_codes')) {
      const [id, device_hash, user_code, label, status, created_at, expires_at] = this.args
      this.db.devices.push({ id, device_hash, user_code, user_id: null, label, status, created_at, expires_at })
    } else if (this.sql.startsWith("UPDATE device_codes SET status = 'approved'")) {
      const [user_id, id] = this.args
      const d = this.db.devices.find((x) => x.id === id && (x.status === 'pending' || x.status === 'approved'))
      if (d) {
        d.status = 'approved'
        d.user_id = user_id
      }
    } else if (this.sql.startsWith("UPDATE device_codes SET status = 'claimed'")) {
      const [id] = this.args
      const d = this.db.devices.find((x) => x.id === id && x.status === 'approved')
      if (d) d.status = 'claimed'
    } else if (this.sql.startsWith('INSERT INTO tokens')) {
      const [id, user_id, hash, label] = this.args
      this.db.tokens.push({ id, user_id, hash, label })
    }
    return { success: true } as any
  }
}

const T0 = 1_700_000_000 // fixed epoch for deterministic expiry checks

describe('code generation + formatting', () => {
  it('device code is url-safe and unique', () => {
    const a = generateDeviceCode()
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(a).not.toBe(generateDeviceCode())
  })
  it('user code avoids ambiguous chars', () => {
    for (let i = 0; i < 50; i++) expect(generateUserCode()).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
  })
  it('normalize strips separators + uppercases; format adds a dash', () => {
    expect(normalizeUserCode('abcd-efgh')).toBe('ABCDEFGH')
    expect(normalizeUserCode('ab cd ef gh')).toBe('ABCDEFGH')
    expect(formatUserCode('ABCDEFGH')).toBe('ABCD-EFGH')
  })
  it('auto-label folds in the CLI hint + date, falls back to cli', () => {
    expect(deviceTokenLabel('my-laptop', T0)).toBe('cli · my-laptop · 2023-11-14')
    expect(deviceTokenLabel(null, T0)).toBe('cli · 2023-11-14')
  })
})

describe('device flow', () => {
  let d: FakeD1
  beforeEach(() => {
    d = new FakeD1()
  })

  it('pending until approved, then issues a token exactly once', async () => {
    const start = await createDeviceCode(d as any, T0, 'laptop')
    expect(start.interval).toBeGreaterThan(0)
    expect(start.expiresIn).toBe(DEVICE_CODE_TTL)

    // Poll before approval → pending.
    expect((await claimDeviceToken(d as any, T0, start.deviceCode)).status).toBe('pending')

    // A signed-in user approves via the displayed (dashed) code.
    expect(await approveDeviceCode(d as any, T0, 'user-1', formatUserCode(start.userCode))).toBe('approved')

    // First poll after approval issues the token (auto-labelled, hashed in tokens table).
    const issued = await claimDeviceToken(d as any, T0, start.deviceCode)
    expect(issued.status).toBe('issued')
    if (issued.status !== 'issued') throw new Error('unreachable')
    expect(issued.token.startsWith('arc_')).toBe(true)
    expect(d.tokens).toHaveLength(1)
    expect(d.tokens[0].user_id).toBe('user-1')
    expect(d.tokens[0].hash).toBe(await sha256Hex(issued.token))
    expect(d.tokens[0].label).toBe(`cli · laptop · ${new Date(T0 * 1000).toISOString().slice(0, 10)}`)

    // Second poll → already used, no second token minted.
    expect((await claimDeviceToken(d as any, T0, start.deviceCode)).status).toBe('used')
    expect(d.tokens).toHaveLength(1)
  })

  it('rejects an expired code on poll and on approval', async () => {
    const start = await createDeviceCode(d as any, T0)
    const later = T0 + DEVICE_CODE_TTL + 1
    expect((await claimDeviceToken(d as any, later, start.deviceCode)).status).toBe('expired')
    expect(await approveDeviceCode(d as any, later, 'user-1', start.userCode)).toBe('expired')
  })

  it('unknown device code / user code', async () => {
    expect((await claimDeviceToken(d as any, T0, 'nope')).status).toBe('not_found')
    expect(await approveDeviceCode(d as any, T0, 'user-1', 'ZZZZ-ZZZZ')).toBe('not_found')
    expect(await approveDeviceCode(d as any, T0, 'user-1', '')).toBe('not_found')
  })

  it('approval is idempotent', async () => {
    const start = await createDeviceCode(d as any, T0)
    expect(await approveDeviceCode(d as any, T0, 'user-1', start.userCode)).toBe('approved')
    expect(await approveDeviceCode(d as any, T0, 'user-1', start.userCode)).toBe('approved')
  })
})
