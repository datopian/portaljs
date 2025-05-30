import Head from "next/head";

export function HomePageStructuredData() {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          })
        }}
      />
    </Head>
  );
}
