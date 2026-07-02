import { CSSProperties, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

// Dual-interface hero (imported from the Claude Design "PortalJS Hero" project).
// The site's <Nav> renders above this, so the design's own navbar is intentionally
// dropped. Colors match the site palette (sky-400 → blue-600, slate); the section
// inherits the page background + soft glows so it blends with the rest of the page.

type Seq = {
  typeChar: boolean
  p?: string
  pc?: string
  t?: string
  tc?: string
  dwell?: number
  role?: 'user' | 'step' | 'done'
  text?: string
}

const DOCS_URL = 'https://portaljs.com/docs'
const BUILDER_URL = 'https://cloud.portaljs.com'
const CMD = 'npm create portaljs@latest'

// Primary CTA destination — the builder entry page reads ?prompt= on load.
// The /build page itself is implemented separately (owned downstream); this
// hero only wires the link and carries the typed prompt.
const BUILDER_ROUTE = '/build'

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

const GUI_SEQ: Seq[] = [
  { typeChar: true, role: 'user', text: 'Build an open-data portal for the City of Malmö — load our air-quality dataset and connect CKAN.' },
  { typeChar: false, dwell: 16, role: 'step', text: 'Generated pages, theme & navigation' },
  { typeChar: false, dwell: 13, role: 'step', text: 'Loaded 12,480 rows · table + chart views' },
  { typeChar: false, dwell: 13, role: 'step', text: 'Wired CKAN backend · 84 datasets synced' },
  { typeChar: false, dwell: 14, role: 'done', text: 'Your portal is live — malmo.portaljs.cloud' },
]

export default function LandingHero() {
  const router = useRouter()
  const [mode, setMode] = useState<'terminal' | 'gui'>('gui')
  const [revealed, setRevealed] = useState(0)
  const [typed, setTyped] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  // The "Describe your portal" CTA input + its rotating example placeholder.
  const [prompt, setPrompt] = useState('')
  const [exampleIdx, setExampleIdx] = useState(0)
  const copyT = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  function select(next: 'terminal' | 'gui') {
    if (next !== mode) setMode(next)
  }

  // Primary CTA: carry the typed prompt (or, if empty, the visible example) to
  // the builder entry page as a url-encoded ?prompt= query param.
  function build() {
    const seed = (prompt.trim() || BUILD_EXAMPLES[exampleIdx]).trim()
    router.push(`${BUILDER_ROUTE}?prompt=${encodeURIComponent(seed)}`)
  }

  function copy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(CMD)
    } catch (_) {}
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

  const gUser = GUI_SEQ[0]
  const guiUserText = revealed === 0 ? (gUser.text || '').slice(0, typed) : gUser.text || ''
  const guiUserShow = revealed > 0 || typed > 0
  // While the prompt is still being typed the composer sits in the middle of the
  // window (Claude-style); once it "submits" (revealed >= 1) the chat takes over.
  const guiComposing = revealed === 0
  const guiAssistantShow = revealed >= 1
  const assistant = seq.slice(1, revealed)
  const guiSteps = assistant.filter((i) => i.role === 'step').map((i) => i.text || '')
  const doneItem = assistant.find((i) => i.role === 'done')
  const guiDoneShow = !!doneItem
  const guiWorking = revealed >= 1 && !guiDoneShow
  const guiTitle = guiDoneShow ? 'Your portal is ready' : 'Building your portal…'
  const previewUrl = isTerminal ? 'my-portal.arc.portaljs.com' : 'malmo.portaljs.cloud'

  const card: CSSProperties = {
    position: 'relative',
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    gap: 11,
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    borderRadius: 14,
    padding: '16px 18px',
    textDecoration: 'none',
  }
  const cardRing: CSSProperties = {
    position: 'absolute',
    inset: -1,
    borderRadius: 14,
    border: '1.5px solid #2563eb',
    boxShadow: '0 0 0 3px rgba(37,99,235,0.12), 0 12px 30px -12px rgba(37,99,235,0.35)',
    pointerEvents: 'none',
  }
  const tab = (active: boolean): CSSProperties => ({
    cursor: 'pointer',
    padding: '7px 15px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: active ? '#ffffff' : 'transparent',
    color: active ? '#2563eb' : '#64748b',
    boxShadow: active ? '0 1px 3px rgba(15,23,42,0.14)' : 'none',
  })

  return (
    <section id="top" className="relative overflow-hidden scroll-mt-32">
      <style>{`
        @keyframes hero-blink { 0%,50%{opacity:1} 50.01%,100%{opacity:0} }
        @keyframes hero-pulse { 0%,80%,100%{opacity:.25;transform:translateY(0)} 40%{opacity:1;transform:translateY(-2px)} }
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
        {/* LEFT: message + two ways to build */}
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
            <span className="bg-gradient-to-r from-sky-400 to-blue-700 bg-clip-text text-transparent">describing it.</span>
          </h1>

          <p className="mt-5 max-w-[520px] text-[18px] leading-relaxed text-slate-500">
            The AI-native framework for data portals. Tell your AI agent what you want — it scaffolds the site, loads your
            data, and wires a backend. <span className="font-medium text-slate-700">You own plain, editable code.</span>
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3">
            {/* Chat card (primary) — the input + Build submit to the builder
                entry route; the "Open the chat" link is secondary. */}
            <div onMouseEnter={() => select('gui')} style={card}>
              {!isTerminal && <div style={cardRing} />}
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>Chat</span>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,0.09)', padding: '3px 7px', borderRadius: 5 }}>
                  Chat · no setup
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minWidth: 0, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '10px 12px', fontSize: 12.5 }}>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      build()
                    }
                  }}
                  placeholder={BUILD_EXAMPLES[exampleIdx]}
                  aria-label="Describe your portal"
                  style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: '#0f172a', padding: 0, cursor: 'text' }}
                />
                <button
                  type="button"
                  onClick={build}
                  aria-label="Build your portal"
                  style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
                >
                  Build <span style={{ fontSize: 13, lineHeight: 1 }}>→</span>
                </button>
              </div>
              <a
                href={BUILDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: 'auto', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}
              >
                Open the chat <span style={{ fontSize: 15 }}>→</span>
              </a>
            </div>

            {/* Terminal card (secondary) — only the "Read the docs" link navigates */}
            <div onMouseEnter={() => select('terminal')} style={card}>
              {isTerminal && <div style={cardRing} />}
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>Terminal</span>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#2563eb', background: 'rgba(37,99,235,0.09)', padding: '3px 7px', borderRadius: 5 }}>
                  CLI · for devs
                </span>
              </div>
              <div
                onClick={copy}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minWidth: 0, background: '#0d1526', borderRadius: 9, padding: '10px 12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, color: '#e2e8f0' }}
              >
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#64748b' }}>$ </span>
                  {CMD}
                </span>
                <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, background: copied ? '#16a34a' : '#2563eb', color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 6 }}>
                  {copied ? 'Copied ✓' : 'Copy'}
                </span>
              </div>
              <a
                href={DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: 'auto', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}
              >
                Read the docs <span style={{ fontSize: 15 }}>→</span>
              </a>
            </div>
          </div>

          <p className="mt-4 text-[13px] text-slate-400">
            One framework, two ways to drive it.{' '}
            <span className="text-slate-500">Same AI skills, same plain editable code — from your terminal, or in chat.</span>
          </p>
        </div>

        {/* RIGHT: animated showcase */}
        <div className="relative flex flex-col">
          <div className="mb-3.5 inline-flex items-center gap-0.5 self-start rounded-[10px] border border-slate-200 p-[3px]" style={{ background: '#eef2f7' }}>
            <span onClick={() => select('gui')} style={tab(!isTerminal)}>
              <span style={{ width: 12, height: 11, border: '1.6px solid currentColor', borderRadius: 3, display: 'inline-block', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 2, left: 0, right: 0, height: 1.4, background: 'currentColor' }} />
              </span>{' '}
              Chat
            </span>
            <span onClick={() => select('terminal')} style={tab(isTerminal)}>
              <span style={{ fontFamily: 'ui-monospace, monospace', opacity: 0.7 }}>&gt;_</span> Terminal
            </span>
          </div>

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
            </div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 34px 80px -34px rgba(15,23,42,0.30), 0 2px 8px rgba(15,23,42,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #eef2f7' }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e2554e' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e6a83f' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#4bb563' }} />
                <span style={{ marginLeft: 8, fontSize: 12.5, fontWeight: 600, color: '#475569' }}>PortalJS Studio</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,0.09)', padding: '3px 8px', borderRadius: 6 }}>AI builder</span>
              </div>
              <div style={{ padding: 18, minHeight: 380, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {guiComposing ? (
                  /* Composer centered in the window — the prompt types itself in, then submits. */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, textAlign: 'center', padding: '8px 6px' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>What do you want to build?</div>
                      <div style={{ marginTop: 7, fontSize: 13, color: '#94a3b8', maxWidth: 320 }}>
                        Describe your portal in plain language — PortalJS builds it for you.
                      </div>
                    </div>
                    <div style={{ width: '100%', maxWidth: 430, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, boxShadow: '0 10px 30px -14px rgba(15,23,42,0.20)', padding: '14px 15px 12px', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                      <div style={{ minHeight: 42, fontSize: 13.5, lineHeight: 1.55, color: guiUserText ? '#0f172a' : '#94a3b8' }}>
                        {guiUserText || 'Describe your portal…'}
                        <span style={{ display: 'inline-block', width: 7, height: 15, background: '#2563eb', marginLeft: 1, verticalAlign: -2, animation: 'hero-blink 1s infinite' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1' }}>PortalJS Studio</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9, background: '#2563eb', color: '#fff', fontSize: 15, lineHeight: 1 }}>↑</span>
                      </div>
                    </div>
                  </div>
                ) : (
                <>
                {guiUserShow && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ maxWidth: '82%', background: '#2563eb', color: '#fff', padding: '10px 14px', borderRadius: '15px 15px 5px 15px', fontSize: 13.5, lineHeight: 1.5 }}>
                      {guiUserText}
                    </div>
                  </div>
                )}
                {guiAssistantShow && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
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
                </>
                )}
              </div>
            </div>
          )}

          {/* floating live-preview card */}
          <div className="relative mt-[-20px] hidden self-stretch sm:block" style={{ height: 158 }}>
            {showPreview && (
              <div style={{ position: 'absolute', top: 0, right: 12, zIndex: 3, width: 250, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 26px 54px -18px rgba(15,23,42,0.28)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: '#f8fafc', borderBottom: '1px solid #eef2f7' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />
                  <span style={{ marginLeft: 4, flex: 1, background: '#eef2f7', borderRadius: 5, padding: '3px 8px', fontFamily: 'ui-monospace, monospace', fontSize: 10, color: '#2563eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewUrl}</span>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Malmö Open Data</span>
                    <span style={{ fontSize: 9.5, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px rgba(22,163,74,0.6)' }} />live
                    </span>
                  </div>
                  <div style={{ height: 60, borderRadius: 7, border: '1px solid #eef2f7', background: '#f8fafc', display: 'flex', alignItems: 'flex-end', gap: 4, padding: 8 }}>
                    {[42, 66, 50, 82, 58, 92, 70].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(#7dd3fc, #2563eb)', borderRadius: 3 }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, fontFamily: 'ui-monospace, monospace', fontSize: 10, color: '#94a3b8' }}>
                    <span>84 datasets</span><span>·</span><span>CKAN</span><span>·</span><span>12.4k rows</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
