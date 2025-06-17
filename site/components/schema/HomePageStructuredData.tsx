import { BreadcrumbJsonLd, FAQPageJsonLd, LogoJsonLd, NextSeo, WebPageJsonLd } from "next-seo";
import { homeFaqQuestions } from '@/pages/index';

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
      <LogoJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />
      <NextSeo
        title="PortalJS — Modern Open Data Portals & Headless Data Platform"
        description="PortalJS is the simplest way to launch a modern, compliant open data portal. Designed for governments, nonprofits, and academic institutions."
        canonical="https://www.portaljs.com"
        openGraph={{
          url: 'https://www.portaljs.com',
          title: 'PortalJS — Modern Open Data Portals & Headless Data Platform',
          description: 'PortalJS is the simplest way to launch a modern, compliant open data portal. Designed for governments, nonprofits, and academic institutions.',
          site_name: 'PortalJS',
          type: 'website',
          images: [
            {
              url: 'https://portaljs.com/static/img/seo-image.webp',
              alt: 'PortalJS Cloud',
              width: 1280,
              height: 720,
              type: 'image/webp',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
          site: '@PortalJS_',
        }}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: 'Home',
            item: 'https://www.portaljs.com',
          },
        ]}
      />
      <WebPageJsonLd
        id="https://www.portaljs.com#webpage"
        url="https://www.portaljs.com"
        name="PortalJS Cloud"
        description="PortalJS Cloud is the simplest way to get started with open data. Designed for governments, nonprofits, and academic institutions, it lets you launch a modern, compliant portal in minutes."
      />
      <FAQPageJsonLd
        mainEntity={homeFaqQuestions.map(({ question, answer }) => ({
          questionName: question,
          acceptedAnswerText: markdownToPlainText(answer),
        }))}
      />
    </>
  );
}
