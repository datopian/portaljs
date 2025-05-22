---
title: Validate your Data Package descriptor online
created: 2018-04-19
authors: ['acckiygerman']
---

To help users with creation of Data Packages we have implemented a descriptor validation tool:

https://datahub.io/tools/validate

Now users can check the Data Package descriptor to be sure they have no errors in it.

## How to use it

The descriptor should be stored online, e.g. on the github.

You should provide the URL to the descriptor (datapackage.json) file and press 'Validate' button.

:::info
Online validator tool validates only the descriptor file.

Here you can read about the [full data validation on the DataHub](https://datahub.io/blog/data-validation-in-the-datahub).
:::

## How we validate

We try to create a Data Package object using [datapackage-js](https://github.com/frictionlessdata/datapackage-js) and then show user any errors the Data Package has with `Package.valid` and `Package.errors` methods. For example, here we validate following [datapackage.json](https://raw.githubusercontent.com/frictionlessdata/test-data/master/packages/invalid-descriptor/datapackage.json) file that has invalid `name` property:

![online-validation-tool-invalid-package](/static/img/docs/online-validation-tool-invalid-package.png)

To create a valid Data Package, please read full datapackage.json specs here:

https://frictionlessdata.io/docs/data-package/
