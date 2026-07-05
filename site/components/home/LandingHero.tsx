import { CSSProperties, useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'

// Named landing/hero analytics events. Prefer these over DOM autocapture: they
// survive redesigns and give clean funnel/trend building blocks in PostHog.
// See bead po-607 for the event contract + the "portaljs.com landing" dashboard.
function track(event: string, props?: Record<string, unknown>) {
  try {
    posthog.capture(event, props)
  } catch (_) {
    // never let analytics break the hero
  }
}

// Dual-interface hero (imported from the Claude Design "PortalJS Hero" project,
// iterated in po-pdq from the updated mockup). The site's <Nav> renders above
// this, so the design's own navbar is intentionally dropped. Colors match the
// site palette (sky-400 → blue-600, slate); the section inherits the page
// background + soft glows so it blends with the rest of the page.
//
// Layout vs the first import (po-jnv): the two always-visible mode cards + a
// separate pill tab-strip are unified into ONE underline tab bar (left) that
// drives ONE mode-switched card, and the floating live-preview card becomes an
// inline "live at …" footer bar inside the showcase window.

type Seq = {
  typeChar: boolean
  p?: string
  pc?: string
  t?: string
  tc?: string
  dwell?: number
  role?: 'user' | 'upload' | 'step' | 'done'
  text?: string
}

const DOCS_URL = 'https://portaljs.com/docs'
const BUILDER_URL = 'https://cloud.portaljs.com'
const CMD = 'npm create portaljs@latest'

// Primary CTA destination — the builder entry page at /build will read ?prompt=
// on load. NOTE: /build isn't live yet, so the CTA shows a "coming soon" hint
// instead of navigating (would 404). To re-enable when the page ships: add back
// `import { useRouter }`, `const router = useRouter()`, and in build() call
// `router.push('/build?prompt=' + encodeURIComponent(seed))`.

// Rotating placeholder examples that seed intent in the "Describe your portal"
// input (AU/NZ municipalities). If the user hasn't typed anything, the visible
// example is used as the prompt so Build is always functional.
const BUILD_EXAMPLES = [
  'Create an open-data portal for Auckland City Council',
  'Build a data catalog for Wellington City Council',
  'Open data for Christchurch City Council',
  'A transport data portal for Brisbane City Council',
]

const TERMINAL_SEQ: Seq[] = [
  { typeChar: true, p: '$', pc: '#5b7083', t: 'npm create portaljs@latest my-portal', tc: '#e2e8f0' },
  { typeChar: false, dwell: 4, p: '◇', pc: '#64748b', t: 'Scaffolding your data portal…', tc: '#94a3b8' },
  { typeChar: false, dwell: 3, p: '✓', pc: '#34d399', t: 'Created Next.js app · installed dependencies', tc: '#cbd5e1' },
  { typeChar: false, dwell: 3, p: '✓', pc: '#34d399', t: 'Connected your AI agent', tc: '#cbd5e1' },
  { typeChar: false, dwell: 2, p: '', pc: '#000', t: '', tc: '#000' },
  { typeChar: true, p: '›', pc: '#38bdf8', t: '/portaljs-new-portal "Open data for the City of Malmö"', tc: '#7dd3fc' },
  { typeChar: false, dwell: 3, p: '✓', pc: '#34d399', t: 'Generated pages, theme & navigation', tc: '#cbd5e1' },
  { typeChar: true, p: '›', pc: '#38bdf8', t: '/portaljs-add-dataset ./air-quality.csv', tc: '#7dd3fc' },
  { typeChar: false, dwell: 3, p: '✓', pc: '#34d399', t: 'Loaded 12,480 rows · table + chart views', tc: '#cbd5e1' },
  { typeChar: true, p: '›', pc: '#38bdf8', t: '/portaljs-connect-ckan https://data.malmo.se', tc: '#7dd3fc' },
  { typeChar: false, dwell: 3, p: '✓', pc: '#34d399', t: 'Wired CKAN backend · 84 datasets synced', tc: '#cbd5e1' },
  { typeChar: true, p: '›', pc: '#38bdf8', t: '/portaljs-deploy', tc: '#7dd3fc' },
  { typeChar: false, dwell: 3, p: '✓', pc: '#34d399', t: 'Portal running at my-portal.arc.portaljs.com', tc: '#cbd5e1' },
]

// GUI showcase sequence. seq[0] is the composer prompt (types itself in), seq[1]
// is the CSV upload chip (spins, then ✓), then the assistant work steps + done.
const GUI_SEQ: Seq[] = [
  { typeChar: true, role: 'user', text: 'Build an open-data portal for the City of Malmö — load our air-quality dataset and connect CKAN.' },
  { typeChar: false, dwell: 22, role: 'upload', text: 'air-quality.csv' },
  { typeChar: false, dwell: 16, role: 'step', text: 'Generated pages, theme & navigation' },
  { typeChar: false, dwell: 13, role: 'step', text: 'Loaded 12,480 rows · table + chart views' },
  { typeChar: false, dwell: 13, role: 'step', text: 'Wired CKAN backend · 84 datasets synced' },
  { typeChar: false, dwell: 14, role: 'done', text: 'Your portal is live — malmo.portaljs.cloud' },
]

export default function LandingHero() {
  const [mode, setMode] = useState<'terminal' | 'gui'>('gui')
  const [revealed, setRevealed] = useState(0)
  const [typed, setTyped] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  // The "Describe your portal" CTA input + its rotating example placeholder.
  const [prompt, setPrompt] = useState('')
  const [exampleIdx, setExampleIdx] = useState(0)
  // /build isn't live yet — Build shows a transient "coming soon" hint instead.
  const [comingSoon, setComingSoon] = useState(false)
  const copyT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const soonT = useRef<ReturnType<typeof setTimeout> | null>(null)
  // mutable animation cursor kept in a ref so the interval reads fresh values
  const anim = useRef({ revealed: 0, typed: 0, wait: 0, hold: 0, showPreview: false })

  const seq = mode === 'gui' ? GUI_SEQ : TERMINAL_SEQ
  const isTerminal = mode !== 'gui'

  useEffect(() => {
    anim.current = { revealed: 0, typed: 0, wait: 0, hold: 0, showPreview: false }
    setRevealed(0)
    setTyped(0)
    setShowPreview(false)
    const active = mode === 'gui' ? GUI_SEQ : TERMINAL_SEQ
    const timer = setInterval(() => {
      const a = anim.current
      if (a.revealed >= active.length) {
        if (!a.showPreview) {
          a.showPreview = true
          a.hold = 0
          setShowPreview(true)
          return
        }
        a.hold++
        if (a.hold > 60) {
          a.revealed = 0
          a.typed = 0
          a.wait = 0
          a.showPreview = false
          setRevealed(0)
          setTyped(0)
          setShowPreview(false)
        }
        return
      }
      const cur = active[a.revealed]
      const curText = (cur.text != null ? cur.text : cur.t) || ''
      if (cur.typeChar) {
        // The GUI composer prompt types one char at a time and holds when done,
        // so the reader can actually read it before it "submits".
        const guiComposerLine = mode === 'gui' && a.revealed === 0
        const step = guiComposerLine ? 1 : 2
        const postTypeHold = guiComposerLine ? 32 : 0
        if (a.typed < curText.length) {
          a.typed = Math.min(curText.length, a.typed + step)
          setTyped(a.typed)
        } else if (a.wait < postTypeHold) {
          a.wait++
        } else {
          a.revealed++
          a.typed = 0
          a.wait = 0
          setRevealed(a.revealed)
          setTyped(0)
        }
      } else {
        const dwell = cur.dwell || 3
        if (a.wait < dwell) {
          a.wait++
        } else {
          a.revealed++
          a.typed = 0
          a.wait = 0
          setRevealed(a.revealed)
          setTyped(0)
        }
      }
    }, 45)
    return () => clearInterval(timer)
  }, [mode])

  // Rotate the placeholder example while the input is empty, so it reads like a
  // suggestion carousel. Pauses (visually) once the user types, since the
  // placeholder only shows on an empty field.
  useEffect(() => {
    const id = setInterval(
      () => setExampleIdx((i) => (i + 1) % BUILD_EXAMPLES.length),
      3200,
    )
    return () => clearInterval(id)
  }, [])

  function select(next: 'terminal' | 'gui', source: 'tab_click') {
    if (next !== mode) {
      setMode(next)
      // Report the public-facing name: the "gui" mode is the "Visual builder" tab
      // in the UI. The event value stays 'chat' for continuity with the po-607
      // funnel/dashboard (taxonomy stable across the display rename).
      track('hero_mode_switched', { mode: next === 'gui' ? 'chat' : 'terminal', source })
    }
  }

  // Primary CTA: /build isn't live yet, so instead of navigating (404) we show a
  // transient "coming soon" hint. The typed prompt is intentionally not consumed
  // yet — it will seed /build?prompt= once that page ships (see BUILDER_ROUTE note).
  function build(method: 'click' | 'enter') {
    // When the field is empty the visible rotating example is used as the prompt,
    // so a "suggestion" was effectively submitted.
    const usedSuggestion = prompt.trim() === ''
    const effectiveLength = usedSuggestion ? BUILD_EXAMPLES[exampleIdx].length : prompt.trim().length
    track('hero_build_clicked', {
      method,
      used_suggestion: usedSuggestion,
      suggestion_index: usedSuggestion ? exampleIdx : null,
      prompt_length: effectiveLength,
    })
    setComingSoon(true)
    // /build isn't live — the CTA resolves to a "coming soon" state; track it as a
    // proxy for build intent until the page ships (po-76p).
    track('hero_coming_soon_shown')
    if (soonT.current) clearTimeout(soonT.current)
    soonT.current = setTimeout(() => setComingSoon(false), 3200)
  }

  function copy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(CMD)
    } catch (_) {}
    track('hero_cli_copied')
    setCopied(true)
    if (copyT.current) clearTimeout(copyT.current)
    copyT.current = setTimeout(() => setCopied(false), 1600)
  }

  const completedLines = isTerminal ? seq.slice(0, revealed) : []
  let cur: Seq = { typeChar: true, p: '$', t: '', pc: '#5b7083', tc: '#e2e8f0' }
  if (isTerminal && revealed < seq.length) {
    const c = seq[revealed]
    cur = { ...c, t: c.typeChar ? (c.t || '').slice(0, typed) : c.t }
  }

  // GUI derived: composer (idx 0) → CSV upload chip (idx 1) → assistant steps/done.
  const gUser = GUI_SEQ[0]
  const guiUserText = revealed === 0 ? (gUser.text || '').slice(0, typed) : gUser.text || ''
  // While the prompt is still being typed the composer sits in the middle of the
  // window (Claude-style); once it "submits" (revealed >= 1) the chat takes over.
  const guiComposing = revealed === 0
  const guiUpload = GUI_SEQ[1]
  const guiUploadShow = revealed >= 1
  const guiUploadSpinning = revealed <= 1
  const guiAssistantShow = revealed >= 2
  const assistant = seq.slice(2, revealed)
  const guiSteps = assistant.filter((i) => i.role === 'step').map((i) => i.text || '')
  const doneItem = assistant.find((i) => i.role === 'done')
  const guiDoneShow = !!doneItem
  const guiWorking = revealed >= 2 && !guiDoneShow
  const guiTitle = guiDoneShow ? 'Your portal is ready' : 'Building your portal…'
  const previewUrl = isTerminal ? 'my-portal.arc.portaljs.com' : 'malmo.portaljs.cloud'

  const tab = (active: boolean): CSSProperties => ({
    cursor: 'pointer',
    paddingBottom: 13,
    marginBottom: -1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 9,
    fontSize: 16,
    fontWeight: active ? 700 : 600,
    color: active ? '#0f172a' : '#94a3b8',
    borderBottom: active ? '2.5px solid #2563eb' : '2.5px solid transparent',
  })
  const ctaLink: CSSProperties = {
    marginTop: 12,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13.5,
    fontWeight: 600,
    color: '#2563eb',
    textDecoration: 'none',
    alignSelf: 'flex-start',
  }

  return (
    <section id="top" className="relative overflow-hidden scroll-mt-32">
      <style>{`
        @keyframes hero-blink { 0%,50%{opacity:1} 50.01%,100%{opacity:0} }
        @keyframes hero-pulse { 0%,80%,100%{opacity:.25;transform:translateY(0)} 40%{opacity:1;transform:translateY(-2px)} }
        @keyframes hero-fade-up { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hero-spin { to{transform:rotate(360deg)} }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 82% 12%,rgba(56,189,248,0.16),transparent 70%),radial-gradient(50% 60% at 6% 4%,rgba(125,211,252,0.14),transparent 68%)',
        }}
      />

      <div className="grid items-center gap-12 pt-4 pb-14 sm:pt-6 sm:pb-16 lg:grid-cols-[1.02fr_1.12fr] lg:gap-14">
        {/* LEFT: message + two ways to build (underline tabs → one mode card) */}
        <div>
          <div
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium text-blue-600"
            style={{ borderColor: 'rgba(37,99,235,0.24)', background: 'rgba(37,99,235,0.06)' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 8px rgba(37,99,235,0.6)' }} />
            Open source · AI-native
          </div>

          <h1
            className="m-0 text-[40px] font-bold leading-[1.04] tracking-tight text-slate-900 sm:text-5xl xl:text-[56px]"
            style={{ textWrap: 'balance' } as CSSProperties}
          >
            Build a data portal
            <br />
            by{' '}
            <span className="bg-gradient-to-r from-sky-400 via-blue-600 to-blue-900 bg-clip-text text-transparent">describing it.</span>
          </h1>

          <p className="mt-5 max-w-[500px] text-[18px] leading-relaxed text-slate-500">
            The AI-native framework for data portals — from your terminal, or a visual builder.{' '}
            <span className="font-medium text-slate-700">Same AI skills, same plain editable code either way.</span>
          </p>

          {/* Underline tab bar — the single control that switches mode. */}
          <div className="mt-8 flex items-center gap-8 border-b border-slate-200">
            <span onClick={() => select('gui', 'tab_click')} style={tab(!isTerminal)}>
              <span style={{ width: 13, height: 12, border: '1.8px solid currentColor', borderRadius: 3, display: 'inline-block', position: 'relative', boxSizing: 'border-box' }}>
                <span style={{ position: 'absolute', top: 3, left: 0, right: 0, height: 1.5, background: 'currentColor' }} />
              </span>{' '}
              Visual builder
            </span>
            <span onClick={() => select('terminal', 'tab_click')} style={tab(isTerminal)}>
              <span style={{ fontFamily: 'ui-monospace, monospace', opacity: 0.7 }}>&gt;_</span> Terminal
            </span>
          </div>

          {/* One mode-switched card below the tabs. */}
          <div className="mt-5" style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
            {!isTerminal ? (
              /* Visual builder (primary) — functional input + Build → coming soon. */
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minWidth: 0, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '10px 12px', fontSize: 12.5 }}>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        build('enter')
                      }
                    }}
                    placeholder={BUILD_EXAMPLES[exampleIdx]}
                    aria-label="Describe your portal"
                    style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: '#0f172a', padding: 0, cursor: 'text' }}
                  />
                  <button
                    type="button"
                    onClick={() => build('click')}
                    aria-label="Build your portal"
                    style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, background: comingSoon ? '#7c3aed' : '#2563eb', color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 1px 6px rgba(37,99,235,0.5)' }}
                  >
                    {comingSoon ? 'Coming soon' : (<>Build <span style={{ fontSize: 13, lineHeight: 1 }}>→</span></>)}
                  </button>
                </div>
                {comingSoon && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7c3aed', marginTop: 12 }}>
                    <span>✨</span>
                    <span>The visual builder is coming soon. Meanwhile, <a href={BUILDER_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('hero_cta_link_clicked', { target: 'cloud.portaljs.com' })} style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'underline' }}>open the builder</a> or <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('hero_cta_link_clicked', { target: 'docs' })} style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'underline' }}>read the docs</a>.</span>
                  </div>
                )}
                <a
                  href={BUILDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('hero_cta_link_clicked', { target: 'open_the_builder' })}
                  style={ctaLink}
                >
                  Open the builder <span style={{ fontSize: 15 }}>→</span>
                </a>
              </>
            ) : (
              /* Terminal (secondary) — click the command to copy; docs link. */
              <>
                <div
                  onClick={copy}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minWidth: 0, background: '#0d1526', borderRadius: 9, padding: '10px 12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5, color: '#e2e8f0', cursor: 'pointer' }}
                >
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#64748b' }}>$ </span>
                    {CMD}
                  </span>
                  <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, background: copied ? '#16a34a' : '#2563eb', color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 6, boxShadow: copied ? 'none' : '0 1px 6px rgba(37,99,235,0.5)' }}>
                    {copied ? 'Copied ✓' : 'Copy'}
                  </span>
                </div>
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('hero_cta_link_clicked', { target: 'read_the_docs' })}
                  style={ctaLink}
                >
                  Read the docs <span style={{ fontSize: 15 }}>→</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: animated showcase (no tab strip — the left tabs drive it) */}
        <div className="relative flex flex-col">
          {isTerminal ? (
            <div style={{ border: '1px solid #0d1526', borderRadius: 14, overflow: 'hidden', background: '#0a0f1a', boxShadow: '0 34px 80px -34px rgba(15,23,42,0.45), 0 2px 8px rgba(15,23,42,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#0d1424', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 8, fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#64748b' }}>agent — my-portal</span>
              </div>
              <div style={{ padding: '18px 20px 22px', minHeight: 380, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, lineHeight: 1.92 }}>
                {completedLines.map((ln, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, whiteSpace: 'pre' }}>
                    <span style={{ color: ln.pc, flexShrink: 0, width: 12 }}>{ln.p}</span>
                    <span style={{ color: ln.tc }}>{ln.t}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 9, whiteSpace: 'pre' }}>
                  <span style={{ color: cur.pc, flexShrink: 0, width: 12 }}>{cur.p}</span>
                  <span style={{ color: cur.tc }}>
                    {cur.t}
                    <span style={{ display: 'inline-block', width: 8, height: 15, background: '#38bdf8', marginLeft: 1, verticalAlign: -2, animation: 'hero-blink 1s infinite' }} />
                  </span>
                </div>
              </div>
              {/* inline live-preview footer (replaces the old floating card) */}
              <div style={{ height: 41, boxSizing: 'border-box', padding: '0 20px', borderTop: '1px solid rgba(148,163,184,0.12)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', opacity: showPreview ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px rgba(22,163,74,0.6)', flexShrink: 0 }} /> live at {previewUrl}
              </div>
            </div>
          ) : (
            <div style={{ border: '1px solid #eef1f6', borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 34px 80px -34px rgba(15,23,42,0.30), 0 2px 8px rgba(15,23,42,0.06)' }}>
              {/* browser-chrome header with a centered studio URL pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: '#fbfcfd', borderBottom: '1px solid #eef2f7' }}>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e6e9ef' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e6e9ef' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e6e9ef' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f4f8', borderRadius: 7, padding: '5px 14px', fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#7c8798' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#94a3b8', flexShrink: 0 }} /> studio.portaljs.com
                  </div>
                </div>
                <div style={{ width: 34, flexShrink: 0 }} />
              </div>
              <div style={{ minHeight: 380, position: 'relative' }}>
                {guiComposing ? (
                  /* Composer centered in the window — the prompt types itself in, then submits. */
                  <div style={{ height: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 36px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'conic-gradient(from 200deg, #1e3a8a, #2563eb, #38bdf8, #7dd3fc, #2563eb, #1e3a8a)', boxShadow: 'inset 0 0 0 4px #fff' }} />
                    <div style={{ fontSize: 15.5, fontWeight: 600, color: '#0f172a' }}>What do you want to build?</div>
                    <div style={{ width: '100%', maxWidth: 420, display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: 12, padding: '12px 15px' }}>
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: '#334155' }}>
                        {guiUserText}
                        <span style={{ display: 'inline-block', width: 7, height: 14, background: '#94a3b8', marginLeft: 1, verticalAlign: -2, animation: 'hero-blink 1s infinite' }} />
                      </span>
                      <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 7 }}>Build <span style={{ fontSize: 13, lineHeight: 1 }}>→</span></span>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ maxWidth: '82%', background: '#eef2f7', border: '1px solid #e6eaf1', color: '#1e293b', padding: '10px 14px', borderRadius: '15px 15px 5px 15px', fontSize: 13.5, lineHeight: 1.5, animation: 'hero-fade-up 0.4s ease' }}>
                        {guiUserText}
                      </div>
                    </div>
                    {guiUploadShow && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'hero-fade-up 0.4s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid #eef2f7', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#475569' }}>
                          <span style={{ flexShrink: 0, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.02em', color: '#2563eb', background: '#eef4ff', padding: '4px 5px', borderRadius: 4 }}>CSV</span>
                          <span>{guiUpload.text}</span>
                          {guiUploadSpinning ? (
                            <span style={{ width: 12, height: 12, border: '2px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', display: 'inline-block', animation: 'hero-spin 0.8s linear infinite' }} />
                          ) : (
                            <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 13 }}>✓</span>
                          )}
                        </div>
                      </div>
                    )}
                    {guiAssistantShow && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'hero-fade-up 0.4s ease' }}>
                        <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: 'conic-gradient(from 200deg, #1e3a8a, #2563eb, #38bdf8, #7dd3fc, #2563eb, #1e3a8a)', boxShadow: 'inset 0 0 0 3px #fff' }} />
                        <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: '15px 15px 15px 5px', padding: '14px 15px' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>{guiTitle}</div>
                          {guiSteps.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#475569', padding: '3px 0' }}>
                              <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span> {s}
                            </div>
                          ))}
                          {guiWorking && (
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 0 2px' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'hero-pulse 1.2s infinite' }} />
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'hero-pulse 1.2s infinite 0.2s' }} />
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'hero-pulse 1.2s infinite 0.4s' }} />
                            </div>
                          )}
                          {guiDoneShow && (
                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eef2f7', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: '#2563eb' }}>
                              {doneItem?.text} <span style={{ fontSize: 15 }}>→</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* inline live-preview footer (replaces the old floating card) */}
              <div style={{ height: 41, boxSizing: 'border-box', padding: '0 18px', borderTop: '1px solid #eef2f7', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', opacity: showPreview ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px rgba(22,163,74,0.6)', flexShrink: 0 }} /> live at {previewUrl}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
