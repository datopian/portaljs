import Hero from '@/components/git/Hero'
import { KeyFeatures } from '@/components/git/KeyFeatures'
import Schedule from '@/components/home/Schedule'
import { LogoJsonLd, NextSeo, WebPageJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from 'next-seo'
import Layout from '@/components/Layout'
import { WhyGitAndPortalJS } from '@/components/git/WhyGitAndPortalJS'
import { CommonUseCases } from '@/components/git/CommonUseCases'
import { LiveExamples } from '@/components/git/LiveExamples'

export default function Git() {
  return (
    <Layout isHomePage={true}>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          {/* 1. Your logo structured data */}
          <LogoJsonLd
            url="https://portaljs.com"
            logo="https://portaljs.com/icon.png"
          />
          {/* 2. Base SEO tags */}
          <NextSeo
            title="Git-Backed Data Portals | Version-Controlled Data with PortalJS"
            description="Build modern data portals using Git as your data source. Leverage GitHub, GitLab, or any Git repository for version-controlled, collaborative data management with PortalJS."
            canonical="https://portaljs.com/git"
            openGraph={{
              url: 'https://portaljs.com/git',
              title: 'Git-Backed Data Portals | Version-Controlled Data with PortalJS',
              description: 'Build modern data portals using Git as your data source. Leverage GitHub, GitLab, or any Git repository for version-controlled, collaborative data management with PortalJS.',
              site_name: 'PortalJS',
            }}
          />
          {/* 3. WebPage schema */}
          <WebPageJsonLd
            id="https://portaljs.com/git#webpage"
            url="https://portaljs.com/git"
            title="Git-Backed Data Portals | Version-Controlled Data with PortalJS"
            description="Build modern data portals using Git as your data source. Leverage GitHub, GitLab, or any Git repository for version-controlled, collaborative data management with PortalJS."
          />
          {/* 4. Breadcrumb schema */}
          <BreadcrumbJsonLd
            itemListElements={[
              {
                position: 1,
                name: 'Home',
                item: 'https://portaljs.com',
              },
              {
                position: 2,
                name: 'Git Integration',
                item: 'https://portaljs.com/git',
              },
            ]}
          />
          {/* 5. FAQ schema */}
          <FAQPageJsonLd
            mainEntity={[
              {
                questionName: 'How does a Git-backed data portal work?',
                acceptedAnswerText: 'A Git-backed data portal uses Git repositories as the data source. Datasets are stored in repositories with metadata files, and PortalJS dynamically generates the portal interface by fetching data from Git APIs. This enables version control, collaboration, and distributed data management.',
              },
              {
                questionName: 'Can I use private Git repositories?',
                acceptedAnswerText: 'Yes, PortalJS supports both public and private Git repositories. For private repositories, you can configure authentication tokens to access your data while maintaining security and access controls.',
              },
              {
                questionName: 'Which Git platforms are supported?',
                acceptedAnswerText: 'PortalJS works with GitHub, GitLab, Bitbucket, and any Git hosting platform that provides API access. You can also use self-hosted Git solutions like GitLab Community Edition or Gitea.',
              },
              {
                questionName: 'How do I add new datasets to a Git-backed portal?',
                acceptedAnswerText: 'Simply add your dataset files and metadata to the configured Git repositories. The portal automatically detects new datasets and updates the catalog. You can use Git workflows like pull requests for dataset review and approval.',
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