---
title: Auto-publish your datasets using Travis-CI
created: 2018-05-23
authors: ['anuveyatsu']
---

In this tutorial, we provide instructions on how to automate publishing your dataset via [Travis-CI]. If you prefer hosting and controlling your dataset on GitHub, you'd find this tutorial useful. Before reading further, please, make sure you're familiar with GitHub and Travis-CI as you'll need to enable builds for your repository.

[Travis-CI]: https://travis-ci.org/

Let's consider the request we've received recently for auto-publishing the dataset from the following repository:

https://github.com/datasets/dac-crs-codes

Please, read through the issue thread here to understand the problem: https://github.com/datahq/datahub-qa/issues/213.

## Setup

Our goal is to trigger a publishing on every commit to 'master' branch. To do so we'll use the [data] CLI tool for interacting with DataHub, which is available via [NPM]. Below is how the configuration file (`.travis.yml`) for Travis-CI would look like:

```yaml
language: node_js
node_js:
  - "8"
install: npm install -g data-cli
script: data push --public
branches:
  only:
  - master
```

This instructs Travis-CI to install 'data' CLI tool via NPM and publish the dataset with 'public' option which makes it publicly available. It assumes that there is a `datapackage.json` file in the root directory of the repository.

[data]: https://datahub.io/download
[NPM]: https://www.npmjs.com/package/data-cli

## Credentials

If you try to trigger a build, it wouldn't publish anything to DataHub since you need to set credentials. Provide `token`, `id` and `username` values of your DataHub account as environment variables - go to your Travis-CI settings and add the required key-value pairs. We recommend not displaying values in build log for security reasons. Additionally, you may need to setup `env` variable with `test` value to overcome some Travis specific errors.

![setting env variable test to overcome some travise specific errors](https://raw.githubusercontent.com/datahq/datahub-content/master/assets/img/travis-ci-env-vars.png)

## Final steps

Now, you should be able to trigger a Travis-CI build by pushing a commit into 'master' branch. If builds are not starting, make sure that 'Build pushed branches' option is enabled in the settings.
