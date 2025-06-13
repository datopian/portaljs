import Layout from '@/components/Layout';
import { NextSeo, LogoJsonLd } from 'next-seo';
import ButtonLink from '@/components/ButtonLink';
import { Player } from '@lottiefiles/react-lottie-player';
import { useTheme } from 'next-themes';

export default function Partners() {
  const { theme } = useTheme();
  // Partnership benefits data
  const benefits = [
    {
      title: "Collaborative Growth",
      description: "Work side-by-side with our experts to co-deliver projects, combining your local market knowledge with our open data platform.",
      icon: 'connection',
      iconStyle: 'dark:-rotate-[4deg]',
    },
    {
      title: "Flexible Engagement",
      description: "Offer everything from frontend customizations to full enterprise deployments—scale up your services as clients' needs evolve.",
      icon: 'puzzle',
      iconStyle: 'dark:-rotate-[4deg]',
    },
    {
      title: "Dedicated Support",
      description: "Gain access to technical resources, sales enablement materials, and priority support to ensure every partnership succeeds.",
      icon: 'server',
      iconStyle: 'dark:-rotate-[4deg]',
    },
    {
      title: "Marketing & Co-Branding",
      description: "Amplify your reach through joint marketing campaigns, webinars, and events.",
      icon: 'rocket',
      iconStyle: 'dark:-rotate-[4deg]',
    }
  ];

  // Partnership process steps
  const steps = [
    {
      number: "1",
      title: "Connect",
      description: "Book a meeting with our partnerships team to explore collaboration opportunities.",
      color: "from-blue-400 to-blue-600",
      icon: 'conference',
      iconStyle: 'dark:-rotate-[4deg]',
    },
    {
      number: "2",
      title: "Plan",
      description: "Together, we'll design a joint engagement model tailored to your strengths and your clients' needs.",
      color: "from-indigo-400 to-indigo-600",
      icon: 'document',
      iconStyle: 'dark:-rotate-[4deg]',
    },
    {
      number: "3",
      title: "Deliver",
      description: "Collaborate on implementation—from customizing our default PortalJS template to deploying enterprise-grade, self-hosted or cloud solutions.",
      color: "from-purple-400 to-purple-600",
      icon: 'presentation',
      iconStyle: 'dark:-rotate-[4deg]',
    },
    {
      number: "4",
      title: "Grow",
      description: "Celebrate shared success, gather feedback, and expand into new markets.",
      color: "from-blue-400 to-blue-600",
      icon: 'line-chart',
      iconStyle: 'dark:-rotate-[4deg]',
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

      {/* Hero Section - Styled like CKAN page */}
      <div className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]" id="hero">
        <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
          <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
            <div className="relative mb-10 lg:mb-0 text-center">
              <h1 className="inline bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-5xl tracking-tight text-transparent">
                Become a PortalJS Partner
              </h1>
              <p className="mt-4 text-xl tracking-tight text-slate-400">
                Join a network of forward-thinking organizations driving open data innovation
                across governments, non-profits, academia, and businesses.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <ButtonLink
                  href={calendarLink}
                  title="Book a Partnership Meeting"
                >
                  Book a Partnership Meeting
                </ButtonLink>
                <ButtonLink
                  href="/showcase"
                  style="secondary"
                  title="See Client Success Stories"
                >
                  See Client Success Stories
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Partner with PortalJS Section - Styled like home page's KeyFeatures */}
      <div className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-transparent">
            Why Partner with PortalJS
          </h2>
          <p className="mt-4 text-xl tracking-tight text-slate-400 text-center max-w-3xl mx-auto">
            Leverage our platform and expertise to deliver exceptional data portal experiences for your clients
          </p>
          <div className="mt-16 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-4 lg:gap-x-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="relative flex flex-col rounded-xl dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 p-7 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex-shrink-0 w-full flex items-start -ml-2">
                  <div className="w-14 h-14">
                    <Player src={`/static/icons/${theme}/${benefit.icon}.json`} autoplay loop className={`w-14 h-14 ${benefit.iconStyle}`} />
                  </div>
                </div>
                <div className="pt-4">
                  <h3 className="text-lg font-medium">{benefit.title}</h3>
                  <p className="mt-4 text-base">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section - Styled like home page's LaunchPortal */}
      <div className="bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-transparent">
              Get Started in 4 Easy Steps
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Our streamlined partnership process is designed to help you start delivering value quickly
            </p>
          </div>
          <div className="mt-12 max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center text-white font-bold mr-4`}>
                    <Player src={`/static/icons/${theme}/${step.icon}.json`} autoplay loop className={`w-14 h-14 ${step.iconStyle}`} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {step.title}
                      <div className="flex items-center justify-center w-24 h-6 px-2 text-sm !z-50 mr-auto bg-blue-500 text-white rounded-xl mt-4">
                        Step {step.number}
                      </div>
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-16 flex transform-gpu justify-center overflow-hidden blur-3xl"
          >
            <div
              style={{
                clipPath:
                  'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
              }}
              className="aspect-[1318/752] w-[82.375rem] rotate-270 flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25 !-z-10"
            />
          </div>
        </div>
      </div>

      {/* Our Partners Section */}
      {/* <div className="bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-transparent">
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
      </div> */}

      {/* CTA Section - Styled like Schedule from /ckan page */}
      <div className="!max-w-none ring-1 ring-slate-200 dark:ring-slate-800 py-24 bg-zinc-50 dark:bg-slate-800/75 mt-24 relative overflow-hidden ">
        <div className="relative max-w-8xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-transparent">
              Ready to become a PortalJS partner?
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Schedule a meeting with our partnerships team to explore opportunities for collaboration and growth.
            </p>
          </div>
          <div className="flex justify-center py-8 max-w-lg mx-auto">
            <ButtonLink
              href={calendarLink}
              title="Book a Partnership Meeting"
              className="text-sm"
              target="_blank"
            >
              Schedule a free call
            </ButtonLink>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-16 z-10 flex transform-gpu justify-center overflow-hidden blur-3xl pointer-events-none"
          >
            <div
              style={{
                clipPath:
                  'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
              }}
              className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25 rotate-180"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}