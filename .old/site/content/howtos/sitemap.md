---
title: How to build a sitemap?
description: Learn how to build a sitemap for a data portal built with PortalJS
---

## Setup

Install the following packages:

```sh
npm i globby
npm i -D prettier
```

## Add sitemap script

>[!info]
>The following example assumes files list for dynamic Next.js routes is imported from the database created with [MarkdownDB](https://github.com/datopian/markdowndb) package. You need to adjust it to your specific use case.

Add the following script to e.g. `/scripts/sitemap.mjs` and adjust it to work with your app:

```js
// /scripts/sitemap.mjs
import { writeFileSync } from "fs";
import { globby } from "globby";
import prettier from "prettier";

// Change this to import data from your content layer (if needed)
import clientPromise from "../lib/mddb.mjs";

export default async function sitemap() {
  const prettierConfig = await prettier.resolveConfig("path-to-your-prettier-config");

  // Change this to create a list of page paths
  const mddb = await clientPromise;
  const allFiles = await mddb.getFiles({ extensions: ["mdx", "md"] });
  const contentPages = allFiles
    .filter((x) => !x.metadata?.isDraft)
    .map((x) => `/${x.url_path}`);
  const pages = await globby([
    "pages/*.(js|tsx)",
    "!pages/_*.(js|tsx)",
    "!pages/api",
    "!pages/404.(js|tsx)",
    "!pages/**/\\[\\[*\\]\\].(js|tsx)", // pages/[[...slug]].tsx
  ]);
  const allPages = pages.concat(contentPages);
  // end

  // Replace this with your site domain
  const siteDomain = "your-site-domain";

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allPages
        .map((page) => {
          const path = page
            .replace("pages/", "/")
            .replace("public/", "/")
            .replace(/\.js|.tsx|.mdx|.md[^\/.]+$/, "")
            .replace("/feed.xml", "");
          const route = path === "/index" ? "" : path;
          return `
            <url>
              <loc>${siteDomain}${route}</loc>
            </url>
          `;
        })
        .join("")}
    </urlset>
  `;

  const formatted = prettier.format(sitemap, {
    ...prettierConfig,
    parser: "html",
  });

  if (siteUrl) {
    writeFileSync("public/sitemap.xml", formatted);
    console.log("Sitemap generated...");
  }
}

await sitemap();
process.exit();
```

## Execute script before each build

Add this to the scripts section in your `package.json` to regenerate the sitemap before each build.

```json

"prebuild": "node ./scripts/sitemap.mjs",

```
