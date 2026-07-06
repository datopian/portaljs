import { useEffect, useRef } from 'react'
import posthog from 'posthog-js'

// "Why so affordable?" TCO section (po-xv5 §2). Competitor rows are anonymized per Anuar's
// decision (2026-07-06): named comparisons live only on dedicated /compare pages; here we keep
// the sourced figures + legal-guard footnote but not the vendor names.
const rows = [
  {
    platform: 'PortalJS Cloud',
    cost: '$1.2k–$15k',
    notes: 'Public pricing, unlimited datasets',
    highlight: true,
  },
  {
    platform: 'Proprietary SaaS portal A',
    cost: '~€5.6k+',
    notes: 'Metadata only, storage caps',
  },
  {
    platform: 'Proprietary SaaS portal B',
    cost: '$65k–$200k',
    notes: 'Marketplace list price',
  },
  {
    platform: 'Proprietary SaaS portal C',
    cost: '$16k–$400k+',
    notes: 'Public procurement testimony; dataset-count caps',
  },
  {
    platform: 'GIS hub platform',
    cost: '"$0" + platform licenses + credits',
    notes: 'Premium tier is quote-only',
  },
  {
    platform: 'Metadata SaaS',
    cost: '£12k–£600k + day-rate services',
    notes: 'Public framework listing',
  },
]

export default function TcoComparison() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              posthog.capture('pricing_tco_table_view')
            } catch (_) {
              /* never let analytics break the page */
            }
            observer.disconnect()
          }
        })
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-12 mt-24">
      <div className="relative z-10">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Same job. A fraction of the invoice.
        </h2>
        <p className="mx-auto mt-4 mb-8 text-center text-[17px] text-slate-600 dark:text-slate-300 max-w-3xl">
          Open-source economics mean no per-dataset caps and no quota licensing.
          You pay for hosting, compliance, and support — not a license.
        </p>
      </div>

      <div ref={ref} className="overflow-x-auto rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Typical annual cost of open data portal platforms
          </caption>
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                Platform
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                Typical annual cost
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr
                key={row.platform}
                className={
                  row.highlight
                    ? 'bg-blue-50/60 dark:bg-blue-900/20'
                    : 'bg-white dark:bg-slate-900'
                }
              >
                <th
                  scope="row"
                  className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap"
                >
                  {row.platform}
                </th>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {row.cost}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {row.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
        Competitor prices from public sources (AWS Marketplace, UK G-Cloud, NYC
        Council testimony, vendor pricing pages), retrieved July 2026. Figures
        are indicative ranges — verify with vendors.
      </p>
    </section>
  )
}
