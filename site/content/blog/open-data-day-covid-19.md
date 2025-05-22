---
title: "Open Data Day 2020 and COVID-19 data"
authors: ["michael.polidori"]
created: 2020-03-17
tags: ['COVID-19', 'Open Data Day']
---

Here at DataHub and [Datopian](https://www.datopian.com/), we recently celebrated [Open Data Day 2020](https://opendataday.org/). If you're not familiar with Open Data Day, it's an annual worldwide celebration of open data.

For part of our day, we decided to clean up and package some data on COVID-19 (coronavirus). The data includes **province/state**, **country/region**, **latitude**, **longitude**, **date**, **confirmed**, **recovered**, and **deaths**. Our source was from the [Data Repository by Johns Hopkins CSSE](https://github.com/CSSEGISandData/COVID-19), which is updated daily by [Johns Hopkins Whiting School of Engineering](https://systems.jhu.edu/).

To clean up the data, we used a Python library called dataflows, which is available in the [PyPI](https://pypi.org/project/dataflows/), and on [GitHub](https://github.com/datahq/dataflows). We used this library to unpivot the data, accumulate the daily cases, and consolidate our 3 sources (Johns Hopkins has separate CSV files for cases: [confirmed](https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv), [recovered](https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv), and [deaths](https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv)).

The source code and results can be found on [GitHub](https://github.com/datasets/covid-19), and a published dataset can be found here on [DataHub](https://datahub.io/core/covid-19). Our next step is to release a visualization.

Whether or not you've participated in Open Data Day before, we hope to see you participate next year!
