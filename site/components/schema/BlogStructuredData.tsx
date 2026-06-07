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
          title: "Blog",
          description: "Discover insights, updates and stories about PortalJS Cloud. Stay informed about open data solutions and enhance your data portal skills.",
          canonical: "https://www.portaljs.com/blog",
          openGraph: {
          url: 'https://www.portaljs.com/blog',
          title: 'Blog',
          description: 'Discover insights, updates and stories about PortalJS Cloud. Stay informed about open data solutions and enhance your data portal skills.',
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
            name: 'Blog',
            item: 'https://www.portaljs.com/blog',
          },
        ]}
      />
    </>
  );
}
