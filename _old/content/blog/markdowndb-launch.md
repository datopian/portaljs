---
title: 'Announcing MarkdownDB: an open source tool to create an SQL API to your markdown files! 🚀'
description: MarkdownDB - an open source library to transform markdown content into sql-queryable data. Build rich markdown-powered sites easily and reliably. New dedicated website at markdowndb.com
date: 2023-10-11
authors: ['Ola Rubaj']
filetype: blog
---

Hello, dear readers!

We're excited to announce the official launch of MarkdownDB, an open source library to transform markdown content into sql-queryable data. Get a rich SQL API to your markdown files in seconds and build rich markdown-powered sites easily and reliably.

We've also created a new dedicated website:

https://markdowndb.com/

## 🔍 What is MarkdownDB?

MarkdownDB transforms your Markdown content into a queryable, lightweight SQLite database. Imagine being able to treat your collection of markdown files like entries in a database! Ever thought about fetching documents with specific tags or created in the past week? Or, say, pulling up all tasks across documents marked with the "⏭️" emoji? With MarkdownDB, all of this (and more) is not just possible, but a breeze.

## 🌟 Features

- Rich metadata extracted including frontmatter, links and more.
- Lightweight and fast indexing 1000s of files in seconds.
- Open source and extensible via plugin system.

## 🚀 How it works

### You have a folder of markdown content

For example, your blog posts. Each file can have a YAML frontmatter header with metadata like title, date, tags, etc.

```md
---
title: My first blog post
date: 2021-01-01
tags: [a, b, c]
author: John Doe
---

# My first blog post

This is my first blog post.
I'm using MarkdownDB to manage my blog posts.
```

### Index the files with MarkdownDB

Use the npm `mddb` package to index Markdown files into an SQLite database. This will create a `markdown.db` file in the current directory.

```bash
# npx mddb <path-to-folder-with-your-md-files>
npx mddb ./blog
```

### Query your files with SQL...

E.g. get all the files with with tag `a`.

```sql
SELECT files.*
FROM files
INNER JOIN file_tags ON files._id = file_tags.file
WHERE file_tags.tag = 'a'
```

### ...or using MarkdownDB Node.js API in a framework of your choice!

Use our Node API to query your data for your blog, wiki, docs, digital garden, or anything you want!

E.g. here is an example of a Next.js page:

```js
// @/pages/blog/index.js
import React from 'react';
import clientPromise from '@/lib/mddb.mjs';

export default function Blog({ blogs }) {
  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {blogs.map((blog) => (
          <li key={blog.id}>
            <a href={blog.url_path}>{blog.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getStaticProps = async () => {
  const mddb = await clientPromise;
  // get all files that are not marked as draft in the frontmatter
  const blogFiles = await mddb.getFiles({
    frontmatter: {
      draft: false,
    },
  });

  const blogsList = blogFiles.map(({ metadata, url_path }) => ({
    ...metadata,
    url_path,
  }));

  return {
    props: {
      blogs: blogsList,
    },
  };
};
```

And the imported library with MarkdownDB database connection:

```js
// @/lib/mddb.mjs
import { MarkdownDB } from 'mddb';

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

### Build your blog, wiki, docs, digital garden, or anything you want

And share it with the world!

![[markdowbdb-launch-site-example.png]]

👉 [Read the full tutorial](https://markdowndb.com/blog/basic-tutorial)

---

Find out more on our new official website: https://markdowndb.com/

Check out the source on GitHub: https://github.com/datopian/markdowndb

— Ola Rubaj, Developer at Datopian
