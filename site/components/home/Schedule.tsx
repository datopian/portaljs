import ButtonLink from '../ButtonLink'
import { H2, H3 } from '../custom/header'

interface ScheduleProps {
  calendar?: string;
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export default function Schedule({
  calendar = "https://calendar.app.google/sn2PU7ZvzjCPo1ok6",
  title = "Ready to Launch Your Data Portal?",
  subtitle = "Join hundreds of organizations worldwide that trust PortalJS Cloud for their data publishing needs.",
  primaryLabel = "Schedule a free call",
  secondaryLabel = "Book a demo",
}: ScheduleProps) {
  return (
    <div className="!max-w-none ring-1 ring-slate-200 dark:ring-slate-800 py-24 bg-zinc-50 dark:bg-slate-800/75 mt-24 relative overflow-hidden ">
      <div className="relative max-w-8xl mx-auto">
        <div className="text-center">
          <H2>{title}</H2>
          <H3>{subtitle}</H3>
        </div>
        <div className="flex justify-center py-8 max-w-lg mx-auto gap-6">
          <ButtonLink
            href={calendar}
            title={primaryLabel}
            className="text-sm"
            target="_blank"
          >
            {primaryLabel}
          </ButtonLink>
          {secondaryLabel && (
            <ButtonLink
              href={calendar}
              title={secondaryLabel}
              style="secondary"
              className="text-sm"
              target="_blank"
            >
              {secondaryLabel}
            </ButtonLink>
          )}
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16 z-10 flex transform-gpu justify-center overflow-hidden blur-3xl pointer-events-none"
        >
          <div
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
            className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-[#38bdf8] to-[#5eead4] opacity-25 rotate-180"
          />
        </div>
      </div>
    </div>
  )
}
