import Layout from '@/components/Layout'
import Schedule from '@/components/home/Schedule'
import { LogoJsonLd, NextSeo, WebPageJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from 'next-seo'
import ButtonLink from '@/components/ButtonLink'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'

export default function PortalJSvsOpenDataSoft() {
  const { theme } = useTheme()

  const testimonials = [
    {
      quote: "After evaluating multiple options including OpenDataSoft, we chose PortalJS for our data portal. The flexibility and developer-friendly approach let us deliver a custom solution in half the time at a fraction of the cost.",
      author: "Data Director",
      organization: "UK Government Agency",
      image: "/static/img/social-proof/gov-uk.webp"
    },
    {
      quote: "We migrated from OpenDataSoft to PortalJS and immediately saw improvements in performance, customization options, and total cost of ownership. The open architecture means we're never locked into proprietary systems again.",
      author: "IT Manager",
      organization: "European Research Institution",
      image: "/static/img/social-proof/OECD-light.png"
    }
  ]

  const comparisonTable = [
    {
      category: "Architecture",
      items: [
        {
          feature: "Open Source",
          portaljs: "Yes - 100% open source codebase",
          competitor: "No - Proprietary SaaS platform"
        },
        {
          feature: "Frontend Technology",
          portaljs: "Modern React/Next.js frontend",
          competitor: "Custom framework with limited extensibility"
        },
        {
          feature: "Hosting Options",
          portaljs: "Self-hosted or PortalJS Cloud",
          competitor: "Vendor-hosted only"
        },
        {
          feature: "Backend Flexibility",
          portaljs: "Works with CKAN, OpenMetadata, custom APIs",
          competitor: "Proprietary backend only"
        }
      ]
    },
    {
      category: "Customization",
      items: [
        {
          feature: "Visual Customization",
          portaljs: "Unlimited - full control over UI/UX",
          competitor: "Limited to theme colors and logo"
        },
        {
          feature: "Custom Components",
          portaljs: "Create any component with React",
          competitor: "Limited to provided widgets"
        },
        {
          feature: "Workflow Customization",
          portaljs: "Complete control over user workflows",
          competitor: "Fixed workflows with minimal options"
        },
        {
          feature: "Branding",
          portaljs: "100% white-label capability",
          competitor: "Vendor branding remains"
        }
      ]
    },
    {
      category: "Developer Experience",
      items: [
        {
          feature: "Technology Stack",
          portaljs: "Modern JavaScript/TypeScript stack",
          competitor: "Proprietary technologies"
        },
        {
          feature: "Integration Options",
          portaljs: "Unlimited - use any library or service",
          competitor: "Limited to approved integrations"
        },
        {
          feature: "CI/CD Support",
          portaljs: "Full DevOps integration with any CI/CD",
          competitor: "Limited deployment options"
        },
        {
          feature: "Version Control",
          portaljs: "Git-based workflow",
          competitor: "Vendor-controlled versioning"
        }
      ]
    },
    {
      category: "Cost & Ownership",
      items: [
        {
          feature: "License Model",
          portaljs: "Open source (MIT license)",
          competitor: "Proprietary license"
        },
        {
          feature: "Cost Structure",
          portaljs: "Transparent pricing with no hidden fees",
          competitor: "Complex pricing with tiered features"
        },
        {
          feature: "Data Ownership",
          portaljs: "100% data ownership & control",
          competitor: "Data stored on vendor servers"
        },
        {
          feature: "Exit Strategy",
          portaljs: "Take your code & deploy anywhere",
          competitor: "Migration challenges & vendor lock-in"
        }
      ]
    }
  ]

  // Select 5 logos for social proof
  const socialProofLogos = [
    {
      name: 'Transport Data Commons',
      src: '/static/img/social-proof/TDC_logo.svg',
      url: 'https://portal.transport-data.org/',
      width: 240
    },
    {
      name: 'Scottish & Southern Electricity Networks',
      src: '/static/img/social-proof/sse-logo-white.png',
      url: 'https://data.ssen.co.uk/',
      width: 200
    },
    {
      name: 'UAE Ministry of Energy and Infrastructure',
      src: '/static/img/social-proof/uae_moei_eng-logo.png',
      url: 'https://opendata.moei.gov.ae/',
      width: 230
    },
    {
      name: 'Sigma2',
      src: '/static/img/social-proof/sigma2-light-transparent.png',
      url: 'https://archive.sigma2.no/',
      width: 180,
    },
    {
      name: 'Hounslow',
      src: '/static/img/social-proof/hounslow.svg',
      url: 'https://data.hounslow.gov.uk',
      width: 200,
    },
  ]

  return (
    <Layout>
      {/* SEO */}
      <LogoJsonLd
        url="https://portaljs.com"
        logo="https://portaljs.com/icon.png"
      />
      <NextSeo
        title="PortalJS vs OpenDataSoft | Open Source Data Portal Comparison"
        description="Compare PortalJS with OpenDataSoft: See how our open source data portal platform stacks up against proprietary solutions in features, flexibility, and cost."
        canonical="https://portaljs.com/compare/opendatasoft"
        openGraph={{
          url: 'https://portaljs.com/compare/opendatasoft',
          title: 'PortalJS vs OpenDataSoft | Open Source Data Portal Comparison',
          description: 'Compare PortalJS with OpenDataSoft: See how our open source data portal platform stacks up against proprietary solutions in features, flexibility, and cost.',
          images: [
            {
              url: 'https://portaljs.com/static/img/seo.webp',
              width: 1200,
              height: 630,
              alt: 'PortalJS vs OpenDataSoft Comparison',
            }
          ],
          siteName: 'PortalJS',
          type: 'website'
        }}
      />
      <WebPageJsonLd
        id="https://portaljs.com/compare/opendatasoft#webpage"
        url="https://portaljs.com/compare/opendatasoft"
        name="PortalJS vs OpenDataSoft | Open Source Data Portal Comparison"
        description="Compare PortalJS with OpenDataSoft: See how our open source data portal platform stacks up against proprietary solutions in features, flexibility, and cost."
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
          },
          {
            position: 3,
            name: 'OpenDataSoft',
            item: 'https://portaljs.com/compare/opendatasoft',
          }
        ]}
      />

      {/* Hero Section */}
      <div className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]" id="hero">
        <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
          <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
            <div className="relative mb-10 lg:mb-0 text-center">
              <h1 className="inline bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-5xl tracking-tight text-transparent">
                PortalJS vs OpenDataSoft
              </h1>
              <p className="mt-4 text-xl tracking-tight text-slate-400">
                Looking for an alternative to OpenDataSoft? See how PortalJS delivers greater flexibility, modern technology, and no vendor lock-in.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <ButtonLink href="https://calendar.app.google/iQkon85iKURfdBtX7" title="Book a demo">
                  Book a demo
                </ButtonLink>
                <ButtonLink href="/opensource/docs" title="Read the docs" style="secondary">
                  Read the docs
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="text-center max-w-full mx-auto py-24 px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-base font-semibold text-theme-orange uppercase tracking-wide opacity-75">
          Trusted by leading organizations worldwide
        </h2>
        <div className="max-w-8xl flex justify-center mt-5" tabIndex={0}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 justify-center items-center gap-x-4 gap-y-5 w-full mt-6">
            {socialProofLogos.map((logo) => (
              <Link
                className="flex items-center justify-center w-full h-full max-h-24 p-2 opacity-75 hover:opacity-100 transition-all duration-300"
                key={logo.name}
                title={logo.name}
                href={logo.url}
              >
                <Image
                  className={`h-auto ${theme === 'dark' ? 'grayscale' : ''}`}
                  src={logo.src}
                  alt={`${logo.name} Logo`}
                  title={logo.name}
                  height={100}
                  width={logo.width}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative max-w-none w-full flex justify-center py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Hear from users who deployed PortalJS
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Organizations share their experiences about PortalJS.
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex flex-col justify-between bg-white dark:bg-slate-800/70 p-10 shadow-lg rounded-xl border border-slate-200 dark:border-slate-700/50">
                <div>
                  <div className="text-xl font-medium text-slate-900 dark:text-white mb-6">
                    "{testimonial.quote}"
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-x-4">
                  {testimonial.image && (
                    <Image
                      src={testimonial.image}
                      alt={testimonial.organization}
                      width={48}
                      height={48}
                      className="h-10 w-auto"
                    />
                  )}
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-slate-600 dark:text-slate-400">{testimonial.organization}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 py-24">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Feature Comparison
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                See how PortalJS compares to OpenDataSoft across key categories.
              </p>
            </div>

            <div className="mt-16 space-y-16">
              {comparisonTable.map((category, idx) => (
                <div key={category.category} className={idx % 2 === 0 ? "bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm" : "bg-slate-50 dark:bg-slate-900/70 p-8 rounded-xl shadow-sm"}>
                  <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                    {category.category}
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/70 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                          <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-white sm:pl-6">
                            Feature
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">
                            PortalJS
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">
                            OpenDataSoft
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                        {category.items.map((item) => (
                          <tr key={item.feature} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                            <td className="py-4 pl-6 pr-3 text-sm font-medium text-slate-900 dark:text-white">
                              {item.feature}
                            </td>
                            <td className="px-3 py-4 text-sm text-slate-700 dark:text-slate-300">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{item.portaljs}</span>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-slate-700 dark:text-slate-300">
                              {item.competitor}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <Schedule />
    </Layout>
  )
}