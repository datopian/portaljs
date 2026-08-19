import { questions } from "@/pages/faq";
import { BreadcrumbJsonLd, FAQJsonLd, OrganizationJsonLd } from "next-seo";
import { generateNextSeo } from "next-seo/pages";
import Head from "next/head";

export function FaqStructuredData() {
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
          title: "FAQ | PortalJS Cloud — Pricing, Features & Deployment",
          description: "Frequently Asked Questions about PortalJS Cloud. Get answers about pricing, features, deployment, migration, security, and more.",
          canonical: "https://www.portaljs.com/faq",
          openGraph: {
          url: 'https://www.portaljs.com/faq',
          title: 'FAQ | PortalJS Cloud — Pricing, Features & Deployment',
          description: 'Frequently Asked Questions about PortalJS Cloud. Get answers about pricing, features, deployment, migration, security, and more.',
          site_name: 'PortalJS',
          type: 'website',
          images: [
            {
              url: 'https://www.portaljs.com/static/img/seo.webp',
              alt: 'PortalJS Cloud FAQ',
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
          {
            name: 'FAQ',
            item: 'https://www.portaljs.com/faq',
          },
        ]}
      />
      <FAQJsonLd
        questions={questions.flatMap(category =>
          category.items.map(({ question, answer }) => ({
            question,
            answer: markdownToPlainText(answer),
          }))
        )}
      />
    </>
  );
}
