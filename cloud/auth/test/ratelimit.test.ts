import { describe, it, expect, beforeEach } from 'vitest'
import {
  gateEmailSend,
  EMAIL_SEND_MAX_PER_EMAIL,
  EMAIL_SEND_WINDOW_EMAIL,
  EMAIL_SEND_MAX_PER_IP,
  EMAIL_SEND_WINDOW_IP,
} from '../src/ratelimit'

interface SendRow {
  id: string
  email: string
  ip: string
  created_at: number
}

// D1 fake covering exactly the statements ratelimit.ts issues against email_send_log:
// the two windowed COUNTs, the INSERT, and the prune DELETE.
class FakeD1 {
  rows: SendRow[] = []
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
    if (this.sql.includes('WHERE email = ? AND created_at > ?')) {
      const [email, since] = this.args
      return { n: this.db.rows.filter((r) => r.email === email && r.created_at > since).length } as any
    }
    if (this.sql.includes('WHERE ip = ? AND created_at > ?')) {
      const [ip, since] = this.args
      return { n: this.db.rows.filter((r) => r.ip === ip && r.created_at > since).length } as any
    }
    return null
  }
  async run() {
    if (this.sql.startsWith('INSERT INTO email_send_log')) {
      const [id, email, ip, created_at] = this.args
      this.db.rows.push({ id, email, ip, created_at })
      return { meta: { changes: 1 } }
    }
    if (this.sql.startsWith('DELETE FROM email_send_log WHERE created_at <=')) {
      const [cutoff] = this.args
      const before = this.db.rows.length
      this.db.rows = this.db.rows.filter((r) => r.created_at > cutoff)
      return { meta: { changes: before - this.db.rows.length } }
    }
    return { meta: { changes: 0 } }
  }
}

describe('gateEmailSend — per-email cap', () => {
  let db: FakeD1
  beforeEach(() => {
    db = new FakeD1()
  })

  it('allows sends up to the cap, then blocks within the window', async () => {
    for (let i = 0; i < EMAIL_SEND_MAX_PER_EMAIL; i++) {
      expect(await gateEmailSend(db as any, 1000 + i, 'victim@x.co', `1.1.1.${i}`)).toBe(true)
    }
    // Cap reached — a further request for the SAME address is refused…
    expect(await gateEmailSend(db as any, 1000 + EMAIL_SEND_MAX_PER_EMAIL, 'victim@x.co', '1.1.1.99')).toBe(false)
    // …and a blocked attempt is NOT recorded (still exactly cap rows for this email).
    expect(db.rows.filter((r) => r.email === 'victim@x.co')).toHaveLength(EMAIL_SEND_MAX_PER_EMAIL)
  })

  it('lets the window slide: old sends age out and free up capacity', async () => {
    for (let i = 0; i < EMAIL_SEND_MAX_PER_EMAIL; i++) {
      expect(await gateEmailSend(db as any, 1000, 'a@b.co', 'ip-a')).toBe(true)
    }
    expect(await gateEmailSend(db as any, 1000, 'a@b.co', 'ip-a')).toBe(false)
    // Just past the email window from the original sends → they no longer count.
    const later = 1000 + EMAIL_SEND_WINDOW_EMAIL + 1
    expect(await gateEmailSend(db as any, later, 'a@b.co', 'ip-a')).toBe(true)
  })

  it('caps each address independently', async () => {
    for (let i = 0; i < EMAIL_SEND_MAX_PER_EMAIL; i++) {
      await gateEmailSend(db as any, 1000, 'a@b.co', 'shared-ip-not-hit')
    }
    // a@b.co is capped, but a different address is unaffected.
    expect(await gateEmailSend(db as any, 1000, 'a@b.co', 'shared-ip-not-hit')).toBe(false)
    expect(await gateEmailSend(db as any, 1000, 'c@d.co', 'shared-ip-not-hit')).toBe(true)
  })
})

describe('gateEmailSend — per-IP cap', () => {
  let db: FakeD1
  beforeEach(() => {
    db = new FakeD1()
  })

  it('blocks a single IP fanning out across many addresses', async () => {
    // Distinct addresses (so the per-email cap never trips) all from one IP.
    for (let i = 0; i < EMAIL_SEND_MAX_PER_IP; i++) {
      expect(await gateEmailSend(db as any, 2000 + i, `u${i}@x.co`, '9.9.9.9')).toBe(true)
    }
    expect(await gateEmailSend(db as any, 2000 + EMAIL_SEND_MAX_PER_IP, 'fresh@x.co', '9.9.9.9')).toBe(false)
  })

  it('slides the per-IP window over the hour', async () => {
    for (let i = 0; i < EMAIL_SEND_MAX_PER_IP; i++) {
      await gateEmailSend(db as any, 2000, `u${i}@x.co`, '9.9.9.9')
    }
    expect(await gateEmailSend(db as any, 2000, 'z@x.co', '9.9.9.9')).toBe(false)
    const later = 2000 + EMAIL_SEND_WINDOW_IP + 1
    expect(await gateEmailSend(db as any, later, 'z@x.co', '9.9.9.9')).toBe(true)
  })

  it('does not bucket unknown ("") IPs together', async () => {
    // Many sends with no IP must not lock out the shared '' bucket — only the per-email cap
    // applies to them (each address here is distinct, so all are allowed).
    for (let i = 0; i < EMAIL_SEND_MAX_PER_IP + 5; i++) {
      expect(await gateEmailSend(db as any, 3000 + i, `n${i}@x.co`, '')).toBe(true)
    }
  })
})

describe('gateEmailSend — pruning', () => {
  it('drops rows older than the longest (per-IP) window', async () => {
    const db = new FakeD1()
    await gateEmailSend(db as any, 5000, 'old@x.co', 'ip-1')
    // A send an hour+ later prunes the stale row on write.
    const later = 5000 + EMAIL_SEND_WINDOW_IP + 1
    await gateEmailSend(db as any, later, 'new@x.co', 'ip-2')
    expect(db.rows.map((r) => r.email)).toEqual(['new@x.co'])
  })
})
