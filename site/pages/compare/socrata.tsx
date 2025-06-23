import Layout from '@/components/Layout'
import Schedule from '@/components/home/Schedule'
import { LogoJsonLd, NextSeo, WebPageJsonLd, BreadcrumbJsonLd } from 'next-seo'
import ButtonLink from '@/components/ButtonLink'
import Image from 'next/image'
import Link from 'next/link'

export default function PortalJSvsSocrata() {
  // Calendar link for all CTAs
  const calendarLink = "https://calendar.app.google/sn2PU7ZvzjCPo1ok6";

  const testimonials = [
    {
      quote: "After migrating from Socrata to PortalJS, we gained complete control over our data portal. The ability to customize everything from the UI to the data pipelines while reducing costs by 70% made this an easy decision.",
      author: "Data Portal Manager",
      organization: "State Government Agency, US",
      image: null
    },
    {
      quote: "Socrata's licensing costs were becoming prohibitive as our data portal grew. PortalJS allowed us to scale without the per-dataset fees, and the modern tech stack made development much faster for our team.",
      author: "Chief Technology Officer",
      organization: "Municipal Government",
      image: null
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
          competitor: "Legacy web technologies with limited flexibility"
        },
        {
          feature: "Hosting Options",
          portaljs: "Self-hosted or PortalJS Cloud",
          competitor: "Vendor-hosted only (AWS-based)"
        },
        {
          feature: "Backend Flexibility",
          portaljs: "Works with CKAN, OpenMetadata, custom APIs",
          competitor: "Proprietary Socrata backend only"
        }
      ]
    },
    {
      category: "Customization",
      items: [
        {
          feature: "Visual Customization",
          portaljs: "Unlimited - full control over UI/UX",
          competitor: "Limited theme options and CSS overrides"
        },
        {
          feature: "Custom Components",
          portaljs: "Create any component with React",
          competitor: "Limited to pre-built visualization widgets"
        },
        {
          feature: "Workflow Customization",
          portaljs: "Complete control over user workflows",
          competitor: "Fixed workflows with minimal configuration"
        },
        {
          feature: "Branding",
          portaljs: "100% white-label capability",
          competitor: "Limited branding with Socrata attribution"
        }
      ]
    },
    {
      category: "Developer Experience",
      items: [
        {
          feature: "Technology Stack",
          portaljs: "Modern JavaScript/TypeScript stack",
          competitor: "Proprietary platform with limited dev tools"
        },
        {
          feature: "Integration Options",
          portaljs: "Unlimited - use any library or service",
          competitor: "API-based integrations with rate limits"
        },
        {
          feature: "CI/CD Support",
          portaljs: "Full DevOps integration with any CI/CD",
          competitor: "Limited deployment automation"
        },
        {
          feature: "Version Control",
          portaljs: "Git-based workflow",
          competitor: "Platform-based versioning"
        }
      ]
    },
    {
      category: "Cost & Ownership",
      items: [
        {
          feature: "License Model",
          portaljs: "Open source (MIT license)",
          competitor: "Proprietary subscription license"
        },
        {
          feature: "Cost Structure",
          portaljs: "Transparent pricing with no hidden fees",
          competitor: "Complex tiered pricing with per-dataset costs"
        },
        {
          feature: "Data Ownership",
          portaljs: "100% data ownership & control",
          competitor: "Data stored on Socrata infrastructure"
        },
        {
          feature: "Exit Strategy",
          portaljs: "Take your code & deploy anywhere",
          competitor: "Data export possible but platform migration required"
        }
      ]
    },
    {
      category: "Performance & Scale",
      items: [
        {
          feature: "Performance Optimization",
          portaljs: "Full control over performance tuning",
          competitor: "Limited to platform optimizations"
        },
        {
          feature: "Caching Strategy",
          portaljs: "Implement any caching solution",
          competitor: "Built-in caching with limited control"
        },
        {
          feature: "Data Processing",
          portaljs: "Custom ETL pipelines and real-time processing",
          competitor: "Platform-provided data transformation tools"
        },
        {
          feature: "Scalability",
          portaljs: "Scale infrastructure based on your needs",
          competitor: "Platform-managed scaling with usage limits"
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
    <Layout isHomePage={true}>
      {/* SEO */}
      <LogoJsonLd
        url="https://portaljs.com"
        logo="https://portaljs.com/icon.png"
      />
      <NextSeo
        title="PortalJS vs Socrata | Open Source Data Portal Comparison"
        description="Compare PortalJS with Socrata: See how our open source data portal platform delivers more flexibility, control, and cost savings than Socrata's proprietary solution."
        canonical="https://portaljs.com/compare/socrata"
        openGraph={{
          url: 'https://portaljs.com/compare/socrata',
          title: 'PortalJS vs Socrata | Open Source Data Portal Comparison',
          description: 'Compare PortalJS with Socrata: See how our open source data portal platform delivers more flexibility, control, and cost savings than Socrata\'s proprietary solution.',
          images: [
            {
              url: 'https://portaljs.com/static/img/seo.webp',
              width: 1200,
              height: 630,
              alt: 'PortalJS vs Socrata Comparison',
            }
          ],
          siteName: 'PortalJS',
          type: 'website'
        }}
      />
      <WebPageJsonLd
        id="https://portaljs.com/compare/socrata#webpage"
        url="https://portaljs.com/compare/socrata"
        name="PortalJS vs Socrata | Open Source Data Portal Comparison"
        description="Compare PortalJS with Socrata: See how our open source data portal platform delivers more flexibility, control, and cost savings than Socrata's proprietary solution."
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
            name: 'Socrata',
            item: 'https://portaljs.com/compare/socrata',
          }
        ]}
      />

      {/* Hero Section */}
      <div className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]" id="hero">
        <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
          <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
            <div className="relative mb-10 lg:mb-0 text-center">
              <h1 className="inline bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-5xl tracking-tight text-transparent">
                PortalJS vs Socrata
              </h1>
              <p className="mt-4 text-xl tracking-tight text-slate-400">
                Escape Socrata's high costs and limitations with modern, flexible data portal technology.
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
                  className={`h-auto grayscale`}
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
      <div className="w-full bg-slate-50 dark:bg-slate-900">
        <div className="py-24">
          <div className="mx-auto">
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                Organizations choosing PortalJS over Socrata
              </h2>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 text-center max-w-2xl">
                See what government agencies achieved after migrating from Socrata to PortalJS.
              </p>
            </div>
            <div className="mt-12 px-4 sm:px-8 xl:px-12 mx-auto grid max-w-8xl grid-cols-1 gap-8 lg:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex flex-col justify-between bg-white dark:bg-slate-800 p-10 shadow-lg rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 hover:shadow-xl transition-all duration-300">
                <div>
                  <svg className="w-10 h-10 text-blue-400/30 dark:text-blue-300/30 mb-4" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="text-xl italic font-medium text-slate-800 dark:text-slate-200 mb-6 leading-relaxed">
                    {testimonial.quote}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-x-4">
                    <div className="flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white w-12 h-12 flex items-center justify-center font-semibold">
                      {testimonial.author.split(' ').map(word => word[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</div>
                      <div className="text-slate-600 dark:text-slate-400">{testimonial.organization}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="w-full">
        <div className="py-24">
          <div className="mx-auto px-4 sm:px-8 xl:px-12 max-w-8xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                Feature Comparison
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                See how PortalJS compares to Socrata across key categories.
              </p>
            </div>

            <div className="mt-16 space-y-16">
              {comparisonTable.map((category, idx) => (
                <div key={category.category} className={idx % 2 === 0 ? "bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" : "bg-slate-50 dark:bg-slate-800 p-8 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"}>
                  <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                    {category.category}
                  </h3>
                  <div className="overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm">
                    <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-900/60">
                          <th scope="col" className="py-4 pl-8 pr-3 text-left text-base font-semibold text-slate-900 dark:text-white w-1/3">
                            Feature
                          </th>
                          <th scope="col" className="px-4 py-4 text-left text-base font-semibold text-slate-900 dark:text-white w-1/3">
                            PortalJS
                          </th>
                          <th scope="col" className="px-4 py-4 text-left text-base font-semibold text-slate-900 dark:text-white w-1/3">
                            Socrata
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/70">
                        {category.items.map((item) => (
                          <tr key={item.feature} className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors">
                            <td className="py-5 pl-8 pr-3 text-base font-medium text-slate-900 dark:text-white">
                              {item.feature}
                            </td>
                            <td className="px-4 py-5 text-base text-slate-700 dark:text-slate-300">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{item.portaljs}</span>
                              </div>
                            </td>
                            <td className="px-4 py-5 text-base text-slate-700 dark:text-slate-300">
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
      <Schedule calendar={calendarLink} />
    </Layout>
  )
}