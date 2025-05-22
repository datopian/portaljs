import { ArticleJsonLd } from 'next-seo';
import { useRouter } from 'next/router';

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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://portaljs.com';
  const pageUrl = `${baseUrl}/${meta.urlPath}`;

  const imageMatches = source.match(
    /(?<=src: ")(.*)\.((png)|(jpg)|(jpeg))(?=")/g
  );
  let images = [];
  if (imageMatches) {
    images = [...imageMatches];
    images = images.map((img) =>
      img.startsWith('http')
        ? img
        : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`
    );
  }

  let Component: JSX.Element;

  const isBlog: boolean =
    /^blog\/.*/.test(meta.urlPath) || meta.filetype === 'blog';
  const isDoc: boolean = /^((docs)|(howtos\/)|(guide\/)).*/.test(meta.urlPath);

  if (isBlog) {
    Component = (
      <ArticleJsonLd
        type="BlogPosting"
        url={pageUrl}
        title={meta.title}
        datePublished={meta.date}
        dateModified={meta.date}
        authorName={meta.authors.length ? meta.authors[0].name : 'PortalJS'}
        description={meta.description}
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
        authorName={meta.authors.length ? meta.authors[0].name : 'PortalJS'}
        description={meta.description}
      />
    );
  }

  return Component;
}
