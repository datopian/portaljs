import Layout from '@/components/Layout'
import { isValidEmail, isFreeEmailDomain, orgFromEmail } from '@/lib/freemail'
import posthog from 'posthog-js'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

// The /build page — destination of the hero + navbar primary CTA (po-ctt repoints them here).
// PHASED (po-76p): Phase 1 is SIGN-UP ONLY. Capture email (+ confirm), full name and
// organization, gate out free/consumer email (steer those to the terminal path), request a
// passwordless magic link from Arc, then show a "coming soon" state. The actual browser
// builder is Phase 2. The hero's typed ?prompt= seed is carried through and persisted so the
// builder can pick it up once it ships.

// Arc auth worker (arc.portaljs.com) hosts the passwordless email flow. /build POSTs the
// magic-link request here cross-origin; the worker allows this site's origin via CORS (po-76p).
const ARC_URL = process.env.NEXT_PUBLIC_ARC_URL || 'https://arc.portaljs.com'
const DOCS_URL = 'https://portaljs.com/docs'
const CMD = 'npm create portaljs@latest'
// Where the hero's typed prompt is stashed so the Phase 2 builder can seed itself later.
const PROMPT_KEY = 'portaljs_build_prompt'

function track(event: string, props?: Record<string, unknown>) {
  try {
    posthog.capture(event, props)
  } catch (_) {
    // never let analytics break the page
  }
}

type Status = 'idle' | 'submitting' | 'sent'

