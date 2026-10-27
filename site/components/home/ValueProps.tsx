import type { ReactNode } from 'react'
import IconCard from './IconCard'
import SectionHeader from './SectionHeader'

const props: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: 'Open source, MIT',
    body: 'No lock-in, no license traps. Fork it, ship it, own it.',
    icon: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: 'AI-native',
    body: 'Skills do the assembly. Your assistant scaffolds pages, loads data, and wires up views.',
    icon: (
      <>
        <rect x="4" y="7" width="16" height="13" rx="2" />
        <path d="M12 7V4M8 3h8M9 13h0M15 13h0M9 17h6" />
      </>
    ),
  },
  {
    title: 'Any backend',
    body: 'CKAN, DKAN, OpenMetadata, Microsoft Purview, DataHub, GitHub, Frictionless, or your own.',
    icon: <path d="M4 7h7v4H4zM4 15h7v2H4zM13 9h7v8h-7z" />,
  },
  {
    title: 'Bring your own stack',
    body: 'Adapt PortalJS to your frontend tooling and design system. Plain, editable code throughout.',
    icon: (
      <>
        <path d="M3 9l9-6 9 6-9 6-9-6Z" />
        <path d="M3 9v6l9 6 9-6V9" />
      </>
    ),
  },
  {
    title: 'Community-driven',
    body: 'An active Discord and open discussions. Built in the open, used in production.',
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M22 20a6 6 0 0 0-5-5.9" />
      </>
    ),
  },
]

export default function ValueProps() {
  return (
    <section
      id="why"
      className="w-full scroll-mt-32 border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:py-[88px]"
    >
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
        <SectionHeader
          eyebrow="Why PortalJS"
          title="Built to fit your stack, not replace it."
          lede="A decoupled framework: keep the catalog, metadata system and frontend tooling you already run."
        />

        <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {props.map((p) => (
            <IconCard key={p.title} icon={p.icon} title={p.title} body={p.body} />
          ))}
        </div>
      </div>
    </section>
  )
}
