---
title: Data Package v1 Specifications. What has Changed and how to Upgrade
created: 2017-10-11
authors: ['mikanebu']
---

This post walks you through the major changes in the Data Package v1 specs compared to pre-v1. It covers changes in the full suite of Data Package specifications including Data Resources and Table Schema. It is particularly valuable if:

* you were using Data Packages pre v1 and want to know how to upgrade your datasets
* if you are implementing Data Package related tooling and want to know how to upgrade your tools or want to support or auto-upgrade pre-v1 Data Packages for backwards compatibility

It also includes a script we have created (in JavaScript) that we've been using ourselves to automate upgrades of the [Core Data][core-data].

## The Changes

Two major changes in v1 were presentational:

* Creating Data Resource as a separate spec from Data Package. This did not change anything substantive in terms of how data packages worked but is important presentationally. In parallel, we also split out a Tabular Data Resource from the Tabular Data Package.
* Renaming JSON Table Schema to just Table Schema

In addition, there were a fair number of substantive changes. We summarize these in the sections below. For more detailed info see the [current specifications][specs] and [the old site containing the pre spec v1 specifications][prev1].

### Table Schema

Link to spec: https://specs.frictionlessdata.io/table-schema/

<table class="table table-striped table-bordered">
<thead>
<th>Property</th>
<th>Pre v1</th>
<th>v1 Spec</th>
<th>Notes</th>
<th>Issue</th>
</thead>
<tbody>
<tr>
<td>id/name</td>
<td>id</td>
<td>name</td>
<td>Renamed id to name to be consistent across specs</td>
<td></td>
</tr>
<tr>
<td>type/number</td>
<td>format: currency</td>
<td>format: currency - removed
format: bareNumber
format: decimalChar and groupChar</td>
<td></td>
<td><a href="https://github.com/frictionlessdata/specs/issues/509">#509</a> <a href="https://github.com/frictionlessdata/specs/issues/246">#246</a></td>
</tr>
<tr>
<td>type/integer</td>
<td>No additional properties</td>
<td>Additional properties: bareNumber</td>
<td></td>
<td><a href="https://github.com/frictionlessdata/specs/issues/509">#509</a></td>
</tr>
<tr>
<td>type/boolean</td>
<td>true: [yes, y, true, t, 1],false: [no, n, false, f, 0]</td>
<td>true: [ true, True, TRUE, 1],false: [false, False, FALSE, 0]</td>
<td></td>
<td><a href="https://github.com/frictionlessdata/specs/issues/415">#415</a></td>
</tr>
<tr>
<td>type/year + yearmonth</td>
<td></td>
<td>year and yearmonth NB: these were temporarily gyear and gyearmonth</td>
<td></td>
<td><a href="https://github.com/frictionlessdata/specs/issues/346">#346</a></td>
</tr>
<tr>
<td>type/duration</td>
<td></td>
<td>duration</td>
<td></td>
<td><a href="https://github.com/frictionlessdata/specs/issues/210">#210</a></td>
</tr>
<tr>
<td>type/rdfType</td>
<td></td>
<td>rdfType</td>
<td>Support rich "semantic web" types for fields</td>
<td><a href="https://github.com/frictionlessdata/specs/issues/217">#217</a></td>
</tr>
<tr>
<td>type/null</td>
<td></td>
<td>removed (see missingValue)</td>
<td></td>
<td><a href="https://github.com/frictionlessdata/specs/issues/262">#262</a></td>
</tr>
<tr>
<td>missingValues</td>
<td></td>
<td>missingValues</td>
<td>Missing values support did not exist pre v1.</td>
<td><a href="https://github.com/frictionlessdata/specs/issues/97">#97</a></td>
</tr>
</tbody>
</table>


### Data Resource

Link to spec: https://specs.frictionlessdata.io/data-resource/

*Note: Data Resource did not exist as a separate spec pre-v1 so strictly we are comparing the Data Resource section of the old Data Package spec with the new Data Resource spec.*

<table class="table table-striped table-bordered">
<thead>
<th>Property</th>
<th>Pre v1</th>
<th>v1 Spec</th>
<th>Notes</th>
<th>Issue</th>
</thead>
<tbody>
<tr>
<td>path</td>
<td>path and url</td>
<td>path only</td>
<td>url merged into path and path can now be a url or local path</td>
<td><a href="https://github.com/frictionlessdata/specs/issues/250">#250</a></td>
</tr>
<tr>
<td>path</td>
<td>string</td>
<td>string or array</td>
<td>path can be an array to support a single resource split across multiple files</td>
<td><a href="https://github.com/frictionlessdata/specs/issues/228">#228</a></td>
</tr>
<tr>
<td>name</td>
<td>recommended</td>
<td>required</td>
<td>Made name required to enable access to resources by name consistently across tools</td>
<td></td>
</tr>
<tr>
<td>profile</td>
<td></td>
<td>recommended</td>
<td>See profiles discussion</td>
<td></td>
</tr>
<tr>
<td>sources, licenses ...</td>
<td></td>
<td></td>
<td>Inherited metadata from Data Package like sources or licenses upgraded inline with changes in Data Package</td>
<td></td>
</tr>
</tbody>
</table>