export default function BuildPage() {
  const router = useRouter()

  const [prompt, setPrompt] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [org, setOrg] = useState('')
  const orgEdited = useRef(false)

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const copyT = useRef<ReturnType<typeof setTimeout> | null>(null)

  const freemail = email !== '' && isValidEmail(email) && isFreeEmailDomain(email)

  // Carry the hero's ?prompt= seed through and persist it (localStorage) so the builder can
  // pick it up once Phase 2 ships. router.query is empty on the first render, so wait for it.
  useEffect(() => {
    if (!router.isReady) return
    const raw = router.query.prompt
    const seed = (Array.isArray(raw) ? raw[0] : raw) || ''
    if (seed) {
      setPrompt(seed)
      try {
        window.localStorage.setItem(PROMPT_KEY, seed)
      } catch (_) {}
    } else {
      try {
        setPrompt(window.localStorage.getItem(PROMPT_KEY) || '')
      } catch (_) {}
    }
    track('build_viewed', { has_prompt: !!seed })
  }, [router.isReady, router.query.prompt])

  // Prefill the (editable) organization from the corporate email domain until the user types
  // their own. Once they edit the field we stop overwriting it.
  function onEmailChange(next: string) {
    setEmail(next)
    setError(null)
    if (!orgEdited.current) {
      setOrg(isValidEmail(next) ? orgFromEmail(next) : '')
    }
  }

  function validate(): string | null {
    if (!isValidEmail(email)) return 'Enter a valid email address.'
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) return 'The two email addresses don’t match.'
    if (isFreeEmailDomain(email)) return 'free-email'
    if (!fullName.trim()) return 'Enter your full name.'
    if (!org.trim()) return 'Enter your organization.'
    return null
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return
    const problem = validate()
    if (problem === 'free-email') {
      track('build_freemail_blocked')
      setError('free-email')
      return
    }
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    setStatus('submitting')
    track('build_signup_submitted', {
      has_prompt: !!prompt,
      org_inferred: org === orgFromEmail(email),
    })
    try {
      const res = await fetch(`${ARC_URL}/email/start`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), full_name: fullName.trim(), org: org.trim() }),
      })
      if (!res.ok) throw new Error(`arc responded ${res.status}`)
      track('build_email_sent')
      setStatus('sent')
    } catch (err) {
      track('build_signup_error')
      setStatus('idle')
      setError('Something went wrong sending your confirmation email. Please try again.')
    }
  }

  function copyCmd() {
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(CMD)
    } catch (_) {}
    track('build_cli_copied')
    setCopied(true)
    if (copyT.current) clearTimeout(copyT.current)
    copyT.current = setTimeout(() => setCopied(false), 1600)
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
  const labelClass = 'mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300'

  // The terminal-path card: shown as the alternative under the form, and surfaced as the
  // primary call to action when a free-email address is gated out.
  const terminalCard = (highlight: boolean) => (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? 'border-blue-300 bg-blue-50/60 dark:border-blue-500/40 dark:bg-blue-500/10'
          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          &gt;_ Terminal
        </span>
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">Build from your terminal — no sign-up</span>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
        Same AI skills, same plain editable code — available to everyone, right now. Scaffold a portal, load data and
        deploy from the command line.
      </p>
      <div
        onClick={copyCmd}
        className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-[#0d1526] px-3.5 py-2.5 font-mono text-[13px] text-slate-100"
      >
        <span className="truncate">
          <span className="text-slate-500">$ </span>
          {CMD}
        </span>
        <span
          className={`flex-shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold text-white ${
            copied ? 'bg-green-600' : 'bg-blue-600'
          }`}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </span>
      </div>
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('build_docs_clicked')}
        className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
      >
        Read the docs <span aria-hidden>→</span>
      </a>
    </div>
  )

  return (
    <Layout
      isHomePage={true}
      title="Build a data portal — PortalJS"
      description="Sign up to build a data portal by describing it. AI scaffolds the site, loads your data and wires a backend."
    >
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
        {/* seed / heading */}
        <div className="text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-600/25 bg-blue-600/[0.06] px-3 py-1.5 text-[12.5px] font-medium text-blue-600 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
            Open source · AI-native
          </div>
          <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Build your data portal
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-slate-500 dark:text-slate-400">
            Create your account and we’ll take it from here — the AI builder scaffolds the site, loads your data and
            wires a backend.
          </p>
        </div>

        {prompt && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Your portal</div>
            <div className="mt-1 flex items-start gap-2 text-[15px] text-slate-800 dark:text-slate-200">
              <span aria-hidden className="text-blue-500">✦</span>
              <span className="italic">“{prompt}”</span>
            </div>
          </div>
        )}

        {status === 'sent' ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-2xl dark:bg-blue-500/10">
              ✉️
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Check your email</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
              We sent a confirmation link to <span className="font-semibold text-slate-700 dark:text-slate-200">{email.trim()}</span>. Click
              it to finish signing up. The link expires in 30 minutes.
            </p>
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/60 p-5 text-left dark:border-blue-500/40 dark:bg-blue-500/10">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-blue-700 dark:text-blue-300">
                <span aria-hidden>✨</span> The visual builder is coming soon
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
                We’re putting the finishing touches on the browser builder{prompt ? ' — your prompt is saved and ready for it' : ''}.
                In the meantime you can build the exact same portal from your terminal today.
              </p>
            </div>
            <div className="mt-5 text-left">{terminalCard(false)}</div>
          </div>
        ) : freemail && error === 'free-email' ? (
          <div className="mt-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Use the terminal path for personal email</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
                The browser builder is for organization accounts, so we can’t sign up a personal address like{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{email.trim()}</span>. You get the exact same
                capability — with no gate — from the terminal:
              </p>
              <div className="mt-5">{terminalCard(true)}</div>
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setEmail('')
                  setConfirmEmail('')
                }}
                className="mt-4 text-[14px] font-semibold text-slate-500 hover:text-slate-700 hover:underline dark:text-slate-400"
              >
                ← Use a different email
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="grid gap-4">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="you@your-organization.org"
                    className={inputClass}
                    aria-invalid={freemail}
                  />
                  {freemail && (
                    <p className="mt-1.5 text-[13px] text-amber-600 dark:text-amber-400">
                      That looks like a personal email — the builder needs an organization address. You can still build from
                      the terminal.
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="confirmEmail" className={labelClass}>
                    Confirm email
                  </label>
                  <input
                    id="confirmEmail"
                    type="email"
                    autoComplete="email"
                    value={confirmEmail}
                    onChange={(e) => {
                      setConfirmEmail(e.target.value)
                      setError(null)
                    }}
                    placeholder="you@your-organization.org"
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className={labelClass}>
                      Full name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        setError(null)
                      }}
                      placeholder="Ada Lovelace"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="org" className={labelClass}>
                      Organization
                    </label>
                    <input
                      id="org"
                      type="text"
                      autoComplete="organization"
                      value={org}
                      onChange={(e) => {
                        orgEdited.current = true
                        setOrg(e.target.value)
                        setError(null)
                      }}
                      placeholder="City of Malmö"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {error && error !== 'free-email' && (
                <p className="mt-4 text-[13px] font-medium text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? 'Sending…' : 'Create account'}
                {status !== 'submitting' && <span aria-hidden>→</span>}
              </button>
              <p className="mt-3 text-center text-[12.5px] text-slate-400">
                Passwordless — we’ll email you a confirmation link. No password to remember.
              </p>
            </form>

            {terminalCard(false)}
          </div>
        )}
      </div>
    </Layout>
  )
}
