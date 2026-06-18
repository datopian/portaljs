import { BreadcrumbJsonLd, FAQJsonLd, OrganizationJsonLd } from "next-seo";
import { generateNextSeo } from "next-seo/pages";
import Head from "next/head";
import { homeFaqQuestions } from '@/lib/homeFaqQuestions';

export function HomePageStructuredData() {
  function markdownToPlainText(md: string) {
    return md
      .replace(/\*\*(.*?)\*\*/g, '$1')        // bold **text**
      .replace(/\*(.*?)\*/g, '$1')            // italic *text*
      .replace(/!\[.*?\]\(.*?\)/g, '')        // images ![alt](url)
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')     // links [text](url)
      .replace(/^\s*[-*+]\s+/gm, '')           // list markers (-, *, +)
      .replace(/\n+/g, ' ')                    // new lines to space
      .trim();
  }
  return (
    <>
      <OrganizationJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />
      <Head>
        {generateNextSeo({
          title: "PortalJS — Modern Open Data Portals & Headless Data Platform",
          description: "PortalJS is the simplest way to launch a modern, compliant open data portal. Designed for governments, nonprofits, and academic institutions.",
          canonical: "https://www.portaljs.com",
          openGraph: {
          url: 'https://www.portaljs.com',
          title: 'PortalJS — Modern Open Data Portals & Headless Data Platform',
          description: 'PortalJS is the simplest way to launch a modern, compliant open data portal. Designed for governments, nonprofits, and academic institutions.',
          site_name: 'PortalJS',
          type: 'website',
          images: [
            {
              url: 'https://www.portaljs.com/static/img/seo.webp',
              alt: 'PortalJS — Modern Open Data Portals',
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
      <BreadcrumbJsonLd
        items={[
          {
            name: 'Home',
            item: 'https://www.portaljs.com',
          },
        ]}
      />
      <FAQJsonLd
        questions={homeFaqQuestions.map(({ question, answer }) => ({
          question,
          answer: markdownToPlainText(answer),
        }))}
      />
    </>
  );
}
