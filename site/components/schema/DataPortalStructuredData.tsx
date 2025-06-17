import { BreadcrumbJsonLd, LogoJsonLd, NextSeo, WebPageJsonLd } from "next-seo";
import { dataPortals } from "../Showcases";


export function DataPortalsStructuredData() {

  return (
    <>
      <LogoJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
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
                url: 'https://portaljs.com/static/img/seo-image.webp',
                alt: 'PortalJS Cloud',
                width: 1280,
                height: 720,
                type: 'image/webp',
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
            item: 'https://www.portaljs.com',
          },
          {
            position: 2,
            name: 'Showcase',
            item: 'https://www.portaljs.com/showcase',
          },
        ]}
      />
      <WebPageJsonLd
        id="https://www.portaljs.com/showcase#webpage"
        url="https://www.portaljs.com/showcase"
        name="Showcase of Data Portals"
        description="Discover data portals powered by PortalJS."
      />
    </>
  )
}