import Layout from '@/components/Layout';
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Link from 'next/link';

const learningTopics = [
  {
    id: 'metadata',
    title: 'Metadata',
    description: 'Master the fundamentals of metadata—what it is, how it works, and why it\'s essential for data discovery. Learn about metadata schemas, standards, and best practices.',
    href: '/learn/metadata',
    status: 'published',
  },
  {
    id: 'data-management-systems',
    title: 'Data Management Systems',
    description: 'Explore data management software components and architectures. Learn about data catalogs, portals, CKAN, and how different systems work together to manage data at scale.',
    href: '/learn/data-management-systems',
    status: 'coming-soon',
  },
  {
    id: 'data-governance',
    title: 'Data Governance',
    description: 'Learn about data governance frameworks, policies, and best practices. Understand data stewardship, compliance requirements, and how to establish governance in your organization.',
    href: '/learn/data-governance',
    status: 'coming-soon',
  },
  {
    id: 'data-quality',
    title: 'Data Quality',
    description: 'Discover techniques for measuring, monitoring, and improving data quality. Learn about validation rules, data profiling, cleansing strategies, and quality metrics.',
    href: '/learn/data-quality',
    status: 'coming-soon',
  },
  {
    id: 'data-integration',
    title: 'Data Integration',
    description: 'Master data integration patterns and technologies. Learn about ETL processes, APIs, real-time data sync, and building robust data pipelines.',
    href: '/learn/data-integration',
    status: 'coming-soon',
  },
  {
    id: 'data-lifecycle',
    title: 'Data Lifecycle',
    description: 'Understand the complete data lifecycle from creation to archival. Learn about data retention policies, versioning, backup strategies, and deletion processes.',
    href: '/learn/data-lifecycle',
    status: 'coming-soon',
  },
];

export default function LearnPage() {
  const title = 'Learn Data Management | PortalJS';
  const description =
    'Master the fundamentals of data management through our comprehensive learning paths. Explore in-depth guides on metadata, governance, data quality, and more.';
  const canonical = 'https://www.portaljs.com/learn';

  return (
    <Layout isHomePage={true}>
      <Head>
        {generateNextSeo({
          title,
          description,
          canonical,
          openGraph: {
            url: canonical,
            title,
            description,
            images: [
              {
                url: 'https://www.portaljs.com/static/img/seo.webp',
                width: 1200,
                height: 630,
                alt: 'PortalJS Learn',
              },
            ],
            siteName: 'PortalJS',
            type: 'website',
          },
        })}
      </Head>

      {/* Hero Section */}
      <div
        className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]"
        id="hero"
      >
        <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
          <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
            <div className="relative mb-10 lg:mb-0 text-center">
              <h1 className="inline bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-5xl font-bold leading-[1.08] tracking-tight text-transparent">
                Learn Data Management
              </h1>
              <p className="mt-4 text-xl tracking-tight text-slate-600 dark:text-slate-400">
                Comprehensive learning paths on data management, governance, quality, and more. Choose a topic to get started.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Cards Section */}
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 pt-8 pb-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {learningTopics.map((topic) =>
                topic.status === 'published' ? (
                  <Link
                    key={topic.id}
                    href={topic.href}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-slate-300 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 cursor-pointer"
                  >
                    <h3 className="mb-[7px] text-[17.5px] font-semibold text-slate-900 dark:text-white">
                      {topic.title}
                    </h3>
                    <p className="flex-1 text-[14.5px] text-slate-600 dark:text-slate-300">
                      {topic.description}
                    </p>
                    <span className="mt-5 text-[13px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                      Start learning →
                    </span>
                  </Link>
                ) : (
                  <div
                    key={topic.id}
                    className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 opacity-60 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <span className="absolute top-4 right-4 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5">
                      Coming Soon
                    </span>
                    <h3 className="mb-[7px] text-[17.5px] font-semibold text-slate-900 dark:text-white">
                      {topic.title}
                    </h3>
                    <p className="text-[14.5px] text-slate-600 dark:text-slate-300">
                      {topic.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Note */}
      <div className="flex justify-center pb-24">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
              More Learning Resources Coming Soon
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              We're continuously expanding our learning resources. Stay tuned for more guides on advanced data management, API integration, and best practices.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
