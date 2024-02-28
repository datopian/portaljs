import { syntax } from "../src/lib/syntax";
import { html } from "../src/lib/html";
import { micromark } from "micromark";

describe("micromark-extension-wiki-link", () => {
  describe("parses a wikilink", () => {
    test("with 'raw' file format (default) that has no matching permalink", () => {
      const serialized = micromark("[[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      // note: class="internal new"
      expect(serialized).toBe(
        '<p><a href="Wiki Link" class="internal new">Wiki Link</a></p>'
      );
    });

    test("with 'raw' file format (default) that has a matching permalink", () => {
      const serialized = micromark("[[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html({ permalinks: ["Wiki Link"] }) as any], // TODO type fix
      });
      // note: class="internal"
      expect(serialized).toBe(
        '<p><a href="Wiki Link" class="internal">Wiki Link</a></p>'
      );
    });

    test("with shortened Obsidian-style path that has no matching permalink", () => {
      const serialized = micromark("[[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            pathFormat: "obsidian-short",
          }) as any // TODO type fix
        ],
      });
      // note: class="internal new"
      expect(serialized).toBe(
        '<p><a href="Wiki Link" class="internal new">Wiki Link</a></p>'
      );
    });

    test("with shortened Obsidian-style path that has a matching permalink", () => {
      const serialized = micromark("[[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            permalinks: ["/some/folder/Wiki Link"],
            pathFormat: "obsidian-short",
          }) as any, // TODO type fix
        ],
      });
      expect(serialized).toBe(
        '<p><a href="/some/folder/Wiki Link" class="internal">Wiki Link</a></p>'
      );
    });

    // Obsidian absolute path doesn't have a leading slash
    test("with 'obsidian-absolute' path format that has no matching permalink", () => {
      const serialized = micromark("[[some/folder/Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html({ pathFormat: "obsidian-absolute" }) as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><a href="/some/folder/Wiki Link" class="internal new">some/folder/Wiki Link</a></p>'
      );
    });

    // Obsidian absolute path doesn't have a leading slash
    test("with 'obsidian-absolute' path format that has a matching permalink", () => {
      const serialized = micromark("[[some/folder/Wiki Link]]", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            permalinks: ["/some/folder/Wiki Link"],
            pathFormat: "obsidian-absolute",
          }) as any, // TODO type fix
        ],
      });
      expect(serialized).toBe(
        '<p><a href="/some/folder/Wiki Link" class="internal">some/folder/Wiki Link</a></p>'
      );
    });
  });

  describe("aliases and headings", () => {
    test("parses a wiki link with heading", () => {
      const serialized = micromark("[[Wiki Link#Some Heading]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      // note: lowercased and hyphenated heading
      expect(serialized).toBe(
        '<p><a href="Wiki Link#some-heading" class="internal new">Wiki Link#Some Heading</a></p>'
      );
    });

    test("parses a wiki link with heading and alias", () => {
      const serialized = micromark(
        "[[Wiki Link#Some Heading|Alias]]",
        "ascii",
        {
          extensions: [syntax()],
          htmlExtensions: [html() as any], // TODO type fix
        }
      );
      // note: lowercased and hyphenated heading
      expect(serialized).toBe(
        '<p><a href="Wiki Link#some-heading" class="internal new">Alias</a></p>'
      );
    });

    test("parses a wiki link to a heading on the same page", () => {
      const serialized = micromark("[[#Some Heading]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><a href="#some-heading" class="internal new">Some Heading</a></p>'
      );
    });
  });

  describe("image embeds", () => {
    test("parses an image embed of supported file format", () => {
      const serialized = micromark("![[My Image.jpg]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><img src="My Image.jpg" alt="My Image.jpg" class="internal new" /></p>'
      );
    });

    test("parses an image embed of unsupported file format", () => {
      const serialized = micromark("![[My Image.xyz]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe('<p>![[My Image.xyz]]</p>');
    });

    test("parses and image ambed with a matching permalink", () => {
      const serialized = micromark("![[My Image.jpg]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html({ permalinks: ["My Image.jpg"] }) as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><img src="My Image.jpg" alt="My Image.jpg" class="internal" /></p>'
      );
    });
    test("Can identify the dimensions of the image if exists", () => {
      const serialized = micromark("![[My Image.jpg|200x200]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html({ permalinks: ["My Image.jpg"] }) as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><img src="My Image.jpg" alt="My Image.jpg" class="internal" width="200" height="200" /></p>'
      );
    });

    test("parses an image embed with a matching permalink and Obsidian-style shortedned path", () => {
      const serialized = micromark("![[My Image.jpg]]", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            permalinks: ["/assets/My Image.jpg"],
            pathFormat: "obsidian-short",
          }) as any, // TODO type fix
        ],
      });
      expect(serialized).toBe(
        '<p><img src="/assets/My Image.jpg" alt="My Image.jpg" class="internal" /></p>'
      );
    });

    test("parses an image embed with an alt text", () => {
      const serialized = micromark("![[My Image.jpg|My Image Alt]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><img src="My Image.jpg" alt="My Image Alt" class="internal new" /></p>'
      );
    });

    test("parses a pdf embed", () => {
      const serialized = micromark("![[My Document.pdf]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><iframe width="100%" src="My Document.pdf#toolbar=0" class="internal new" /></p>'
      );
    });
  });

  describe("invalid wiki links", () => {
    test("doesn't parse a wiki link with two missing closing brackets", () => {
      const serialized = micromark("[[Wiki Link", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe('<p>[[Wiki Link</p>');
    });

    test("doesn't parse a wiki link with one missing closing bracket", () => {
      const serialized = micromark("[[Wiki Link]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe('<p>[[Wiki Link]</p>');
    });

    test("doesn't parse a wiki link with a missing opening bracket", () => {
      const serialized = micromark("[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe('<p>[Wiki Link]]</p>');
    });

    test("doesn't parse a wiki link in single brackets", () => {
      const serialized = micromark("[Wiki Link]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe('<p>[Wiki Link]</p>');
    });
  });

  describe("other options", () => {
    test("parses a wiki link with a custom class", () => {
      const serialized = micromark("[[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            newClassName: "test-new",
            wikiLinkClassName: "test-wiki-link",
          }) as any, // TODO type fix
        ],
      });
      expect(serialized).toBe(
        '<p><a href="Wiki Link" class="test-wiki-link test-new">Wiki Link</a></p>'
      );
    });

    test("parses a wiki link with a custom divider", () => {
      const serialized = micromark("[[Wiki Link:Alias Name]]", "ascii", {
        extensions: [syntax({ aliasDivider: ":" })],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><a href="Wiki Link" class="internal new">Alias Name</a></p>'
      );
    });

    test("parses a wiki link with a custom page resolver", () => {
      const serialized = micromark("[[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            wikiLinkResolver: (page) => [
              page.replace(/\s+/, "-").toLowerCase(),
            ],
          }) as any, // TODO type fix
        ],
      });
      expect(serialized).toBe(
        '<p><a href="wiki-link" class="internal new">Wiki Link</a></p>'
      );
    });
  });

  test("parses wiki links to index files", () => {
    const serialized = micromark("[[/some/folder/index]]", "ascii", {
      extensions: [syntax()],
      htmlExtensions: [html() as any], // TODO type fix
    });
    expect(serialized).toBe(
      '<p><a href="/some/folder" class="internal new">/some/folder/index</a></p>'
    );
  });

  describe("other", () => {
    test("parses a wiki link to some index page in a folder with no matching permalink", () => {
      const serialized = micromark("[[/some/folder/index]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><a href="/some/folder" class="internal new">/some/folder/index</a></p>'
      );
    });

    test("parses a wiki link to some index page in a folder with a matching permalink", () => {
      const serialized = micromark("[[/some/folder/index]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html({ permalinks: ["/some/folder"] }) as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><a href="/some/folder" class="internal">/some/folder/index</a></p>'
      );
    });

    test("parses a wiki link to home index page with no matching permalink", () => {
      const serialized = micromark("[[/index]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><a href="/" class="internal new">/index</a></p>'
      );
    });

    test("parses a wiki link to home index page with a matching permalink", () => {
      const serialized = micromark("[[/index]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html({ permalinks: ["/"] }) as any], // TODO type fix
      });
      expect(serialized).toBe('<p><a href="/" class="internal">/index</a></p>');
    });
  });

  describe("transclusions", () => {
    test("parsers a transclusion as a regular wiki link", () => {
      const serialized = micromark("![[Some Page]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any], // TODO type fix
      });
      expect(serialized).toBe(
        '<p><a href="Some Page" class="internal new transclusion">Some Page</a></p>'
      );
    });
  });

  describe("Links with special characters", () => {
    test("parses a link with special characters and symbols", () => {
      const serialized = micromark("[[li nk-w(i)th-àcèô íã_a(n)d_underline!:ª%@'*º$ °~./\\#LI NK-W(i)th-àcèô íã_a(n)d_uNdErlinE!:ª%@'*º$ °~./\\]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html() as any],
      });
      expect(serialized).toBe(`<p><a href="li nk-w(i)th-àcèô íã_a(n)d_underline!:ª%@'*º$ °~./\\#li-nk-w(i)th-àcèô-íã_a(n)d_underline!:ª%@'*º$-°~./\\" class="internal new">li nk-w(i)th-àcèô íã_a(n)d_underline!:ª%@'*º$ °~./\\#LI NK-W(i)th-àcèô íã_a(n)d_uNdErlinE!:ª%@'*º$ °~./\\</a></p>`);
    });
  });
});
