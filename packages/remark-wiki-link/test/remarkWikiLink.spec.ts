import markdown from "remark-parse";
import { unified } from "unified";
import { select } from "unist-util-select";
import { visit } from "unist-util-visit";
import { Node } from "unist";

import wikiLinkPlugin from "../src/lib/remarkWikiLink";

describe("remark-wiki-link", () => {
  describe("parses a wikilink", () => {
    test("with 'raw' file format (default) that has no matching permalink", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("[[Wiki Link]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.exists).toEqual(false);
        expect(node.data?.permalink).toEqual("Wiki Link");
        expect(node.data?.alias).toEqual(null);
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual(
          "internal new"
        );
        expect((node.data?.hProperties as any).href).toEqual("Wiki Link");
        expect((node.data?.hChildren as any)[0].value).toEqual("Wiki Link");
      });
    });

    test("with 'raw' file format (default) that has a matching permalink", () => {
      const processor = unified()
        .use(markdown)
        .use(wikiLinkPlugin, {
          permalinks: ["Wiki Link"],
        });

      let ast = processor.parse("[[Wiki Link]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.exists).toEqual(true);
        expect(node.data?.permalink).toEqual("Wiki Link");
        expect(node.data?.alias).toEqual(null);
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual("internal");
        expect((node.data?.hProperties as any).href).toEqual("Wiki Link");
        expect((node.data?.hChildren as any)[0].value).toEqual("Wiki Link");
      });
    });

    test("with shortened Obsidian-style path that has no matching permalink", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin, {
        pathFormat: "obsidian-short",
      });

      let ast = processor.parse("[[Wiki Link]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.exists).toEqual(false);
        expect(node.data?.permalink).toEqual("Wiki Link");
        expect(node.data?.alias).toEqual(null);
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual(
          "internal new"
        );
        expect((node.data?.hProperties as any).href).toEqual("Wiki Link");
        expect((node.data?.hChildren as any)[0].value).toEqual("Wiki Link");
      });
    });

    test("with shortened Obsidian-style path that has a matching permalink", () => {
      const processor = unified()
        .use(markdown)
        .use(wikiLinkPlugin, {
          permalinks: ["/some/folder/Wiki Link"],
          pathFormat: "obsidian-short",
        });

      let ast = processor.parse("[[Wiki Link]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.exists).toEqual(true);
        expect(node.data?.permalink).toEqual("/some/folder/Wiki Link");
        expect(node.data?.alias).toEqual(null);
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual("internal");
        expect((node.data?.hProperties as any).href).toEqual(
          "/some/folder/Wiki Link"
        );
        expect((node.data?.hChildren as any)[0].value).toEqual("Wiki Link");
      });
    });

    // Obsidian absolute path doesn't have a leading slash
    test("with 'obsidian-absolute' path format that has no matching permalink", () => {
      const processor = unified()
        .use(markdown)
        .use(wikiLinkPlugin, { pathFormat: "obsidian-absolute" });

      let ast = processor.parse("[[some/folder/Wiki Link]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.exists).toEqual(false);
        expect(node.data?.permalink).toEqual("/some/folder/Wiki Link");
        expect(node.data?.alias).toEqual(null);
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual(
          "internal new"
        );
        expect((node.data?.hProperties as any).href).toEqual(
          "/some/folder/Wiki Link"
        );
        expect((node.data?.hChildren as any)[0].value).toEqual(
          "some/folder/Wiki Link"
        );
      });
    });

    // Obsidian absolute path doesn't have a leading slash
    test("with 'obsidian-absolute' path format that has a matching permalink", () => {
      const processor = unified()
        .use(markdown)
        .use(wikiLinkPlugin, {
          permalinks: ["/some/folder/Wiki Link"],
          pathFormat: "obsidian-absolute",
        });

      let ast = processor.parse("[[some/folder/Wiki Link]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.exists).toEqual(true);
        expect(node.data?.permalink).toEqual("/some/folder/Wiki Link");
        expect(node.data?.alias).toEqual(null);
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual("internal");
        expect((node.data?.hProperties as any).href).toEqual(
          "/some/folder/Wiki Link"
        );
        expect((node.data?.hChildren as any)[0].value).toEqual(
          "some/folder/Wiki Link"
        );
      });
    });
  });

  describe("aliases and headings", () => {
    test("parses a wiki link with heading", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("[[Wiki Link#Some Heading]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.exists).toEqual(false);
        expect(node.data?.permalink).toEqual("Wiki Link");
        expect(node.data?.alias).toEqual(null);
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual(
          "internal new"
        );
        expect((node.data?.hProperties as any).href).toEqual(
          "Wiki Link#some-heading"
        );
        expect((node.data?.hChildren as any)[0].value).toEqual(
          "Wiki Link#Some Heading"
        );
      });
    });

    test("parses a wiki link with heading and alias", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("[[Wiki Link#Some Heading|Alias]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.exists).toEqual(false);
        expect(node.data?.permalink).toEqual("Wiki Link");
        expect(node.data?.alias).toEqual("Alias");
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual(
          "internal new"
        );
        expect((node.data?.hProperties as any).href).toEqual(
          "Wiki Link#some-heading"
        );
        expect((node.data?.hChildren as any)[0].value).toEqual("Alias");
      });
    });

    test("parses a wiki link to a heading on the same page", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("[[#Some Heading]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.exists).toEqual(false);
        expect(node.data?.permalink).toEqual(""); // TODO should this be null?
        expect(node.data?.alias).toEqual(null);
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual(
          "internal new"
        );
        expect((node.data?.hProperties as any).href).toEqual("#some-heading");
        expect((node.data?.hChildren as any)[0].value).toEqual("Some Heading");
      });
    });
  });

  describe("image embeds", () => {
    test("parses an image embed of supported file format", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("![[My Image.png]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.isEmbed).toEqual(true);
        expect(node.data?.target).toEqual("My Image.png");
        expect(node.data?.permalink).toEqual("My Image.png");
        expect(node.data?.hName).toEqual("img");
        expect((node.data?.hProperties as any).src).toEqual("My Image.png");
        expect((node.data?.hProperties as any).alt).toEqual("My Image.png");
        expect((node.data?.hProperties as any).width).toBeUndefined();
        expect((node.data?.hProperties as any).height).toBeUndefined();
      });
    });

    test("Can identify the dimensions of the image if exists", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("![[My Image.png|132x612]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.isEmbed).toEqual(true);
        expect(node.data?.target).toEqual("My Image.png");
        expect(node.data?.permalink).toEqual("My Image.png");
        expect(node.data?.hName).toEqual("img");
        expect((node.data?.hProperties as any).src).toEqual("My Image.png");
        expect((node.data?.hProperties as any).alt).toEqual("My Image.png");
        expect((node.data?.hProperties as any).width).toBe("132");
        expect((node.data?.hProperties as any).height).toBe("612");
      });
    });

    test("parses an image embed of unsupported file format", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("![[My Image.xyz]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.isEmbed).toEqual(true);
        expect(node.data?.target).toEqual("My Image.xyz");
        expect(node.data?.permalink).toEqual("My Image.xyz");
        expect(node.data?.hName).toEqual("p");
        expect((node.data?.hChildren as any)[0].value).toEqual(
          "![[My Image.xyz]]"
        );
      });
    });

    test("parses an image embed with a matching permalink", () => {
      const processor = unified()
        .use(markdown)
        .use(wikiLinkPlugin, {
          permalinks: ["Pasted Image 123.png"],
        });

      let ast = processor.parse("![[Pasted Image 123.png]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.isEmbed).toEqual(true);
        expect(node.data?.target).toEqual("Pasted Image 123.png");
        expect(node.data?.exists).toEqual(true);
        expect(node.data?.permalink).toEqual("Pasted Image 123.png");
        expect(node.data?.hName).toEqual("img");
        expect((node.data?.hProperties as any).src).toEqual(
          "Pasted Image 123.png"
        );
        expect((node.data?.hProperties as any).alt).toEqual(
          "Pasted Image 123.png"
        );
      });
    });

    test("parses an image embed with a matching permalink and Obsidian-style shortedned path", () => {
      const processor = unified()
        .use(markdown)
        .use(wikiLinkPlugin, {
          pathFormat: "obsidian-short",
          permalinks: ["/assets/Pasted Image 123.png"],
        });

      let ast = processor.parse("![[Pasted Image 123.png]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.isEmbed).toEqual(true);
        expect(node.data?.target).toEqual("Pasted Image 123.png");
        expect(node.data?.exists).toEqual(true);
        expect(node.data?.permalink).toEqual("/assets/Pasted Image 123.png");
        expect(node.data?.hName).toEqual("img");
        expect((node.data?.hProperties as any).src).toEqual(
          "/assets/Pasted Image 123.png"
        );
        expect((node.data?.hProperties as any).alt).toEqual(
          "Pasted Image 123.png"
        );
      });
    });

    test("parses an image embed with an alt text", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("![[My Image.png|Alt Text]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.isEmbed).toEqual(true);
        expect(node.data?.target).toEqual("My Image.png");
        expect(node.data?.permalink).toEqual("My Image.png");
        expect(node.data?.hName).toEqual("img");
        expect((node.data?.hProperties as any).src).toEqual("My Image.png");
        expect((node.data?.hProperties as any).alt).toEqual("Alt Text");
      });
    });

    test("parses a pdf embed", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("![[My Document.pdf]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.isEmbed).toEqual(true);
        expect(node.data?.target).toEqual("My Document.pdf");
        expect(node.data?.permalink).toEqual("My Document.pdf");
        expect(node.data?.hName).toEqual("iframe");
        expect((node.data?.hProperties as any).src).toEqual(
          "My Document.pdf#toolbar=0"
        );
      });
    });

    test("parses a CSV embed", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("![[My Data.csv]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.isEmbed).toEqual(true);
        expect(node.data?.target).toEqual("My Data.csv");
        expect(node.data?.permalink).toEqual("My Data.csv");
        expect(node.data?.hName).toEqual("FlatUiTable");
        expect((node.data?.hProperties as any).data).toEqual({ url: "My Data.csv" });
      });
    });
  });

  describe("Links with special characters", () => {
    test("parses a link with special characters and symbols", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse(
        "[[li nk-w(i)th-àcèô íã_a(n)d_underline!:ª%@'*º$ °~./\\#li-nk-w(i)th-àcèô íã_a(n)D_UNDERLINE!:ª%@'*º$ °~./\\]]"
      );
      ast = processor.runSync(ast);
      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.exists).toEqual(false);
        expect(node.data?.permalink).toEqual(
          "li nk-w(i)th-àcèô íã_a(n)d_underline!:ª%@'*º$ °~./\\"
        );
        expect(node.data?.alias).toEqual(null);
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual(
          "internal new"
        );
        expect((node.data?.hProperties as any).href).toEqual(
          "li nk-w(i)th-àcèô íã_a(n)d_underline!:ª%@'*º$ °~./\\#li-nk-w(i)th-àcèô-íã_a(n)d_underline!:ª%@'*º$-°~./\\"
        );
        expect((node.data?.hChildren as any)[0].value).toEqual(
          "li nk-w(i)th-àcèô íã_a(n)d_underline!:ª%@'*º$ °~./\\#li-nk-w(i)th-àcèô íã_a(n)D_UNDERLINE!:ª%@'*º$ °~./\\"
        );
      });
    });
  });

  describe("invalid wiki links", () => {
    test("doesn't parse a wiki link with two missing closing brackets", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("[[Wiki Link");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).toEqual(null);
    });

    test("doesn't parse a wiki link with one missing closing bracket", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("[[Wiki Link]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).toEqual(null);
    });

    test("doesn't parse a wiki link with a missing opening bracket", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("Wiki Link]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).toEqual(null);
    });

    test("doesn't parse a wiki link in single brackets", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("[Wiki Link]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).toEqual(null);
    });
  });

  test("supports different config options", () => {
    const processor = unified()
      .use(markdown)
      .use(wikiLinkPlugin, {
        aliasDivider: ":",
        pathFormat: "obsidian-short",
        permalinks: ["/some/folder/123/real-page"],
        wikiLinkResolver: (pageName: string) => [
          `123/${pageName.replace(/ /g, "-").toLowerCase()}`,
        ],
        wikiLinkClassName: "my-wiki-link-class",
        hrefTemplate: (permalink: string) => `https://my-site.com${permalink}`,
      });

    let ast = processor.parse("[[Real Page#Some Heading:Page Alias]]");
    ast = processor.runSync(ast);

    expect(select("wikiLink", ast)).not.toEqual(null);

    visit(ast, "wikiLink", (node: Node) => {
      expect(node.data?.exists).toEqual(true);
      expect(node.data?.permalink).toEqual("/some/folder/123/real-page");
      expect(node.data?.alias).toEqual("Page Alias");
      expect(node.data?.hName).toEqual("a");
      expect((node.data?.hProperties as any).className).toEqual(
        "my-wiki-link-class"
      );
      expect((node.data?.hProperties as any).href).toEqual(
        "https://my-site.com/some/folder/123/real-page#some-heading"
      );
      expect((node.data?.hChildren as any)[0].value).toEqual("Page Alias");
    });
  });

  describe("transclusions", () => {
    test("replaces a transclusion with a regular wiki link", () => {
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("![[Some Page]]");
      ast = processor.runSync(ast);

      expect(select("wikiLink", ast)).not.toEqual(null);

      visit(ast, "wikiLink", (node: Node) => {
        expect(node.data?.isEmbed).toEqual(true);
        expect(node.data?.exists).toEqual(false);
        expect(node.data?.permalink).toEqual("Some Page");
        expect(node.data?.alias).toEqual(null);
        expect(node.data?.hName).toEqual("a");
        expect((node.data?.hProperties as any).className).toEqual(
          "internal new transclusion"
        );
        expect((node.data?.hProperties as any).href).toEqual("Some Page");
        expect((node.data?.hChildren as any)[0].value).toEqual("Some Page");
      });
    });
  });
});
