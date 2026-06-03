# 🌀 PortalJS example with CKAN and Apollo

**🚩 UPDATE April 2023: This example is now deprecated - though still works!. Please use the [new CKAN examples](https://github.com/datopian/portaljs/tree/main/examples)**

This example shows how you can build a full data portal using a CKAN Backend with a Next.JS Frontend powered by Apollo, a full fledged guide is available as a [blog post](https://portaljs.com/blog/example-ckan-2021)

## Developers

### Boot the local instance

Install the dependencies:

```bash
yarn # or npm i
```

Boot the demo portal:

```console
$ yarn dev # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the home page 🎉

You can start editing the page by modifying `/pages/index.tsx`. The page auto-updates as you edit the file.

### Tests

We use Jest for running tests:

```bash
yarn test # or npm run test

# turn on watching
yarn test --watch
```

We use Cypress tests as well

```
yarn run e2e
```

### Architecture

- Language: Javascript
- Framework: NextJS - https://nextjs.org/
- Data layer API: GraphQL using Apollo. So controllers access data using GraphQL “gatsby like”

### Key Pages

See https://datahub.io/docs/dms/frontend/

