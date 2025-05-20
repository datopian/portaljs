# Concepts and Terms

In this section, we explain some of the terms and concepts used throughtout the PortalJS documentation. 

> Some of these concepts are part of official specs, and when appropriate, we'll link to the sources where you can get more details. 

### Dataset

A dataset extends the [Frictionless data package](https://specs.frictionlessdata.io/data-package/#metadata) to add an extra organization property. The organization property describes the organization the dataset belongs to, and it should have the following properties:

```javascript
organization = {
 name: "some org name",
 title: "Some optional org title",
 description: "A description of the organization"
}
```

An example of dataset with organization properties is given below:

```javascript
datasets = [{
    organization: {
     name: "some org name",
     title: "Some optional org title",
     description: "A description of the organization"
    },
    title: "Data package title",
    name:  "Data package name",
    description: "description of data package",
    resources: [...],
    licences: [...],
    sources: [...]
    }
]
```

### Resource

TODO

### View spec

---

## Deploying portal build to github pages

* [Deploying single frictionless dataset to Github](./scripts/README.md)

## Showcases

### Single Dataset with Default Theme

![Single Dataset Example](./examples/dataset-frictionless/assets/demo.gif)
