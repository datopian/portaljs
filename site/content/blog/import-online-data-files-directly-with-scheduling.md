---
title: Import online data files directly with scheduling
created: 2017-11-14
authors: ['anuveyatsu', 'rufuspollock']
---

Users can now import online data files directly into the DataHub using the `data` command line tool -- and setup scheduled re-imports at the same time.

We're very excited about this feature as it is the first step in supporting automated scraping and doing this on a regular schedule. This is something we ourselves have long wanted for our [Core Data work][core data] and we're already using the feature ourselves.

[core data]: https://datahub.io/core

## An example

We'll use an example of the "Energy consumption by sector" from the US Energy Information Administration. This data is updated on monthly basis so we want it to be re-imported every 30 days (~1 month):

```
data push https://www.eia.gov/totalenergy/data/browser/csv.php?tbl=T02.01 --schedule="every 30d" --format=csv
```

:::info
By default, when you push datasets to DataHub, they are "unlisted" so only people with the link can see it. If you wish to make your dataset "published", you need to pass `--published` option: `data push URL --published`.
:::

Once the process is completed open your browser and check it out! It would generate a URL using your username, which will be copied to clipboard so you can just open a browser and paste it. You should see something similar to this page:

![page generated with your name url](/static/img/docs/scheduled-data.png)

Note: We've decided to still use the push command, even though unlike local data you are not "pushing" it but rather importing it. [Read more about the `push` command in our getting started guide][getting-started].

[getting-started]: http://datahub.io/docs/getting-started/publishing-data

### Set up a Schedule

You can  setup a schedule so the DataHub will automatically re-import the remote file on a regular basis. E.g., `every 90s`, `every 5m`, `every 2d` etc. The number is always an integer, selector is `s/m/h/d/w` (second -> week) and you can’t schedule for less than 60 seconds.

In our example above the dataset is updated on monthly basis so we have the schedule that runs every 30 days:

```bash
--schedule="every 30d"
```

This data file will then re-imported monthly.

To read more including full details of the schedule format see our [full docs on importing online data to the DataHub].

### Provide file format explicitly

If the file URL does not contain conventional file name, you need to provide its format explicitly by using `--format` option. See how we did it in our example above:

```bash
--format=csv
```
