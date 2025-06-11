import { questions } from "@/pages/faq";
import { BreadcrumbJsonLd, LogoJsonLd, NextSeo, QAPageJsonLd } from "next-seo";

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
        url="https://portaljs.com"
        logo="https://portaljs.com/icon.png"
      />
      <NextSeo
        title="FAQ"
        description="Frequently Asked Questions about PortalJS Cloud."
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: 'Home',
            item: 'https://portaljs.com',
          },
          {
            position: 2,
            name: 'FAQ',
            item: 'https://portaljs.com/faq',
          },
        ]}
      />
      <QAPageJsonLd
        title="FAQ"
        description="Frequently Asked Questions about PortalJS Cloud."
        mainEntity={questions.flatMap(category =>
          category.items.map(({ question, answer }) => ({
            "@type": "Question",
            "name": question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": markdownToPlainText(answer),
            }
          }))
        )}
        type="FAQPage"
        context="https://schema.org"
      />
    </>
  );
}
