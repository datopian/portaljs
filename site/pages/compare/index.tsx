import Layout from '@/components/Layout'
import { OrganizationJsonLd, BreadcrumbJsonLd } from 'next-seo';
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Link from 'next/link'

export default function CompareIndex() {
  // Calendar link for all CTAs
  const calendarLink = "https://calendar.app.google/sn2PU7ZvzjCPo1ok6";
  
  const comparisons = [
    {
      id: 'opendatasoft',
      title: 'PortalJS vs OpenDataSoft',
      description: 'See how our open source solution compares to OpenDataSoft\'s proprietary platform.',
      href: '/compare/opendatasoft',
      status: 'published'
    },
    {
      id: 'socrata',
      title: 'PortalJS vs Socrata',
      description: 'See how PortalJS stacks up against Tyler Technologies\' Socrata.',
      href: '/compare/socrata',
      status: 'published'
    },
    {
      id: 'arcgis-hub',
      title: 'PortalJS vs ArcGIS Hub',
      description: 'Compare PortalJS to Esri\'s ArcGIS Hub for data portals.',
      href: '/compare/arcgis-hub',
      status: 'published'
    },
    {
      id: 'ckan',
      title: 'PortalJS vs CKAN Classic',
      description: 'Compare PortalJS Cloud with monolith classic CKAN.',
      href: '/compare/ckan',
      status: 'published'
    },
    {
      id: 'dkan',
      title: 'PortalJS vs DKAN',
      description: 'Compare PortalJS with DKAN, the Drupal-based open data platform.',
      href: '/compare/dkan',
      status: 'published'
    },
    {
      id: 'dataverse',
      title: 'PortalJS vs Dataverse',
      description: 'See how PortalJS compares to Harvard\'s Dataverse for research data repositories.',
      href: '/compare/dataverse',
      status: 'published'
    },
    {
      id: 'custom',
      title: 'PortalJS vs Custom Solution',
      description: 'Compare PortalJS with building a bespoke custom data portal solution from scratch.',
      href: '/compare/custom-solution',
      status: 'published'
    }
  ]

  const title = "Compare PortalJS | Open Source Data Portal Comparisons"
  const description = "Compare PortalJS with other data portals: OpenDataSoft, CKAN, Socrata and more. See the advantages of our open source approach.";
  const canonical = "https://www.portaljs.com/compare";


  return (
    <Layout isHomePage={true}>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          {/* SEO */}
          <OrganizationJsonLd
            url="https://www.portaljs.com"
            logo="https://www.portaljs.com/icon.png"
          />
          <Head>
            {generateNextSeo({
              title: title,
              description: description,
              canonical: canonical,
              openGraph: {
              url: 'https://www.portaljs.com/compare',
              title,
              description,
              images: [
                {
                  url: 'https://www.portaljs.com/static/img/seo.webp',
                  width: 1200,
                  height: 630,
                  alt: 'PortalJS Comparisons',
                }
              ],
              siteName: 'PortalJS',
              type: 'website'
            },
            })}
          </Head>
          <BreadcrumbJsonLd
            items={[
              {
                name: 'Home',
                item: 'https://portaljs.com',
              },
              {
                name: 'Compare',
                item: 'https://www.portaljs.com/compare',
              }
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div
        className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]"
        id="hero"
      >
        <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
          <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
            <div className="relative mb-10 lg:mb-0 text-center">
              <h1 className="inline bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-5xl font-bold leading-[1.08] tracking-tight text-transparent">
                Compare PortalJS vs alternatives
              </h1>
              <p className="mt-4 text-xl tracking-tight text-slate-600 dark:text-slate-400">
                See how open source PortalJS approach delivers more flexibility, better performance, and lower total cost of ownership.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3.5">
                <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]">
                  Book a demo
                </a>
                <a href="https://cloud.portaljs.com/auth/signup" className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-300 bg-white px-[18px] py-2.5 text-[14.5px] font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-blue-400 hover:text-blue-600">
                  Sign up for free
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Cards Section */}
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 pt-8 pb-24">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
                Platform Comparisons
              </h2>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                Detailed feature comparisons with popular data portal solutions.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {comparisons.map((comparison) => (
                comparison.status === 'published' ? (
                  <Link
                    key={comparison.id}
                    href={comparison.href}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-slate-300 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 cursor-pointer"
                  >
                    <h3 className="mb-[7px] text-[17.5px] font-semibold text-slate-900 dark:text-white">{comparison.title}</h3>
                    <p className="flex-1 text-[14.5px] text-slate-600 dark:text-slate-300">{comparison.description}</p>
                    <span className="mt-5 text-[13px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                      View comparison →
                    </span>
                  </Link>
                ) : (
                  <div
                    key={comparison.id}
                    className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 opacity-60 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <span className="absolute top-4 right-4 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5">
                      Coming Soon
                    </span>
                    <h3 className="mb-[7px] text-[17.5px] font-semibold text-slate-900 dark:text-white">{comparison.title}</h3>
                    <p className="text-[14.5px] text-slate-600 dark:text-slate-300">{comparison.description}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Advantages Section */}
      <div className="bg-slate-50 dark:bg-slate-900">
        <div className="flex justify-center">
          <div className="max-w-8xl px-4 sm:px-8 xl:px-12 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
              PortalJS Key Advantages
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              What makes PortalJS stand out from proprietary alternatives?
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300 dark:hover:bg-slate-800 hover:bg-slate-100">
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Open Source</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Full transparency, no black boxes, and freedom to modify code. PortalJS is MIT-licensed and built on a modern tech stack.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300 dark:hover:bg-slate-800 hover:bg-slate-100">
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ultimate Flexibility</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Build exactly what you need with complete control over UI/UX, integrations, and workflows. No restrictive templates.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300 dark:hover:bg-slate-800 hover:bg-slate-100">
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lower Total Cost</h3>
              <p className="text-slate-600 dark:text-slate-400">
                No escalating license fees or hidden costs. Self-host for free or choose predictable pricing with PortalJS Cloud.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300 dark:hover:bg-slate-800 hover:bg-slate-100">
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Developer-Friendly</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Built with React, NextJS and Tailwind CSS — modern tools developers know and love. No proprietary frameworks to learn.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300 dark:hover:bg-slate-800 hover:bg-slate-100">
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Superior Performance</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Static site generation (SSG), incremental static regeneration (ISR) and modern frontend practices deliver lightning-fast load times and a smooth user experience.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300 dark:hover:bg-slate-800 hover:bg-slate-100">
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Scalable Architecture</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Efficiently handle massive datasets and high traffic volumes with a decoupled architecture that scales horizontally.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      <section className="w-full pb-[88px] pt-[30px]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1830] via-[#10254a] to-[#173a78] px-7 py-12 text-center sm:px-14 sm:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 90% at 50% -10%,rgba(125,211,252,0.22),transparent 70%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to launch your data portal?</h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-[#b9c9e4]">Join hundreds of organizations worldwide that trust PortalJS Cloud for their data publishing needs.</p>
              <div className="mt-[30px] flex flex-wrap justify-center gap-3.5">
                <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]">
                  Schedule a free call
                </a>
                <a href="https://cloud.portaljs.com/auth/signup" className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.06] px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-white/[0.12]">
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