---
title: Searching datasets
description: 'Learn how to create a searchable datasets index with facets on a PortalJs data portal'
---

Typing out every link in the index page will get cumbersome eventually, and as the portal grows, finding the datasets you are looking for on the index page will become harder and harder, for that we will need search functionality.

## Creating a search page

Luckily we have a component for that. Change your `content/index.md` file to this:

```
# Welcome to my data portal!

List of available datasets:

<Catalog datasets={datasets} />
```

Before you refresh the page, however, you will need to run the following command:

```
npm run mddb
```

This example makes use of the [markdowndb](https://github.com/datopian/markdowndb) library. For now the only thing you need to know is that you should run the command above everytime you make some change to `/content`.

From the browser, access http://localhost:3000. You should see the following, you now have a searchable automatic list of your datasets:

![Simple data catalog built with PortalJS](https://i.imgur.com/9HfSPIx.png)

To make this catalog look even better, we can change the text that is being displayed for each dataset to a title. Let's do that by adding the "title" [frontmatter field](https://daily-dev-tips.com/posts/what-exactly-is-frontmatter/) to the first dataset in the list. Change `content/my-awesome-dataset/index.md` to the following:

```
---
title: 'My awesome dataset'
---

# My Awesome Dataset

Built with PortalJS

## Table

<Table url="data.csv" />
```

Rerun `npm run mddb` and, from the browser, access http://localhost:3000. You should see the title appearing instead of the folder name:

![Example of a newly added dataset on a data catalog built with PortalJS](https://i.imgur.com/nvmSnJ5.png)

Any frontmatter attribute that you add will automatically get indexed and be usable in the search box.

## Adding filters

Sometimes contextual search is not enough. Let's add a filter. To do so, lets add a new metadata field called "group", add it to your `content/my-incredible-dataset/index.md` like so:

```
---
group: 'Incredible'
---

# My Incredible Dataset

This is my incredible dataset.

## Chart

<LineChart
    title="US Population By Decade"
    xAxis="Year"
    yAxis="Population (mi)"
    data="my-incredible-data.csv"
/>
```

Also add it to your `content/my-awesome-dataset/index.md` like so:

```
---
title: 'My awesome dataset'
group: 'Awesome'
---

# My Awesome Dataset

Built with PortalJS

## Table

<Table url="data.csv" />
```

Now on your `content/index.md` you can add a "facet" to the `Catalog` component, like so:

```
# Welcome to my data portal!

List of available datasets:

<Catalog datasets={datasets} facets={['group']}/>
```

Rerun `npm run mddb`. You now have a filter in your page with all possible values automatically added to it.

![Data catalog with facets built with PortalJS](https://i.imgur.com/p2miSdg.png)

In the next lesson, you are going to learn how to display metadata on the dataset page.

<DocsPagination prev="/docs/creating-new-datasets" next="/docs/showing-metadata" />
