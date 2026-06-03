---
title: How to add user comments?
description: Learn how to add user comments on a PortalJS data portal
---

![[comments-example.png]]

## Setup

Page comments can be setup with any one of the following supported providers:

1.  [giscus](https://giscus.app/)
2.  [utterances](https://utteranc.es/)
3.  [disqus](https://disqus.com/)

Each provider has it's own configuration options that you should add to your `.env` file.

> [!Info]
> If you are hosting your website on hosting providers like Netlify, Vercel or Cloudflare, you will also need to add the environment variables there.

### Giscus

[Giscus](https://giscus.app/) uses your github repo's discussions feature to store your comments and display them on your site.

#### Prerequisites

1.  You have a public [github repository](https://docs.github.com/en/get-started/quickstart/create-a-repo) with the [discussions](https://docs.github.com/en/github/administering-a-repository/managing-repository-settings/enabling-or-disabling-github-discussions-for-a-repository) feature activated which will be used to store your comments.
2.  The [giscus app](https://github.com/apps/giscus) installed in your repo by following their configuration setup at [https://giscus.app/](https://giscus.app/)

Once the above steps are completed, head over to [https://giscus.app](https://giscus.app/) and follow the steps there by filling out the fields to get your config values.

> [!important]
> Make sure to choose `pathname` under page discussions mapping.

After filling out the fields, you will be provided with a script tag that contains your config values. Add them to your `.env` file, like so:

```
NEXT_PUBLIC_GISCUS_REPO=
NEXT_PUBLIC_GISCUS_REPOSITORY_ID=
NEXT_PUBLIC_GISCUS_CATEGORY=
NEXT_PUBLIC_GISCUS_CATEGORY_ID=
```

When a user visits a web page, Giscus searches for a discussion whose title contains the page's pathname URL component. If there are no matches (i.e., no comments have been made about that page), then a new discussion is created for that page.

By using the pathname for mapping with a page, Giscus ensures that each discussion is unique to a particular page and that comments made on that page are kept together.

More info on how this connection is achieved can be found on their '**how it works**' section in their repo - [https://github.com/giscus/giscus#how-it-works](https://github.com/giscus/giscus#how-it-works) and also in the '**Page Discussions Mapping**' section at [https://giscus.app/](https://giscus.app/)

### Utterances

[Utterances](https://utteranc.es/) uses your github repo's issues to store comments for your pages and display them on your site. To setup comments with utterances, you would need to do the following:

#### Prerequisites

1.  You have a public [github repository](https://docs.github.com/en/get-started/quickstart/create-a-repo)
2.  The utterances app installed in your repo by following their configuration setup at [https://utteranc.es/](https://utteranc.es/)

Once installed fill in the required fields and you will see a script tag with your repo value which you can add to your `.env` file, like so:

```
NEXT_PUBLIC_UTTERANCES_REPO=
```

### Disqus

[Disqus](https://disqus.com/) is a feature rich provider which can be used to add comments to your site. You can configure flowershow to use disqus by creating an account on their site and following their process. You will be asked to enter a shortname for your site. Once completed, we can use this shortname in our comments configuration as below.

#### Prerequisites

1.  Create an account on [Disqus](https://disqus.com/) and follow their setup process.

You will be asked to enter a shortname for your site. Add it to your `.env` file as well, like so:

```
NEXT_PUBLIC_DISQUS_SHORTNAME=
```

## Add comments to your page layout

You can use `@portaljs/core` to import the comments section component. Install it with:

```sh
npm i @portaljs/core
```

Then, add the following to your custom layout (or directly to your pages):

```tsx
import Navbar from './navbar';
import Footer from './footer';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <div>
        <Comments commentsConfig={commentsConfig} slug={urlPath} />
      </div>
      <Footer />
    </>
  );
}
```
