import { useEffect, useRef, useState } from 'react'

/**
 * The hero animation: a terminal that "types" the PortalJS agent flow —
 * describe a portal, the assistant scaffolds it and loads data, a live portal
 * appears. Show, don't tell. Pure CSS/JS, no recording asset.
 *
 * Each step types its prompt, then reveals output lines, then advances. Loops.
 * Honors prefers-reduced-motion by rendering the final state statically.
 */

type Line = { kind: 'out' | 'ok' | 'muted'; text: string }
type Step = { prompt: string; lines: Line[] }

const STEPS: Step[] = [
  {
    prompt: '/new-portal "City of Malmö open data"',
    lines: [
      { kind: 'muted', text: 'Scaffolding Next.js portal…' },
      { kind: 'out', text: 'Created pages/, components/, tailwind config' },
      { kind: 'ok', text: '✓ Portal ready at localhost:3000' },
    ],
  },
  {
    prompt: '/add-dataset air-quality.csv',
    lines: [
      { kind: 'muted', text: 'Reading 12,480 rows · inferring schema…' },
      { kind: 'out', text: 'Generated /datasets/air-quality + table view' },
      { kind: 'ok', text: '✓ Dataset live with sortable, searchable table' },
    ],
  },
  {
    prompt: '/deploy',
    lines: [
      { kind: 'muted', text: 'Building static export · uploading…' },
      { kind: 'out', text: 'Plain editable code — no magic runtime' },
      { kind: 'ok', text: '✓ Published → malmo.portaljs.app' },
    ],
  },
]

const TYPE_MS = 38
const LINE_MS = 420
const HOLD_MS = 1600

export default function AgentFlow() {
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState('')
  const [shownLines, setShownLines] = useState(0)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced.current) {
      // Render the last step fully, no animation.
      setStep(STEPS.length - 1)
      setTyped(STEPS[STEPS.length - 1].prompt)
      setShownLines(STEPS[STEPS.length - 1].lines.length)
      return
    }

    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) =>
      new Promise<void>((res) => timers.push(setTimeout(res, ms)))

    async function run() {
      while (!cancelled) {
        for (let s = 0; s < STEPS.length && !cancelled; s++) {
          setStep(s)
          setTyped('')
          setShownLines(0)
          const { prompt, lines } = STEPS[s]

          for (let i = 1; i <= prompt.length && !cancelled; i++) {
            setTyped(prompt.slice(0, i))
            await wait(TYPE_MS)
          }
          await wait(300)
          for (let l = 1; l <= lines.length && !cancelled; l++) {
            setShownLines(l)
            await wait(LINE_MS)
          }
          await wait(HOLD_MS)
        }
      }
    }
    run()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [])

  const current = STEPS[step]

  return (
    <div className="agent-flow w-full rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-blue-500/10 overflow-hidden">
      {/* title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/60 bg-slate-800/60">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
        <span className="h-3 w-3 rounded-full bg-green-400/80" />
        <span className="ml-3 text-xs font-mono text-slate-400">
          portaljs — your AI assistant
        </span>
      </div>

      {/* body */}
      <div className="px-5 py-5 font-mono text-sm leading-relaxed min-h-[220px]">
        {/* step indicator */}
        <div className="flex gap-1.5 mb-4">
          {STEPS.map((s, i) => (
            <span
              key={s.prompt}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-blue-400' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="flex items-start gap-2">
          <span className="text-blue-400 select-none">›</span>
          <span className="text-slate-100 break-all">
            {typed}
            <span className="cursor-blink text-blue-300">▋</span>
          </span>
        </div>

        <div className="mt-3 space-y-1.5 pl-4">
          {current.lines.slice(0, shownLines).map((line, i) => (
            <div
              key={i}
              className={
                line.kind === 'ok'
                  ? 'text-green-400'
                  : line.kind === 'muted'
                    ? 'text-slate-500'
                    : 'text-slate-300'
              }
            >
              {line.text}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .cursor-blink {
          animation: cursor-blink 1s step-end infinite;
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
