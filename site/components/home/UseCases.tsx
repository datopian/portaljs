import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

const Player = dynamic(() => import('./LottiePlayer'), { ssr: false })

const useCases = [
  {
    id: 'opendata',
    title: 'Open Data Portals',
    icon: 'network',
    highlight: 'Meet transparency mandates with beautiful, WCAG-compliant portals.',
    bullets: [
      'National, state, and municipal open data portals',
      'Supports DCAT, DCAT-AP, DCAT-US, and country-specific profiles',
      'CKAN-backed interoperability with mature dataset APIs',
      'SEO-friendly schema markup and structured data for discovery',
      'Cost-effective, designed for LLMs/AI chatbots, fully open-source',
    ],
  },
  {
    id: 'internal',
    title: 'Data Lakes',
    icon: 'html',
    highlight: 'Modern data lakehouse stack powered by blob storage with unlimited scale.',
    bullets: [
      'S3-compatible and tested with R2, AWS S3, GCS, and Azure Blob',
      'Native Parquet support with DuckDB integration and lightweight stack',
      'Built-in data versioning for reproducible lake workflows',
      'Fast ingestion and querying for analytics teams',
    ],
  },
  {
    id: 'research',
    title: 'Research Data Repositories',
    icon: 'layers',
    highlight: 'Publish and preserve research outputs with proper metadata and citation.',
    bullets: [
      'DataCite DOI issuance, ORCID support, and FAIR metadata',
      'Advanced access workflows, embargoes, and custom schemas',
      'S3 integration for large blobs, semi-open and hybrid models',
      'Improved data citation and compliance reporting',
    ],
  },
  {
    id: 'catalog',
    title: 'Data Catalog Frontends',
    icon: 'expand',
    highlight: 'Layer a friendly UI on top of OpenMetadata, DataHub, or Purview.',
    bullets: [
      'Business-user UI/UX that is easy to theme and extend',
      'Out-of-the-box connectors for OpenMetadata, DataHub, Microsoft Purview, more',
      'Self-service discovery with previews, visualizations, and curated views',
    ],
  },
]

export default function UseCases() {
  const [activeCase, setActiveCase] = useState(useCases[0].id)
  const current = useCases.find((item) => item.id === activeCase) ?? useCases[0]
  const { resolvedTheme } = useTheme()
  const currentTheme = resolvedTheme ?? 'light'

  return (
    <section id="solutions" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-8xl mx-auto px-4 sm:px-8 xl:px-12">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
            Solutions
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Built for every stage of your data portal journey
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl">
            PortalJS powers public transparency sites, data lakes, data sharing portals, and enterprise catalog frontends.
          </p>
        </div>
        <div className="mt-12 flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-1 flex-row flex-wrap gap-3">
            {useCases.map((useCase) => (
              <button
                key={useCase.id}
                type="button"
                onClick={() => setActiveCase(useCase.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeCase === useCase.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/20 dark:text-blue-200'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <Player
                  autoplay
                  loop
                  src={`/static/icons/${currentTheme}/${useCase.icon}.json`}
                  className="h-6 w-6"
                />
                {useCase.title}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/20">
            <Player
              autoplay
              loop
              src={`/static/icons/${currentTheme}/${current.icon}.json`}
              className="h-7 w-7"
            />
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
            {current.title}
          </h3>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{current.highlight}</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-200">
            {current.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
