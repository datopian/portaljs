// PortalJS Arc — auth worker / dashboard (po-5vk). Served at arc.portaljs.com.
// GitHub OAuth sign-in → upsert users → issue/revoke API tokens (sha256-hashed in the
// shared D1 the deploy API reads). Stateless signed-cookie sessions.

import { signSession, verifySession } from './session'
import { upsertUser, createToken, listTokens, revokeToken } from './tokens'
import { landingPage, dashboardPage, activatePage, activateResultPage } from './html'
import { createDeviceCode, approveDeviceCode, claimDeviceToken, formatUserCode } from './device'
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
const RETURN_COOKIE = 'arc_return' // post-login redirect target (e.g. back to /activate)
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const now = () => Math.floor(Date.now() / 1000)

// Only ever redirect to a local path (open-redirect guard): must start with a single
// "/" and not "//" (protocol-relative). Anything else falls back to the dashboard.
function safeReturnPath(path: string | null | undefined): string {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/'
}

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
const json = (body: unknown, status = 200, headers?: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  })

// Body parser tolerant of both JSON and form posts (the CLI sends JSON; a curl/form
// fallback sends urlencoded). Never throws — returns {} on a malformed/empty body.
async function readJsonOrForm(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? ''
  try {
    if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>
    const form = await request.formData()
    return Object.fromEntries(form.entries())
  } catch {
    return {}
  }
}

async function readLabel(request: Request): Promise<string | undefined> {
  const body = await readJsonOrForm(request)
  const label = body.label
  return typeof label === 'string' && label.trim() ? label.trim() : undefined
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
      // Remember where to send the user after sign-in (e.g. back to /activate?code=…).
      const ret = safeReturnPath(url.searchParams.get('return'))
      if (ret !== '/') h.append('set-cookie', cookie(RETURN_COOKIE, ret, 600))
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
      const dest = safeReturnPath(getCookie(request, RETURN_COOKIE))
      h.append('set-cookie', cookie(RETURN_COOKIE, '', 0)) // clear return
      return redirect(dest, h)
    }

    // --- Device-authorization flow (CLI sign-in; po-j57) ---

    // Step 1: the CLI requests a code pair. Public (no session) — the device_code is the
    // bearer secret it polls with; approval still requires a signed-in human at /activate.
    if (path === '/device/code' && request.method === 'POST') {
      const label = await readLabel(request)
      const { deviceCode, userCode, interval, expiresIn } = await createDeviceCode(env.DB, now(), label)
      const verificationUri = `${env.BASE_URL}/activate`
      return json(
        {
          device_code: deviceCode,
          user_code: formatUserCode(userCode),
          verification_uri: verificationUri,
          verification_uri_complete: `${verificationUri}?code=${encodeURIComponent(formatUserCode(userCode))}`,
          interval,
          expires_in: expiresIn,
        },
        200
      )
    }

    // Step 3: the CLI polls until the user approves, then gets the token exactly once.
    if (path === '/device/token' && request.method === 'POST') {
      const body = await readJsonOrForm(request)
      const result = await claimDeviceToken(env.DB, now(), String(body.device_code ?? ''))
      switch (result.status) {
        case 'issued':
          // One-time cleartext token — never cache.
          return json({ token: result.token }, 200, { 'cache-control': 'no-store' })
        case 'pending':
          return json({ error: 'authorization_pending' }, 428)
        case 'expired':
          return json({ error: 'expired_token' }, 400)
        case 'used':
          return json({ error: 'token_already_issued' }, 410)
        default:
          return json({ error: 'invalid_device_code' }, 400)
      }
    }

    // Step 2 (browser): the user enters the code. Requires a signed-in session; if absent,
    // bounce through GitHub OAuth and come back here (return cookie carries the code).
    if (path === '/activate' && request.method === 'GET') {
      const uid = await currentUser(request, env)
      const code = url.searchParams.get('code') ?? ''
      if (!uid) {
        const ret = `/activate${code ? `?code=${encodeURIComponent(code)}` : ''}`
        return redirect(`/auth/login?return=${encodeURIComponent(ret)}`)
      }
      return html(activatePage(code))
    }

    if (path === '/activate' && request.method === 'POST') {
      if (!isAllowedOrigin(request.headers.get('origin'), env.BASE_URL)) {
        return new Response('Forbidden', { status: 403 })
      }
      const uid = await currentUser(request, env)
      const form = await request.formData()
      const code = String(form.get('code') ?? '')
      if (!uid) return redirect(`/auth/login?return=${encodeURIComponent(`/activate?code=${encodeURIComponent(code)}`)}`)
      const result = await approveDeviceCode(env.DB, now(), uid, code)
      return html(activateResultPage(result, formatUserCode(code.toUpperCase().replace(/[^A-Z0-9]/gi, ''))), result === 'approved' ? 200 : 400)
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
      // The response embeds the one-time cleartext token — never cache it.
      const noStore = new Headers({ 'cache-control': 'no-store' })
      return html(dashboardPage(login, await listTokens(env.DB, uid), token), 200, noStore)
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
