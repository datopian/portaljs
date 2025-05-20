---
title: How to add markdown-based content pages?
description: Learn how to add markdown-based content pages on PortalJS data portals
---

## Add content layer to your app

Create a folder where you'll keep your markdown files and add some markdown files to it.

```sh
cd my-portaljs-project
mkdir content
# touch content/index.md ...
```

Install [MarkdownDB](https://github.com/datopian/markdowndb) package:

```
npm i mddb
```

And add the following to your `package.json`:

```json
{
  "scripts": {
    "mddb": "mddb <path-to-your-content-folder>",
    "prebuild": "npm run mddb"
  }
}
```

You can give it a go by running `npm run mddb`. You should see a `markdown.db` file created in the root of your project. You can inspect it with any SQLite viewer or in the command line. In the `files` table you should see all your markdown files from your content folder.

Now, once the data is in the database, you can add the following script to your project (e.g. in `/lib` folder). It will allow you to establish a single connection to the database and use it across your app.

```ts
// lib/mddb.ts
import { MarkdownDB } from 'mddb;

// path to the markdown.db file created by the mddb script
const dbPath = 'markdown.db';

const client = new MarkdownDB({
  client: 'sqlite3',
  connection: {
    filename: dbPath,
  },
});

const clientPromise = client.init();

export default clientPromise;
```

Now you can import it across your project to query the database, e.g.:

```ts
import clientPromise from '@/lib/mddb';

const mddb = await clientPromise;
const blogs = await mddb.getFiles({
  folder: 'blog',
  extensions: ['md', 'mdx'],
});
```

## Write a markdown parser

Install [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) package, which we'll first use to parse markdown files and then to render them in Next.js app.

```sh
npm i next-mdx-remote
```

Create the following basic parser for your markdown files, e.g. in `/lib/markdown.ts`:

```ts
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import { serialize } from 'next-mdx-remote/serialize';

const parse = async function (source) {
  const { content } = matter(source);

  const mdxSource = await serialize(
    { value: content },
    {
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          // ... your remark plugins
        ],
        rehypePlugins: [
          // ... your plugins
        ],
        format,
      },
    }
  );

  return {
    mdxSource,
  };
};

export default parse;
```

## Import, parse and render your markdown files

Create a page in the `/pages` folder that will render your markdown content, e.g. `pages/blog/[[...slug]].tsx`:

```tsx
import fs from 'fs';

import { MdxRemote } from 'next-mdx-remote';
import clientPromise from '@/lib/mddb.mjs';
import parse from '@/lib/markdown';

export default function Page({ source }) {
  source = JSON.parse(source);

  return (
    <>
      <MdxRemote source={source} />
    </>
  );
}

// Import metadata of a file matching the static path and return its parsed source and frontmatter object
export const getStaticProps = async ({ params }) => {
  const urlPath = params?.slug ? (params.slug as string[]).join('/') : '/';

  const mddb = await clientPromise;
  const dbFile = await mddb.getFileByUrl(urlPath);
  const filePath = dbFile!.file_path;
  // const frontMatter = dbFile!.metadata ?? {};

  const source = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const { mdxSource } = await parse(source, 'mdx', {});

  return {
    props: {
      source: JSON.stringify(mdxSource),
      // frontMatter
    },
  };
};

// Import metadata of your markdown files from MarkdownDB and return a list of static paths
export const getStaticPaths = async () => {
  const mddb = await clientPromise;
  const allDocuments = await mddb.getFiles({ extensions: ['md', 'mdx'] });
  const paths = allDocuments.map((page) => {
    const url = decodeURI(page.url_path);
    const parts = url.split('/');
    return { params: { slug: parts } };
  });

  return {
    paths,
    fallback: false,
  };
};
```
