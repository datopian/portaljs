---
title: Data Validation in the DataHub
created: 2018-01-24
authors: ['rufuspollock', 'anuveyatsu']
---

Users can now use the DataHub to validate their tabular data, for example checking that dates really are dates or that a column of daily revenue is always positive.

Data validation is also integrated as part of the data publishing flow making it easier to debug general errors -- the most common issue we've found in our own publishing experience is a typo in a data value that then breaks graphing or other data presentation and processing.

## How to use it

Data Validation now happens automatically for you whenever you push data to the DataHub so to validate data in a file or data package just push it to the DataHub:

```
# Note: in this case DataHub will auto-infer the types of the columns
data push myfile.csv

# a data package
cd my-data-datapackage
data push
```

:::info
You can find more about pushing data to the DataHub [here](http://datahub.io/docs/getting-started/publishing-data).
:::

You may need to customize the schema for your file -- perhaps DataHub has guessed the types wrong.

## How we validate

We use the Table Schema for your data file along with the powerful [goodtables library](https://github.com/frictionlessdata/goodtables-py) to validate your data and generate a JSON validation report.

This report is then used in your dataset page to show you a human-readable version of the errors (a JSON version is also available).

## Validation reporting on the Showcase Page

Results of the report will be displayed in an easy to understand form. Specifically, if there are errors you will see a detailed report like this:

![Results of the Validation report](/static/img/docs/validation-report-vix-daily.png)

This table displays errors in a validation report. You can see that in the example above we have 3 badges indicating key details (`INVALID` `SCHEMA` `985`) and `Type or Format Error` message. It means 985 values have type or format errors when validating against the schema. Details can be expanded by clicking on "Error details" link on the right. You also can find values causing this error on the table - they have a red background colour. By default, we show first 10 rows but you can open more of them by clicking on "Show next 10 rows" link.

In the screenshot below, you can see how a validation report looks like for "Minimum Constraint" error. Revenue value cannot be negative so we've set `constraints` property with a `minimum` attribute as 0 and validation process identified which value is not meeting that requirement:

![validation report revenue](/static/img/docs/validation-report-revenue.png)

Below are properties that you can use in a table schema for validation of your data:

* `constraints` - you may use this property to validate field values, e.g., a column with "Daily Revenue" or "Sales" must be a positive number so you'd have a `minimum` attribute set to 0.
* `type` is a string indicating the type of this field, e.g., `string` or `number`.
* `format` is a string indicating a format for the field type, e.g., you can have `email` format for `string` type so it validates if values in the field are emails.
* other properties such as `missing values` can be used to indicate a special value for empty entries, e.g., `-` or `N/A`.

You can find full table schema specs here https://frictionlessdata.io/specs/table-schema.
