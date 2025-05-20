---
title: 'Creating new datasets'
description: 'Learn how to create new datasets and an index for all datasets on a data portal built with PortalJS'
---

So far, the PortalJS app we created only has a single page displaying a dataset. Data catalogs and data portals generally showcase many different datasets.

Let's explore how to add and display more datasets to our portal.

## Pages in PortalJS

As you have seen, in this example a dataset page is just a markdown file on disk plus a data file.

To create a new data showcase page we just create a new markdown file in the `content/` folder and a new data file in the `public/` folder.

Let's do that now. Create a `content/my-incredible-dataset` folder, and inside this new folder create a `index.md` file with the following content:

```markdown
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

Now, create a file in `public/` named `my-incredible-data.csv` and put the following content inside it:

```bash
Year,Population (mi)
1980,227
1990,249
2000,281
2010,309
2020,331
```

Note that pages are associated with a route based on their pathname, so, to see the new data page, access http://localhost:3000/my-incredible-dataset from the browser. You should see the following:

<img src="/assets/docs/my-incredible-dataset.png" alt="Page of a new dataset created on a PortalJS data portal" />

> [!tip]
> In this tutorial we opted for storing content as markdown files and data as CSV files in the app, but PortalJS can have metadata, data and content stored anywhere.

## Create an index page

Now, let's create an index page. First, create a new folder `content/my-awesome-dataset/` and move `content/index.md` to it. Then, create a new file `content/index.md` and put the following content inside it:

```markdown
# Welcome to my data portal!

List of available datasets:

- [My Awesome Dataset](/my-awesome-dataset)
- [My Incredible Dataset](/my-incredible-dataset)
```

From the browser, access http://localhost:3000. You should see the following:

<img src="/assets/docs/datasets-index-page.png" alt="PortalJS data portal with multiple datasets" />

At this point, the app has multiple datasets, and users can find and navigate to any dataset they want. In the next lesson, you are going to learn how to improve this experience with search.

<DocsPagination prev="/docs" next="/docs/searching-datasets" />
