import { BreadcrumbJsonLd, LogoJsonLd, NextSeo, WebPageJsonLd } from "next-seo";

export function BlogStructuredData({ blogs }) {

  return (
    <>
      <LogoJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />
      <NextSeo
        title="Blog"
        description="Discover insights, updates and stories about PortalJS Cloud. Stay informed about open data solutions and enhance your data portal skills."
        canonical="https://www.portaljs.com/blog"
        openGraph={{
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
          {
            position: 2,
            name: 'Blog',
            item: 'https://www.portaljs.com/blog',
          },
        ]}
      />
      <WebPageJsonLd
        id="https://www.portaljs.com/blog#webpage"
        url="https://www.portaljs.com/blog"
        name="Blog"
        description="Discover insights, updates and stories about PortalJS Cloud. Stay informed about open data solutions and enhance your data portal skills."
      />
    </>
  );
}
