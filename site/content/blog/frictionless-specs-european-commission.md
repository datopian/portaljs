---
title: "A Short Case Study Involving Table Schema Frictionless Specs at the European Union"
created: 2021-06-22
authors: ["sebastien.lavoie"]
tags: ['table-schema', 'frictionless', 'specifications', 'validator', 'tabular-data']
---

The Frictionless specifications are helping with simplifying data validation for applications in production at the European Union. More specifically, [Costas Simatos](https://joinup.ec.europa.eu/user/73932) introduced the Frictionless Data community to the [Interoperability Test Bed](https://joinup.ec.europa.eu/collection/interoperability-test-bed-repository) (ITB), an online platform that can be used to test systems against technical specifications --- curious minds will find a recording of his presentation on the subject [available on YouTube](https://www.youtube.com/watch?v=pJFsJW96fuA). Amongst the tools it offers, there is a [CSV validator](https://joinup.ec.europa.eu/collection/interoperability-test-bed-repository/solution/csvvalidator) which relies on the [Table Schema specifications](https://specs.frictionlessdata.io/table-schema/). Those specifications filled a gap that the [RFC 4180](https://datatracker.ietf.org/doc/html/rfc4180) didn't address by having a structured way of defining the content of individual fields in terms of data types, formats and constraints, which is a clear benefit of the Frictionless specifications as reported back in 2020 [when a beta version of the CSV validator was launched](https://joinup.ec.europa.eu/collection/interoperability-test-bed-repository/solution/interoperability-test-bed/news/table-schema-validator).

![Puzzle texture with negative space](/static/img/blog/2021-06-21-frictionless-specs/clark-van-der-beken-596baa0MpyM-unsplash.jpg)
_Photo by Clark Van Der Beken on Unsplash_

---

Frictionless specifications are flexible while allowing users to define unambiguously the expected content of a given field, therefore they were officially adopted to [realise the validator for the Kohesio pilot phase of 2014-2020](https://joinup.ec.europa.eu/collection/interoperability-test-bed-repository/solution/interoperability-test-bed/news/test-bed-support-kohesio-pilot), [Kohesio](https://kohesio.eu/) being the _"Project Information Portal for Cohesion Policy"_. The Table Schema specifications made it easy and convenient for the Interoperability Test Bed to establish constraints and describe the data to be validated in a concise way based on an initial set of [CSV syntax rules](https://joinup.ec.europa.eu/collection/semantic-interoperability-community-semic/solution/kohesio-validator/specification), converting written and mostly non-technical definitions to their Frictionless equivalent. Using simple JSON objects, Frictionless specifications allowed the ITB to enforce data validation in multiple ways as can be observed from the [schema used for the CSV validator](https://github.com/ISAITB/validator-resources-kohesio/blob/master/resources/schemas/schema.json). The following list of items calls attention to the core aspects of the Table Schema standard that were taken advantage of:

* Dates can be defined with string formatting (e.g. `%d/%m/%Y` stands for `day/month/year`);
* Constraints can indicate whether a column can contain empty values or not;
* Constraints can also specify a valid range of values (e.g. `"minimum": 0.0` and `"maximum": 100.0`);
* Constraints can specify an enumeration of valid values to choose from (e.g. `"enum" : ["2014-2020", "2021-2027"]`).
* Constraints can be specified in custom ways, such as with [regular expressions](https://en.wikipedia.org/wiki/Regular_expression) for powerful string matching capabilities;
* Data types can be enforced for any column;
* Columns can be forced to adapt a specific name and a description can be provided for each one of them.

Because these specifications can be expressed as portable text files, they became part of a multitude of tools to provide greater convenience to users and the validation process has been [documented extensively](https://www.itb.ec.europa.eu/docs/guides/latest/validatingCSV/index.html). JSON code snippets from the documentation highlight the fact that this format conveys all the necessary information in a readable manner and lets users extend the original specifications as needed. In this particular instance, the CSV validator can be used as a [Docker image](https://hub.docker.com/repository/docker/isaitb/validator-kohesio), as part of a [command-line application](https://www.itb.ec.europa.eu/csv-offline/kohesio/validator.zip), inside a [web application](https://www.itb.ec.europa.eu/csv/kohesio/upload) and even as a [SOAP API](https://www.itb.ec.europa.eu/csv/soap/kohesio/validation?wsdl).

In a way, the Frictionless specifications were the missing piece of the puzzle that enabled the ITB to rely on a well-documented set of standards for their data validation needs.
