import { useEffect, useRef, useState } from 'react'

/**
 * The hero terminal: types the PortalJS agent flow — scaffold a portal, load a
 * dataset, deploy — then reveals a mini live-portal preview card. Pure
 * CSS/JS, no recording asset, no animation library.
 *
 * Honors prefers-reduced-motion by rendering the final state statically.
 * Ported from the standalone landing design (rotateY perspective, dark
 * terminal, blue gradient cursor, light preview card).
 */

type CmdStep = { t: 'cmd'; text: string }
type OutStep = { t: 'out'; text: string }
// `ok` lines may contain a single highlighted span (text wrapped in **…**).
type OkStep = { t: 'ok'; text: string }
type PreviewStep = { t: 'preview' }
type Step = CmdStep | OutStep | OkStep | PreviewStep

const SEQ: Step[] = [
  { t: 'cmd', text: '/new-portal "Malmö Open Data"' },
  { t: 'out', text: '◐ scaffolding · Next.js + Frictionless' },
  { t: 'ok', text: '✓ portal ready in 8.2s' },
  { t: 'cmd', text: '/add-dataset traffic-2024.csv' },
  { t: 'out', text: '◐ profiling columns · loading rows' },
  { t: 'ok', text: '✓ **12,403 rows** · 9 fields · indexed' },
  { t: 'cmd', text: '/deploy' },
  { t: 'ok', text: '✓ deployed → malmo.portaljs.app' },
  { t: 'preview' },
]

const TYPE_MS = 34
const CMD_PAUSE = 260
const OUT_PAUSE = 620
const OK_PAUSE = 420
const LOOP_PAUSE = 4200

// One rendered terminal line.
type RenderLine =
  | { kind: 'cmd'; text: string; typing: boolean }
  | { kind: 'out'; text: string }
  | { kind: 'ok'; text: string }
  | { kind: 'preview' }

