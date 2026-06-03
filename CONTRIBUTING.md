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
  - **portaljs-components**: the library of components for creating a data portal

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

## Nx

Our monorepo is set up with Nx build system. See their [official documentation](https://nx.dev/getting-started) to learn more.

### Tasks

Each project(stuff inside either the packages or examples folder) within this repository has a `project.json` file, which defines all targets that can be run on this project.

A target is an action that can be taken on a project.
A task is a single target run on a given project.

#### Running single tasks

To run a single target on a given project run:

```sh
npx nx <target> <project>
# e.g. npx nx serve ckan
```

or you can use just:

```sh
nx <target> <project>
# e.g. npx nx serve ckan
```

if you have the `nx` binary installed globally in your machine

#### Running multiple tasks

To run a given target on all projects that define it, run:

```sh
npx nx run-many --target=<target>
# e.g. npx nx run-many --target=serve
```

#### Running tasks affected by your changes

When you run `nx affected --target=<some-target>`, Nx looks at the files you changed (compares current HEAD vs base), and it uses this to figure out the list of projects in the workspace that may be affected by this change. It then runs the run-many command with that list.

```sh
npx nx affected --target=<target>
# e.g. npx nx affected --target=serve

# or
# npx nx affected:<target>
# e.g. npx nx affected:serve
```

> To learn more about how Affected works, read [this Nx docs page](https://nx.dev/concepts/affected#how-affected-works).

### Linting and formatting

Nx uses eslint for code linting and prettier for code formatting. There is a base `eslintrc.json` file in the root of this repository that defines global eslint configs. Each project can have its own `eslintrc.json` for project-specific eslint confiurations.

To lint the code in a single project:

```sh
npx nx lint <project>
# npx nx lint ckan
```

To lint all projects:

```
npx nx run-many --target=lint
```

To check code formatting in selected projects:

```sh
npx nx format:check --projects=<array of projects>
# npx nx format:check --projects=ckan,dataset-frictionless
```

To check code formatting in all projects:

```sh
npx nx format:check --all
# or
# npx nx format
```

To fix code formatting in selected projects:

```sh
npx nx format:write --projects=<array projects>
# npx nx format:write --projects=ckan,dataset-frictionless
```

To fix formatting in all projects:

```sh
npx nx format --all
# or
# npx nx format:write --all
```

> To learn more about all the available options for the format command, see [format:check](https://nx.dev/nx/format-check) and [format:write](https://nx.dev/nx/format-write) docs pages.

### Creating a library

To create a new publishable js library:

```sh
nx g @nrwl/next:lib --js --publishable --importPath @portaljs/<library-name>
```

### Creating an example

To create a new next.js app in the examples folder :

```sh
nx g @nrwl/next:app <example-name>
```

### Dependency graph

To see the graph of dependencies between the projects within this repository, run:

```sh
npx nx graph
```

### Caching

Nx by default uses local computation cache to store results of the tasks it has run.

### Configuration

The entry point of Nx's confiuration is the `nx.json` file in the root of this repository. It defines global configurations as well default configurations for projects targets.

To learn more see this [offical docs page](https://nx.dev/reference/nx-json).

Each project also has it's own configuration file - `project.json`, where you can define and configure it's targets (and more).

To learn more see this [offical docs page](https://nx.dev/reference/project-configuration).

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
