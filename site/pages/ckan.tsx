import Link from 'next/link'
import Hero from '@/components/ckan/Hero'
import SocialProof from '@/components/ckan/SocialProof'
import { KeyFeatures } from '@/components/ckan/KeyFeatures'
import { OrganizationJsonLd, BreadcrumbJsonLd } from 'next-seo';
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Layout from '@/components/Layout'
import { WhyCKANAndPortalJS } from '@/components/ckan/WhyCKANAndPortalJS'
import { CommonUseCases } from '@/components/ckan/CommonUseCases'

export default function CKAN() {
  return (
    <Layout isHomePage={true}>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          {/* 1. Your logo structured data */}
          <OrganizationJsonLd
            url="https://www.portaljs.com"
            logo="https://www.portaljs.com/icon.png"
          />
          {/* 2. Base SEO tags */}
          <Head>
            {generateNextSeo({
              title: "CKAN Data Management System Integration | Decoupled Open Data Frontend",
              description: "Build a modern, headless UI for CKAN with PortalJS. Enjoy copy-&-paste components, server-side rendering for SEO, and full branding control.",
              canonical: "https://www.portaljs.com/ckan",
              openGraph: {
              url: 'https://www.portaljs.com/ckan',
              title: 'CKAN Data Management System Integration | Decoupled Open Data Frontend',
              description: 'Build a modern, headless UI for CKAN with PortalJS. Enjoy copy-&-paste components, server-side rendering for SEO, and full branding control.',
              site_name: 'PortalJS',
            },
            })}
          </Head>
          {/* 4. Breadcrumb schema */}
          <BreadcrumbJsonLd
            items={[
              {
                name: 'Home',
                item: 'https://portaljs.com',
              },
              {
                name: 'CKAN',
                item: 'https://www.portaljs.com/ckan',
              },
            ]}
          />
          <Hero />
          <SocialProof />
          <WhyCKANAndPortalJS />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <KeyFeatures />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <CommonUseCases />
        </div>
      </div>
      <section className="w-full pt-2 pb-0 flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-6 py-4">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Explore more:</span>
            <Link href="/compare/ckan" className="text-sm text-blue-600 hover:underline font-medium">PortalJS vs CKAN alternatives →</Link>
            <Link href="/case-studies" className="text-sm text-blue-600 hover:underline font-medium">Customer stories →</Link>
            <Link href="/pricing" className="text-sm text-blue-600 hover:underline font-medium">View pricing →</Link>
          </div>
        </div>
      </section>
      <section className="w-full pb-[88px] pt-[30px]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1830] via-[#10254a] to-[#173a78] px-7 py-12 text-center sm:px-14 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(50% 90% at 50% -10%,rgba(125,211,252,0.22),transparent 70%)' }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to launch your data portal?
              </h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-[#b9c9e4]">
                Join hundreds of organizations worldwide that trust PortalJS Cloud for their data publishing needs.
              </p>
              <div className="mt-[30px] flex flex-wrap justify-center gap-3.5">
                <a
                  href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
                >
                  Schedule a free call
                </a>
                <a
                  href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.06] px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-white/[0.12]"
                >
                  Book a demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
