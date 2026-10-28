import type { ReactNode } from 'react'

// The light browser window the homepage hero's showcase sits in (see
// LandingHero's GUI mode): three muted dots, a centred mono URL pill, and an
// optional "live at …" footer bar (with an optional link on its right). Same colours,
// radii and shadow, so a real portal screenshot framed with it reads as part of the
// same site.
export default function BrowserFrame({
  url,
  footer,
  footerAction,
  children,
}: {
  url: string
  footer?: ReactNode
  footerAction?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#eef1f6] bg-white shadow-[0_34px_80px_-34px_rgba(15,23,42,0.30),0_2px_8px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-[#eef2f7] bg-[#fbfcfd] px-4 py-[11px] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-shrink-0 gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-[#e6e9ef] dark:bg-slate-700" />
          <span className="h-2 w-2 rounded-full bg-[#e6e9ef] dark:bg-slate-700" />
          <span className="h-2 w-2 rounded-full bg-[#e6e9ef] dark:bg-slate-700" />
        </div>
        <div className="flex min-w-0 flex-1 justify-center">
          <div className="inline-flex min-w-0 items-center gap-1.5 rounded-[7px] bg-[#f1f4f8] px-3.5 py-[5px] font-mono text-[11px] text-[#7c8798] dark:bg-slate-800 dark:text-slate-400">
            <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[#94a3b8]" aria-hidden="true" />
            <span className="truncate">{url}</span>
          </div>
        </div>
        <div className="w-[34px] flex-shrink-0" aria-hidden="true" />
      </div>
      {children}
      {footer && (
        <div className="flex h-[41px] items-center gap-2 border-t border-[#eef2f7] px-[18px] text-xs text-[#64748b] dark:border-slate-800 dark:text-slate-400">
          <span
            className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.6)]"
            aria-hidden="true"
          />
          <span className="truncate">{footer}</span>
          {footerAction && <span className="ml-auto flex-shrink-0 pl-3">{footerAction}</span>}
        </div>
      )}
    </div>
  )
}
