---
title: How to add a simple blog?
description: Learn how to add a simple blog on a PortalJS data portal
---

## Setup

The following example uses components imported from the [`@portaljs/core` package](https://www.npmjs.com/package/@portaljs/core). If you want to follow along install it too:

```sh
npm i @portaljs/core
```

## Create home page for your blogs

Add the following code to the Next.js page that is going to be your blog home page, e.g. to `/pages/blog/index.tsx`:

```tsx
import { BlogsList, SimpleLayout } from '@portaljs/core';

// pass a list of blogs, home page title and home page description, e.g. from `getStaticProps`
export default function BlogIndex({ blogs, title, description }) {
  return (
    <SimpleLayout title={title} description={description}>
      <BlogsList blogs={blogs} />
    </SimpleLayout>
  );
}
```

`BlogsList` component has the following API:

```ts
interface BlogsListProps {
  blogs: Blog;
}

interface Blog {
  title: string;
  date: string;
  urlPath: string;
  description?: string;
  authors?: Array<string>;
  tags?: Array<string>;
}
```

## Create blog post pages

Add the following code to your blog pages, e.g. to `/pages/blog/[...slug].tsx`:

```tsx
import { BlogLayout } from "@portaljs/core";

export default BlogPost({ content, title, date, authors }) {
	return (
		<BlogLayout title={title} date={date} authors={authors}
			{content}
		</BlogLayout>
	)
}
```

`BlogLayout` component has the following API:

```ts
interface BlogLayoutProps {
  title?: string;
  date?: string;
  authors?: Array<Author>;
}

interface Author {
  name: string;
  avatar: string; // avatar image path
  urlPath?: string; // author page
}
```
