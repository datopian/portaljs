// PortalJS Arc — auth worker / dashboard (po-5vk). Served at arc.portaljs.com.
// GitHub OAuth sign-in → upsert users → issue/revoke API tokens (sha256-hashed in the
// shared D1 the deploy API reads). Stateless signed-cookie sessions.

import { signSession, verifySession } from './session'
import { upsertUser, upsertEmailUser, createToken, listTokens, revokeToken } from './tokens'
import {
  landingPage,
  dashboardPage,
  activatePage,
  activateResultPage,
  emailSentPage,
  emailConfirmPage,
  emailResultPage,
} from './html'
import { createDeviceCode, approveDeviceCode, claimDeviceToken, formatUserCode } from './device'
import {
  normalizeEmail,
  isValidEmail,
  isFreeEmailDomain,
  createEmailLogin,
  peekEmailLogin,
  verifyEmailLogin,
  sendMagicLinkEmail,
} from './email'
import { gateEmailSend } from './ratelimit'
import { b64url, timingSafeEqual } from './util'

export interface Env {
  DB: D1Database
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  SESSION_SECRET: string
  BASE_URL: string // e.g. https://arc.portaljs.com (must match the GitHub OAuth callback host)
  // Passwordless email sign-in (po-e6j). Resend HTTPS API — RESEND_API_KEY is a secret
  // (wrangler secret put), EMAIL_FROM a var (e.g. "PortalJS Arc <login@arc.portaljs.com>").
  RESEND_API_KEY: string
  EMAIL_FROM: string
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

// Presentation-ready name for the dashboard header: "@login" for GitHub users, else the
// full name or email for email users (github_id / login are NULL for those). Falls back to
// "you" if the row somehow has none.
async function displayNameFor(env: Env, uid: string): Promise<string> {
  const u = await env.DB.prepare('SELECT login, email, full_name FROM users WHERE id = ?')
    .bind(uid)
    .first<{ login: string | null; email: string | null; full_name: string | null }>()
  if (u?.login) return `@${u.login}`
  return u?.full_name || u?.email || 'you'
}

// CSRF guard for state-changing POSTs. SameSite=Lax does NOT protect against a
// *same-site* request from a tenant subdomain (`evil.arc.portaljs.com`), which is the
// multi-tenant risk here — so require the Origin to match the dashboard. Allow a missing
// Origin (some same-origin form posts omit it); reject only a present, mismatched one.
export function isAllowedOrigin(origin: string | null, baseUrl: string): boolean {
  return !origin || origin === baseUrl
}

// The marketing site (portaljs.com) hosts the /build sign-up form, which POSTs the email
// magic-link request cross-origin to /email/start (po-76p). These origins are explicitly
// allowed to hit /email/start (and only that route) with CORS. Everything else — token
// management, device approval — stays same-origin only.
const SITE_ORIGINS: ReadonlySet<string> = new Set([
  'https://portaljs.com',
  'https://www.portaljs.com',
  'http://localhost:3000',
])
export function isAllowedSiteOrigin(origin: string | null): boolean {
  return !!origin && SITE_ORIGINS.has(origin)
}

// Build the CORS response headers for an allowed site origin. Echoes the specific origin
// (never "*") and Vary: Origin so caches don't cross-pollinate. No Allow-Credentials —
// /email/start reads/sets no cookies, so the request is sent without credentials.
function corsHeaders(origin: string, extra?: Headers): Headers {
  const h = extra ?? new Headers()
  h.set('access-control-allow-origin', origin)
  h.set('vary', 'Origin')
  h.set('access-control-allow-methods', 'POST, OPTIONS')
  h.set('access-control-allow-headers', 'content-type')
  h.set('access-control-max-age', '86400')
  return h
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
      return html(dashboardPage(await displayNameFor(env, uid), await listTokens(env.DB, uid)))
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

    // --- Passwordless email sign-in (magic link; po-e6j) ---
    // A GitHub-free front door for the /build audience. Lands in the SAME users table as
    // OAuth and issues the SAME signed-cookie session.

    // CORS preflight for the cross-origin /build sign-up POST (po-76p). Only the marketing
    // site origins are allowed; anything else gets a bare 403 with no CORS headers.
    if (path === '/email/start' && request.method === 'OPTIONS') {
      const origin = request.headers.get('origin')
      if (isAllowedSiteOrigin(origin)) {
        return new Response(null, { status: 204, headers: corsHeaders(origin as string) })
      }
      return new Response('Forbidden', { status: 403 })
    }

    // Step 1: request a magic link. CSRF-guarded like the other state-changing POSTs, but
    // ALSO reachable cross-origin from the marketing site's /build form (SITE_ORIGINS, CORS).
    // The response is deliberately NEUTRAL (always "check your email") so it can't be used
    // to probe which addresses have accounts.
    if (path === '/email/start' && request.method === 'POST') {
      const origin = request.headers.get('origin')
      const fromSite = isAllowedSiteOrigin(origin)
      if (!isAllowedOrigin(origin, env.BASE_URL) && !fromSite) {
        return new Response('Forbidden', { status: 403 })
      }
      // Attach CORS headers to every cross-origin response below, else the browser blocks the
      // site from reading it (and treats the send as failed).
      const respHeaders = () => (fromSite ? corsHeaders(origin as string) : undefined)
      const body = await readJsonOrForm(request)
      const email = normalizeEmail(String(body.email ?? ''))
      const fullName = typeof body.full_name === 'string' ? body.full_name : undefined
      const org = typeof body.org === 'string' ? body.org : undefined
      const ret = safeReturnPath(typeof body.return === 'string' ? body.return : null)
      // Skip minting/sending for free/consumer domains (po-76p corporate-email gate). The
      // /build page blocks these client-side with a friendly terminal-path message; this is
      // the server-side backstop so a bypassed POST doesn't burn a send. Neutral either way.
      if (isValidEmail(email) && !isFreeEmailDomain(email)) {
        // Rate-limit accepted sends by target email + source IP (po-jwn) to prevent
        // email-bombing a victim and burning Resend quota. gateEmailSend records the send
        // when under the caps and returns false when over — in which case we silently skip
        // minting/sending. Either way the response below is identical (see neutrality note).
        const ip = request.headers.get('cf-connecting-ip') ?? ''
        if (await gateEmailSend(env.DB, now(), email, ip)) {
          const { token } = await createEmailLogin(env.DB, now(), email, { fullName, org }, ret === '/' ? undefined : ret)
          const link = `${env.BASE_URL}/email/verify?token=${encodeURIComponent(token)}`
          // Fire the send but don't leak its success/failure into the response (neutrality).
          await sendMagicLinkEmail(env, email, link)
        }
      }
      // Echo back a best-effort address for the "check your email" copy; if it was invalid
      // we still show the neutral page (with whatever the user typed, escaped).
      return html(emailSentPage(email || String(body.email ?? '')), 200, respHeaders())
    }

    // Step 2: the emailed link lands here. A bare GET never signs in — it shows a
    // confirmation page so an email scanner / prefetcher can't consume the token.
    if (path === '/email/verify' && request.method === 'GET') {
      const token = url.searchParams.get('token') ?? ''
      const peek = await peekEmailLogin(env.DB, now(), token)
      if (peek.status === 'valid') return html(emailConfirmPage(token, peek.email ?? ''))
      return html(emailResultPage(peek.status), 400)
    }

    // Step 3: consume the token exactly once and issue a session. CSRF-guarded.
    if (path === '/email/verify' && request.method === 'POST') {
      if (!isAllowedOrigin(request.headers.get('origin'), env.BASE_URL)) {
        return new Response('Forbidden', { status: 403 })
      }
      const body = await readJsonOrForm(request)
      const token = String(body.token ?? '')
      const result = await verifyEmailLogin(env.DB, now(), token)
      if (result.status !== 'verified') return html(emailResultPage(result.status), 400)
      const uid = await upsertEmailUser(
        env.DB,
        result.email,
        { fullName: result.fullName, org: result.org },
        new Date(now() * 1000).toISOString()
      )
      const session = await signSession(uid, env.SESSION_SECRET, now())
      const h = new Headers()
      h.append('set-cookie', cookie(SESSION_COOKIE, session, SESSION_MAX_AGE))
      return redirect(safeReturnPath(result.returnPath), h)
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
      // The response embeds the one-time cleartext token — never cache it.
      const noStore = new Headers({ 'cache-control': 'no-store' })
      return html(dashboardPage(await displayNameFor(env, uid), await listTokens(env.DB, uid), token), 200, noStore)
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
