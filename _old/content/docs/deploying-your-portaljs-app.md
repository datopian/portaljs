---
title: Deploying your PortalJS app
description: 'Learn how to deploy PortalJS apps to Vercel and Cloudflare'
---

Finally, let's learn how to deploy PortalJS apps to Vercel or Cloudflare Pages.

> [!tip]
> Although we are using Vercel and Cloudflare Pages in this tutorial, you can deploy apps in any hosting solution you want as a static website by running `npm run export` and distributing the contents of the `out/` folder.

## Push to a GitHub repo

The PortalJS app we built up to this point is stored locally. To allow Vercel or Cloudflare Pages to deploy it, we have to push it to GitHub (or another SCM supported by these hosting solutions).

- Create a new repository under your GitHub account
- Add the new remote origin to your PortalJS app
- Push the app to the repository

If you are not sure about how to do it, follow this guide: https://nextjs.org/learn/basics/deploying-nextjs-app/github

> [!tip]
> You can also deploy using our Vercel deploy button. In this case, a new repository will be created under your GitHub account automatically.
> [Click here](#one-click-deploy) to scroll to the deploy button.

## Deploy to Vercel

The easiest way to deploy a PortalJS app is to use Vercel, a serverless platform for static and hybrid applications developed by the creators of Next.js.

To deploy your PortalJS app:

- Create a Vercel account by going to https://vercel.com/signup and choosing "Continue with GitHub"
- Import the repository you created for the PortalJS app at https://vercel.com/new
- During the setup process you can use the default settings - no need to change anything.

When you deploy, your PortalJS app will start building. It should finish in under a minute.

When it’s done, you’ll get deployment URLs. Click on one of the URLs and you should see your PortalJS app live.

> [!tip]
> You can find a more in-depth explanation about this process at https://nextjs.org/learn/basics/deploying-nextjs-app/deploy

### One-Click Deploy

You can instantly deploy our example app to your Vercel account by clicking the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdatopian%2Fportaljs%2Ftree%2Fmain%2Fexamples%2Flearn-example&project-name=my-data-portal&repository-name=my-data-portal&demo-title=PortalJS%20Learn%20Example&demo-description=PortalJS%20Learn%20Example%20-%20https%3A%2F%2Fportaljs.org%2Fdocs&demo-url=learn-example.portaljs.org&demo-image=https%3A%2F%2Fportaljs.org%2Fassets%2Fexamples%2Fbasic-example.png)

This will create a new repository on your GitHub account and deploy it to Vercel. If you are following the tutorial, you can replicate the changes done on your local app to this new repository.

## Deploy to Cloudflare Pages

To deploy your PortalJS app to Cloudflare Pages, follow this guide:

https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#deploy-with-cloudflare-pages-1

Note that you don't have to change anything - just follow the steps, choosing the repository you created.

<DocsPagination prev="/docs/showing-metadata" />
