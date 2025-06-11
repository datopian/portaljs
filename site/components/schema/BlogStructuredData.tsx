import { BreadcrumbJsonLd, LogoJsonLd, NextSeo, WebPageJsonLd } from "next-seo";

export function BlogStructuredData({ blogs }) {
  const blogStructuredData = blogs.map((blog) => ({
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.description || "",
    url: `https://portaljs.com${blog.urlPath}`,
    datePublished: blog.date,
    author: (blog.author?.length ? blog.author : ["PortalJS Team"]).map((name) => ({
      "@type": "Person",
      name,
    })),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "PortalJS Blog",
    url: "https://portaljs.com/blog",
    description:
      "Discover insights, updates and stories about PortalJS. Stay informed and enhance your skills.",
    blogPost: blogStructuredData,
  };

  return (
    <>
      <LogoJsonLd
        url="https://portaljs.com"
        logo="https://portaljs.com/icon.png"
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
            item: 'https://portaljs.com',
          },
          {
            position: 2,
            name: 'Blog',
            item: 'https://portaljs.com/blog',
          },
        ]}
      />
      <WebPageJsonLd
        id="https://portaljs.com/blog#webpage"
        url="https://portaljs.com/blog"
        title="Blog"
        description="Discover insights, updates and stories about PortalJS. Stay informed and enhance your skills."
        canonical="https://portaljs.com/blog"
        {...jsonLd}
      />
    </>
  );
}
