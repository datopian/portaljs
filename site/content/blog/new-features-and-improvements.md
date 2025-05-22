---
title: New Features and Improvements
created: 2018-03-26
authors: ['acckiygerman']
---

Good day, dear data miners, scientists and statisticians!

During the last month we were focused on polishing the existing product - DataHub platform and the **data-cli** tool. Also we added number of new features.

## New ways to share data

Say, you are creating PhD thesis or a blog article. And you need to share some data in a pretty-looking form? That's so easy with the DataHub - just [upload your data](https://datahub.io/docs/getting-started/publishing-data)  and follow steps below.

### Share data tables

Each dataset on the datahub.io has preview tables for tabular data. Now you can share or embed them:

![preview tables for tabular data. Now you can share or embed them](/static/img/docs/share-embed-tables.png)

The **Share link** opens the table in the full-screen mode. Your colleague can easily find data and copy the entire table (or some part of it) to the clipboard and paste into the excel file, google sheets etc.

The **Embed snippet** allows you to integrate the table into your HTML document or a web-site:

<iframe src="https://datahub.io/core/gini-index/r/0.html" width="100%" height="300px" frameborder="0"></iframe>

**Note:** preview table contains only 2000 rows of original data to avoid possible browser crash cause of the big data.

### Share views and graphs

The same idea works with graphs - each view for a dataset could be easily shared or embedded into your web-page using the links under the view:

![each view for a dataset could be easily shared or embedded into your web-page using the links](/static/img/docs/share-embed-graphs.png)

and here is the embedded version right here:

<iframe src="https://datahub.io/core/gini-index/view/0" width="100%" height="475px" frameborder="0"></iframe>

## Other small features

- Data push command now shows a progress-bar when uploading files
- User can add custom titles and axis suffixes to the views
- TSV files are supported now
- DataHub [API documentation](https://datahub.io/docs/features/api) has been added.
