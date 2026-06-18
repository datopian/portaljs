import Layout from '@/components/Layout'
import PricingPlans from '@/components/PricingPlans'
import AddOns from '@/components/AddOns'
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Link from 'next/link';

export default function Pricing() {
  return (
    <Layout>
      <Head>
        {generateNextSeo({
          title: "Pricing | PortalJS Cloud — Open Data Portal Plans",
          description: "Simple, transparent pricing for PortalJS Cloud. Managed open data portals for governments, nonprofits, and enterprises — pay-as-you-go with no infrastructure overhead.",
          canonical: "https://www.portaljs.com/pricing",
          openGraph: {
            url: 'https://www.portaljs.com/pricing',
            title: 'Pricing | PortalJS Cloud — Open Data Portal Plans',
            description: 'Simple, transparent pricing for PortalJS Cloud. Managed open data portals for governments, nonprofits, and enterprises — pay-as-you-go with no infrastructure overhead.',
            site_name: 'PortalJS',
            type: 'website',
            images: [
              {
                url: 'https://www.portaljs.com/static/img/seo.webp',
                alt: 'PortalJS Cloud Pricing',
                width: 1280,
                height: 720,
                type: 'image/webp',
              },
            ],
          },
          twitter: {
            cardType: 'summary_large_image',
            site: '@PortalJS_',
          },
        })}
      </Head>
      <div className="overflow-hidden">
        <div className="">
          <div className="mx-auto ">
            <div className="relative z-10">
              <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Find the best plan for you
              </h1>
              <p className="mx-auto my-4 text-center text-[17px] text-slate-600 dark:text-slate-300">
                Our plans cover all ranges of budgets and needs
              </p>
            </div>
            <PricingPlans />
          </div>
        </div>
        <div className="relative" id="addons">
          <div className="mx-auto max-w-8xl mt-32 ">
            {/* Add-ons */}
            <div className="relative z-10">
              <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Add-ons
              </h2>
              <p className="mx-auto mt-4 mb-8 text-center text-[17px] text-slate-600 dark:text-slate-300 max-w-4xl">
                Extend your data portal with features designed to make your work easier. Each add-on helps you manage, publish, or present your data more efficiently.
              </p>
            </div>
            <AddOns />
          </div>
        </div>

        {/* Internal navigation strip */}
        <div className="mx-auto max-w-4xl mt-24 mb-8 px-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Before you decide — explore more
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
              Not sure which plan fits? See what PortalJS Cloud can do, how it compares to alternatives, and what other organisations have built with it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/features" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                All features →
              </Link>
              <Link href="/case-studies" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                Customer stories →
              </Link>
              <Link href="/compare" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                Compare alternatives →
              </Link>
              <Link href="/faq" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                Pricing FAQ →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
