import { useEffect, useRef, useState } from 'react'

/**
 * The hero terminal: types the PortalJS agent flow — scaffold a portal, load
 * two datasets, deploy — narrating each step so a visitor can read along, then
 * reveals a catalog-style live-portal preview that holds on screen. Pure
 * CSS/JS, no recording asset, no animation library.
 *
 * Honors prefers-reduced-motion by rendering the final state statically.
 * Content reads top-down and auto-scrolls to the newest line (overflow-hidden
 * + scrollTop), so the latest activity and the final catalog stay in view.
 */

type CmdStep = { t: 'cmd'; text: string }
type OutStep = { t: 'out'; text: string }
// `ok` lines may contain a single highlighted span (text wrapped in **…**).
type OkStep = { t: 'ok'; text: string }
type PreviewStep = { t: 'preview' }
type Step = CmdStep | OutStep | OkStep | PreviewStep

// Mirrors the README example brief. More intermediate `out` lines = more for
// the visitor to read between commands.
const SEQ: Step[] = [
  { t: 'cmd', text: '/portaljs-new-portal "Auckland Council open data portal"' },
  { t: 'out', text: '◐ reading brief · planning structure' },
  { t: 'out', text: '◐ scaffolding Next.js app · Tailwind + Frictionless' },
  { t: 'ok', text: '✓ portal ready · **14 files** generated' },
  { t: 'cmd', text: '/portaljs-add-dataset ./data/air-quality.csv' },
  { t: 'out', text: '◐ reading air-quality.csv · 8,742 rows' },
  { t: 'out', text: '◐ profiling columns · inferring types' },
  { t: 'ok', text: '✓ added **Air quality** · 6 fields · table + chart' },
  { t: 'cmd', text: '/portaljs-add-dataset https://example.com/parks.geojson' },
  { t: 'out', text: '◐ fetching GeoJSON · 312 features' },
  { t: 'out', text: '◐ rendering interactive map' },
  { t: 'ok', text: '✓ added **Parks & reserves** · GeoJSON · mapped' },
  { t: 'cmd', text: '/portaljs-deploy' },
  { t: 'out', text: '◐ building static catalog · optimizing' },
  { t: 'out', text: '◐ uploading to Vercel' },
  { t: 'ok', text: '✓ live → **auckland.portaljs.app**' },
  { t: 'preview' },
]

const TYPE_MS = 36 // per-character typing speed
const CMD_PAUSE = 480 // lead time after a command finishes typing
const OUT_PAUSE = 880 // each narrated step lingers so it can be read
const OK_PAUSE = 720 // success line holds before the next command
const HOLD_FINAL = 9500 // keep the finished catalog on screen to read

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

// Catalog-style preview of the finished portal (header + search + dataset cards).
function CatalogPreview({ show }: { show: boolean }) {
  const datasets = [
    {
      name: 'Air quality',
      desc: 'Hourly readings from monitoring stations',
      meta: 'CSV · 8,742 rows',
      tag: 'Environment',
    },
    {
      name: 'Parks & reserves',
      desc: 'Boundaries and amenities for council parks',
      meta: 'GeoJSON · 312 features',
      tag: 'Recreation',
    },
    {
      name: 'Building consents',
      desc: 'Monthly consents issued by the council',
      meta: 'CSV · 2,180 rows',
      tag: 'Planning',
    },
  ]
  return (
    <div
      className={`mt-3.5 overflow-hidden rounded-[10px] border border-[rgba(148,163,184,0.18)] bg-white transition-all duration-500 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      {/* browser chrome */}
      <div className="flex items-center gap-[7px] border-b border-[#e2e8f0] bg-[#eef2f8] px-2.5 py-[7px]">
        <span className="h-[9px] w-[9px] rounded-full bg-[#ff5f57]" />
        <span className="h-[9px] w-[9px] rounded-full bg-[#febc2e]" />
        <span className="h-[9px] w-[9px] rounded-full bg-[#28c840]" />
        <span className="flex-1 rounded-[5px] border border-[#e2e8f0] bg-white px-2 py-1 font-mono text-[10.5px] font-medium text-[#64748b]">
          auckland.portaljs.app
        </span>
      </div>
      {/* portal header + search */}
      <div className="px-[13px] pt-3 font-sans">
        <div className="flex items-center gap-[7px] text-[12.5px] font-bold text-[#0f172a]">
          <CycMark />
          Auckland Council open data portal
        </div>
        <div className="mt-2 flex items-center gap-[6px] rounded-md border border-[#e7ebf2] bg-[#f7f9fc] px-2 py-[5px] text-[10.5px] text-[#94a3b8]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          Search datasets…
          <span className="ml-auto font-mono text-[9.5px] text-[#b2bccc]">3 datasets</span>
        </div>
      </div>
      {/* dataset catalog */}
      <div className="flex flex-col gap-[6px] px-[13px] pb-3 pt-[9px] font-sans">
        {datasets.map((d) => (
          <div
            key={d.name}
            className="rounded-md border border-[#eef1f6] px-[10px] py-[7px]"
          >
            <div className="flex items-center justify-between">
              <b className="text-[11.5px] font-semibold text-[#0f172a]">{d.name}</b>
              <span className="rounded bg-[#eff5ff] px-[6px] py-[2px] font-mono text-[9px] font-semibold text-[#2563eb]">
                {d.tag}
              </span>
            </div>
            <div className="mt-[2px] text-[10px] leading-snug text-[#64748b]">
              {d.desc}
            </div>
            <div className="mt-[3px] font-mono text-[9.5px] text-[#94a3b8]">
              {d.meta}
            </div>
          </div>
        ))}
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
            // Append the typing cmd line, then fill it character by character.
            // The line being typed is always the last one in the list.
            setLines((prev) => [...prev, { kind: 'cmd', text: '', typing: true }])
            for (let c = 1; c <= s.text.length && !cancelled; c++) {
              const partial = s.text.slice(0, c)
              setLines((prev) => {
                const next = [...prev]
                next[next.length - 1] = { kind: 'cmd', text: partial, typing: true }
                return next
              })
              await wait(TYPE_MS)
            }
            setLines((prev) => {
              const next = [...prev]
              next[next.length - 1] = { kind: 'cmd', text: s.text, typing: false }
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
            await wait(HOLD_FINAL)
          }
        }
      }
    }

    run()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [])

  // Keep the newest line (and the final catalog) in view as content grows, so
  // the terminal reads top-down like a real one but never overflows its box.
  const bodyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, previewShow])

  return (
    <div
      className="overflow-hidden rounded-[14px] bg-[#0a1424] font-mono shadow-[0_30px_70px_-24px_rgba(15,23,42,0.5),0_0_0_1px_rgba(148,163,184,0.12)]"
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
      <div
        ref={bodyRef}
        className="h-[500px] overflow-hidden px-[18px] pb-5 pt-[18px] text-[13.5px] leading-[1.85] text-[#cdd9ec]"
      >
        {lines.map((line, i) => {
          if (line.kind === 'preview') {
            return <CatalogPreview key={`pv-${i}`} show={previewShow} />
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
