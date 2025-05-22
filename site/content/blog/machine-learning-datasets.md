---
title: Machine learning datasets
created: 2018-05-25
authors: ['svetozarstojkovic', 'branko-dj']
---

We have created a number of `machine learning` datasets that can be interesting for professionals and students from the field.

You can see our current machine-learning datasets at https://datahub.io/machine-learning

## Introduction

Machine learning is the science of making computers learn like humans do and to also improve their capabilities to learn to act without being explicitly programmed. It is used as a general term for computational data analysis: using data to make inferences and predictions. It combines computational statistics, data analytics, data mining and a good portion of data science. Machine learning algorithms are often categorized as supervised or unsupervised (“data mining”).

For more information please visit:
https://datahub.io/awesome#machine-learning-statistical

Example dataset:

| Column 1 | Column 2 | Column 3 | Class |
|----------|----------|----------|-------|
| 0        | 1        | 2        | 0     |
| 3        | 4        | 5        | 1     |
| 6        | 7        | 8        | 2     |
| 9        | 10       | 11       | 3     |
| 12       | 13       | 14       | 4     |

Using columns as input, machine learning algorithms can "learn" how to predict the appropriate output for any input.

Some of the more famous algorithms for supervised learning include:
* Neural networks
* Naive Bayes
* K - nearest neighbor
* Decision tree
* Support Vector Machines

Some of the more famous algorithms for unsupervised learning include:
* DB Scan
* K - means

All above algorithms can be applied on datasets that are located under the machine-learning user.

## Available datasets

Some interesting datasets you can take a look at:
* [Seismic bumps](https://datahub.io/machine-learning/seismic-bumps)
* [Hepatitis](https://datahub.io/machine-learning/hepatitis)
* [Cervical cancer](https://datahub.io/machine-learning/cervical-cancer)
* [Primary tumor](https://datahub.io/machine-learning/primary-tumor)
* [Fertility](https://datahub.io/machine-learning/fertility)
* [Breast cancer](https://datahub.io/machine-learning/breast-cancer)
* [Speed dating](https://datahub.io/machine-learning/speed-dating)
* [Dermatology](https://datahub.io/machine-learning/dermatology)
* [Lymph](https://datahub.io/machine-learning/lymph)
* [Tic Tac Toe Endgame](https://datahub.io/machine-learning/tic-tac-toe-endgame)
* [EEG Eye State](https://datahub.io/machine-learning/eeg-eye-state)

## Usage

* For those new to data science and machine learning you can dive in with analysis and practicing on our prepared datasets. No need to modify the raw unprocessed online data, we have already taken care of that.

* For those advanced in the study of machine learning you can get a wide range of well-prepared datasets (including well known ones) that you can practice on so that you can improve and focus your efforts on improving your understanding.

* For machine learning practitioners you can find up to date datasets that you can use for implementing newest classificators so that you can contribute to machine learning community or create projects for any organization you may work with.

Starting with machine learning will be shown on `hepatitis` dataset and in Python language:
https://datahub.io/machine-learning/hepatitis#python

### Getting a dataset
First thing to do is install datapackage library

```bash
pip install datapackage
```

Then you need to get your dataset using the "Import into your tool" (option at the bottom of the page)

```python
from datapackage import Package

package = Package('https://datahub.io/machine-learning/hepatitis/datapackage.json')

# print list of all resources:
print(package.resource_names)

# print processed tabular data (if exists any)
for resource in package.resources:
    if resource.descriptor['datahub']['type'] == 'derived/csv':
        print(resource.read())
```

### Input and output matrices

In the `hepatitis` dataset last column represents the class attribute which holds the information about whether the patient lived or died.

We will mark the number of columns with letter **m**, and number of instances with letter **n**

Input matrix will contain all elements from all columns except class which means that it's dimension will be **n** x **m-1**.

| n        | Column 1 | Column 2 | ...      | Column m-1 |
|----------|----------|----------|----------|----------
| 1        | x        | x        | ...      |  x
| 2        | x        | x        | ...      |  x
| ...      | ...      | ...      | ...      |  ...
| n        | x        | x        | ...      |  x

Output matrix will contain elements from class attribute and it's dimension will be **n**x**1**

| n        | Column 1(class) |
|----------|-----------------|
| 1        | x               |
| 2        | x               |
| ...      | ...             |
| n        | x               |

By using those matrices you will be able to pass them as a parameter to any classifier method.


## Summary

By using DataHub you can easily get the datasets you need and just start working on them without necessary data-wrangling and focus on creating machine learning algorithms. We hope you find them useful and interesting.