### Tabular Data Resource

Link to spec: https://specs.frictionlessdata.io/data-resource/

Just as Data Resource split out from Data Package so Tabular Data Resource split out from the old Tabular Data Package spec.

There were no significant changes here beyond those in Data Resource.

### Data Package

Link to spec: https://specs.frictionlessdata.io/data-package/

<table class="table table-striped table-bordered">
<thead>
<th>Property</th>
<th>Pre v1</th>
<th>v1 Spec</th>
<th>Notes</th>
<th>Issue</th>
</thead>
<tbody>
<tr>
<td>name</td>
<td>required</td>
<td>recommended</td>
<td>Unique names are not essential to any part of the present tooling so we have have moved to recommended.</td>
<td><a href="https://github.com/frictionlessdata/specs/issues/237">#237</a></td>
</tr>
<tr>
<td>id</td>
<td></td>
<td>id property-globally unique</td>
<td>Globally unique id property</td>
<td><a href="https://github.com/frictionlessdata/specs/issues/237">#237</a></td>
</tr>
<tr>
<td>licenses</td>
<td>license - object or string. The object structure must contain a type property and a url property linking to the actual text</td>
<td>licenses - is an array. Each item in the array is a License. Each must be an object. The object must contain a name property and/or a path property. It may contain a title property.</td>
<td></td>
<td></td>
</tr>
<tr>
<td>author</td>
<td>author</td>
<td>author is removed in favour of contributors</td>
<td></td>
<td></td>
</tr>
<tr>
<td>contributor</td>
<td>name, email, web properties with name required</td>
<td>title property required with roles, role property values must be one of - author, publisher, maintainer, wrangler, and contributor. Defaults to contributor.</td>
<td></td>
<td></td>
</tr>
<tr>
<td>sources</td>
<td>name, web and email and none required</td>
<td>title, path and email and title is required</td>
<td></td>
<td></td>
</tr>
<tr>
<td>resources</td>
<td></td>
<td>resources array is required</td>
<td></td>
<td><a href="https://github.com/frictionlessdata/specs/issues/434">#434</a></td>
</tr>
<tr>
<td>dataDependencies</td>
<td>dataDependencies</td>
<td></td>
<td>Moved to a pattern until we have greater clarity on need.</td>
<td><a href="https://github.com/frictionlessdata/specs/issues/341">#341</a></td>
</tr>
</tbody>
</table>


### Tabular Data Package

Link to spec: https://specs.frictionlessdata.io/tabular-data-package/

Tabular Data Package is unchanged.

### Profiles

Profiles arrived in v1:

http://specs.frictionlessdata.io/profiles/

Profiles are the first step on supporting a rich ecosystem of "micro-schemas" for data. They provide a very simple way to quickly state that your data follows a specific structure and/or schema. From the docs:

> Different kinds of data need different formats for their data and metadata. To support these different data and metadata formats we need to extend and specialise the generic Data Package. These specialized types of Data Package (or Data Resource) are termed profiles.
>
> For example, there is a Tabular Data Package profile that specializes Data Packages specifically for tabular data. And there is a "Fiscal" Data Package profile designed for government financial data that includes requirements that certain columns are present in the data e.g. Amount or Date and that they contain data of certain types.

We think profiles are an easy, lightweight way to starting adding more structure to your data.

Profiles can be specified on both resources and packages.

[core-data]: https://github.com/datahq/datapackage-normalize-js
[specs]: https://specs.frictionlessdata.io/
[prev1]: https://pre-v1.frictionlessdata.io/
[normalization]: https://github.com/datahq/datapackage-normalize-js
[ghrepo]: https://github.com/frictionlessdata/specs/



## Automate upgrading your descriptor according to the spec v1

We have created a [data package normalization script][norm-script] that you can use to automate the process of upgrading a `datapackage.json` or Table Schema from pre-v1 to v1.

The script enables you to automate updating your `datapackage.json` for the following properties: `path`, `contributors`, `resources`, `sources` and `licenses`.

[norm-script]: https://github.com/datahq/datapackage-normalize-js

This is a simple script that you can download directly from here:

https://raw.githubusercontent.com/datahq/datapackage-normalize-js/master/normalize.js

e.g. using wget:
```bash
wget https://raw.githubusercontent.com/datahq/datapackage-normalize-js/master/normalize.js
```

```bash
# path (optional) is the path to datapackage.json
# if not provided looks in current directory
normalize.js [path]

# prints out updated datapackage.json
```

You can also use as a library:

```bash
# install it from npm
npm install datapackage-normalize
```

so you can use it in your javascript:

```javascript
const normalize = require('datapackage-normalize')

const path = 'path/to/datapackage.json'
normalize(path)
```

## Conclusion

The above summarizes the main changes for v1 of Data Package suite of specs and instructions on how to upgrade.

If you want to see specification for more details, please visit [Data Package specifications][specs]. You can also visit the [Frictionless Data initiative for more information about Data Packages][fd].

[fd]: http://frictionlessdata.io/
