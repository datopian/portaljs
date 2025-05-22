---
title: "Excel Files on the DataHub: Automated Previews and Data Extraction"
created: 2017-10-16
authors: ['anuveyatsu']
---

In this tutorial, we will explain how to push Excel data to the DataHub. When an Excel file is pushed, we can extract data from selected sheets for previewing and downloading in alternative formats. By default, our CLI tool would process only first sheet of the Excel, but publishers can specify any sheets they want.

## Get some Excel data

If you have an Excel file you can use it for this tutorial. Otherwise, we have prepared an example file, which you can simply get by using the CLI tool:

```
data get https://github.com/datapackage-examples/excel/raw/master/excel.xlsx
```

which saves the file in the current working directory. You can inspect the contents before pushing:

```
data cat excel.xlsx
```

and it would prompt you to select a sheet. Let's select the first sheet so it will output a table with its content in the standard out:

```cli-output
| Mean   | Uncertainty |
| ------ | ----------- |
| 338.8  | 0.1         |
| 339.99 | 0.1         |
| 340.76 | 0.1         |

...
```

## Push the data

Now we can push the file to the DataHub:

```bash
data push excel.xlsx
```

By default, only first sheet is processed. You should get success message like this:

```cli-output
🙌  your data is published!

🔗  https://datahub.io/{your-username}/{dataset-name} (copied to clipboard)
```

You can just open your browser and paste the link, which is already copied to your clipboard.

## Your data's online!

Once your data is online, you will see the following page:

![your online data](/static/img/docs/showcase-excel-1.png)

:::info
DataHub may still be processing your data. In this case you will see an appropriate message on the page. Just allow it couple of moments and it will be there!
:::

We have converted the first sheet to CSV. If you take a look at downloads table, there are options to get data in CSV or JSON versions. Also, you still can download your original data:

![download your original data in csv or json](/static/img/docs/showcase-downloads-excel-1.png)

Scrolling down, you can find a preview table of your data:

![preview table of your data](/static/img/docs/showcase-preview-excel-1.png)

## Processing multiple sheets

Sometimes, you need to process multiple sheets from your Excel file or you just need a sheet other than the first one. In such situations, you can use `--sheets` option when pushing your data to DataHub. In our sample data, we have 2 sheets and in the example above we have pushed only the first one. Now, let's push both of them:

```bash
data push excel.xlsx --sheets=all
```

We have used `--sheets=all` option to specify that we want to push "all" sheets. You also can list sheet numbers, e.g., `--sheets=1,2`. If you wanted to push only the second sheet, you would do `--sheets=2`.

**Note:** *sheet number starts from 1.*

Again, you should get a success message with the link to your data:

```cli-output
🙌  your data is published!

🔗  https://datahub.io/{your-username}/{dataset-name} (copied to clipboard)
```

By opening the link, you would see the following page:

![By opening the link, you would see the following page](/static/img/docs/showcase-excel-2.png)

We have converted all sheets of the file to CSV so now you can download each of them in CSV or JSON formats:

![converted all sheets of the file to CSV so now you can download each of them in CSV or JSON formats](/static/img/docs/showcase-downloads-excel-2.png)

You also can find preview tables for each sheet by scrolling down the page.
