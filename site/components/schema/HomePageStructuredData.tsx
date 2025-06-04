import { NextSeo } from "next-seo";

export function HomePageStructuredData() {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PortalJS Cloud",
    "url": "https://portaljs.com",
    "description":
      "PortalJS Cloud is the simplest way to get started with open data. Designed for governments, nonprofits, and academic institutions, it lets you launch a modern, compliant portal in minutes.",
    "publisher": {
      "@type": "Organization",
      "name": "PortalJS Cloud",
      "url": "https://portaljs.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://portaljs.com/icon.png"
      },
      "sameAs": [
        "https://www.linkedin.com/company/datopian/posts/?feedView=all",
        "https://x.com/datopian",
        "https://github.com/datopian",
        "https://www.youtube.com/@datopian1413"
      ]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://portaljs.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <NextSeo
      title="PortalJS Cloud"
      description="PortalJS Cloud is the simplest way to get started with open data. Designed for governments, nonprofits, and academic institutions, it lets you launch a modern, compliant portal in minutes."
      additionalMetaTags={[
        {
          name: 'application/ld+json',
          content: JSON.stringify(jsonLd)
        }
      ]}
    />
  );
}
