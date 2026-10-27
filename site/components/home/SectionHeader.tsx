import type { ReactNode } from 'react'

// The heading block every homepage section opens with: a blue mono uppercase
// eyebrow, the section title, and an optional one-line lede. Shared so landing
// pages built from the same parts (e.g. /government) read as the same site.
export default function SectionHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: ReactNode
  title: ReactNode
  lede?: ReactNode
}) {
  return (
    <div className="max-w-[680px]">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
        {eyebrow}
      </span>
      <h2 className="mt-3.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-3.5 text-[17px] text-slate-600 dark:text-slate-300">
          {lede}
        </p>
      )}
    </div>
  )
}
