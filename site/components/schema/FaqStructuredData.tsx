import { questions } from "@/pages/faq";
import { BreadcrumbJsonLd, FAQPageJsonLd, LogoJsonLd, NextSeo } from "next-seo";

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
      <LogoJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />
      <NextSeo
        title="FAQ"
        description="Frequently Asked Questions about PortalJS Cloud. Get answers about pricing, features, deployment, and more."
        canonical="https://www.portaljs.com/faq"
        openGraph={{
          url: 'https://www.portaljs.com/faq',
          title: 'FAQ',
          description: 'Frequently Asked Questions about PortalJS Cloud. Get answers about pricing, features, deployment, and more.',
          site_name: 'PortalJS',
          type: 'website',
          images: [
            {
              url: 'https://portaljs.com/static/img/seo.webp',
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
          {
            position: 2,
            name: 'FAQ',
            item: 'https://www.portaljs.com/faq',
          },
        ]}
      />
      <FAQPageJsonLd
        mainEntity={questions.flatMap(category =>
          category.items.map(({ question, answer }) => ({
            questionName: question,
            acceptedAnswerText: markdownToPlainText(answer),
          }))
        )}
      />
    </>
  );
}
