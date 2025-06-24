import Layout from '@/components/Layout'
import Schedule from '@/components/home/Schedule'
import { LogoJsonLd, NextSeo, WebPageJsonLd, BreadcrumbJsonLd } from 'next-seo'
import ButtonLink from '@/components/ButtonLink'
import Image from 'next/image'
import Link from 'next/link'

export default function PortalJSvsDataverse() {
  // Calendar link for all CTAs
  const calendarLink = "https://calendar.app.google/sn2PU7ZvzjCPo1ok6";

  const testimonials = [
    {
      quote: "Dataverse was great for our research repository needs, but we needed a public-facing data portal with better discovery and visualization. PortalJS gave us the flexibility to create both internal research workflows and public data engagement.",
      author: "Data Services Librarian",
      organization: "Research University",
      image: null
    },
    {
      quote: "While Dataverse handled our dataset preservation well, our stakeholders needed modern data exploration tools. PortalJS allowed us to create interactive dashboards and better user experiences while keeping Dataverse as our preservation layer.",
      author: "Research Data Manager",
      organization: "Government Research Institute",
      image: null
    }
  ]

  const comparisonTable = [
    {
      category: "Purpose & Focus",
      items: [
        {
          feature: "Primary Use Case",
          portaljs: "Open data portal with public engagement and discovery",
          competitor: "Research data repository with preservation focus"
        },
        {
          feature: "Target Audience",
          portaljs: "General public, journalists, analysts, developers",
          competitor: "Researchers, academics, institutional users"
        },
        {
          feature: "Data Presentation",
          portaljs: "Interactive visualizations and data stories",
          competitor: "Dataset metadata and file downloads"
        },
        {
          feature: "Discovery Approach",
          portaljs: "Browse, explore, and engage with data",
          competitor: "Search and cite research datasets"
        }
      ]
    },
    {
      category: "Technology & Architecture",
      items: [
        {
          feature: "Frontend Technology",
          portaljs: "Modern React/Next.js with static generation",
          competitor: "Java-based web application (JSF)"
        },
        {
          feature: "Performance",
          portaljs: "Lightning fast with CDN delivery",
          competitor: "Traditional server-rendered application"
        },
        {
          feature: "Customization",
          portaljs: "Full frontend control with component architecture",
          competitor: "Limited theming and branding options"
        },
        {
          feature: "Integration Flexibility",
          portaljs: "API-first, works with any backend",
          competitor: "Self-contained repository system"
        }
      ]
    },
    {
      category: "User Experience",
      items: [
        {
          feature: "Data Exploration",
          portaljs: "Interactive charts, maps, and data previews",
          competitor: "Basic tabular data display"
        },
        {
          feature: "Search & Filtering",
          portaljs: "Faceted search with real-time filtering",
          competitor: "Academic metadata search"
        },
        {
          feature: "Mobile Experience",
          portaljs: "Optimized for mobile data consumption",
          competitor: "Basic responsive design"
        },
        {
          feature: "Data Download",
          portaljs: "Multiple formats with API access",
          competitor: "File-based downloads with access controls"
        }
      ]
    },
    {
      category: "Content Management",
      items: [
        {
          feature: "Content Strategy",
          portaljs: "Data stories, insights, and contextual content",
          competitor: "Research documentation and metadata"
        },
        {
          feature: "Publishing Workflow",
          portaljs: "Flexible publishing with Git-based or CMS options",
          competitor: "Academic dataset submission process"
        },
        {
          feature: "Metadata Standards",
          portaljs: "Flexible schema supporting various standards",
          competitor: "Research-focused metadata (DDI, Dublin Core)"
        },
        {
          feature: "Version Control",
          portaljs: "Modern Git workflows for content",
          competitor: "Dataset versioning within repository"
        }
      ]
    },
    {
      category: "Operational Considerations",
      items: [
        {
          feature: "Hosting & Deployment",
          portaljs: "Static hosting with global CDN distribution",
          competitor: "Self-hosted Java application server"
        },
        {
          feature: "Maintenance Overhead",
          portaljs: "Minimal - frontend updates independent",
          competitor: "Regular Java application maintenance required"
        },
        {
          feature: "Scaling Requirements",
          portaljs: "Scales automatically via CDN",
          competitor: "Application server scaling needed"
        },
        {
          feature: "Technical Expertise",
          portaljs: "Modern web development skills",
          competitor: "Java enterprise application knowledge"
        }
      ]
    }
  ]

  // Select 5 logos for social proof
  const socialProofLogos = [
    {
      name: 'Sigma2',
      src: '/static/img/social-proof/sigma2-light-transparent.png',
      url: 'https://archive.sigma2.no/',
      width: 180,
    },
    {
      name: 'Marcus Institute',
      src: '/static/img/social-proof/Marcus_Institute_HMS_vertical-grey-transparent.png',
      url: 'https://data.hsl.harvard.edu/',
      width: 200
    },
    {
      name: 'IDPO (University of Sydney)',
      src: '/static/img/social-proof/UNIOFSY.png',
      url: 'https://www.idpo.org.au',
      width: 160
    },
    {
      name: 'FIND DXConnect',
      src: '/static/img/social-proof/dx-connect-find.svg',
      url: 'https://finddx.portaljs.com/',
      width: 180,
    },
    {
      name: 'Transport Data Commons',
      src: '/static/img/social-proof/TDC_logo.svg',
      url: 'https://portal.transport-data.org/',
      width: 240
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
        title="PortalJS vs Dataverse | Open Data Portal vs Research Data Repository"
        description="Compare PortalJS with Dataverse research data repository: See how our open data portal approach delivers better public engagement and user experience for sharing research data."
        canonical="https://portaljs.com/compare/dataverse"
        openGraph={{
          url: 'https://portaljs.com/compare/dataverse',
          title: 'PortalJS vs Dataverse | Open Data Portal vs Research Data Repository',
          description: 'Compare PortalJS with Dataverse research data repository: See how our open data portal approach delivers better public engagement and user experience for sharing research data.',
          images: [
            {
              url: 'https://portaljs.com/static/img/seo.webp',
              width: 1200,
              height: 630,
              alt: 'PortalJS vs Dataverse Comparison',
            }
          ],
          siteName: 'PortalJS',
          type: 'website'
        }}
      />
      <WebPageJsonLd
        id="https://portaljs.com/compare/dataverse#webpage"
        url="https://portaljs.com/compare/dataverse"
        name="PortalJS vs Dataverse | Open Data Portal vs Research Data Repository"
        description="Compare PortalJS with Dataverse research data repository: See how our open data portal approach delivers better public engagement and user experience for sharing research data."
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
            name: 'Dataverse',
            item: 'https://portaljs.com/compare/dataverse',
          }
        ]}
      />

      {/* Hero Section */}
      <div className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]" id="hero">
        <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
          <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
            <div className="relative mb-10 lg:mb-0 text-center">
              <h1 className="inline bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-5xl tracking-tight text-transparent">
                PortalJS vs Dataverse
              </h1>
              <p className="mt-4 text-xl tracking-tight text-slate-400">
                Transform research data into engaging public experiences with modern portal technology.
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
                Research institutions choosing PortalJS
              </h2>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 text-center max-w-2xl">
                See how research organizations enhanced their data sharing with PortalJS public portals.
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
                Platform Comparison
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                See how PortalJS's public engagement focus compares to Dataverse's research data repository approach.
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
                            Dataverse
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