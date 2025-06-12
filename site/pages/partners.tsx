import Layout from '@/components/Layout';
import { NextSeo, LogoJsonLd } from 'next-seo';
import ButtonLink from '@/components/ButtonLink';
import Image from 'next/image';
import Link from 'next/link';

export default function Partners() {
  // Partnership benefits data
  const benefits = [
    {
      title: "Collaborative Growth",
      description: "Work side-by-side with our experts to co-deliver projects, combining your local market knowledge with our open data platform.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Flexible Engagement",
      description: "Offer everything from frontend customizations to full enterprise deployments—scale up your services as clients' needs evolve.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      title: "Dedicated Support",
      description: "Gain access to technical resources, sales enablement materials, and priority support to ensure every partnership succeeds.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: "Marketing & Co-Branding",
      description: "Amplify your reach through joint marketing campaigns, webinars, and events.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      )
    }
  ];

  // Partnership process steps
  const steps = [
    {
      number: "01",
      title: "Connect",
      description: "Book a meeting with our partnerships team to explore collaboration opportunities.",
      color: "from-blue-400 to-blue-600"
    },
    {
      number: "02",
      title: "Plan",
      description: "Together, we'll design a joint engagement model tailored to your strengths and your clients' needs.",
      color: "from-indigo-400 to-indigo-600"
    },
    {
      number: "03",
      title: "Deliver",
      description: "Collaborate on implementation—from customizing our default PortalJS template to deploying enterprise-grade, self-hosted or cloud solutions.",
      color: "from-purple-400 to-purple-600"
    },
    {
      number: "04",
      title: "Grow",
      description: "Celebrate shared success, gather feedback, and expand into new markets.",
      color: "from-blue-400 to-blue-600"
    }
  ];

  // Partner data
  const partners = [
    {
      name: "Multi",
      region: "France, Belgium & Europe",
      description: "Our primary partners in Paris helping our customers in France, Belgium and other European countries.",
      logoPlaceholder: "M"
    },
    {
      name: "Liip",
      region: "Switzerland & Germany",
      description: "Our main partners in Switzerland and Germany.",
      logoPlaceholder: "L"
    },
    {
      name: "XYZ",
      region: "USA & Canada",
      description: "Our main partners in the USA and Canada region.",
      logoPlaceholder: "X"
    }
  ];

  const calendarLink = "https://calendar.app.google/sn2PU7ZvzjCPo1ok6";

  return (
    <Layout isHomePage={true}>
      <NextSeo
        title="PortalJS Partnership Program | Collaborate on Open Data Portals"
        description="Join the PortalJS Partnership Program to deliver innovative open data solutions across governments, non-profits, academia, and businesses."
        canonical="https://portaljs.com/partners"
        openGraph={{
          url: 'https://portaljs.com/partners',
          title: 'PortalJS Partnership Program | Collaborate on Open Data Portals',
          description: 'Join the PortalJS Partnership Program to deliver innovative open data solutions across governments, non-profits, academia, and businesses.',
          images: [
            {
              url: 'https://portaljs.com/static/img/seo.webp',
              width: 1200,
              height: 630,
              alt: 'PortalJS Partnerships',
            }
          ],
          siteName: 'PortalJS',
        }}
      />
      <LogoJsonLd
        url="https://portaljs.com"
        logo="https://portaljs.com/icon.png"
      />

      {/* Hero Section */}
      <div className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]">
        <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
          <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 lg:max-w-8xl lg:grid-cols-2 lg:px-8 xl:gap-x-16 xl:px-12">
            <div className="relative z-10 md:text-center lg:text-left">
              <div className="relative">
                <h1 className="inline font-extrabold text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Become a PortalJS Partner
                </h1>
                <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
                  Join a network of forward-thinking organizations driving open data
                  innovation across governments, non-profits, academia, and
                  businesses. As a PortalJS partner, you'll collaborate with our team
                  to deliver seamless, user-friendly data portals—and grow your
                  services offering.
                </p>
                <div className="mt-8 flex gap-4 md:justify-center lg:justify-start">
                  <ButtonLink
                    href={calendarLink}
                    className="px-5 py-3"
                  >
                    Book a Partnership Meeting
                  </ButtonLink>
                  <ButtonLink
                    href="/showcase"
                    style="secondary"
                    className="px-5 py-3"
                  >
                    See Client Success Stories
                  </ButtonLink>
                </div>
              </div>
            </div>
            <div className="relative lg:static xl:pl-10">
              <div className="relative">
                <div className="aspect-[596/429] w-full bg-gradient-to-tr from-blue-600 to-blue-400 opacity-20 absolute -inset-1 rounded-2xl blur-2xl" />
                <div className="relative bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg shadow-xl">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Expand Your Service Offering</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 dark:text-slate-300">Co-deliver data portal projects</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 dark:text-slate-300">Access technical training & resources</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 dark:text-slate-300">Generate recurring revenue streams</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 dark:text-slate-300">Earn partner-exclusive offers</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Partner with PortalJS Section */}
      <div className="bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-clip-text text-transparent">
              Why Partner with PortalJS
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Leverage our platform and expertise to deliver exceptional data portal experiences for your clients
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300 hover:shadow-lg">
                <div className="p-2 mb-4 rounded-full bg-blue-50 dark:bg-blue-900/30 inline-block">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Our streamlined partnership process is designed to help you start delivering value quickly
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 opacity-25 rounded-lg blur-sm group-hover:opacity-100 transition duration-200"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300 group-hover:shadow-lg">
                  <div className={`w-12 h-12 mb-4 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold`}>
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Partners Section */}
      <div className="bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-clip-text text-transparent">
              Our Current Partners
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Join our global network of trusted implementation partners
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {partners.map((partner, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300 hover:shadow-lg flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-6">
                  {partner.logoPlaceholder}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">{partner.name}</h3>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">{partner.region}</div>
                <p className="text-slate-600 dark:text-slate-400">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-16 md:p-16 text-center md:text-left md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to become a PortalJS partner?
                </h2>
                <p className="mt-4 text-lg text-blue-100 max-w-3xl">
                  Schedule a meeting with our partnerships team to explore opportunities for collaboration and growth.
                </p>
              </div>
              <div className="mt-8 md:mt-0 md:ml-8 md:flex-shrink-0">
                <ButtonLink
                  href={calendarLink}
                  className="px-6 py-4 rounded-lg bg-white text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500"
                >
                  Let's Talk
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}