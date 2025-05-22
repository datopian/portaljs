import { NextSeo } from "next-seo";
import Head from "next/head";

import siteConfig from "../config/siteConfig";
import { CustomLink } from "./Link";
import { Pre } from "./Pre";
import { BlogsList } from "./BlogsList";

const components = {
  Head,
  a: CustomLink,
  /* eslint no-unused-vars: off */
  // TODO this is a temporary workaround for errors resulting from importing this component directly in mdx file
  // see this issue for ref: https://github.com/kentcdodds/mdx-bundler/issues/156
  BlogsList,
  pre: Pre,
  wrapper: ({ layout, ...rest }) => {
    const Layout = require(`../layouts/${layout}`).default;
    return <Layout {...rest} />;
  },
};

export function MdxPage({ mdxComponent, frontMatter, ...rest }) {
  const Component = mdxComponent;

  // Handle SEO Image urls in frontmatter
  const websiteUrl = siteConfig.authorUrl.replace(/\/+$/, "");
  const frontMatterImage =
    typeof frontMatter?.image === "string" && frontMatter.image;
  const seoImageUrl =
    frontMatterImage && frontMatterImage.startsWith("http")
      ? frontMatterImage
      : websiteUrl + frontMatterImage;

  return (
    <>
      <NextSeo
        title={frontMatter.title}
        openGraph={{
          title: frontMatter.title,
          description: frontMatter.description || siteConfig.description,
          images: frontMatter.image
            ? [
                {
                  url: seoImageUrl,
                  width: 1200,
                  height: 627,
                  alt: frontMatter.title,
                },
              ]
            : siteConfig?.nextSeo?.openGraph?.images || [],
        }}
      />
      <Component
        layout={frontMatter.layout}
        components={components}
        frontMatter={frontMatter}
        {...rest}
      />
    </>
  );
}
