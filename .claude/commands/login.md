---
description: Sign in to PortalJS Arc from the terminal — one browser click, no copying tokens. Runs the device-authorization flow (the gh/wrangler model), saves credentials to ~/.portaljs/credentials, and is reused automatically by /deploy. Also handles `logout` and `whoami`.
allowed-tools: Read, Write, Edit, Bash
---

# /login

Sign in to **PortalJS Arc** without ever seeing, naming, or copying a token. This runs the
**device-authorization flow** (the same model as `gh auth login` / `wrangler login`):

```
$ /login
→ Opening browser to authorize…  (sign in + one "Authorize" click)
✓ Logged in as @you. Credentials saved to ~/.portaljs/credentials
```

The token is minted server-side, auto-named (`cli · <hostname> · <date>`), and stored at
`~/.portaljs/credentials` (mode 0600). `/deploy` reads it automatically — no prompts on later
deploys.

Subcommands (from `$ARGUMENTS`): `login` (default), `logout`, `whoami`.

## Endpoints + config

- **Auth worker** (device flow): `PORTALJS_ARC_AUTH` or `https://arc.portaljs.com`.
- **Deploy API** (whoami / used by /deploy): `PORTALJS_ARC_API` or `https://api.arc.portaljs.com`.
- For staging, point both at the staging workers, e.g.
  `PORTALJS_ARC_AUTH=https://arc-auth-staging.datopian.workers.dev`.

## logout

```bash
rm -f "$HOME/.portaljs/credentials" && echo "Signed out (removed ~/.portaljs/credentials)."
```

## whoami

```bash
API="${PORTALJS_ARC_API:-https://api.arc.portaljs.com}"
TOKEN="${PORTALJS_TOKEN:-}"
if [ -z "$TOKEN" ] && [ -f "$HOME/.portaljs/credentials" ]; then
  TOKEN=$(node -e "const fs=require('fs');try{process.stdout.write(JSON.parse(fs.readFileSync(process.env.HOME+'/.portaljs/credentials','utf8')).token||'')}catch{}")
fi
[ -z "$TOKEN" ] && { echo "Not logged in. Run /login."; exit 0; }
HDR=$(mktemp); chmod 600 "$HDR"; printf 'header = "Authorization: Bearer %s"\n' "$TOKEN" > "$HDR"
RESP=$(curl -s -K "$HDR" "$API/v1/whoami"); rm -f "$HDR"
echo "$RESP" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);console.log(j.login?('Logged in as @'+j.login):'Token invalid or expired — run /login.')}catch{console.log('Could not reach the Arc API.')}})"
```

## login (default)

Run the device flow with a self-contained Node script (Node ≥18; uses global `fetch`). It
requests a code, opens the browser, polls until you approve, then writes credentials.

```bash
AUTH="${PORTALJS_ARC_AUTH:-https://arc.portaljs.com}"
API="${PORTALJS_ARC_API:-https://api.arc.portaljs.com}"

# Already logged in? Don't re-auth needlessly.
if [ -z "${PORTALJS_TOKEN:-}" ] && [ -f "$HOME/.portaljs/credentials" ]; then
  echo "Credentials already present at ~/.portaljs/credentials (run '/login logout' to replace, or '/login whoami')."
  exit 0
fi

cat > /tmp/arc-login.mjs <<'EOF'
import { writeFileSync, mkdirSync, chmodSync } from 'node:fs'
import { join } from 'node:path'
import { homedir, hostname } from 'node:os'
import { spawn } from 'node:child_process'

const AUTH = process.env.PORTALJS_ARC_AUTH || 'https://arc.portaljs.com'
const API = process.env.PORTALJS_ARC_API || 'https://api.arc.portaljs.com'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Best-effort browser open; harmless/no-op in headless/agent sessions.
function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open'
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]
  try { spawn(cmd, args, { stdio: 'ignore', detached: true }).unref() } catch {}
}

async function main() {
  const start = await fetch(`${AUTH}/device/code`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ label: hostname() }),
  })
  if (!start.ok) throw new Error(`device/code failed: HTTP ${start.status}`)
  const { device_code, user_code, verification_uri, verification_uri_complete, interval, expires_in } = await start.json()

  console.log(`\n  Authorize this device at:  ${verification_uri}`)
  console.log(`  Your code:                 ${user_code}\n`)
  console.log('  Opening your browser… (sign in with GitHub, then click Authorize)')
  console.log('  Headless/SSH? Open the URL above on any device and enter the code.\n')
  openBrowser(verification_uri_complete || verification_uri)

  const deadline = Date.now() + (expires_in || 900) * 1000
  let wait = (interval || 5) * 1000
  for (;;) {
    if (Date.now() > deadline) throw new Error('Timed out waiting for authorization. Run /login again.')
    await sleep(wait)
    const poll = await fetch(`${AUTH}/device/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ device_code }),
    })
    if (poll.status === 200) {
      const { token } = await poll.json()
      const dir = join(homedir(), '.portaljs')
      mkdirSync(dir, { recursive: true })
      const file = join(dir, 'credentials')
      writeFileSync(file, JSON.stringify({ token, api: API }) + '\n', { mode: 0o600 })
      chmodSync(file, 0o600)
      // Confirm + greet by login name.
      let who = ''
      try {
        const me = await fetch(`${API}/v1/whoami`, { headers: { authorization: `Bearer ${token}` } })
        if (me.ok) who = (await me.json()).login
      } catch {}
      console.log(`✓ Logged in${who ? ` as @${who}` : ''}. Credentials saved to ${file}`)
      return
    }
    if (poll.status === 428) continue // authorization_pending
    const body = await poll.json().catch(() => ({}))
    if (poll.status === 400 && body.error === 'expired_token') throw new Error('Code expired. Run /login again.')
    throw new Error(`Authorization failed: HTTP ${poll.status} ${body.error || ''}`)
  }
}
main().catch((e) => { console.error(`✖ ${e.message}`); process.exit(1) })
EOF

PORTALJS_ARC_AUTH="$AUTH" PORTALJS_ARC_API="$API" node /tmp/arc-login.mjs
rm -f /tmp/arc-login.mjs
```

## Notes

- **One token per machine.** The flow auto-names the token `cli · <hostname> · <date>`, so the
  dashboard at `https://arc.portaljs.com` shows which device each token belongs to. Revoke any
  there.
- **CI / non-interactive.** Skip the browser flow entirely: set `PORTALJS_TOKEN=<token>` (mint a
  token in the dashboard). `/deploy` and `whoami` prefer `PORTALJS_TOKEN` over the file.
- **Security.** The credentials file is written `0600`. The `device_code` is a one-time secret
  the dashboard never displays; only the short `user_code` is shown, and approving it requires a
  signed-in GitHub session.
