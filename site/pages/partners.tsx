import dynamic from 'next/dynamic'
import Layout from '@/components/Layout';
import { OrganizationJsonLd } from 'next-seo';
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import { useTheme } from 'next-themes';

const Player = dynamic(
  () => import('@lottiefiles/react-lottie-player').then((m) => m.Player),
  { ssr: false }
)

const benefits = [
  {
    title: "Collaborative Growth",
    description: "Work side-by-side with our experts to co-deliver projects, combining your local market knowledge with our open data platform.",
    icon: 'connection',
  },
  {
    title: "Flexible Engagement",
    description: "Offer everything from frontend customizations to full enterprise deployments—scale up your services as clients' needs evolve.",
    icon: 'puzzle',
  },
  {
    title: "Dedicated Support",
    description: "Gain access to technical resources, sales enablement materials, and priority support to ensure every partnership succeeds.",
    icon: 'server',
  },
  {
    title: "Marketing & Co-Branding",
    description: "Amplify your reach through joint marketing campaigns, webinars, and events.",
    icon: 'rocket',
  },
];

const steps = [
  {
    number: "1",
    title: "Connect",
    description: "Book a meeting with our partnerships team to explore collaboration opportunities.",
    icon: 'conference',
  },
  {
    number: "2",
    title: "Plan",
    description: "Together, we'll design a joint engagement model tailored to your strengths and your clients' needs.",
    icon: 'document',
  },
  {
    number: "3",
    title: "Deliver",
    description: "Collaborate on implementation—from customizing our default PortalJS template to deploying enterprise-grade, self-hosted or cloud solutions.",
    icon: 'presentation',
  },
  {
    number: "4",
    title: "Grow",
    description: "Celebrate shared success, gather feedback, and expand into new markets.",
    icon: 'line-chart',
  },
];

export default function Partners() {
  const { resolvedTheme } = useTheme();
  const calendarLink = "https://calendar.app.google/sn2PU7ZvzjCPo1ok6";

  return (
    <Layout isHomePage={true}>
      <Head>
        {generateNextSeo({
          title: "PortalJS Partnership Program | Collaborate on Open Data Portals",
          description: "Join the PortalJS Partnership Program to deliver innovative open data solutions across governments, non-profits, academia, and businesses.",
          canonical: "https://www.portaljs.com/partners",
          openGraph: {
            url: 'https://www.portaljs.com/partners',
            title: 'PortalJS Partnership Program | Collaborate on Open Data Portals',
            description: 'Join the PortalJS Partnership Program to deliver innovative open data solutions across governments, non-profits, academia, and businesses.',
            images: [
              {
                url: 'https://www.portaljs.com/static/img/seo.webp',
                width: 1200,
                height: 630,
                alt: 'PortalJS Partnerships',
              }
            ],
            siteName: 'PortalJS',
          },
        })}
      </Head>
      <OrganizationJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />

      {/* Hero */}
      <div className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]" id="hero">
        <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
          <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
            <div className="relative mb-10 lg:mb-0 text-center">
              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Become a PortalJS Partner
              </h1>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Join a network of forward-thinking organizations driving open data innovation
                across governments, non-profits, academia, and businesses.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3.5">
                <a
                  href={calendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Book a Partnership Meeting"
                  className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
                >
                  Book a Partnership Meeting
                </a>
                <a
                  href="/case-studies"
                  title="See Client Success Stories"
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-300 bg-white px-[18px] py-2.5 text-[14.5px] font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-blue-400 hover:text-blue-600"
                >
                  See Client Success Stories
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Partner with PortalJS */}
      <div className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Why Partner with PortalJS
          </h2>
          <p className="mx-auto mt-4 text-center text-[17px] text-slate-600 dark:text-slate-300 max-w-3xl">
            Leverage our platform and expertise to deliver exceptional data portal experiences for your clients
          </p>
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-slate-300 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
              >
                <div className="mb-4 w-12 h-12">
                  <Player
                    src={`/static/icons/${resolvedTheme ?? 'light'}/${benefit.icon}.json`}
                    autoplay
                    loop
                    className="w-12 h-12"
                  />
                </div>
                <h3 className="text-[17.5px] font-semibold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-[14.5px] text-slate-600 dark:text-slate-300">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Get Started in 4 Easy Steps
            </h2>
            <p className="mx-auto mt-4 text-center text-[17px] text-slate-600 dark:text-slate-300 max-w-3xl">
              Our streamlined partnership process is designed to help you start delivering value quickly
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-6xl mx-auto">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-slate-300 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 shrink-0">
                    <Player
                      src={`/static/icons/${resolvedTheme ?? 'light'}/${step.icon}.json`}
                      autoplay
                      loop
                      className="w-12 h-12"
                    />
                  </div>
                  <span className="inline-flex items-center justify-center px-3 py-0.5 text-[11px] font-semibold text-white bg-gradient-to-br from-sky-400 to-blue-600 rounded-full">
                    Step {step.number}
                  </span>
                </div>
                <h3 className="text-[17.5px] font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-[14.5px] text-slate-600 dark:text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                Ready to become a PortalJS partner?
              </h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-[#b9c9e4]">
                Schedule a meeting with our partnerships team to explore opportunities for collaboration and growth.
              </p>
              <div className="mt-[30px] flex flex-wrap justify-center gap-3.5">
                <a
                  href={calendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
                >
                  Schedule a free call
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
