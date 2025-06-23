import Layout from '@/components/Layout'
import { LogoJsonLd, NextSeo, WebPageJsonLd, BreadcrumbJsonLd } from 'next-seo'
import ButtonLink from '@/components/ButtonLink'
import Link from 'next/link'
import Schedule from '@/components/home/Schedule'

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
      id: 'ckan',
      title: 'PortalJS vs CKAN Classic',
      description: 'Compare PortalJS Cloud with monolith classic CKAN.',
      href: '/compare/ckan',
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
      id: 'dkan',
      title: 'PortalJS vs DKAN',
      description: 'Compare PortalJS with DKAN, the Drupal-based open data platform.',
      href: '/compare/dkan',
      status: 'coming-soon'
    },
    {
      id: 'dataverse',
      title: 'PortalJS vs Dataverse',
      description: 'See how PortalJS compares to Harvard\'s Dataverse for research data repositories.',
      href: '/compare/dataverse',
      status: 'coming-soon'
    },
    {
      id: 'custom',
      title: 'PortalJS vs Custom Solution',
      description: 'Compare PortalJS with building a bespoke custom data portal solution from scratch.',
      href: '/compare/custom-solution',
      status: 'coming-soon'
    }
  ]

  const title = "Compare PortalJS | Open Source Data Portal Comparisons"
  const description = "Compare PortalJS with other data portals: OpenDataSoft, CKAN, Socrata and more. See the advantages of our open source approach.";
  const canonical = "https://portaljs.com/compare";


  return (
    <Layout isHomePage={true}>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          {/* SEO */}
          <LogoJsonLd
            url="https://portaljs.com"
            logo="https://portaljs.com/icon.png"
          />
          <NextSeo
            title={title}
            description={description}
            canonical={canonical}
            openGraph={{
              url: 'https://portaljs.com/compare',
              title,
              description,
              images: [
                {
                  url: 'https://portaljs.com/static/img/seo.webp',
                  width: 1200,
                  height: 630,
                  alt: 'PortalJS Comparisons',
                }
              ],
              siteName: 'PortalJS',
              type: 'website'
            }}
          />
          <WebPageJsonLd
            id="https://portaljs.com/compare#webpage"
            url="https://portaljs.com/compare"
            name={title}
            description={description}
          />
          <BreadcrumbJsonLd
            itemListElements={[
              {
                position: 1,
                name: 'Home',
                item: 'https://portaljs.com',
              },
              {
                position: 2,
                name: 'Compare',
                item: 'https://portaljs.com/compare',
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
              <h1 className="inline bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-5xl tracking-tight text-transparent">
                Compare PortalJS vs alternatives
              </h1>
              <p className="mt-4 text-xl tracking-tight text-slate-400">
                See how open source PortalJS approach delivers more flexibility, better performance, and lower total cost of ownership.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <ButtonLink href={calendarLink} title="Book a demo">
                  Book a demo
                </ButtonLink>
                <ButtonLink href="https://cloud.portaljs.com/auth/signup" title="Sign up for free" style="secondary" trackConversion={true}>
                  Sign up for free
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Cards Section */}
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 py-24">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                Platform Comparisons
              </h2>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                Detailed feature comparisons with popular data portal solutions.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {comparisons.map((comparison) => (
                <div
                  key={comparison.id}
                  className="relative flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md transition-all hover:shadow-lg"
                >
                  {comparison.status === 'coming-soon' && (
                    <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded">
                      Coming Soon
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-semibold mb-2">{comparison.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{comparison.description}</p>
                  </div>
                  <div className="px-6 pb-6">
                    {comparison.status === 'published' ? (
                      <Link
                        href={comparison.href}
                        className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        View Comparison
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-block w-full text-center bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium py-2 px-4 rounded-md cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-transparent">
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

      <Schedule calendar={calendarLink} />
    </Layout>
  )
}