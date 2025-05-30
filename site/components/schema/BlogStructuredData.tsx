import { NextSeo } from "next-seo";

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
    "@type": "Blog",
    name: "PortalJS Blog",
    url: "https://portaljs.com/blog",
    description:
      "Explore the latest updates, tutorials, and insights about PortalJS. Stay informed and enhance your skills.",
    blogPost: blogStructuredData,
  };

  return (
    <NextSeo
      title="Blog"
      description="Explore the latest updates, tutorials, and insights about PortalJS. Stay informed and enhance your skills."
      additionalMetaTags={[
        {
          name: 'application/ld+json',
          content: JSON.stringify(jsonLd)
        }
      ]}
    />
  );
}
