import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

const Player = dynamic(() => import('./LottiePlayer'), { ssr: false })

const features = [
  {
    title: 'Unified sites',
    description:
      'Blend datasets from data backend with CMS content to ship one cohesive experience.',
    icon: 'network',
  },
  {
    title: 'Developer friendly',
    description:
      'Next.js + Tailwind foundation, fast local dev, and unlimited customization via React.',
    icon: 'html',
  },
  {
    title: 'Batteries included',
    description:
      'Catalog search, dataset pages, tables, charts, blogs, and dashboards ready to go.',
    icon: 'layers',
  },
  {
    title: 'Easy to brand',
    description:
      'Install themes, override Tailwind tokens, and create custom routes that match your identity.',
    icon: 'paint-roller',
  },
  {
    title: 'Extensible',
    description:
      'Drop in your own components or integrate third-party widgets without fighting the framework.',
    icon: 'expand',
  },
  {
    title: 'Enterprise ready',
    description:
      'Optional modules for SSO, RBAC, quality workflows, and API management keep orgs compliant.',
    icon: 'padlock',
  },
] as const

export function KeyFeatures() {
  const { resolvedTheme } = useTheme()
  const currentTheme = resolvedTheme ?? 'light'

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-8xl mx-auto px-4 sm:px-8 xl:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              Why teams choose PortalJS
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Modern features for real-world data portals
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Build, launch, and scale data portals without reinventing the stack. PortalJS pairs a rich component library with a developer-first workflow.
            </p>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-4 p-5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  <Player
                    autoplay
                    loop
                    src={`/static/icons/${currentTheme}/${feature.icon}.json`}
                    className="h-6 w-6"
                  />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
