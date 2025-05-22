---
title: "Setup Guide: Create a data catalog to display and share your GitHub datasets with PortalJS"
authors: ['Luccas Mateus']
date: 2023-04-20
filetype: blog
---

The github-backed example added to PortalJS is intended to provide users with an easy way to set up a data catalog that can be used to display and share data stored in GitHub repositories. With this example, users can quickly set up a web-based portal that allows them to showcase their data and make it accessible to others, all this being done thru the configuration of a simple `datasets.json` file.

## Demo

To get a feel of the project, users can check the [live deployment](https://example.portaljs.org).

Below are some screenshots:

#### Front page

![](https://i.imgur.com/jAljJ9C.png)

#### Individual dataset page

![](https://i.imgur.com/AoJd4O0.png)

## How to use this example as a template

> [!tip]
> You can also create a new project by clicking on the "Deploy" button below. Vercel will clone the example on a new repo under your user or organization on GitHub and set up a deployment  for it.
> Then, you can clone the new repo on your machine and start editing it. 

### Create a new app with `create-next-app`

Run the following commands:


```bash
npx create-next-app <app-name> --example https://github.com/datopian/datahub/tree/main/examples/github-backed-catalog
cd <app-name>
```

### Setup a GitHub token

This project uses the GitHub API, which for anonymous users will cap at 50 requests per hour, so you might want to get a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) and add it to a `.env` file inside the folder, like so:

```bash
GITHUB_PAT=<github token>
```

### Setup the datasets list

The `datasets.json` file serves as a list of datasets that should be in your data portal. Edit the this file to your liking. Some examples can be found inside this [repo](https://github.com/datasets):

### Run the app

Run the app by executing the following command:

```bash
npm run dev
```

Congratulations, your new app is now running at http://localhost:3000.

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdatopian%2Fdatahub%2Ftree%2Fmain%2Fexamples%2Fgithub-backed-catalog)

By clicking on this button, you will be redirected to a page which will allow you to clone the example into your own GitHub/GitLab/BitBucket account and automatically deploy it.

### GitHub token

You have to set up `GITHUB_PATH` as an environment variable on Vercel. To do that, go to the project's page on Vercel, then click settings, look for "Environment variables" and create a new environment variable. Refer back to the [previous section](#setup-a-github-token) if you are not sure about how to create a GitHub token.

### Editing the new deployment

You can now clone the new repo on your machine and start changing it. Simply follow the ["How to use this example as a template" section](#how-to-use-this-example-as-a-template) skipping the first step. 

> [!tip]
> Note that whenever you push changes to the new repo these are going to be automatically deployed by Vercel.

## Structure of `datasets.json`

The `datasets.json` file is simply a list of datasets, below you can see a minimal example of a dataset

```json
{
  "owner": "fivethirtyeight",
  "repo": "data",
  "branch": "master",
  "files": ["nba-raptor/historical_RAPTOR_by_player.csv", "nba-raptor/historical_RAPTOR_by_team.csv"],
  "readme": "nba-raptor/README.md"
}
```

It has

- A `owner` which is going to be the github repo owner
- A `repo` which is going to be the github repo name
- A `branch` which is going to be the branch to which we need to get the files and the readme
- A list of `files` which is going to be a list of paths with files that you want to show to the world
- A `readme` which is going to be the path to your data description, it can also be a subpath eg: `example/README.md`

You can also add

- A `description` which is useful if you have more than one dataset for each repo, if not provided we are just going to use the repo description
- A `Name` which is useful if you want to give your dataset a nice name, if not provided we are going to use the junction of the `owner` the `repo` + the path of the README, in the example above it will be `fivethirtyeight/data/nba-raptor`

## Extra commands

You can also build the project for production with

```
npm run build
```

And run using the production build like so:

```
npm run start
```

## Links

- [Repo](https://github.com/datopian/datahub/tree/main/examples/github-backed-catalog)  
- [Live Demo](https://example.portaljs.org)  
