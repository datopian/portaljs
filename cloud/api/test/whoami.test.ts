import { describe, it, expect } from 'vitest'
import { loginForToken, sha256Hex } from '../src/db'

// Fake covering the tokens⋈users JOIN that loginForToken issues.
class FakeD1 {
  users = new Map<string, string>() // user_id -> login
  tokens: { hash: string; user_id: string; revoked: boolean }[] = []
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
    if (this.sql.includes('FROM tokens t JOIN users u')) {
      const t = this.db.tokens.find((x) => x.hash === this.args[0] && !x.revoked)
      if (!t) return null
      const login = this.db.users.get(t.user_id)
      return (login ? { login } : null) as any
    }
    return null
  }
}

describe('loginForToken', () => {
  it('resolves a valid token to its owner login', async () => {
    const db = new FakeD1()
    db.users.set('u1', 'octocat')
    db.tokens.push({ hash: await sha256Hex('arc_good'), user_id: 'u1', revoked: false })
    expect(await loginForToken(db as any, 'arc_good')).toBe('octocat')
  })
  it('returns null for unknown or revoked tokens', async () => {
    const db = new FakeD1()
    db.users.set('u1', 'octocat')
    db.tokens.push({ hash: await sha256Hex('arc_revoked'), user_id: 'u1', revoked: true })
    expect(await loginForToken(db as any, 'arc_revoked')).toBeNull()
    expect(await loginForToken(db as any, 'arc_unknown')).toBeNull()
  })
})
