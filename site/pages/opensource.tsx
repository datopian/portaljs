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
        <Hero />
        <Container>
          <Community homePage={false} />
        </Container>
      </Layout>
    </>
  );
}