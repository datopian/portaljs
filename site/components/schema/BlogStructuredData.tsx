import { BreadcrumbJsonLd, LogoJsonLd, NextSeo, WebPageJsonLd } from "next-seo";

export function BlogStructuredData({ blogs }) {
  const blogStructuredData = blogs.map((blog, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "url": `https://www.portaljs.com${blog.urlPath}`,
    "item": {
      "@type": "BlogPosting",
      "name": blog.title.replace('/', '-'),
      "description": blog.description || "",
      "author": blog.authors?.map(a => a.name) || "PortalJS Cloud",
    }
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "mainEntity": [
      {
        "@type": "ItemList",
        "name": "PortalJS Blog",
        "itemListElement": blogStructuredData,
      }
    ]
  }

  return (
    <>
      <LogoJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />
      <NextSeo
        title="Blog"
        description="Discover insights, updates and stories about PortalJS. Stay informed and enhance your skills."
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
        description="Discover insights, updates and stories about PortalJS. Stay informed and enhance your skills."
        {...jsonLd}
      />
    </>
  );
}
