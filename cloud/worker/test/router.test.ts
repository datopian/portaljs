import { describe, it, expect } from 'vitest'
import worker, {
  slugFromHost,
  resolveCandidates,
  contentType,
  cacheControl,
  type Env,
} from '../src/index'

// Minimal in-memory R2 stand-in: enough of the R2Bucket surface for the router
// (get → { body, httpEtag } or null).
class FakeR2 {
  store = new Map<string, string>()
  put(key: string, value: string) {
    this.store.set(key, value)
  }
  async get(key: string) {
    if (!this.store.has(key)) return null
    const body = this.store.get(key)!
    return { body, size: body.length, httpEtag: `"${key.length}"` }
  }
}

function envWith(files: Record<string, string>): Env {
  const r2 = new FakeR2()
  for (const [k, v] of Object.entries(files)) r2.put(k, v)
  return { ASSETS: r2 as unknown as R2Bucket }
}

const get = (host: string, path = '/') =>
  new Request(`https://${host}${path}`)

describe('slugFromHost', () => {
  it('takes the left-most label', () => {
    expect(slugFromHost('acme.arc.portaljs.com')).toBe('acme')
    expect(slugFromHost('acme.staging.arc.portaljs.com')).toBe('acme')
  })
  it('rejects reserved labels and apex', () => {
    for (const h of ['api.arc.portaljs.com', 'www.arc.portaljs.com', 'admin.arc.portaljs.com', 'arc.portaljs.com']) {
      expect(slugFromHost(h)).toBeNull()
    }
  })
})

describe('resolveCandidates', () => {
  it('maps root to index.html', () => {
    expect(resolveCandidates('acme', '/')).toEqual(['sites/acme/index.html'])
  })
  it('trailing slash tries index.html then <path>.html', () => {
    expect(resolveCandidates('acme', '/search/')).toEqual([
      'sites/acme/search/index.html',
      'sites/acme/search.html',
    ])
  })
  it('serves a file path directly', () => {
    expect(resolveCandidates('acme', '/data/x.csv')).toEqual(['sites/acme/data/x.csv'])
  })
  it('tries extensionless as file, then <path>.html, then directory index', () => {
    expect(resolveCandidates('acme', '/about')).toEqual([
      'sites/acme/about',
      'sites/acme/about.html',
      'sites/acme/about/index.html',
    ])
  })
})

describe('contentType', () => {
  it('maps known extensions', () => {
    expect(contentType('sites/a/index.html')).toMatch(/text\/html/)
    expect(contentType('sites/a/x.csv')).toMatch(/text\/csv/)
    expect(contentType('sites/a/p.geojson')).toBe('application/geo+json')
    expect(contentType('sites/a/blob')).toBe('application/octet-stream')
  })
})

describe('cacheControl', () => {
  it('immutable for hashed next static, revalidate for html', () => {
    expect(cacheControl('sites/a/_next/static/chunk.js')).toMatch(/immutable/)
    expect(cacheControl('sites/a/index.html')).toMatch(/must-revalidate/)
  })
})

describe('fetch handler', () => {
  const env = envWith({
    'sites/acme/index.html': '<h1>Acme</h1>',
    'sites/acme/data/pop.csv': 'a,b\n1,2',
    'sites/acme/search.html': '<h1>Search</h1>', // Next export: /search → search.html
    'sites/acme/about/index.html': '<h1>About</h1>',
    'sites/acme/404.html': '<h1>custom 404</h1>',
  })

  it('serves a Next-export <path>.html for an extensionless route', async () => {
    const res = await worker.fetch(get('acme.staging.arc.portaljs.com', '/search'), env)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/text\/html/)
    expect(await res.text()).toContain('Search')
  })

  it('serves <path>.html for the trailing-slash form too', async () => {
    const res = await worker.fetch(get('acme.staging.arc.portaljs.com', '/search/'), env)
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('Search')
  })

  it('serves the home page', async () => {
    const res = await worker.fetch(get('acme.staging.arc.portaljs.com', '/'), env)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/text\/html/)
    expect(await res.text()).toContain('Acme')
  })

  it('serves a nested data file with the right type', async () => {
    const res = await worker.fetch(get('acme.staging.arc.portaljs.com', '/data/pop.csv'), env)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/text\/csv/)
    expect(await res.text()).toContain('1,2')
  })

  it('resolves an extensionless directory to its index', async () => {
    const res = await worker.fetch(get('acme.staging.arc.portaljs.com', '/about'), env)
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('About')
  })

  it('falls back to the per-site 404', async () => {
    const res = await worker.fetch(get('acme.staging.arc.portaljs.com', '/missing'), env)
    expect(res.status).toBe(404)
    expect(await res.text()).toContain('custom 404')
  })

  it('branded 404 for an unknown slug', async () => {
    const res = await worker.fetch(get('nope.staging.arc.portaljs.com', '/'), env)
    expect(res.status).toBe(404)
    expect(await res.text()).toContain('PortalJS')
  })

  it('reserved label is not served as a tenant', async () => {
    const res = await worker.fetch(get('api.staging.arc.portaljs.com', '/'), env)
    expect(res.status).toBe(404)
  })

  it('rejects non-GET', async () => {
    const res = await worker.fetch(
      new Request('https://acme.staging.arc.portaljs.com/', { method: 'POST' }),
      env
    )
    expect(res.status).toBe(405)
  })

  it('HEAD returns headers but no body', async () => {
    const res = await worker.fetch(
      new Request('https://acme.staging.arc.portaljs.com/', { method: 'HEAD' }),
      env
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/text\/html/)
    expect(await res.text()).toBe('')
  })

  it('malformed percent-encoding → 400, not 500', async () => {
    const res = await worker.fetch(get('acme.staging.arc.portaljs.com', '/%'), env)
    expect(res.status).toBe(400)
  })
})
