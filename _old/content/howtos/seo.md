---
title: How to customize page metadata for SEO?
description: Learn how to customize page metadata for SEO on data portals built with PortalJS
---

>[!info]
>See [`next-seo` documentation](https://github.com/garmeeh/next-seo) to learn more.

## Setup

Install `next-seo` package:

```sh
npm i next-seo
```

## Default SEO configuration

Create `next-seo.config` file (e.g. in the root of your project) and add default meta tags values you want to be set up for your pages. For example:

```ts
export default {
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://www.my.portaljs.app/',
    siteName: 'MyPortalJSApp',
  },
  twitter: {
    handle: '@handle',
    site: '@site',
    cardType: 'summary_large_image',
  },
};
```

Then, in your custom Next.js App, add the following:

```tsx
// /pages/_app.tsx
import { DefaultSeo } from "next-seo";

// import your default seo configuration
import SEO from '../next-seo.config';


export default function MyApp({ Component, pageProps }) {
    // ... your code
    return (
        <>
            <DefaultSeo {...SEO} />
            <Component {...pageProps} />
        </>
    );
};

```

>[!info]
>To learn more on default SEO configuration with `next-seo`, see [this docs section](https://github.com/garmeeh/next-seo#default-seo-configuration).

## Per-page SEO configuration

To add page specific meta tag values:

```tsx
import { NextSeo } from 'next-seo';

export default function Page() (
  // ...
  <>
    <NextSeo
      title="My Portal JS page"
      description="A short description."
    />
    <p>My Portal JS page</p>
  </>
);
```

>[!info]
> To learn more on per-page SEO configuration with `next-seo`, see [this docs section](https://github.com/garmeeh/next-seo#add-seo-to-page)