function OkLine({ text }: { text: string }) {
  // Split out a **highlighted** span.
  const parts = text.split(/\*\*(.+?)\*\*/)
  return (
    <div className="text-[#7ee0a8]">
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-[#cfeede]">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </div>
  )
}

function CycMark({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cyc-grad-pv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="48%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path
        d="M32 31.5C30 18 41 9 53 13c-8-1.5-15 3.5-16.5 12.5C39.5 22 45 22 48 25c-5-2.5-12 .5-16 6.5Z"
        fill="url(#cyc-grad-pv)"
      />
      <path
        d="M32 32.5C34 46 23 55 11 51c8 1.5 15-3.5 16.5-12.5C24.5 42 19 42 16 39c5 2.5 12-.5 16-6.5Z"
        fill="url(#cyc-grad-pv)"
      />
      <circle cx="32" cy="32" r="5.4" fill="#1e3a8a" />
    </svg>
  )
}

function PreviewCard({ show }: { show: boolean }) {
  const rows = [
    { name: 'Traffic counts 2024', tag: 'CSV · 12.4k' },
    { name: 'Air quality sensors', tag: 'JSON · 3.1k' },
    { name: 'Cycling network', tag: 'GeoJSON' },
  ]
  return (
    <div
      className={`mt-3.5 overflow-hidden rounded-[10px] border border-[rgba(148,163,184,0.18)] bg-white transition-all duration-500 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className="flex items-center gap-[7px] border-b border-[#e2e8f0] bg-[#eef2f8] px-2.5 py-[7px]">
        <span className="h-[9px] w-[9px] rounded-full bg-[#ff5f57]" />
        <span className="h-[9px] w-[9px] rounded-full bg-[#febc2e]" />
        <span className="h-[9px] w-[9px] rounded-full bg-[#28c840]" />
        <span className="flex-1 rounded-[5px] border border-[#e2e8f0] bg-white px-2 py-1 font-mono text-[10.5px] font-medium text-[#64748b]">
          malmo.portaljs.app
        </span>
      </div>
      <div className="px-[13px] py-3 font-sans">
        <div className="flex items-center gap-[7px] text-[12.5px] font-bold text-[#0f172a]">
          <CycMark />
          Malmö Open Data
        </div>
        <div className="mt-[9px] flex flex-col gap-[5px]">
          {rows.map((r) => (
            <div
              key={r.name}
              className="flex items-center justify-between rounded-md border border-[#eef1f6] px-[9px] py-[6px] text-[11px] text-[#475569]"
            >
              <b className="font-semibold text-[#0f172a]">{r.name}</b>
              <span className="rounded bg-[#eff5ff] px-[6px] py-[3px] font-mono text-[9.5px] font-semibold text-[#2563eb]">
                {r.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AgentFlow() {
  const [lines, setLines] = useState<RenderLine[]>([])
  const [previewShow, setPreviewShow] = useState(false)

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      const finalLines: RenderLine[] = SEQ.filter(
        (s): s is CmdStep | OutStep | OkStep => s.t !== 'preview'
      ).map((s) =>
        s.t === 'cmd'
          ? { kind: 'cmd', text: s.text, typing: false }
          : s.t === 'out'
            ? { kind: 'out', text: s.text }
            : { kind: 'ok', text: s.text }
      )
      finalLines.push({ kind: 'preview' })
      setLines(finalLines)
      setPreviewShow(true)
      return
    }

    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) =>
      new Promise<void>((res) => timers.push(setTimeout(res, ms)))

    async function run() {
      while (!cancelled) {
        setLines([])
        setPreviewShow(false)
        for (let i = 0; i < SEQ.length && !cancelled; i++) {
          const s = SEQ[i]
          if (s.t === 'cmd') {
            // Append the typing cmd line; its index in the list is the count of
            // non-preview steps already rendered (= i here, since preview is last).
            const idx = i
            setLines((prev) => [...prev, { kind: 'cmd', text: '', typing: true }])
            for (let c = 1; c <= s.text.length && !cancelled; c++) {
              const partial = s.text.slice(0, c)
              setLines((prev) => {
                const next = [...prev]
                next[idx] = { kind: 'cmd', text: partial, typing: true }
                return next
              })
              await wait(TYPE_MS)
            }
            setLines((prev) => {
              const next = [...prev]
              next[idx] = { kind: 'cmd', text: s.text, typing: false }
              return next
            })
            await wait(CMD_PAUSE)
          } else if (s.t === 'out') {
            setLines((prev) => [...prev, { kind: 'out', text: s.text }])
            await wait(OUT_PAUSE)
          } else if (s.t === 'ok') {
            setLines((prev) => [...prev, { kind: 'ok', text: s.text }])
            await wait(OK_PAUSE)
          } else if (s.t === 'preview') {
            setLines((prev) => [...prev, { kind: 'preview' }])
            await wait(60)
            if (!cancelled) setPreviewShow(true)
            await wait(50)
          }
        }
        await wait(LOOP_PAUSE)
      }
    }

    run()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div
      className="overflow-hidden rounded-[14px] bg-[#0a1424] font-mono shadow-[0_30px_70px_-24px_rgba(15,23,42,0.5),0_0_0_1px_rgba(148,163,184,0.12)] lg:[transform:perspective(1400px)_rotateY(-3deg)]"
      aria-label="Agent workflow demo"
    >
      <div className="flex items-center gap-2 border-b border-[rgba(148,163,184,0.13)] px-4 py-[13px]">
        <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
        <span className="ml-2.5 text-xs tracking-[0.02em] text-[#6b7a92]">
          portaljs — agent
        </span>
      </div>
      <div className="h-[480px] overflow-hidden px-[18px] pb-5 pt-[18px] text-[13.5px] leading-[1.85] text-[#cdd9ec]">
        {lines.map((line, i) => {
          if (line.kind === 'preview') {
            return <PreviewCard key={`pv-${i}`} show={previewShow} />
          }
          if (line.kind === 'cmd') {
            return (
              <div key={i} className="whitespace-pre-wrap break-words">
                <span className="text-[#5eead4]">› </span>
                <span className="text-[#e9f0fb]">{line.text}</span>
                {line.typing && (
                  <span className="cursor-blink ml-0.5 inline-block h-4 w-2 -translate-y-px rounded-[1px] bg-[#38bdf8] align-[-3px]" />
                )}
              </div>
            )
          }
          if (line.kind === 'out') {
            return (
              <div key={i} className="whitespace-pre-wrap break-words text-[#8b9bb4]">
                {line.text}
              </div>
            )
          }
          return <OkLine key={i} text={line.text} />
        })}
      </div>

      <style jsx>{`
        .cursor-blink {
          animation: cursor-blink 1s steps(1) infinite;
        }
        @keyframes cursor-blink {
          50% {
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cursor-blink {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
