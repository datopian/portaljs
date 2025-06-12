import { ArticleJsonLd } from "next-seo";
import { useRouter } from "next/router";

export default function JSONLD({
  meta,
  source,
}: {
  meta: any;
  source: string;
}): JSX.Element {
  if (!source) {
    return <></>;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.portaljs.com";
  const pageUrl = `${baseUrl}/${meta.urlPath}`;

  const imageMatches = source.match(
    /(?<=src: ")(.*)\.((png)|(jpg)|(jpeg))(?=")/g
  );
  let images = [];
  if (imageMatches) {
    images = [...imageMatches];
    images = images.map((img) =>
      img.startsWith("http")
        ? img
        : `${baseUrl}${img.startsWith("/") ? "" : "/"}${img}`
    );
  }

  let Component: JSX.Element;

  const isBlog: boolean =
    /^blog\/.*/.test(meta.urlPath) || meta.filetype === "blog" || meta.layout === "blog";
  const isDoc: boolean = /^((docs)|(howtos\/)|(guide\/)).*/.test(meta.urlPath) || meta.layout === "docs";
  const isCaseStudy: boolean =
    /^casestudies\/.*/.test(meta.urlPath) || meta.filetype === "casestudy" || meta.layout === "casestudy";

  if (isBlog) {
    Component = (
      <ArticleJsonLd
        title={meta.metatitle || meta.title}
        description={meta.metadescription || meta.description}
        type="BlogPosting"
        url={pageUrl}
        datePublished={meta.date}
        authorName={meta.authors?.map(a => a.name) || "PortalJS Cloud"}
        images={images}
      />
    );
  } else if (isDoc) {
    Component = (
      <ArticleJsonLd
        url={pageUrl}
        title={meta.title}
        images={images}
        datePublished={meta.date}
        dateModified={meta.date}
        authorName={meta.authors?.map(a => a.name) || "PortalJS Cloud"}
        description={meta.description}
      />
    );
  }
  else if (isCaseStudy) {
    Component = (
      <ArticleJsonLd
        title={meta.metatitle || meta.title}
        description={meta.metadescription || meta.description}
        url={pageUrl}
        datePublished={meta.date}
        authorName={meta.authors?.map(a => a.name) || "PortalJS Cloud"}
        images={meta.images}
        type="Article"
      />
    )
  }

  return Component;
}
