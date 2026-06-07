import Hero from '@/components/git/Hero'
import { KeyFeatures } from '@/components/git/KeyFeatures'
import Schedule from '@/components/home/Schedule'
import { OrganizationJsonLd, BreadcrumbJsonLd, FAQJsonLd } from 'next-seo';
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Layout from '@/components/Layout'
import { WhyGitAndPortalJS } from '@/components/git/WhyGitAndPortalJS'
import { CommonUseCases } from '@/components/git/CommonUseCases'
import { LiveExamples } from '@/components/git/LiveExamples'
import { GitLFS } from '@/components/git/GitLFS'

export default function Git() {
  return (
    <Layout isHomePage={true}>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          {/* 1. Your logo structured data */}
          <OrganizationJsonLd
            url="https://portaljs.com"
            logo="https://portaljs.com/icon.png"
          />
          {/* 2. Base SEO tags */}
          <Head>
            {generateNextSeo({
              title: "Git-Backed Data Portals | Version-Controlled Data with PortalJS",
              description: "Build modern data portals using Git as your data source. Leverage GitHub, GitLab, or any Git repository for version-controlled, collaborative data management with PortalJS.",
              canonical: "https://portaljs.com/git",
              openGraph: {
              url: 'https://portaljs.com/git',
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
                item: 'https://portaljs.com/git',
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
      <Schedule />
    </Layout>
  )
}