---
title: JavaScript SDK for data deployment
created: 2018-05-15
authors: ['acckiygerman', 'anuveyatsu']
---

Here we explain how you can use JavaScript SDK for data deployment purposes. If you need a detailed step-by-step tutorial, please, go to this article:

https://datahub.io/docs/tutorials/js-sdk-tutorial

## Prerequisites

1. You need to have NodeJS (`>= 7.6`) and NPM.
2. Installed `datahub-client` and `data.js` NPM packages:

      `npm install datahub-client data.js --save`

## Example of usage

Following code snippet is a working example for basic usage. It uses credentials stored in `~/.config/datahub/config.json`, which is created when you login using [the CLI tool](https://datahub.io/download).

```javascript
const {DataHub, config, authenticate} = require('datahub-client')
const {Dataset} = require('data.js')

async function pushDataset(datasetPath) {
  // First, authenticate user
  const apiUrl = config.get('api')
  const token = config.get('token')
  const response = await authenticate(apiUrl, token)
  if (!response.authenticated) {
    console.error('Your credentials expired or missing.')
    return
  }
  // Load dataset that we want to push
  const dataset = await Dataset.load(datasetPath)
  // Create an instance of the DataHub class, using the data from the user config
  const configs = {
   apiUrl,
   token,
   ownerid: config.get('profile') ? config.get('profile').id : config.get('id')
  }
  const datahub = new DataHub(configs)

  // Now use the datahub instance to push the data
  const res = await datahub.push(dataset, {findability: 'unlisted'})
  console.log(res)
}

pushDataset('path/to/dataset')
```

This is an example of correct console output:

```
{ dataset_id: 'username/finance-vix',
  errors: [],
  flow_id: 'username/finance-vix/1',
  success: true }
```

That is all needed to get your dataset deployed in DataHub!
