import Layout from '@/components/Layout'
import PricingPlans from '@/components/PricingPlans'
import AddOns from '@/components/AddOns'
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';

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
      </div>
    </Layout>
  )
}
