import Link from 'next/link'
import Hero from '@/components/git/Hero'
import { KeyFeatures } from '@/components/git/KeyFeatures'
import { OrganizationJsonLd, BreadcrumbJsonLd, FAQJsonLd } from 'next-seo';
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Layout from '@/components/Layout'
import { WhyGitAndPortalJS } from '@/components/git/WhyGitAndPortalJS'
import { CommonUseCases } from '@/components/git/CommonUseCases'
import { LiveExamples } from '@/components/git/LiveExamples'
import { GitLFS } from '@/components/git/GitLFS'

export default function Git() {
  const calendarLink = "https://calendar.app.google/sn2PU7ZvzjCPo1ok6";
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
              title: "Git-Backed Data Portals | Version-Controlled Data with PortalJS",
              description: "Build modern data portals using Git as your data source. Leverage GitHub, GitLab, or any Git repository for version-controlled, collaborative data management with PortalJS.",
              canonical: "https://www.portaljs.com/git",
              openGraph: {
              url: 'https://www.portaljs.com/git',
              title: 'Git-Backed Data Portals | Version-Controlled Data with PortalJS',
              description: 'Build modern data portals using Git as your data source. Leverage GitHub, GitLab, or any Git repository for version-controlled, collaborative data management with PortalJS.',
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
                name: 'Git Integration',
                item: 'https://www.portaljs.com/git',
              },
            ]}
          />
          {/* 5. FAQ schema */}
          <FAQJsonLd
            questions={[
              {
                question: 'How does a Git-backed data portal work?',
                answer: 'A Git-backed data portal uses Git repositories as the data source. Datasets are stored in repositories with metadata files, and PortalJS dynamically generates the portal interface by fetching data from Git APIs. This enables version control, collaboration, and distributed data management.',
              },
              {
                question: 'Can I use private Git repositories?',
                answer: 'Yes, PortalJS supports both public and private Git repositories. For private repositories, you can configure authentication tokens to access your data while maintaining security and access controls.',
              },
              {
                question: 'Which Git platforms are supported?',
                answer: 'PortalJS works with GitHub, GitLab, Bitbucket, and any Git hosting platform that provides API access. You can also use self-hosted Git solutions like GitLab Community Edition or Gitea.',
              },
              {
                question: 'How do you handle large data files in Git?',
                answer: 'We use Git LFS (Large File Storage) combined with our open-source Giftless server to store large files in cloud storage (AWS S3, Cloudflare R2, Google Cloud Storage, Azure Blob Storage) while keeping lightweight pointers in Git. This gives you all the benefits of Git version control without file size limitations.',
              },
              {
                question: 'How do I add new datasets to a Git-backed portal?',
                answer: 'Simply add your dataset files and metadata to the configured Git repositories. The portal automatically detects new datasets and updates the catalog. You can use Git workflows like pull requests for dataset review and approval.',
              },
            ]}
          />

          <Hero />
          <WhyGitAndPortalJS />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <KeyFeatures />
        </div>
      </div>
      <GitLFS />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <LiveExamples />
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
            <Link href="/compare" className="text-sm text-blue-600 hover:underline font-medium">Compare portal platforms →</Link>
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
                  href={calendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
                >
                  Schedule a free call
                </a>
                <a
                  href={calendarLink}
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