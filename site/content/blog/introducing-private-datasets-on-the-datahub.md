---
title: Introducing private datasets on the DataHub
created: 2017-12-13
authors: ['anuveyatsu', 'rufuspollock']
---

Today we are releasing support for **private** datasets on the DataHub. Private datasets are exactly that: private and visible and accessible only to their owners.

This feature is designed to support several use cases. First, simply storing (and sharing) private data. Second, keeping data private prior to publication -- now users have a way to push data, check it and only make it public when they are ready.

The private datasets feature is available on a trial basis to all DataHub users. If you want to use it on an ongoing basis you'll want to sign up for premium membership:

https://datahub.io/pricing

## How to publish private datasets?

You can use either the command line tool or the "Data" desktop app. Please, visit our download page to find out more about available tools:

https://datahub.io/download

### Publish using the "Data" app

Once you are ready to publish your data, just select "private" option and then press "Go" button:

![just select "private" option and then press "Go" button](/static/img/docs/push-private.png)

:::info
Learn more about using the "Data" app [here](http://datahub.io/blog/data-desktop-app-alpha-release).
:::

### Publish using the command line tool

Simply pass `--private` flag when you "push" your data so once it is processed and online only you can view it:

```
$ data push myData --private
```

:::info
Learn more about how to publish datasets using the CLI [here](http://datahub.io/docs/getting-started/publishing-data).
:::


## Making a Private Dataset Public

Just publish the dataset again but set the findability to public.
