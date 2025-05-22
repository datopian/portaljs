---
title: "COVID-19 and Compartmental Models in Epidemiology"
created: 2020-05-08
authors: ["rufuspollock"]
tags: ['COVID-19', 'epidemiology', 'models', 'curve-fitting', 'epidemic']
---

The severity of the current SARS-CoV-2 epidemic is undeniable: since the latest months of 2019, the COVID-19 outbreak is having a significant impact in the world at the macro level, starting its spread from China, then to the Asia-Pacific and then around the rest of the globe.

![Man sleeping on a bus during the COVID-19 outbreak in London](/static/img/blog/2020-05-05-covid19-models/edward-howell-IDhks1n8GYM-unsplash.jpg)

_Photo by Edward Howell on Unsplash_

---

## Models

### Introduction

More than 41 articles were published about COVID-19 just from the beginning of 2020, more than 10,000 GitHub forks of [CSSEGISandData](https://github.com/CSSEGISandData) were made, various open data sets (including [on GitHub](https://github.com/nties/COVID19-open-research-dataset) and [on Kaggle](https://www.kaggle.com/sudalairajkumar/novel-corona-virus-2019-dataset)) shared the number of cases and the number of people affected as well as other metrics.

Many scientists around the globe participated in a global hackathon, trying to address current issues (lockdowns, lack of resources, etc.), trying to fit, predict and estimate the impact. Which models from these ones are close to the reality and which ones have a chance to be implemented as solutions for humanitarian response?

### Basic Mathematical Models

There are various types of models in epidemiology, which are used for prediction of prevalence (total number of people infected), the duration of an epidemic spreading processes and other variables.

One of the most commonly used types are compartmental models, developed in the 1920s from the Kermack–McKendrick theory. In compartmental models, the population is divided into compartments of people with the same properties: people who are susceptible to the virus; those who have recovered; etc. There are three main types of compartmental models in epidemiology based on which many other models can be built upon:

- Susceptible-Infectious (SI), where each person can be in one of two states, either susceptible (S) or infectious (I);
- Susceptible-Infectious-Susceptible (SIS), where a person can be in one of two states, susceptible (S) or infectious (I), but can then become susceptible again;
- Susceptible-Infectious-Recovered (SIR), where a person can be in one of three states: susceptible (S), infectious (I) or recovered \(R\).

In the SIR model, one can study the number of people in each of three compartments: susceptible, infectious and recovered, denoted by the variables S, I and R correspondingly. The SIR system can be expressed by the set of ordinary differential equations proposed by O. Kermack and Anderson Gray McKendrick.

Another model, which has been proven to be much more realistic for some epidemics spreading models is the [SEIR model](https://www.medrxiv.org/content/10.1101/2020.03.20.20040048v1). The main idea of this model is that for many important infections, there is a significant incubation period during which individuals have been infected but are not yet infectious themselves. During this period, the individual is in a special state E (exposed), an additional state to three states in the SIR model.

![sirmodel-beta-mu-parameters](/static/img/blog/2020-05-05-covid19-models/sirmodel_beta_mu_parameters.png)

Some models described here are also explained [on this page](https://github.com/datasets/awesome-data/blob/master/coronavirus.md).

### "Fitting the Curve" - Issues to Consider

During COVID-19 many open data sources were gathered, which explains the temptation of fitting the curve to empirical data or inferring parameters of spreading models. Here, we list some of the main issues with simply trying to do "curve fitting" approach:

1. One of the first and simplest epidemiological model is the SI model. If you are in an infected state within this model, you stay infected forever. This one-way transition S → I is already not so realistic, at the same time the increasing number of infected cases can be obviously fit to the curves with the increasing number of cases, for example from this [time series](https://datahub.io/core/covid-19).
2. Issues with more complex models, such as SIR or SEIR are more delicate. If we assume that in the beginning of an epidemic the fraction of susceptible individuals is still around 1 and that the number of infected people is exponentially growing as <img src="/static/img/blog/2020-05-05-covid19-models/math_expr1.png" alt="math-expr-1"/>, we need to estimate the [basic reproduction number](https://en.wikipedia.org/wiki/Basic_reproduction_number) of the virus as <img src="/static/img/blog/2020-05-05-covid19-models/math_expr2.png" alt="math-expr-2"/>. The intuitive explanation of the basic reproduction number is the following: if each person is able to spread the disease to at least one other person before recovering, then the epidemic can continue, otherwise, if <img src="/static/img/blog/2020-05-05-covid19-models/math_expr3.png" alt="math-expr-3"/>, the epidemic dies off. The problem here is that in reality, the population is very heterogeneous: there is no such thing as a single type of infectious individual since immune systems are varying from one person to another. Hence even if estimated from the empirical data, the true value <img src="/static/img/blog/2020-05-05-covid19-models/math_expr4.png" alt="math-expr-4"/> will still need to be estimated with the confidence interval. For COVID-19 the estimates show that <img src="/static/img/blog/2020-05-05-covid19-models/math_expr5.png" alt="math-expr-5"/>.
3. In reality, one needs to take into account the information about so-called *incubation period*, the time elapsed between exposure to a pathogen, and when symptoms and signs start to appear. At the same time the effects from the mitigation policies, such as lockdown procedures, can be miscalculated using the simplest SIR models, since there total lockdown would correspond to <img src="/static/img/blog/2020-05-05-covid19-models/math_expr6.png" alt="math-expr-6"/>, which gives unrealistic results.

For more publications on COVID-19 please see recent peer-reviewed articles, such as [Fergusson et al.](https://www.medrxiv.org/content/10.1101/2020.03.09.20033357v1)

Find more illustrations and code by B.Goncalves at [Epidemiology101](https://github.com/DataForScience/Epidemiology101).

## Predictions of next waves and role of mobility data

Prediction of next waves of COVID19 can be made using various models, 
including classical simple SIR model or its variations. One can already see the effect of curve flattening by changing the parameters, such as mobility index or average number of interactions between people. For spatial statistics one may need to use spatially embedded models, such as more generic and complex models [Gleamviz model](http://www.gleamviz.org/).
For calibrating these models, 
one need to use expert-curated healthcare datasets available to COVID-19 researchers and data scientists.  Mobility trends are important components for prediction of epidemics spreading, therefore we are working on making finding open mobility datasets.
Below we collected some references of datasets and peer-reviewed publications:

1. Mobility data on the effect of confinement on mobility: [mobility data](https://github.com/datasciencecampus/google-mobility-reports-data/) on
mobility of people in residential, non-residential areas;
2. Mobility data and predictions from the perspective of so-called "mobility index" can be found on the website of Cuebiq and illustrated in [Gleamproject](https://covid19.gleamproject.org/mobility);
3. Recent work and overview of predictive modeling of spreading COVID19 made and explained simply by B.Gonsalves, network scientist and physicist [here](https://medium.com/data-for-science/visualizing-the-spread-of-covid-19-a4ea21ee8e46);
4. References resource of more than 128,000 scholarly articles about the novel coronavirus for use by the global research community: [coronawhy](https://www.coronawhy.org/cord19).


