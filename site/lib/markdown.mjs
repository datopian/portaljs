import { h } from "hastscript";
import matter from "gray-matter";
import mdxmermaid from "mdx-mermaid";
import remarkCallouts from "@portaljs/remark-callouts";
import remarkEmbed from "@portaljs/remark-embed";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import remarkToc from "remark-toc";
import remarkWikiLink from "@flowershow/remark-wiki-link";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypePrismPlus from "rehype-prism-plus";
import { serialize } from "next-mdx-remote/serialize";

import * as tw from "../tailwind.config";
import siteConfig from "../config/siteConfig";

// @portaljs/remark-callouts uses svg-parser which emits SVG attribute names as
// kebab-case strings (e.g. "stroke-width"). React rejects these as invalid DOM
// properties and throws a hydration mismatch. We post-process the compiled MDX
// source string after serialize() to replace them with camelCase equivalents.
const SVG_PROP_MAP = {
  '"stroke-width":':      "strokeWidth:",
  '"stroke-linecap":':    "strokeLinecap:",
  '"stroke-linejoin":':   "strokeLinejoin:",
  '"shape-rendering":':   "shapeRendering:",
  '"text-rendering":':    "textRendering:",
  '"image-rendering":':   "imageRendering:",
  '"fill-rule":':         "fillRule:",
  '"clip-rule":':         "clipRule:",
  '"fill-opacity":':      "fillOpacity:",
  '"stroke-opacity":':    "strokeOpacity:",
  '"stroke-dasharray":':  "strokeDasharray:",
  '"stroke-dashoffset":': "strokeDashoffset:",
};

const parse = async function (source, format, scope) {
  const { content, data } = matter(source);
  const mdxSource = await serialize(
    { value: content, path: format },
    {
      // Optionally pass remark/rehype plugins
      mdxOptions: {
        remarkPlugins: [
          remarkEmbed,
          remarkGfm,
          [remarkSmartypants, { quotes: false, dashes: "oldschool" }],
          remarkMath,
          remarkCallouts,
          [remarkWikiLink],
          [
            remarkToc,
            {
              heading: "Table of contents",
              tight: true,
            },
          ],
          [mdxmermaid, {}],
        ],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              properties: { className: "heading-link" },
              test(element) {
                return (
                  ["h2", "h3", "h4", "h5", "h6"].includes(element.tagName) &&
                  element.properties?.id !== "table-of-contents" &&
                  element.properties?.className !== "blockquote-heading"
                );
              },
              content(node) {
                const labelText = node.children
                  .filter((child) => child.type === "text")
                  .map((child) => child.value)
                  .join(" ");

                // NEVER return h("a") here — rehypeAutolinkHeadings already
                // wraps this content in an outer <a>. A second <a> inside it
                // produces invalid HTML and causes a React hydration mismatch.
                return h(
                  "svg",
                  {
                    xmlns: "http://www.w3.org/2000/svg",
                    fill: tw.theme.extend.colors.secondary.DEFAULT,
                    viewBox: "0 0 20 20",
                    className: "w-5 h-5",
                    ariaLabel: `Go to ${labelText} section`,
                  },
                  [
                    h("path", {
                      fillRule: "evenodd",
                      clipRule: "evenodd",
                      d: "M9.493 2.853a.75.75 0 00-1.486-.205L7.545 6H4.198a.75.75 0 000 1.5h3.14l-.69 5H3.302a.75.75 0 000 1.5h3.14l-.435 3.148a.75.75 0 001.486.205L7.955 14h2.986l-.434 3.148a.75.75 0 001.486.205L12.456 14h3.346a.75.75 0 000-1.5h-3.14l.69-5h3.346a.75.75 0 000-1.5h-3.14l.435-3.147a.75.75 0 00-1.486-.205L12.045 6H9.059l.434-3.147zM8.852 7.5l-.69 5h2.986l.69-5H8.852z",
                    }),
                  ]
                );
              },
            },
          ],

          [rehypeKatex, { output: "mathml" }],
          [rehypePrismPlus, { ignoreMissing: true }],
        ],
        format,
      },
      scope: { ...scope, ...data },
    }
  );

  let src = mdxSource.compiledSource;
  for (const [from, to] of Object.entries(SVG_PROP_MAP)) {
    src = src.replaceAll(from, to);
  }
  mdxSource.compiledSource = src;

  return {
    mdxSource: mdxSource,
    frontMatter: data,
  };
};

export default parse;
