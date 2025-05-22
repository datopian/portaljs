---
title: Data desktop app - alpha release with drag and drop data publishing support
created: 2017-12-01
authors: ['anuveyatsu']
image: '/static/img/docs/app-cli-update.png'
---

We are pleased to announce the launch of our new desktop application for DataHub users. The app brings drag and drop publishing of data. In addition, users can preview and validate their data prior to upload. Currently the app is in alpha and only available for MacOS -- but we plan Linux and Windows soon! Get the app now from:

https://datahub.io/download

## Drag and drop files

Simply drag and drop any files (e.g. CSV) or Data Packages (datapackage.json) into the tray icon and you will start the publishing process.

![drag and drop any files (e.g. CSV) or Data Packages (datapackage.json) into the tray icon](/static/img/docs/drag-n-drop.gif)

## Preview showcase page and edit properties

First, you'll get a preview of your dataset. Here you can preview how it would look like online and edit name and title properties for it:

![A preview of your dataset. Here you can preview how it would look like online and edit name and title properties for it.](/static/img/docs/app-showcase.png)

## Table Schema editor and validation info

Scroll down the page and you can see "Field Information" table that contains details from table schema for the data. You can see validity information for each field and edit field type if necessary. Once you have made a change, it will re-validate and update validity message:

!["Field Information" table that contains details from table schema for the data](/static/img/docs/app-field-info.png)

## Publish it!

Ready to publish your data? Just hit the "Go!" button on the top of the page and it will be published at given path on datahub.io website. Once publish process is finished, you will get a notification - click on it to open online showcase page in your default browser:

![publish your data with go button](/static/img/docs/app-publish.png)

## Command line tool is always up-to-date

In addition, to drag and drop publishing the desktop app auto-installs the command line program and will automatically keep it up to date for you:

![to drag and drop publishing the desktop app auto-installs the command line program](/static/img/docs/app-cli-update.png)
