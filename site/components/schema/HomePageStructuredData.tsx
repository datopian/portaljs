import { BreadcrumbJsonLd, LogoJsonLd, NextSeo, WebPageJsonLd } from "next-seo";

export function HomePageStructuredData() {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://www.portaljs.com",
    "publisher": {
      "@type": "Organization",
      "name": "PortalJS Cloud",
      "url": "https://www.portaljs.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.portaljs.com/icon.png"
      },
      "sameAs": [
        "https://www.linkedin.com/company/datopian/posts/?feedView=all",
        "https://x.com/datopian",
        "https://github.com/datopian",
        "https://www.youtube.com/@datopian1413"
      ]
    },
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
              url: 'https://www.portaljs.com/icon.png',
              alt: 'PortalJS Logo',
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
        {...jsonLd}
      />
    </>
  );
}
