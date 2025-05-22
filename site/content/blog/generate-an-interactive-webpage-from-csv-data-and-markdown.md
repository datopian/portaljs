---
title: "Generate an interactive webpage from CSV data and markdown"
created: 2022-03-14
authors: ["Rising Odegua"]
---

## Getting Started

This tutorial will help you get started with the Datahub pages, and how you can use it to create data driven webpages from static data. 

Data pages you will create can be deployed with static site hosting providers like Github pages. Cloudfare pages, Netlify, or Vercel. 

Here's an [example of a hosted Datahub page](https://datahub.io/collections/demographics) showing how data, text and simple charts can be displayed. 

In this tutorial, we aim to keep things simple, so we'll show you how you can turn a CSV and a ReadMe into a Datahub page. 

## Set up

### Prepare your data folder

* Create new data folder and add your CSV data. We'll be using a folder called `my-data` and a CSV data called `data.csv`
* Add a `README.md` file with some markdown content. You can also add and use custom Datahub components like TableGrid, and LineCharts. See [this example](https://github.com/datopian/portal.js/blob/main/examples/data-literate/pages/demo.mdx)
* For example to display your data as a Table in the page, you can add the following to your `README.md` file:

```markdown
<TableGrid url='data.csv' /> 
```

* At the end you should have a data folder with the following structure:

```bash

├── my-data

     └── data.csv

     └── README.md
```
### Initialize Datahub page from template

Now that you have your data folder created and saved. In a new folder, you're going to initialize your datahub page, using a template we have provided. Follow the steps below to achieve this:

* Run the following command in your terminal to install and create your datahub page from our template. You can always change the name of the folder from `datahub-pages-example`  to anything you like:

```bash
npx create-next-app@latest --example https://github.com/datopian/portal.js/tree/main/examples/data-literate-template datahub-pages-example
```

* Navigate into the folder:

```bash
cd datahub-pages-example
```

* Next you'll copy data files from your data folder into Datahub page. We have provided a handy script to automatically do this for you. All you need to do is pass the full/relative path to your data folder

```bash
node datahub-portal-local-cli.js ./my-data
```
## Test Locally

After copying the files with the `datahub-portal-local-cli.js`, you should have the data.csv file in the `public` folder, and the README.md file in the pages folder under the name `index.mdx`. 
Now we can view the generated page locally by running:

```
npm run dev  
```

This will start the development server, and you can view the page by navigating to http://localhost:3000

## Deployment

The generated page from above is a static Next.js webpage. As such you can deploy it anywhere Next.Js sites can be deployed. The following platforms support deployment of Next.js sites, and you can yse anyone of your choice:

* [Vercel](https://nextjs.org/docs/deployment#managed-nextjs-with-vercel)
* [Cloudfare pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
* [Netlify](https://www.netlify.com/blog/2021/03/16/try-the-new-essential-next.js-plugin-now-with-auto-install/)
* [Github pages](https://gregrickaby.blog/article/nextjs-github-pages)

## Conclusion

We are working towards adding new and better features to Datahub pages. You can request or suggest features in your issue tracker on Github [here](https://github.com/datopian/next.datahub.io/issues).

## Resources

* [Portal.js](https://github.com/datopian/portal.js#component-list) provides custom components you can use in your data pages
* [Demo page](https://datahub.io/collections/air-pollution) a live Datahub page deployed on Cloudfare
