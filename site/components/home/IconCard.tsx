import type { ReactNode } from 'react'

// The homepage's feature card: a gradient icon tile, a title and one or two
// lines of copy, lifting on hover. `icon` is the inner markup of a 24×24
// stroke icon (paths only); the <svg> wrapper is shared. `footer` (e.g. a
// "Learn more →" link) is pinned under the copy. `compact` puts the icon beside
// the title (copy full width underneath) below `sm`, so a long run of cards doesn't become a wall on phones.
const CARD =
  'rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-slate-300 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700'

export default function IconCard({
  icon,
  title,
  body,
  footer,
  compact = false,
}: {
  icon: ReactNode
  title: ReactNode
  body: ReactNode
  footer?: ReactNode
  compact?: boolean
}) {
  const layout = footer ? `flex flex-col ${CARD}` : CARD
  return (
    <div className={compact ? `grid grid-cols-[42px_1fr] items-center gap-x-4 sm:block ${layout}` : layout}>
      <div
        className={`${compact ? 'sm:mb-4' : 'mb-4'} grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-gradient-to-br from-sky-400/20 to-blue-600/15 text-blue-800 dark:text-blue-300`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[22px] w-[22px]"
          aria-hidden="true"
        >
          {icon}
        </svg>
      </div>
      <h3
        className={`${compact ? 'sm:mb-[7px]' : 'mb-[7px]'} text-[17.5px] font-semibold text-slate-900 dark:text-white`}
      >
        {title}
      </h3>
      <p
        className={`${compact ? 'col-span-2 mt-3 sm:mt-0 ' : ''}text-[14.5px] text-slate-600 dark:text-slate-300`}
      >
        {body}
      </p>
      {footer}
    </div>
  )
}
