---
title: "Does PortalJS Cloud support geospatial visualizations?"
created: 2026-05-25
tags:
  - portaljs-cloud
  - geospatial
  - maps
  - geojson
  - data-visualization
keywords: PortalJS Cloud geospatial, open data portal map visualization, GeoJSON data portal
description: "Does PortalJS Cloud support geospatial visualizations? A clear breakdown of what works out of the box, what requires extension, and how to handle complex mapping requirements."
authors: ['Yoana Popova']
canonical: https://www.portaljs.com/blog/portaljs-cloud-geospatial
image: /static/img/blog/2026-05-25-portaljs-cloud-geospatial/hero.png
filetype: 'blog'
---

Geospatial data is increasingly central to government and research portals. If you are evaluating PortalJS Cloud for a portal that includes maps, shapefiles, or location-based datasets, this is a clear breakdown of what works out of the box and what requires additional development.

We will be direct about the current state rather than oversell it. That is more useful to you.

## What's Built In

PortalJS Cloud includes native support for **GeoJSON data previews**. Upload a GeoJSON file and users see an interactive map directly on the dataset page with no configuration required. This covers the most common open data geospatial format and handles the majority of civic and government use cases: administrative boundaries, points of interest, infrastructure layers, and environmental monitoring data.

**iFrame embedding** is also supported. This means you can embed external map tools, a hosted [QGIS](https://qgis.org/) visualization, an [ArcGIS Online](https://www.arcgis.com/) dashboard, a [Mapbox](https://www.mapbox.com/) map, a [Felt](https://felt.com/) layer, directly into a dataset page in the portal. Users get the full map experience; the visualization layer lives in your preferred GIS tool.

Live examples of geospatial data published through PortalJS Cloud-powered portals include [Lincolnshire County Council's open data portal](https://data.lincolnshire.gov.uk/) and [SSEN's energy network data](https://data.ssen.co.uk/). Both publish location-based datasets that are discoverable and previewable by citizens without any technical skills.

## What Requires Extension

Beyond GeoJSON and iframes, support for other geospatial formats is not built in by default. This includes:

- Shapefiles (`.shp`, `.zip`)
- KML / KMZ
- GeoTIFF and raster formats
- WMS / WFS layers
- GPS Exchange Format (GPX)

If your portal needs to render or preview these formats natively, it requires custom development. PortalJS Cloud is built on open-source foundations, the [codebase is on GitHub](https://github.com/datopian/portaljs) and the architecture supports extension, but it will not happen without implementation work.

## Using iFrames for Complex Geospatial Needs

For organizations with sophisticated mapping requirements, the iframe approach gives you meaningful flexibility without waiting for native format support. The pattern is straightforward: your geospatial data lives in your GIS tool of choice, and the portal dataset page embeds the visualization via iframe.

This approach works well when:

- You already have a GIS platform your team manages, such as ArcGIS Hub, QGIS Server, Mapbox, or Felt
- Your maps require interactivity beyond a simple data preview, such as layer toggles, filters, or custom styling
- Your geospatial data is updated frequently and managed independently of the portal

The trade-off is that the portal does not control the visualization layer. You maintain it separately in your GIS tool.

## When Native GeoJSON Support Is Sufficient

For many civic data portals, GeoJSON covers the practical requirement. Administrative boundaries, district maps, public facility locations, transport routes, environmental monitoring points: these are commonly published as GeoJSON and render cleanly in the built-in preview.

If your organization primarily publishes datasets in these categories, the built-in support handles your core use case without additional development. GeoJSON data views are included in the [PortalJS Cloud Foundation plan](https://www.portaljs.com/pricing).

## Roadmap

Expanding native geospatial format support beyond GeoJSON is on our radar. If there are specific formats critical to your portal, the most direct way to register that is through [GitHub Issues](https://github.com/datopian/portaljs/issues). It feeds directly into roadmap prioritization.

## The Honest Summary

Built-in GeoJSON support handles the majority of open data geospatial publishing. For everything else, extension is possible but requires development. iFrames provide a practical workaround for complex mapping requirements today. Enterprise plan customers can scope custom geospatial development as part of their implementation. See [PortalJS Cloud pricing](https://www.portaljs.com/pricing) for plan details.

Have a specific geospatial use case you want to walk through? [Talk to the Datopian team](https://www.datopian.com/contact) or [start a free trial](https://cloud.portaljs.com/auth/signup), no credit card required.
