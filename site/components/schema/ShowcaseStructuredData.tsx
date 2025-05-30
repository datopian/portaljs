import { NextSeo } from "next-seo";
import { dataPortals } from "../Showcases";


export function ShowcaseStructuredData({ casestudies }) {
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
    "description": "See our client stories and discover data portals powered by PortalJS.",
    "mainEntity": [
      {
        "@type": "ItemList",
        "name": "Case Studies",
        "itemListElement": caseStudiesListItems,
      },
      {
        "@type": "ItemList",
        "name": "Data Portals",
        "itemListElement": dataPortalsListItems,
      }
    ]
  }

  return (
    <NextSeo
      title="Showcase of Data Portals"
      description="Discover how PortalJS is used in real-world projects. Explore case studies and examples to see PortalJS in action."
      additionalMetaTags={[
        {
          name: 'application/ld+json',
          content: JSON.stringify(jsonLd)
        }
      ]}
    />
  )
}