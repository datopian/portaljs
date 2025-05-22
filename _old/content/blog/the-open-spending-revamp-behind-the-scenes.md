---
title: 'The OpenSpending Revamp: Behind the Scenes'
date: 2023-10-13
authors: ['Luccas Mateus', 'João Demenech']
filetype: 'blog'
---

_This post was originally published on [the Datopian blog](http://datopian.com/blog/the-open-spending-revamp-behind-the-scenes)._

In our last article, we explored [the Open Spending revamp](https://www.datopian.com/blog/the-open-spending-revamp). Now, let's dive into the tech stack that makes it tick. We'll unpack how PortalJS, Cloudflare R2, Frictionless Data Packages, and Octokit come together to power this next-level data portal. From our Javascript framework PortalJS, that shapes the user experience, to Cloudflare R2, the robust storage solution that secures the data, we'll examine how each piece of technology contributes to the bigger picture. We'll also delve into the roles of Frictionless Data Packages for metadata management and Octokit for automating dataset metadata retrieval. Read on for the inside scoop!

## The Core: PortalJS

At the core of the revamped OpenSpending website is [PortalJS](https://portaljs.com), a JavaScript library that's a game-changer in building powerful data portals with data visualizations. What makes it so special? Well, it's packed with reusable React components that make our lives - and yours - a whole lot easier. Take, for example, our sleek CSV previews; they're brought to life by PortalJS' [FlatUI Component](https://storybook.portaljs.org/?path=/story/components-flatuitable--from-url). It helps transform raw numbers into visuals that you can easily understand and use. Curious to know more? Check out the [official PortalJS website](https://portaljs.com).

![Data visualization](/assets/blog/2023-10-13-the-open-spending-revamp-behind-the-scenes/data-visualization.png)

## Metadata: Frictionless Data Packages

Storing metadata might seem like a backstage operation, but it is pivotal. We chose Frictionless Data Packages, housed in the `os-data` GitHub organization as repositories, to serve this purpose. Frictionless Data Packages offer a simple but powerful format for cataloging and packaging a collection of data - in our scenario, that's primarily tabular data. These aren't merely storage bins - they align with FAIR principles, ensuring that the data is easily Findable, Accessible, Interoperable, and Reusable. This alignment positions them as an ideal solution for publishing datasets designed to be both openly accessible and highly usable. Learn more from their [official documentation](https://framework.frictionlessdata.io/).

## The Link: Octokit

Can you imagine having to manually gather metadata for each dataset from multiple GitHub repositories? Sounds tedious, right? That’s why we used Octokit, a GitHub API client for Node.js. This tool takes care of the heavy lifting, automating the metadata retrieval process for us. If you're intrigued by Octokit's capabilities, you can discover more in its [GitHub repository](https://github.com/octokit/octokit.js). To explore the datasets we've been working on, take a look at [OpenSpending Datasets](https://github.com/os-data).

## Storage: Cloudflare R2

When it comes to data storage, Cloudflare R2 emerges as our choice, defined by its blend of speed and reliability. This service empowers developers to securely store large amounts of blob data without the costly egress bandwidth fees associated with typical cloud storage services. For a comprehensive understanding of Cloudflare R2, their [blog post](https://cloudflare.net/news/news-details/2021/Cloudflare-Announces-R2-Storage-Rapid-and-Reliable-S3-Compatible-Object-Storage-Designed-for-the-Edge/default.aspx) serves as an excellent resource.

## In Closing

In closing, we invite you to explore the architecture and code that power this project. It's all openly accessible in our [GitHub repository](https://github.com/datopian/portaljs/tree/main/examples/openspending). Should you want to experience the end result firsthand, feel free to visit [openspending.org](https://www.openspending.org/). If you encounter any issues or have suggestions to improve the project, we welcome your contributions via our [GitHub issues page](https://github.com/datopian/portaljs/issues). For real-time assistance and to engage with our community, don't hesitate to join our [Discord Channel](https://discord.com/invite/EeyfGrGu4U). Thank you for taking the time to read about our work! We look forward to fostering a collaborative environment where knowledge is freely shared and continually enriched. ♥️

![FlatUiTable Code Snippet](/assets/blog/2023-10-13-the-open-spending-revamp-behind-the-scenes/code-example.png)
