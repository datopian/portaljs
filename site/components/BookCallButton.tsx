import Link from 'next/link'
import { useRouter } from 'next/router'
import { track } from '@/lib/track'

// The site's one "book a call" button. Every page that offers a call renders this, so the
// label, calendar icon, styling and destination are the same everywhere. It replaces the
// per-page mix of "Book a demo", "Schedule a free call" and "Book a Free Consultation",
// which were often two buttons with the same href side by side.
//
// /book-a-demo records the click (book_a_demo_redirect, with `source`) and redirects to the
// calendar. The booking itself becomes `call_booked` server-side (cloud/auth/src/bookings.ts).

const BOOK_CALL = '/book-a-demo'

// Carry outreach attribution (?prospect=…, utm_*) from the current page through to
// /book-a-demo, which records it on book_a_demo_redirect. A link in a cold email then stays
// traceable to the call, whichever page the reader books from.
export function useBookCallHref(source: string, to?: 'partner') {
  const { query } = useRouter()
  const params = new URLSearchParams()
  if (to) params.set('to', to)
  params.set('source', source)
  for (const [k, v] of Object.entries(query)) {
    if (typeof v === 'string' && (k === 'prospect' || k.startsWith('utm_'))) params.set(k, v)
  }
  return `${BOOK_CALL}?${params.toString()}`
}

export function CalendarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  )
}

const VARIANTS = {
  // The homepage's gradient primary; reads on light pages and on the dark closing bands.
  primary:
    'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]',
  // Secondary on a dark band (CtaBandShell), next to a different primary action.
  'on-dark':
    'border border-white/20 bg-white/[0.06] text-white hover:bg-white/[0.12]',
} as const

export default function BookCallButton({
  source,
  to,
  label = 'Book a call',
  variant = 'primary',
  event,
  className = '',
}: {
  // Recorded on book_a_demo_redirect, e.g. 'compare_socrata_hero'.
  source: string
  // The partner-team calendar, for the catalog-integration pages.
  to?: 'partner'
  label?: string
  variant?: keyof typeof VARIANTS
  // A page's own CTA event, when it has one; book_call_clicked otherwise.
  event?: { name: string; props?: Record<string, unknown> }
  className?: string
}) {
  const href = useBookCallHref(source, to)
  return (
    <Link
      href={href}
      onClick={() =>
        event ? track(event.name, event.props) : track('book_call_clicked', { source })
      }
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-[18px] py-2.5 text-[14.5px] font-semibold transition-all duration-150 hover:-translate-y-px ${VARIANTS[variant]} ${className}`}
    >
      <CalendarIcon />
      {label}
    </Link>
  )
}
