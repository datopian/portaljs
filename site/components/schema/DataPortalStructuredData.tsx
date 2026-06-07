import { BreadcrumbJsonLd, OrganizationJsonLd } from "next-seo";
import { generateNextSeo } from "next-seo/pages";
import Head from "next/head";
import { dataPortals } from "../Showcases";


export function DataPortalsStructuredData() {

  return (
    <>
      <OrganizationJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />
      <Head>
        {generateNextSeo({
          title: "Showcase of Data Portals",
          description: "Discover data portals powered by PortalJS.",
          canonical: "https://www.portaljs.com/showcase",
          openGraph: {
            url: 'https://www.portaljs.com/showcase',
            title: 'Showcase of Data Portals',
            description: 'Discover data portals powered by PortalJS.',
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
            name: 'Showcase',
            item: 'https://www.portaljs.com/showcase',
          },
        ]}
      />
    </>
  )
}