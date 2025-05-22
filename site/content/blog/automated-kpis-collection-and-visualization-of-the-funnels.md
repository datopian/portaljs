---
title: Automated KPIs collection and visualization of the funnels
created: 2018-07-10
authors: ['branko-dj']
---

As a platform dedicated to providing access to high quality data and tooling we need to measure how useful our users find DataHub's services. Measurable values like how many users we have, site traffic, how many people run our `data` CLI tool, how many of our datasets are published etc. are all key performance indicators (KPIs) that demonstrate how effectively we do as a company in terms of achieving our key business objectives.

In order to monitor our KPIs, we want to do the followings:

* collect KPIs from Google Analytics and internal APIs so we can keep all stats in the one place;
* package the CSV data and publish it to DataHub so we have a standardized, cleaned and validated dataset of our KPIs;
* add visualizations to easily and quickly see insights.

## The problem of KPIs tracking

In order to keep up-to-date with the usage of our website and services, we collect stats from various sources - our SQL database, our search API, Google Analytics for datahub.io, etc. This process of collection had been done manually at first which presented significant problems for us - it was time consuming and prone to human error as it required tediously scrolling pages and clicking buttons for a long period of time that got longer the more stats we decided to collect.

## Solution that we created to tackle tracking challenges

To address these issues we have created a scalable model for stats collection outlined in a github repo [datahub-metrics](https://github.com/datahq/datahub-metrics) with the task of collecting daily, weekly and biweekly stats for datahub.io and its services. The script is written in Python and it is ran automatically via cronjob on Travis. After collecting these stats, CSV data files are created.

Once we've automated KPIs collection, we wanted to output it on DataHub so our team can easily get insights.

### Publish on DataHub

First we needed to package CSV data files so they have a standard metadata. We then wanted to publish it on DataHub so the team can access cleaned, normalized and validated data.

With our `data` CLI tool we can add metadata for our CSV files by running `data init`. This creates a JSON file `datapackage.json`, which contains information about the name, format and data type of the columns, encoding, missing values etc.:

```json
{
    "name": "datahub-metrics",
    "title": "Datahub metrics",
    "resources": [...]
}
```

*See full `datapackage.json` [here](https://github.com/datahq/datahub-metrics/blob/master/datapackage.json).*

Once the data is packaged, we just need to upload it to DataHub. By running `data push` command from the root directory of the dataset we have following link of our published data:

https://datahub.io/datahq/datahub-metrics

### Visualization of the funnels

Now we want to identify and visualize the funnels that gives us an idea about where we should improve.

We have defined couple of initial funnels that we think is important. We consider ratio of important KPIs against total unique visitors. This way we can tell if decrease in certain area caused by our latest implementations. We will visualize following KPIs:

1. New sign ups
2. Number of CLI downloads from the website

Below we have written how "views" property would look like in the `datapackage.json` file:

:::info
In order to define how the graphs should look like we add a "views" property to `datapackage.json` file that will tell DataHub platform to create graphs on our page. By just editing a few lines in "views" property we can easily change the appearance of our graphs on the whim. Things like which stats to create graph for, which time period to display, average and max values etc.
:::

```json
{
    "name": "datahub-metrics",
    "title": "Datahub metrics",
    "resources": ["..."],
    "views": [
      {
        "name": "funnels",
        "title": "Funnels",
        "resources": [
            {
              "name": "biweekly_stats",
              "transform": [
                {
                  "type": "formula",
                  "expressions": [
                    "data['Total new users'] * 100 / data['Total Unique Visitors']",
                    "data['Downloads CLI (GA)'] * 100 / data['Total Unique Visitors']"
                  ],
                  "asFields": [
                    "Percentage of total new users in the sprint",
                    "Percentage of total CLI downloads from website in the sprint"
                  ]
                }
              ]
            }
        ],
        "specType": "simple",
        "spec": {
          "group": "Date",
          "series": [
            "Percentage of total new users in the sprint",
            "Percentage of total CLI downloads from website in the sprint"
          ],
          "type": "line",
          "ySuffix": "%"
        }
      }
    ]
}
```

These specifications are rendered as below on the DataHub:

<iframe src="https://datahub.io/datahq/datahub-metrics/view/0" width="100%" height="475px" frameborder="0"></iframe>

By taking a look at this graph, we could say that number of CLI downloads significantly decreased since May 3, while number of sign ups remain at the same level. This must be due to redesign that we have implemented in the beginning of the May.

## Summary

By creating 'datahub-metrics' and automating it via Travis CI we drastically shortened the time needed for collecting stats. That which would take at least a half an hour on a daily basis is now being done in no time and at assigned times with no possibility of human error. Once the stats are assembled in clean CSV files we use data-cli to package and publish it. The `datapackage.json` file is thus created and by adding a view section to it we can create and format customized visualizations on our dataset page. Every time the stats files are updated, so are the graphs.

By doing this we have created a scalable model for stats collection and created reusable python modules for interacting with google analytics, sql database, google sheets etc. You can use our platform to keep track of stats for your website and services the same way we did. We hope that you will find our approach informative and useful in your projects where tracking user interactions with your website and services is paramount.
