import { describe, it, expect, beforeAll } from 'vitest'
import { mintLfsToken, normalizeActions, normalizeTtl, LFS_ORG } from '../src/lfs'
import { handleLfsToken } from '../src/index'
import { sha256Hex } from '../src/db'

// Generate a throwaway RS256 keypair and export the private half as a PKCS#8 PEM —
// exactly the shape giftless/scripts/gen-rs256-keys.sh writes and the Worker secret
// holds. The public half verifies the minted token below.
let privatePem: string
let publicKey: CryptoKey

function toPem(der: ArrayBuffer, label: string): string {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(der)))
  const lines = b64.match(/.{1,64}/g)!.join('\n')
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`
}

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)
  const raw = atob(b64)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

function decodeJwt(token: string) {
  const [h, p, s] = token.split('.')
  return {
    header: JSON.parse(new TextDecoder().decode(b64urlToBytes(h))),
    payload: JSON.parse(new TextDecoder().decode(b64urlToBytes(p))),
    signingInput: `${h}.${p}`,
    sig: b64urlToBytes(s),
  }
}

beforeAll(async () => {
  const pair = (await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  )) as CryptoKeyPair
  privatePem = toPem((await crypto.subtle.exportKey('pkcs8', pair.privateKey)) as ArrayBuffer, 'PRIVATE KEY')
  publicKey = pair.publicKey
})

describe('normalizeActions', () => {
  it('defaults to read-only (least privilege)', () => expect(normalizeActions(null)).toBe('read'))
  it('rejects the wildcard', () => expect(normalizeActions('*')).toBeNull())
  it('accepts a valid subset', () => expect(normalizeActions('read,write,verify')).toBe('read,write,verify'))
  it('trims and rejoins', () => expect(normalizeActions(' read , write ')).toBe('read,write'))
  it('rejects unknown actions', () => expect(normalizeActions('read,delete')).toBeNull())
})

describe('normalizeTtl', () => {
  it('defaults when unset', () => expect(normalizeTtl(undefined)).toBe(3600))
  it('defaults on non-positive', () => expect(normalizeTtl(0)).toBe(3600))
  it('caps at 24h', () => expect(normalizeTtl(999999)).toBe(86400))
  it('passes a sane value', () => expect(normalizeTtl(1800)).toBe(1800))
})

describe('mintLfsToken', () => {
  it('mints a verifiable RS256 JWT with the mint-token.py claim shape', async () => {
    const { token, scope, expiresIn } = await mintLfsToken(privatePem, {
      slug: 'my-catalog',
      actions: 'read,write,verify',
      now: 1000,
    })
    const { header, payload, signingInput, sig } = decodeJwt(token)

    expect(header).toEqual({ alg: 'RS256', typ: 'JWT', kid: 'giftless-rs256-1' })
    expect(payload.scopes).toEqual([`obj:${LFS_ORG}/my-catalog/*:read,write,verify`])
    expect(scope).toBe(`obj:${LFS_ORG}/my-catalog/*:read,write,verify`)
    expect(payload.iss).toBe('arc.portaljs.com')
    expect(payload.iat).toBe(1000)
    expect(payload.nbf).toBe(1000)
    expect(payload.exp).toBe(1000 + 3600)
    expect(expiresIn).toBe(3600)
    expect(payload.sub).toBe('lfs-client')

    // The deployed Giftless public key must accept this signature.
    const ok = await crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5' },
      publicKey,
      sig,
      new TextEncoder().encode(signingInput)
    )
    expect(ok).toBe(true)
  })

  it('honors read-only actions and custom ttl/sub', async () => {
    const { token, expiresIn } = await mintLfsToken(privatePem, {
      slug: 'data',
      actions: 'read',
      ttl: 60,
      sub: 'arc:octocat',
      now: 0,
    })
    const { payload } = decodeJwt(token)
    expect(payload.scopes).toEqual([`obj:${LFS_ORG}/data/*:read`])
    expect(payload.exp).toBe(60)
    expect(payload.sub).toBe('arc:octocat')
    expect(expiresIn).toBe(60)
  })

  it('rejects invalid actions', async () => {
    await expect(mintLfsToken(privatePem, { slug: 's', actions: 'nuke' })).rejects.toThrow('invalid actions')
  })
})

// --- handler-level: auth, config, ownership ---------------------------------
class FakeD1 {
  users = new Map<string, string>() // id -> login
  tokens: { hash: string; user_id: string; revoked: boolean }[] = []
  projects: { id: string; user_id: string; slug: string }[] = []
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
      return (login ? { id: t.user_id, login } : null) as any
    }
    if (this.sql.includes('FROM projects')) {
      return (this.db.projects.find((p) => p.slug === this.args[0]) ?? null) as any
    }
    return null
  }
  async run() {
    if (this.sql.startsWith('INSERT INTO projects')) {
      const [id, user_id, slug] = this.args
      if (!this.db.projects.some((p) => p.slug === slug)) this.db.projects.push({ id, user_id, slug })
    }
    return { success: true } as any
  }
}

function req(token?: string, query = '') {
  const headers: Record<string, string> = {}
  if (token) headers.authorization = `Bearer ${token}`
  return new Request(`https://api.arc.portaljs.com/v1/repos/my-catalog/lfs-token${query}`, {
    method: 'POST',
    headers,
  })
}

async function seededEnv() {
  const db = new FakeD1()
  db.users.set('u1', 'octocat')
  db.tokens.push({ hash: await sha256Hex('arc_good'), user_id: 'u1', revoked: false })
  return { DB: db, GIFTLESS_JWT_PRIVATE_KEY: privatePem, LFS_HOST: 'lfs.portaljs.com' } as any
}

describe('handleLfsToken', () => {
  it('401 without a token', async () => {
    const res = await handleLfsToken(req(), await seededEnv(), 'my-catalog')
    expect(res.status).toBe(401)
  })

  it('401 for an unknown token', async () => {
    const res = await handleLfsToken(req('arc_bad'), await seededEnv(), 'my-catalog')
    expect(res.status).toBe(401)
  })

  it('503 when the signer secret is unset', async () => {
    const env = await seededEnv()
    delete env.GIFTLESS_JWT_PRIVATE_KEY
    const res = await handleLfsToken(req('arc_good'), env, 'my-catalog')
    expect(res.status).toBe(503)
  })

  it('400 on a bad slug', async () => {
    const res = await handleLfsToken(req('arc_good'), await seededEnv(), 'Bad_Slug')
    expect(res.status).toBe(400)
  })

  it('400 on invalid actions', async () => {
    const res = await handleLfsToken(req('arc_good', '?actions=delete'), await seededEnv(), 'my-catalog')
    expect(res.status).toBe(400)
  })

  it('404 when the repo does not exist (minting never claims a slug)', async () => {
    const env = await seededEnv() // no project seeded
    const res = await handleLfsToken(req('arc_good'), env, 'my-catalog')
    expect(res.status).toBe(404)
    // Crucially: the call did NOT create/claim the slug.
    expect(env.DB.projects.some((p: any) => p.slug === 'my-catalog')).toBe(false)
  })

  it('mints a read-only token by default for an existing owner', async () => {
    const env = await seededEnv()
    env.DB.projects.push({ id: 'p1', user_id: 'u1', slug: 'my-catalog' })
    const res = await handleLfsToken(req('arc_good'), env, 'my-catalog')
    expect(res.status).toBe(200)
    const body = (await res.json()) as any
    // Least privilege: no ?actions ⇒ read-only.
    expect(body.scope).toBe(`obj:${LFS_ORG}/my-catalog/*:read`)
    expect(body.expires_in).toBe(3600)
    expect(body.lfs_url).toBe(`https://_jwt:${body.token}@lfs.portaljs.com/${LFS_ORG}/my-catalog`)
  })

  it('honors explicit write actions for an existing owner', async () => {
    const env = await seededEnv()
    env.DB.projects.push({ id: 'p1', user_id: 'u1', slug: 'my-catalog' })
    const res = await handleLfsToken(req('arc_good', '?actions=read,write,verify'), env, 'my-catalog')
    expect(res.status).toBe(200)
    const body = (await res.json()) as any
    expect(body.scope).toBe(`obj:${LFS_ORG}/my-catalog/*:read,write,verify`)
  })

  it('403 when the slug is owned by another account', async () => {
    const env = await seededEnv()
    env.DB.projects.push({ id: 'p9', user_id: 'someone-else', slug: 'my-catalog' })
    const res = await handleLfsToken(req('arc_good'), env, 'my-catalog')
    expect(res.status).toBe(403)
  })
})
