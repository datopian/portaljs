// Failure detail for the /build sign-up form (po-a69).
//
// build_signup_error used to fire with nothing but PostHog autocapture defaults, so six July
// failures against eight submissions told us only THAT they failed — po-4nu (75% failure rate)
// stayed guesswork. These helpers turn a thrown fetch/HTTP failure into event properties that
// name the reason.
//
// The two shapes worth telling apart:
//   http_error    — Arc answered with a non-2xx. Status (+ any body detail) identifies it.
//   network_error — fetch itself rejected: offline, DNS, TLS, or a CORS-blocked response. Note
//                   that Arc's /email/start returns a BARE 403 with no CORS headers when the
//                   origin isn't allowlisted, so an origin misconfiguration lands here (as a
//                   TypeError), never as http_error. Hence arc_url on the event.

export type SignupErrorKind = 'http_error' | 'network_error' | 'unknown'

export interface SignupErrorProps {
  error_kind: SignupErrorKind
  error_status: number | null
  error_code: string | null
  error_message: string
  error_field: string | null
}

// Event property values are kept short — a stack-sized message is useless in a PostHog table
// and risks tripping property size limits.
const MAX_MESSAGE = 300

export class SignupHttpError extends Error {
  readonly status: number
  readonly code: string | null
  readonly field: string | null

  constructor(status: number, message: string, code: string | null = null, field: string | null = null) {
    super(message)
    this.name = 'SignupHttpError'
    this.status = status
    this.code = code
    this.field = field
  }
}

function truncate(s: string): string {
  const t = s.trim().replace(/\s+/g, ' ')
  return t.length > MAX_MESSAGE ? `${t.slice(0, MAX_MESSAGE - 1)}…` : t
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? truncate(v) : null
}

// Build the error to throw for a non-ok response. Reads the body ONCE (text, then optional
// JSON.parse) because a Response body can only be consumed a single time. Arc replies to a
// rejected origin with plain text today; JSON error shapes ({ error, message, code, field })
// are handled so a future structured response reports itself without another change here.
export async function httpError(res: Response): Promise<SignupHttpError> {
  let text = ''
  try {
    text = await res.text()
  } catch (_) {
    // body unreadable — status alone still tells us more than the old bare event did
  }
  let body: Record<string, unknown> | null = null
  if (text) {
    try {
      const parsed = JSON.parse(text)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>
      }
    } catch (_) {
      // not JSON (HTML or plain text) — fall back to the raw text as the message
    }
  }
  const message = str(body?.message) ?? str(body?.error) ?? str(text) ?? `arc responded ${res.status}`
  const code = body ? (str(body.code) ?? str(body.error)) : null
  const field = body ? str(body.field) : null
  return new SignupHttpError(res.status, message, code, field)
}

// Flatten anything thrown in the submit path into event properties.
export function errorProps(err: unknown): SignupErrorProps {
  if (err instanceof SignupHttpError) {
    return {
      error_kind: 'http_error',
      error_status: err.status,
      error_code: err.code,
      error_message: truncate(err.message),
      error_field: err.field,
    }
  }
  if (err instanceof Error) {
    // fetch rejects with a TypeError for every transport-level failure, CORS included.
    const kind: SignupErrorKind = err.name === 'TypeError' ? 'network_error' : 'unknown'
    return {
      error_kind: kind,
      error_status: null,
      error_code: err.name || null,
      error_message: truncate(err.message) || 'unknown error',
      error_field: null,
    }
  }
  return {
    error_kind: 'unknown',
    error_status: null,
    error_code: null,
    error_message: truncate(String(err)) || 'unknown error',
    error_field: null,
  }
}
