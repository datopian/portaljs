---
title: "Setup Guide: Create a data catalog with PortalJS and CKAN to share your data stories"
authors: ['Luccas Mateus']
date: 2023-04-20
filetype: blog
---

The ckan-example added to PortalJS is intended to provide users with an easy way to set up a data catalog that can be used to display and share data stores behind a CKAN Backend. With this example, users can quickly set up a web-based portal that allows them to showcase their data and make it accessible to others, all this being done just by adding a simple env variable pointing to a CKAN Deployment.

## Demo

To get a feel of the project, users can check the [live deployment](https://ckan-example.portaljs.org).

Below are some screenshots:

#### Front page

![](https://i.imgur.com/NlTAIAg.png)

#### Individual dataset page

![](https://i.imgur.com/RRoIlGf.png)

## How to use this example as a template

- Create a new app with `create-next-app`:

```
npx create-next-app <app-name> --example https://github.com/datopian/datahub/tree/main/examples/ckan-example
cd <app-name>
```

- This project uses CKAN as a backend, so you need to point the project to the CKAN Url desired, you can do so by setting up the `DMS` env variable in your terminal or adding a `.env` file with the following content:

```
DMS=<ckan url>
```

- Run the app using:

```
npm run dev
```

Congratulations, you now have something similar to this running on `http://localhost:3000`
![](https://media.discordapp.net/attachments/1069718983604977754/1098252297726865408/image.png?width=853&height=461)
If yo go to any one of those pages by clicking on `More info` you will see something similar to this
![](https://media.discordapp.net/attachments/1069718983604977754/1098252298074988595/image.png?width=853&height=461)

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdatopian%2Fdatahub%2Ftree%2Fmain%2Fexamples%2Fckan-example&env=DMS&envDescription=URL%20For%20the%20CKAN%20Backend%20Ex%3A%20https%3A%2F%2Fdemo.dev.datopian.com)

By clicking on this button, you will be redirected to a page which will allow you to clone the content into your own github/gitlab/bitbucket account and automatically deploy everything.

## Extra commands

You can also build the project for production with

```
npm run build
```

And run using the production build like so:

```
npm run start
```


## Links

- [Repo](https://github.com/datopian/datahub/tree/main/examples/ckan-example)  
- [Live Demo](https://ckan-example.portaljs.org)  

