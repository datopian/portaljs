import { questions } from "@/pages/faq";
import { NextSeo } from "next-seo";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.flatMap(category =>
      category.items.map(({ question, answer }) => ({
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": markdownToPlainText(answer),
        }
      }))
    )
  };

  return (
    <NextSeo
      title="FAQ"
      description="Frequently Asked Questions about PortalJS Cloud."
      additionalMetaTags={[
        {
          name: 'application/ld+json',
          content: JSON.stringify(jsonLd)
        }
      ]}
    />
  );
}
