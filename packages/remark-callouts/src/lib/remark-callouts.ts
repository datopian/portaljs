import { visit } from "unist-util-visit";
import { fromMarkdown } from "mdast-util-from-markdown";
import type { Plugin } from "unified";
import type { Node, Data, Parent } from "unist";
import type { Blockquote, Heading, Text, BlockContent } from "mdast";
import { parse } from "svg-parser";
import { calloutTypes } from "./calloutTypes";

// escape regex special characters
function escapeRegExp(s: string) {
  return s.replace(new RegExp(`[-[\\]{}()*+?.\\\\^$|/]`, "g"), "\\$&");
}

// match breaks
const find = /[\t ]*(?:\r?\n|\r)/g;

export const callouts: Plugin = function (providedConfig?: Partial<Config>) {
  const config: Config = { ...defaultConfig, ...providedConfig };
  const defaultKeywords: string = Object.keys(config.types)
    .map(escapeRegExp)
    .join("|");

  return function (tree) {
    visit(tree, (node: Node, index, parent: Parent<Node>) => {
      // Filter required elems
      if (node.type !== "blockquote") return;

      /** add breaks to text without needing spaces or escapes (turns enters into <br>)
       *  code taken directly from remark-breaks,
       *  see https://github.com/remarkjs/remark-breaks for more info on what this does.
       */
      visit(node, "text", (node: Text, index: number, parent: Parent) => {
        const result = [];
        let start = 0;

        find.lastIndex = 0;

        let match = find.exec(node.value);

        while (match) {
          const position = match.index;

          if (start !== position) {
            result.push({
              type: "text",
              value: node.value.slice(start, position),
            });
          }

          result.push({ type: "break" });
          start = position + match[0].length;
          match = find.exec(node.value);
        }

        if (result.length > 0 && parent && typeof index === "number") {
          if (start < node.value.length) {
            result.push({ type: "text", value: node.value.slice(start) });
          }

          parent.children.splice(index, 1, ...result);
          return index + result.length;
        }
      });

      /** add classnames to headings within blockquotes,
       * mainly to identify when using other plugins that
       * might interfere. for eg, rehype-auto-link-headings.
       */
      visit(node, "heading", (node) => {
        const heading = node as Heading;
        heading.data = {
          hProperties: {
            className: "blockquote-heading",
          },
        };
      });

      // wrap blockquote in a div
      const wrapper = {
        ...node,
        type: "element",
        tagName: "div",
        data: {
          hProperties: {},
        },
        children: [node],
      };

      parent.children.splice(Number(index), 1, wrapper);

      const blockquote = wrapper.children[0] as Blockquote;

      blockquote.data = {
        hProperties: {
          className: "blockquote",
        },
      };

      // check for callout syntax starts here
      if (
        blockquote.children.length <= 0 ||
        blockquote.children[0].type !== "paragraph"
      )
        return;
      const paragraph = blockquote.children[0];

      if (
        paragraph.children.length <= 0 ||
        paragraph.children[0].type !== "text"
      )
        return;

      const [t, ...rest] = paragraph.children;

      const regex = new RegExp(
        `^\\[!(?<keyword>(.*?))\\](?<foldChar>[+-]?)[\t\f ]?(?<title>.*?)$`,
        "gi"
      );
      const m = regex.exec(t.value);

      // if no callout syntax, forget about it.
      if (!m) return;

      const [key, foldChar, title] = [m.groups?.keyword, m.groups?.foldChar, m.groups?.title];

      // if there's nothing inside the brackets, is it really a callout ?
      if (!key) return;

      const keyword = key.toLowerCase();
      const isOneOfKeywords: boolean = new RegExp(defaultKeywords).test(
        keyword
      );

      if (title) {
        const mdast = fromMarkdown(title.trim()).children[0];
        if (mdast.type === "heading") {
          mdast.data = {
            ...mdast.data,
            hProperties: {
              className: "blockquote-heading",
            },
          };
        }
        blockquote.children.unshift(mdast as BlockContent);
      } else {
        t.value =
          typeof keyword.charAt(0) === "string"
            ? keyword.charAt(0).toUpperCase() + keyword.slice(1)
            : keyword;
      }

      const entry: { [index: string]: string } = {};

      if (isOneOfKeywords) {
        if (typeof config?.types[keyword] === "string") {
          const e = String(config?.types[keyword]);
          Object.assign(entry, config?.types[e]);
        } else {
          Object.assign(entry, config?.types[keyword]);
        }
      } else {
        Object.assign(entry, config?.types["note"]);
      }

      let parsedSvg;

      if (entry && entry.svg) {
        parsedSvg = parse(entry.svg);
      }

      // create icon and title node wrapped in div
      const titleNode: object = {
        type: "element",
        children: [
          {
            type: "element",
            tagName: "span",
            data: {
              hName: "span",
              hProperties: {
                style: `color:${entry?.color}`,
                className: "callout-icon",
              },
              hChildren: parsedSvg?.children ? parsedSvg.children : [],
            },
          },
          {
            type: "element",
            children: title ? [blockquote.children[0]] : [t],
            data: {
              hName: "strong",
            },
          },
        ],
        data: {
          ...blockquote.children[0]?.data,
          hProperties: {
            className: `${formatClassNameMap(config.classNameMaps.title)(
              keyword
            )} ${isOneOfKeywords ? keyword : "note"}`,
            style: `background-color: ${entry?.color}1a;`,
          },
        },
      };

      // remove the callout paragraph from the content body
      if (title) {
        blockquote.children.shift();
      }

      if (rest.length > 0) {
        rest.shift();
        paragraph.children = rest;
      } else {
        blockquote.children.shift();
      }

      // wrap blockquote content in div
      const contentNode: object = {
        type: "element",
        children: blockquote.children,
        data: {
          hProperties: {
            className: "callout-content",
            style:
              parent.type !== "root"
                ? `border-right:1px solid ${entry?.color}33;
                border-bottom:1px solid ${entry?.color}33;`
                : "",
          },
        },
      };

      if (blockquote.children.length > 0)
        blockquote.children = [contentNode] as BlockContent[];
      blockquote.children.unshift(titleNode as BlockContent);

      // Add classes for the callout block
      const classList = [formatClassNameMap(config.classNameMaps.block)(keyword.toLowerCase())]
      if (foldChar) {
        classList.push('callout-foldable')
        if (foldChar === '-') {
          classList.push('callout-folded')
        }
      }
      blockquote.data = config.dataMaps.block({
        ...blockquote.data,
        hProperties: {
          className: classList.join(" "),
          style: `border-left-color:${entry?.color};`,
        },
      });
    });
  };
};

export interface Config {
  classNameMaps: {
    block: ClassNameMap;
    title: ClassNameMap;
  };
  dataMaps: {
    block: (data: Data) => Data;
    title: (data: Data) => Data;
  };
  types: { [index: string]: string | object };
}

export const defaultConfig: Config = {
  classNameMaps: {
    block: "callout",
    title: "callout-title",
  },
  dataMaps: {
    block: (data) => data,
    title: (data) => data,
  },
  types: { ...calloutTypes },
};

type ClassNames = string | string[];
type ClassNameMap = ClassNames | ((title: string) => ClassNames);
function formatClassNameMap(gen: ClassNameMap) {
  return (title: string) => {
    const classNames = typeof gen == "function" ? gen(title) : gen;
    return typeof classNames == "object" ? classNames.join(" ") : classNames;
  };
}

export default callouts;
