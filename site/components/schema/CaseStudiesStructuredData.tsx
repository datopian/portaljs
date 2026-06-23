import { BreadcrumbJsonLd, OrganizationJsonLd } from "next-seo";
import { generateNextSeo } from "next-seo/pages";
import Head from "next/head";

export function CaseStudiesStructuredData({ casestudies }) {

  return (
    <>
      <OrganizationJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />
      <Head>
        {generateNextSeo({
          title: "Case Studies | PortalJS — Real Open Data Portal Implementations",
          description: "Discover how governments, research institutions, and enterprises worldwide build powerful open data portals with PortalJS. Real client stories and proven outcomes.",
          canonical: "https://www.portaljs.com/case-studies",
          openGraph: {
            url: 'https://www.portaljs.com/case-studies',
            title: 'Case Studies | PortalJS — Real Open Data Portal Implementations',
            description: 'Discover how governments, research institutions, and enterprises worldwide build powerful open data portals with PortalJS. Real client stories and proven outcomes.',
            site_name: 'PortalJS',
            type: 'website',
            images: [
              {
                url: 'https://www.portaljs.com/static/img/seo.webp',
                alt: 'PortalJS — Open Data Portal Case Studies',
                width: 1280,
                height: 720,
                type: 'image/webp',
              },
            ],
          },
          twitter: {
            cardType: 'summary_large_image',
            site: '@PortalJS_',
          },
        })}
      </Head>
      <BreadcrumbJsonLd
        items={[
          {
            name: 'Home',
            item: 'https://www.portaljs.com',
          },
          {
            name: 'Case Studies',
            item: 'https://www.portaljs.com/case-studies',
          },
        ]}
      />
    </>
  )
}
