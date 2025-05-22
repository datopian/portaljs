---
title: How to initialize a data package using data tool
created: 2018-05-14
authors: ['anuveyatsu']
---

In this article we explain how easy is adding a `datapackage.json` file for your data. You need to have `data` tool installed - [download it](https://datahub.io/download) and follow these [instructions](https://datahub.io/docs/getting-started/installing-data).

:::info
If you're not familiar with `datapackage.json`, please, read this article - https://datahub.io/docs/data-packages.
:::

Below is how our project looks like initially:

```cli-output
$ ls

README.md   sample.csv   sample.json
```

We will use `data init` command to create a `datapackage.json` file for this project below.

## Default mode

By default, `data init` command runs in non-interactive mode. No arguments and options are required, it will scan current working directory and all nested directories for the available files:

```cli-output
$ data init

\> This process initializes a new datapackage.json file.

\> Once there is a datapackage.json file, you can still run 'data init' to update/extend it.

\> Press ^C at any time to quit.

\> Detected special file: README.md

\> sample.csv is just added to resources

\> sample.json is just added to resources

\> Default "ODC-PDDL" license is added. If you would like to add a different license, run 'data init -i' or edit 'datapackage.json' manually.

\> 💾 Descriptor is saved in "datapackage.json"
```

and now the project contains `datapackage.json`:

```cli-output
$ ls

README.md  datapackage.json  sample.csv  sample.json
```

If you take a look at `datapackage.json`, you'd mention that:

* it uses name of the current working directory as `name` property and generates `title` from it
* it adds `sample.csv` and `sample.json` files into `resources` list with schema for tabular data
* it detects `README.md` and uses its content in `readme` property; `description` property is the first 100 characters of the readme
* it adds default `ODC-PDDL` license

## Interactive mode

If you need more control, e.g., you want to add only certain files, scan certain directories and add a different license, you can use `init` command in interactive mode:

```
$ data init -i
```

## What's next?

You can now deploy your dataset to DataHub:

```
$ data push
```

Want to learn more? Visit our docs page - https://datahub.io/docs
