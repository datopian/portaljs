import { describe, it, expect, beforeEach } from 'vitest'
import { handleDeploy, validSlug, safeEntryName, type Env } from '../src/index'
import { sha256Hex } from '../src/db'
import { makeTar, gzip, FakeR2, FakeD1 } from './helpers'

const TOKEN = 'arc_test_secret'

async function envWithUser(): Promise<{ env: Env; r2: FakeR2; db: FakeD1 }> {
  const r2 = new FakeR2()
  const db = new FakeD1()
  db.tokens.set(await sha256Hex(TOKEN), 'user-1')
  const env = {
    ASSETS: r2 as unknown as R2Bucket,
    DB: db as unknown as D1Database,
    ARC_HOST: 'staging.arc.portaljs.com',
  }
  return { env, r2, db }
}

async function deployReq(slug: string, files: { name: string; data: string }[], token = TOKEN) {
  const body = await gzip(makeTar(files))
  return new Request(`https://api.staging.arc.portaljs.com/v1/deploy?slug=${slug}`, {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body,
  })
}

describe('validSlug', () => {
  it('accepts dns labels, rejects reserved/invalid', () => {
    expect(validSlug('my-portal')).toBe(true)
    expect(validSlug('acme123')).toBe(true)
    expect(validSlug('api')).toBe(false)
    expect(validSlug('staging')).toBe(false)
    expect(validSlug('-bad')).toBe(false)
    expect(validSlug('UPPER')).toBe(false)
    expect(validSlug('a'.repeat(64))).toBe(false)
  })
})

describe('safeEntryName', () => {
  it('blocks traversal and absolute paths', () => {
    expect(safeEntryName('index.html')).toBe(true)
    expect(safeEntryName('a/b/c.css')).toBe(true)
    expect(safeEntryName('../evil')).toBe(false)
    expect(safeEntryName('a/../../evil')).toBe(false)
    expect(safeEntryName('/etc/passwd')).toBe(false)
  })
})

describe('handleDeploy', () => {
  let ctx: Awaited<ReturnType<typeof envWithUser>>
  beforeEach(async () => {
    ctx = await envWithUser()
  })

  it('deploys: writes files to R2 under the slug and returns the URL', async () => {
    const res = await handleDeploy(
      await deployReq('acme', [
        { name: 'index.html', data: '<h1>Acme</h1>' },
        { name: 'data/pop.csv', data: 'a,b\n1,2' },
      ]),
      ctx.env
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as any
    expect(body.url).toBe('https://acme.staging.arc.portaljs.com')
    expect(body.files).toBe(2)
    expect(body.status).toBe('ready')
    expect(new TextDecoder().decode(ctx.r2.store.get('sites/acme/index.html')!)).toContain('Acme')
    expect(ctx.r2.store.has('sites/acme/data/pop.csv')).toBe(true)
    expect(ctx.db.projects).toHaveLength(1)
    expect(ctx.db.deployments).toHaveLength(1)
  })

  it('401 without a token', async () => {
    const res = await handleDeploy(await deployReq('acme', [{ name: 'i', data: 'x' }], ''), ctx.env)
    expect(res.status).toBe(401)
  })

  it('401 with an unknown token', async () => {
    const res = await handleDeploy(await deployReq('acme', [{ name: 'i', data: 'x' }], 'nope'), ctx.env)
    expect(res.status).toBe(401)
  })

  it('400 for a reserved/invalid slug', async () => {
    const res = await handleDeploy(await deployReq('api', [{ name: 'i', data: 'x' }]), ctx.env)
    expect(res.status).toBe(400)
  })

  it('409 when the slug belongs to another user', async () => {
    ctx.db.projects.push({ id: 'p0', user_id: 'someone-else', slug: 'acme' })
    const res = await handleDeploy(await deployReq('acme', [{ name: 'i', data: 'x' }]), ctx.env)
    expect(res.status).toBe(409)
  })

  it('re-deploy by the same user is allowed (idempotent project)', async () => {
    await handleDeploy(await deployReq('acme', [{ name: 'index.html', data: 'v1' }]), ctx.env)
    const res = await handleDeploy(await deployReq('acme', [{ name: 'index.html', data: 'v2' }]), ctx.env)
    expect(res.status).toBe(200)
    expect(ctx.db.projects).toHaveLength(1) // not duplicated
    expect(new TextDecoder().decode(ctx.r2.store.get('sites/acme/index.html')!)).toBe('v2')
  })

  it('drops path-traversal entries instead of writing them', async () => {
    const res = await handleDeploy(
      await deployReq('acme', [
        { name: 'index.html', data: 'ok' },
        { name: '../escape.txt', data: 'evil' },
      ]),
      ctx.env
    )
    expect(res.status).toBe(200)
    expect(((await res.json()) as any).files).toBe(1)
    expect([...ctx.r2.store.keys()].some((k) => k.includes('escape'))).toBe(false)
  })
})
