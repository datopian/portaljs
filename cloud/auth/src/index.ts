// PortalJS Arc — auth worker / dashboard (po-5vk). Served at arc.portaljs.com.
// GitHub OAuth sign-in → upsert users → issue/revoke API tokens (sha256-hashed in the
// shared D1 the deploy API reads). Stateless signed-cookie sessions.

import { signSession, verifySession } from './session'
import { upsertUser, createToken, listTokens, revokeToken } from './tokens'
import { landingPage, dashboardPage } from './html'
import { b64url, timingSafeEqual } from './util'

export interface Env {
  DB: D1Database
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  SESSION_SECRET: string
  BASE_URL: string // e.g. https://arc.portaljs.com (must match the GitHub OAuth callback host)
}

const SESSION_COOKIE = 'arc_session'
const STATE_COOKIE = 'arc_oauth'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const now = () => Math.floor(Date.now() / 1000)

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie') ?? ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

function cookie(name: string, value: string, maxAge: number): string {
  const attrs = `Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
  return `${name}=${encodeURIComponent(value)}; ${attrs}`
}

const html = (body: string, status = 200, extra?: Headers) => {
  const h = extra ?? new Headers()
  h.set('content-type', 'text/html; charset=utf-8')
  return new Response(body, { status, headers: h })
}
const redirect = (to: string, extra?: Headers) => {
  const h = extra ?? new Headers()
  h.set('location', to)
  return new Response(null, { status: 302, headers: h })
}

async function currentUser(request: Request, env: Env): Promise<string | null> {
  const c = getCookie(request, SESSION_COOKIE)
  return c ? verifySession(c, env.SESSION_SECRET, SESSION_MAX_AGE, now()) : null
}

// CSRF guard for state-changing POSTs. SameSite=Lax does NOT protect against a
// *same-site* request from a tenant subdomain (`evil.arc.portaljs.com`), which is the
// multi-tenant risk here — so require the Origin to match the dashboard. Allow a missing
// Origin (some same-origin form posts omit it); reject only a present, mismatched one.
export function isAllowedOrigin(origin: string | null, baseUrl: string): boolean {
  return !origin || origin === baseUrl
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/healthz') return new Response('ok')

    // --- Dashboard / landing ---
    if (path === '/' && request.method === 'GET') {
      const uid = await currentUser(request, env)
      if (!uid) return html(landingPage())
      const login = (await env.DB.prepare('SELECT login FROM users WHERE id = ?').bind(uid).first<{ login: string }>())?.login ?? 'you'
      return html(dashboardPage(login, await listTokens(env.DB, uid)))
    }

    // --- Start GitHub OAuth ---
    if (path === '/auth/login' && request.method === 'GET') {
      const state = b64url(crypto.getRandomValues(new Uint8Array(16)))
      const authorize = new URL('https://github.com/login/oauth/authorize')
      authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
      authorize.searchParams.set('redirect_uri', `${env.BASE_URL}/auth/callback`)
      authorize.searchParams.set('scope', 'read:user')
      authorize.searchParams.set('state', state)
      const h = new Headers()
      h.append('set-cookie', cookie(STATE_COOKIE, state, 600))
      return redirect(authorize.toString(), h)
    }

    // --- OAuth callback ---
    if (path === '/auth/callback' && request.method === 'GET') {
      const code = url.searchParams.get('code') ?? ''
      const state = url.searchParams.get('state') ?? ''
      const expected = getCookie(request, STATE_COOKIE) ?? ''
      if (!code || !state || !expected || !timingSafeEqual(state, expected)) {
        return html(landingPage(), 400)
      }
      // Exchange code for an access token.
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${env.BASE_URL}/auth/callback`,
        }),
      })
      const accessToken = ((await tokenRes.json()) as { access_token?: string }).access_token
      if (!accessToken) return html(landingPage(), 502)
      // Identify the user.
      const ghRes = await fetch('https://api.github.com/user', {
        headers: { authorization: `Bearer ${accessToken}`, 'user-agent': 'portaljs-arc', accept: 'application/vnd.github+json' },
      })
      const gh = (await ghRes.json()) as { id?: number; login?: string }
      if (!gh.id || !gh.login) return html(landingPage(), 502)

      const uid = await upsertUser(env.DB, gh.id, gh.login)
      const session = await signSession(uid, env.SESSION_SECRET, now())
      const h = new Headers()
      h.append('set-cookie', cookie(SESSION_COOKIE, session, SESSION_MAX_AGE))
      h.append('set-cookie', cookie(STATE_COOKIE, '', 0)) // clear state
      return redirect('/', h)
    }

    if (path === '/auth/logout') {
      const h = new Headers()
      h.append('set-cookie', cookie(SESSION_COOKIE, '', 0))
      return redirect('/', h)
    }

    // --- Token management (auth required) ---
    // CSRF: state-changing POSTs must originate from the dashboard itself.
    if ((path === '/tokens' || path === '/tokens/revoke') && request.method === 'POST') {
      if (!isAllowedOrigin(request.headers.get('origin'), env.BASE_URL)) {
        return new Response('Forbidden', { status: 403 })
      }
    }

    if (path === '/tokens' && request.method === 'POST') {
      const uid = await currentUser(request, env)
      if (!uid) return redirect('/')
      const form = await request.formData()
      const label = String(form.get('label') ?? 'token').slice(0, 60)
      const token = await createToken(env.DB, uid, label)
      const login = (await env.DB.prepare('SELECT login FROM users WHERE id = ?').bind(uid).first<{ login: string }>())?.login ?? 'you'
      return html(dashboardPage(login, await listTokens(env.DB, uid), token))
    }

    if (path === '/tokens/revoke' && request.method === 'POST') {
      const uid = await currentUser(request, env)
      if (!uid) return redirect('/')
      const form = await request.formData()
      await revokeToken(env.DB, uid, String(form.get('id') ?? ''))
      return redirect('/')
    }

    return new Response('Not found', { status: 404 })
  },
}
