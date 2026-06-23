import { BreadcrumbJsonLd, OrganizationJsonLd } from "next-seo";
import { generateNextSeo } from "next-seo/pages";
import Head from "next/head";

export function BlogStructuredData({ blogs }) {

  return (
    <>
      <OrganizationJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />
      <Head>
        {generateNextSeo({
          title: "Blog | PortalJS — Open Data Portal Insights & Updates",
          description: "Discover insights, tutorials, and updates about PortalJS Cloud and open data portals. Stay informed about open data solutions, AI integration, and best practices.",
          canonical: "https://www.portaljs.com/blog",
          openGraph: {
          url: 'https://www.portaljs.com/blog',
          title: 'Blog | PortalJS — Open Data Portal Insights & Updates',
          description: 'Discover insights, tutorials, and updates about PortalJS Cloud and open data portals. Stay informed about open data solutions, AI integration, and best practices.',
          site_name: 'PortalJS',
          type: 'website',
          images: [
            {
              url: 'https://www.portaljs.com/static/img/seo.webp',
              alt: 'PortalJS Blog — Open Data Insights',
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
            name: 'Blog',
            item: 'https://www.portaljs.com/blog',
          },
        ]}
      />
    </>
  );
}
