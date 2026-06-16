// HMAC-signed session token: `<payload>.<sig>`, both base64url. payload = {uid, iat}.
// Stateless (no server session store) — the signature is the trust anchor.

import { b64url, b64urlToBytes } from './util'

const enc = new TextEncoder()
const dec = new TextDecoder()

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

export async function signSession(uid: string, secret: string, iatSeconds: number): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ uid, iat: iatSeconds })))
  const key = await hmacKey(secret)
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(payload)))
  return `${payload}.${b64url(sig)}`
}

// Returns the uid if the signature is valid and not older than maxAgeSeconds, else null.
export async function verifySession(
  token: string,
  secret: string,
  maxAgeSeconds: number,
  nowSeconds: number
): Promise<string | null> {
  const dot = token.indexOf('.')
  if (dot < 1) return null
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const key = await hmacKey(secret)
  let ok: boolean
  try {
    ok = await crypto.subtle.verify('HMAC', key, b64urlToBytes(sig), enc.encode(payload))
  } catch {
    return null
  }
  if (!ok) return null
  try {
    const { uid, iat } = JSON.parse(dec.decode(b64urlToBytes(payload)))
    if (typeof uid !== 'string' || typeof iat !== 'number') return null
    if (nowSeconds - iat > maxAgeSeconds || iat > nowSeconds + 60) return null
    return uid
  } catch {
    return null
  }
}
