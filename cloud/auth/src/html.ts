// Minimal light-theme dashboard for PortalJS Arc. No framework — server-rendered HTML.

import type { TokenRow } from './tokens'
import type { ApproveResult } from './device'

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

const SHELL = (title: string, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
  :root { color-scheme: light }
  body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; background: #f8fafc; margin: 0 }
  .wrap { max-width: 44rem; margin: 4rem auto; padding: 0 1.25rem }
  .brand { font-weight: 700; background: linear-gradient(90deg,#38bdf8,#2563eb); -webkit-background-clip: text; background-clip: text; color: transparent }
  h1 { font-size: 1.6rem } h2 { font-size: 1.05rem; margin-top: 2rem }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-top: 1rem }
  .btn { display: inline-flex; align-items: center; gap: .5rem; border: 0; border-radius: 8px; padding: .6rem 1rem; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none }
  .btn-primary { background: linear-gradient(135deg,#38bdf8,#2563eb); color: #fff }
  .btn-ghost { background: #f1f5f9; color: #334155 }
  input[type=text] { font: inherit; padding: .55rem .7rem; border: 1px solid #cbd5e1; border-radius: 8px; width: 16rem }
  table { width: 100%; border-collapse: collapse; font-size: .9rem }
  td, th { text-align: left; padding: .5rem .25rem; border-bottom: 1px solid #f1f5f9 }
  code, pre { background: #f1f5f9; border-radius: 6px; padding: .15rem .4rem; font-size: .85rem }
  pre { padding: .8rem; overflow:auto } .muted { color: #6b7280; font-size: .85rem }
  .tok { color: #9ca3af }
</style></head><body><div class="wrap">${body}
<p class="muted" style="margin-top:3rem">PortalJS <span class="brand">Arc</span> — managed hosting for PortalJS portals.</p>
</div></body></html>`

export function landingPage(): string {
  return SHELL(
    'PortalJS Arc',
    `<h1>PortalJS <span class="brand">Arc</span></h1>
<p class="muted">Deploy a PortalJS portal to a live <code>&lt;slug&gt;.arc.portaljs.com</code> URL.</p>
<div class="card">
  <p>Sign in to create an API token for the <code>/portaljs-deploy</code> skill.</p>
  <a class="btn btn-primary" href="/auth/login">Sign in with GitHub</a>
</div>`
  )
}

// Device-flow authorization page. `code` prefills from the verification_uri_complete link the
// CLI opened, so the common path is one click: the code is shown read-only (for transparency)
// and the user just confirms "Authorize this device?". We never ask the user to compare it
// against the terminal — the CLI opened this page on the same machine. The form still requires
// one explicit signed-in click; a bare GET /activate?code=… never self-approves.
// When `code` is absent (headless/manual fallback), we show an editable input instead.
export function activatePage(code: string): string {
  const body = code
    ? `<form method="post" action="/activate">
    <input type="hidden" name="code" value="${esc(code)}">
    <p class="muted">You're about to authorize this device:</p>
    <p><code style="font-size:1.2rem;letter-spacing:.1em">${esc(code)}</code></p>
    <button class="btn btn-primary" type="submit">Authorize this device</button>
  </form>`
    : `<form method="post" action="/activate" style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap">
    <input type="text" name="code" placeholder="XXXX-XXXX" autofocus
      autocomplete="off" autocapitalize="characters" spellcheck="false" style="text-transform:uppercase;letter-spacing:.1em">
    <button class="btn btn-primary" type="submit">Authorize</button>
  </form>`
  return SHELL(
    'PortalJS Arc — Authorize device',
    `<h1>Authorize <span class="brand">Arc</span> CLI</h1>
<p class="muted">${code ? 'Finish signing in to the Arc CLI.' : 'Enter the code shown in your terminal to finish signing in.'}</p>
<div class="card">
  ${body}
  <p class="muted" style="margin-top:.8rem">Only authorize a code you started yourself in a terminal you trust.</p>
</div>`
  )
}

export function activateResultPage(result: ApproveResult, code: string): string {
  const ok = result === 'approved'
  const msg: Record<ApproveResult, string> = {
    approved: `Device <code>${esc(code)}</code> authorized. Return to your terminal — the CLI will finish automatically.`,
    not_found: `No pending request for <code>${esc(code)}</code>. Check the code in your terminal and try again.`,
    expired: `That code expired. Re-run <code>portaljs login</code> in your terminal to get a fresh one.`,
    already: `That code was already used. Re-run <code>portaljs login</code> to start over.`,
  }
  return SHELL(
    ok ? 'PortalJS Arc — Authorized' : 'PortalJS Arc — Try again',
    `<h1>${ok ? '✓ Authorized' : 'Couldn’t authorize'}</h1>
<div class="card" ${ok ? 'style="border-color:#38bdf8"' : ''}>
  <p>${msg[result]}</p>
  ${ok ? '' : '<a class="btn btn-ghost" href="/activate">Enter a code</a>'}
</div>`
  )
}

export function dashboardPage(login: string, tokens: TokenRow[], newToken?: string): string {
  const newBlock = newToken
    ? `<div class="card" style="border-color:#38bdf8">
  <strong>New token — copy it now, it won't be shown again:</strong>
  <pre>${esc(newToken)}</pre>
  <p class="muted">Use it with the <code>/portaljs-deploy</code> skill:</p>
  <pre>mkdir -p ~/.portaljs &amp;&amp; printf '{"token":"${esc(newToken)}"}\\n' &gt; ~/.portaljs/credentials</pre>
  <p class="muted">…or <code>export PORTALJS_TOKEN=${esc(newToken)}</code></p>
</div>`
    : ''

  const rows = tokens
    .map(
      (t) =>
        `<tr><td>${esc(t.label)}</td><td class="muted">${esc(t.created_at)}</td><td>${
          t.revoked_at
            ? '<span class="tok">revoked</span>'
            : `<form method="post" action="/tokens/revoke" style="margin:0"><input type="hidden" name="id" value="${esc(
                t.id
              )}"><button class="btn btn-ghost" type="submit">Revoke</button></form>`
        }</td></tr>`
    )
    .join('')

  return SHELL(
    'PortalJS Arc — Dashboard',
    `<div style="display:flex;justify-content:space-between;align-items:center">
  <h1>Your <span class="brand">Arc</span> tokens</h1>
  <span class="muted">@${esc(login)} · <a href="/auth/logout">sign out</a></span>
</div>
${newBlock}
<div class="card">
  <form method="post" action="/tokens" style="display:flex;gap:.6rem;align-items:center">
    <input type="text" name="label" placeholder="Token name (e.g. laptop)" maxlength="60">
    <button class="btn btn-primary" type="submit">Generate token</button>
  </form>
</div>
<h2>Tokens</h2>
<div class="card">
  ${tokens.length ? `<table><tr><th>Name</th><th>Created</th><th></th></tr>${rows}</table>` : '<p class="muted">No tokens yet.</p>'}
</div>`
  )
}
