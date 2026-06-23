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
          title: "Data Portals Showcase | PortalJS — Live Open Data Implementations",
          description: "Explore live open data portals built with PortalJS. Government, research, and enterprise implementations from organisations worldwide.",
          canonical: "https://www.portaljs.com/data-portals",
          openGraph: {
            url: 'https://www.portaljs.com/data-portals',
            title: 'Data Portals Showcase | PortalJS — Live Open Data Implementations',
            description: 'Explore live open data portals built with PortalJS. Government, research, and enterprise implementations from organisations worldwide.',
            site_name: 'PortalJS',
            type: 'website',
            images: [
              {
                url: 'https://www.portaljs.com/static/img/seo.webp',
                alt: 'PortalJS — Live Data Portal Examples',
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
            name: 'Data Portals',
            item: 'https://www.portaljs.com/data-portals',
          },
        ]}
      />
    </>
  )
}
