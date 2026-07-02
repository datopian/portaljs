import { OrganizationJsonLd } from 'next-seo';
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Hero from "@/components/Hero";
import Container from "@/components/Container";
import Community from "@/components/home/community";

export default function OSS() {

  return (
    <>
      <Head>
        {generateNextSeo({
          title: "PortalJS Open Source | JavaScript Framework for Data Portals",
          description: "Rapidly build rich open data portals using PortalJS — the modern, headless JavaScript framework. Native support for CKAN, OpenMetadata, and more.",
          canonical: "https://www.portaljs.com/opensource",
          openGraph: {
            url: 'https://www.portaljs.com/opensource',
            title: 'PortalJS Open Source | JavaScript Framework for Data Portals',
            description: 'Rapidly build rich open data portals using PortalJS — the modern, headless JavaScript framework. Native support for CKAN, OpenMetadata, and more.',
            site_name: 'PortalJS',
            type: 'website',
            images: [
              {
                url: 'https://www.portaljs.com/static/img/seo.webp',
                alt: 'PortalJS Open Source',
                width: 1280,
                height: 720,
                type: 'image/webp',
              },
            ],
          },
          twitter: {
            cardType: 'summary_large_image',
            site: '@PortalJS_',
          },
        })}
      </Head>
      <OrganizationJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />
      <Layout>
        <Container>
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-slate-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-slate-200">
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              There&apos;s now an AI-native way to build a PortalJS portal.
            </span>{' '}
            Describe what you want and let your AI assistant scaffold it —{' '}
            <a
              href="/docs"
              className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              read the new docs →
            </a>{' '}
            The classic framework docs below are not going away.
          </div>
        </Container>
        <Hero />
        <Container>
          <Community homePage={false} />
        </Container>
      </Layout>
    </>
  );
}