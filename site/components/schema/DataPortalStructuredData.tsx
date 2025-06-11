import { BreadcrumbJsonLd, LogoJsonLd, NextSeo, WebPageJsonLd } from "next-seo";
import { dataPortals } from "../Showcases";


export function DataPortalsStructuredData() {

  const dataPortalsListItems = dataPortals.map((portal, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "url": portal.href,
    "item": {
      "@type": "WebSite",
      "name": portal.title,
      "description": portal.description,
      "url": portal.href,
      "image": `https://portaljs.com${portal.image}`
    }
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": "https://portaljs.com/showcase",
    "name": "Showcase of Data Portals",
    "description": "Discover data portals powered by PortalJS.",
    "mainEntity": [
      {
        "@type": "ItemList",
        "name": "Data Portals",
        "itemListElement": dataPortalsListItems,
      }
    ]
  }

  return (
    <>
      <LogoJsonLd
        url="https://portaljs.com"
        logo="https://portaljs.com/icon.png"
      />
      <NextSeo
        title="Showcase of Data Portals"
        description="Discover data portals powered by PortalJS."
        canonical="https://www.portaljs.com/showcase"
        openGraph={
          {
            url: 'https://www.portaljs.com/showcase',
            title: 'Showcase of Data Portals',
            description: 'Discover data portals powered by PortalJS.',
            site_name: 'PortalJS',
            type: 'website',
            images: [
              {
                url: 'https://www.portaljs.com/icon.png',
                alt: 'PortalJS Logo',
              },
            ],
          }
        }
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
            item: 'https://portaljs.com',
          },
          {
            position: 2,
            name: 'Showcase',
            item: 'https://portaljs.com/showcase',
          },
        ]}
      />
      <WebPageJsonLd
        id="https://portaljs.com/showcase#webpage"
        url="https://portaljs.com/showcase"
        title="Showcase of Data Portals"
        description="Discover data portals powered by PortalJS."
        jsonLd={jsonLd}
      />
    </>
  )
}