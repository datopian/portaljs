import { BreadcrumbJsonLd, LogoJsonLd, NextSeo, WebPageJsonLd } from "next-seo";

export function CaseStudiesStructuredData({ casestudies }) {
  const caseStudiesListItems = casestudies?.map((study, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "url": `https://portaljs.com${study.urlPath}`,
    "item": {
      "@type": "CreativeWork",
      "name": study.title.replace('/', '-'),
      "image": `https://portaljs.com${study.image}`,
      "description": study.description
    }
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": "https://portaljs.com/showcase",
    "name": "Showcase of Case Studies",
    "description": "See our client stories.",
    "mainEntity": [
      {
        "@type": "ItemList",
        "name": "Case Studies",
        "itemListElement": caseStudiesListItems,
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
        title="Showcase of Case Studies"
        description="See our client stories."
        canonical="https://www.portaljs.com/showcase"
        openGraph={
          {
            url: 'https://www.portaljs.com/showcase',
            title: 'Showcase of Case Studies',
            description: 'See our client stories.',
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
        title="Showcase of Case Studies"
        description="See our client stories."
        {...jsonLd}
      />
    </>
  )
}