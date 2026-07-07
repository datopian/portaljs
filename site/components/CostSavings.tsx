import { useEffect, useRef } from 'react'
import posthog from 'posthog-js'

// Generic, high-level cost message (po-6sc §3). Replaces the per-competitor TCO table
// (TcoComparison) — no vendor names, no figures table. Framed as "reported" / "typically"
// to stay credible. Named comparisons live only on the dedicated /compare pages.
export default function CostSavings() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              posthog.capture('pricing_cost_savings_view')
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
    <section
      ref={ref}
      className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12 mt-24 text-center"
    >
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Same job. A fraction of the invoice.
      </h2>
      <p className="mx-auto mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Customers report a{' '}
        <span className="text-blue-600 dark:text-blue-400">50–80% reduction</span>{' '}
        in total cost.
      </p>
      <p className="mx-auto mt-4 text-[17px] leading-relaxed text-slate-600 dark:text-slate-300">
        Open-source economics change the math: no per-dataset caps, no quota
        licensing, no license fees. You typically pay only for hosting,
        compliance, and support — not for the right to publish your own data.
      </p>
    </section>
  )
}
