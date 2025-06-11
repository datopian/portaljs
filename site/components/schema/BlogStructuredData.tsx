import { BreadcrumbJsonLd, LogoJsonLd, NextSeo, WebPageJsonLd } from "next-seo";

export function BlogStructuredData({ blogs }) {
  const blogStructuredData = blogs.map((blog) => ({
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.description || "",
    url: `https://www.portaljs.com${blog.urlPath}`,
    datePublished: blog.date,
    author: (Array.isArray(blog.author) ? blog.author : [blog.author ?? "PortalJS Team"]).map((name) => ({
      "@type": "Person",
      name,
    })),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "PortalJS Blog",
    url: "https://www.portaljs.com/blog",
    description:
      "Discover insights, updates and stories about PortalJS. Stay informed and enhance your skills.",
    blogPost: blogStructuredData,
  };

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
        title="Blog"
        description="Discover insights, updates and stories about PortalJS. Stay informed and enhance your skills."
        canonical="https://www.portaljs.com/blog"
        {...jsonLd}
      />
    </>
  );
}
