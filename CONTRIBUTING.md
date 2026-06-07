---
title: Developer docs for contributors
---

## Our repository

https://github.com/datopian/datahub

Structure:

- **examples**
  - **ckan**: Example utilizing CKAN as a backend
  - **dataset-frictionless**: Example utilizing a frictionless dataset as an example
- **site**: the website for the project, with a landing page and the docs
- **packages**:
  - **components** (`@portaljs/components`): the library of components for creating a data portal
  - **core** (`@portaljs/core`): layout/UI components
  - **ckan** (`@portaljs/ckan`): CKAN backend integration

## How to contribute

You can start by checking our [issues board](https://github.com/datopian/datahub/issues).

If you'd like to work on one of the issues you can:

1. Comment on the issue to let us know you'd like to work on, so that we can assist you and to make sure no one has started looking into it yet.
2. If good to go, fork the main repository.
3. Clone the forked repository to your machine.
4. Create a feature branch (e.g. `50-update-readme`, where `50` is the number of the related issue).
5. Commit your changes to the feature branch.
6. Add changeset file describing the changes. (See section below)
7. Push the feature branch to your forked repository.
8. Create a Pull Request against the original repository.
   - add a short description of the changes included in the PR
9. Address review comments if requested by our demanding reviewers 😜.

If you have an idea for improvement, and it doesn't have a corresponding issue yet, simply submit a new one.

> [!note]
> Join our [Discord channel](https://discord.gg/KZSf3FG4EZ) do discuss existing issues and to ask for help.

## Workspace and building packages

This monorepo uses npm workspaces (see the `workspaces` field in the root `package.json`). Each publishable package lives under `packages/*` and defines its own `build`/`prepare` scripts:

- `packages/components` and `packages/ckan` build with `tsc && vite build`.
- `packages/ckan-api-client-js` and `packages/core` build with Rollup (`rollup -c`).

To install all dependencies (and build every package via their `prepare` scripts):

```sh
npm install
```

To build a single package:

```sh
npm run build --workspace=packages/<package-name>
# e.g. npm run build --workspace=packages/core
```

Each package's `prepare` script runs its build, so packages are built automatically on `npm install` and on publish.

### Linting and formatting

This repository uses eslint for code linting and prettier for code formatting. There is a base `.eslintrc.json` file in the root that defines global eslint configs; each package can have its own `.eslintrc.json` for package-specific configuration.

## Changesets and publishing packages

> This monorepo is set up with changesets versioning tool. See their [github repository](https://github.com/changesets/changesets) to learn more.

### What are Changesets?

Changesets are files that describe the intention of a contributor to bump a version of the package according to their changes. Changeset file holds two key bits of information: a version type (following semver), and change information to be added to a changelog.

### Adding changesets

In the root directory of the repo, run:

```
npx changeset
```

Select the package that has been changed, the semver version that should be bumped with it and a description of your changes. Please make sure to add the most accurate but also concise information.

To learn about semantic versioning standards see [this semver doc page](https://semver.org/).
