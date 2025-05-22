---
title: How to use Data Packages from R
created: 2017-11-16
authors: ['mikanebu', 'anuveyatsu']
---

This tutorial demonstrates how to use Data Packages from R. We assume that you already know about [Data Packages](https://datahub.io/docs/data-packages) and its [specifications](https://frictionlessdata.io/specs/data-packages/).

## Example

Let's consider "VIX - CBOE Volatility Index" data here. The VIX dataset is a key measure of market expectations of near-term volatility conveyed by S&P 500 stock index option prices introduced in 1993:

https://datahub.io/core/finance-vix

There are several ways to get data in R, but in this tutorial, we are going to use robust, high performance JSON Parser `jsonlite` library:

```r
library("jsonlite")

json_file <- 'https://datahub.io/core/finance-vix/datapackage.json'
json_data <- fromJSON(paste(readLines(json_file), collapse=""))

# get list of all resources:
print(json_data$resources$name)
```

and you would get following table printed:

![list of all resources](/static/img/docs/r-screenshot-resources.png)


Our data is now available in different formats such as CSV, JSON, ZIP. To get it in the CSV format:

```r
# print all tabular data(if exists any)
for(i in 1:length(json_data$resources$datahub$type)){
  if(json_data$resources$datahub$type[i]=='derived/csv'){
    path_to_file = json_data$resources$path[i]
    data <- read.csv(url(path_to_file))
    print(data)
  }
}
```

![all tabular printed data](/static/img/docs/r-screenshot-data.png)
