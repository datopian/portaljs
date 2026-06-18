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

        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12 mt-24 mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1830] via-[#10254a] to-[#173a78] px-7 py-8 text-center sm:px-14 sm:py-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(50% 90% at 50% -10%,rgba(125,211,252,0.22),transparent 70%)' }}
            />
            <div className="relative z-10">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Not sure yet?</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Before you decide — explore more</h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-[#b9c9e4]">See how PortalJS Cloud compares to alternatives and what organisations have built with it.</p>
              <div className="mt-[30px] flex flex-wrap justify-center gap-3.5">
                <Link href="/case-studies" className="inline-flex items-center justify-center rounded-[10px] border border-white/20 bg-white/10 px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-white/20">Customer stories →</Link>
                <Link href="/compare" className="inline-flex items-center justify-center rounded-[10px] border border-white/20 bg-white/10 px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-white/20">Compare alternatives →</Link>
                <Link href="/faq" className="inline-flex items-center justify-center rounded-[10px] border border-white/20 bg-white/10 px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-white/20">Pricing FAQ →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
