---
title: 'Why PortalJS is the Future of Decoupled Frontend for Data Portals'
description: 'Let’s take a look at how PortalJS based decoupled frontend can improve your data portal, its performance, user experience and more.'
created: 2024-12-06
authors: ['Anuar Ustayev']
filetype: 'blog'
---

## Introduction

In the world of (open) data portals, a seamless, fast, and scalable frontend is crucial for delivering a great user experience. As the amount of data grows and user interactions become more complex, traditional monolithic frontends can become bottlenecks. This is especially true for platforms like CKAN, where the default frontend, built with Flask, can struggle to handle the demands of modern data-rich applications.

This is where **PortalJS** comes in—a modern, decoupled frontend framework designed specifically for data portals. Built on top of **NextJS**, it brings the latest in web performance optimization to the world of open data. Unlike CKAN’s built-in frontend, PortalJS enables faster load times, more efficient use of APIs, and a far more flexible development environment.

One of the key features that sets PortalJS apart is its ability to leverage **NextJS’s rendering strategies**, such as **Static Site Generation (SSG)**, **Server-Side Rendering (SSR)**, and **Incremental Static Regeneration (ISR)**. These techniques ensure that your data portal isn’t just faster but also scales more easily, reducing the load on your CKAN APIs and databases.

In this post, we’ll explore how PortalJS transforms the frontend experience for data portals, compare it to CKAN’s traditional frontend, and dive into why features like ISR and SSG make a significant difference in performance and scalability.

## Leveraging NextJS for Better Performance

When it comes to performance, PortalJS, powered by NextJS, has a significant advantage. One of the key features NextJS brings to the table is its Incremental Static Regeneration (ISR) strategy. ISR allows for the generation of static pages on-demand, which means pages are pre-rendered once and then updated in the background, keeping the load on APIs and databases low. 

This is a game-changer for data portals, especially those powered by CKAN, where the Flask-based frontend often regenerates pages dynamically. ISR, in contrast, helps keep pages static until necessary updates are made, making the whole system much more efficient. You get the best of both worlds: the speed of static pages and the freshness of dynamic content.

But NextJS also offers other approaches like Static Site Generation (SSG) and Server-Side Rendering (SSR), which can be applied based on the specific needs of your data portal.

### SSG for Static Content

A perfect example of where **SSG** shines in CKAN is on its homepage. Most of the content on the homepage remains static—the structure, layout, and majority of the information doesn’t change often. While some sections, such as the “latest datasets” or statistics about the number of datasets, organizations, and groups, might be dynamic, these can be handled separately (for example, by re-fetching the dynamic parts on the client side).

By building the CKAN homepage using **SSG**, you can ensure the page loads super fast, since it’s served as pre-generated static HTML, reducing load on the API and databases.

### SSG for Dataset Metadata

Another excellent use case for SSG is dataset metadata pages. In many data portals, dataset metadata—such as the title, description, tags, authors, and sources—are generally created once and remain unchanged. This makes it a great candidate for **SSG**. Pre-building these pages means they’ll load instantly, without the need for the backend to dynamically generate them with each request. This results in faster page loads and an overall smoother user experience.

By using a combination of these strategies, PortalJS can dramatically reduce latency, improve SEO, and ensure that your data portal is scalable without overwhelming CKAN's APIs or databases.

## Improved User Experience

User experience is at the heart of any successful web application, and data portals are no exception. The way users interact with data—whether they’re browsing datasets, filtering through complex metadata, or simply exploring the portal’s interface—directly affects how useful and engaging the platform becomes.

### Faster Page Loads

One of the biggest frustrations users face with data portals is slow loading times, especially when the portal is packed with large datasets. CKAN’s Flask-based frontend typically relies on dynamic page generation, which can slow things down as each request hits the server and database.

PortalJS, by contrast, can take advantage of Static Site Generation (SSG) and Incremental Static Regeneration (ISR) to pre-build pages and serve them instantly. The result? Faster load times, snappier navigation, and a much smoother experience for users.

### Modern UI/UX Design

With PortalJS, the frontend is decoupled from the backend, giving developers the freedom to craft highly customized user interfaces. You’re no longer restricted by the more rigid CKAN frontend, which can sometimes feel difficult to modify without diving into Python application, Docker set up and dealing with Apache Solr, Postgresql etc.

PortalJS allows developers to integrate modern UI libraries, such as React components, Tailwind CSS, or Material UI, providing a much more polished, user-friendly design. This flexibility lets you create intuitive navigation, visually appealing layouts, and even responsive features that make the portal easier to use across devices.

### Seamless Client-Side Interactions

Another major benefit of PortalJS is its ability to handle client-side interactions more effectively. Using dynamic rendering capabilities, features like filtering datasets, sorting results, and searching for content can all be done without constantly reloading the page or hitting the backend server.

This not only improves performance but also creates a more seamless user experience. With CKAN’s built-in frontend, interactions like these often require a round trip to the server, resulting in slower response times and more friction for users.

## Scalability & Modularity

Scalability is a critical factor for data portals, especially when handling large datasets and growing user bases. With **PortalJS**, scaling your application becomes far more straightforward and cost-efficient compared to CKAN’s traditional monolithic frontend, which relies heavily on server-side resources.

### Scaling Without a Server

One of the most significant advantages of PortalJS is its ability to serve most of your pages statically, without requiring a dedicated server. Thanks to **Static Site Generation (SSG)**, many pages can be pre-built and then served from a simple object storage solution, such as **Cloudflare R2** or **AWS S3**. This not only reduces infrastructure costs but also dramatically improves the app’s ability to scale since you’re offloading traffic to globally distributed storage networks (CDNs), which are optimized for delivering static assets.

For dynamic content that still requires server-side logic, **serverless functions** come into play. Pages that need to be generated on the fly can be handled by, for example, **AWS Lambda** functions, eliminating the need for traditional server infrastructure. By leveraging serverless architecture, you only pay for what you use, and scaling becomes seamless since cloud providers automatically manage resource allocation.

### Common Deployment Platforms

PortalJS applications are often deployed using modern hosting platforms like **Vercel** and **Netlify**, which make it incredibly easy to scale without the complexities of managing servers. These platforms are built to handle dynamic content using **Incremental Static Regeneration (ISR)** and support serverless functions to process on-demand requests. Additionally, **Cloudflare** has started supporting **server-side rendering** for PortalJS apps, giving developers even more options to balance static and dynamic content delivery.

### Scaling on Vercel vs Hosting CKAN on AWS/GCP

Now, let’s compare what it means to scale an app on Vercel versus hosting CKAN’s Python-based Flask application on traditional cloud services like **AWS** or **GCP** or **Azure**. When deploying a CKAN instance, you’re dealing with a monolithic application that requires dedicated servers or virtual machines. You must manage uptime, load balancing, and scaling on your own. If traffic spikes, the infrastructure needs to scale vertically or horizontally, often leading to increased complexity and higher costs.

With **Vercel** (or platforms like **Netlify** or **Cloudflare Pages**), PortalJS handles scaling automatically. Static pages can be served globally via CDNs, and serverless functions take care of dynamic requests. You don’t have to worry about managing backend infrastructure—scaling is built into the platform, and your app adapts to changes in traffic without additional manual configuration.

## Developer Experience

A great developer experience (DX) is essential for productivity, especially in fast-paced environments where engineers need to iterate quickly. When it comes to building data portals, **PortalJS** dramatically simplifies the development workflow compared to CKAN’s traditional frontend setup.

### Modern Development Stack

Frontend engineers typically prefer working with a modern JavaScript stack, which includes tools like **React**, **NextJS** and **TailwindCSS** (or other modern CSS frameworks). These technologies are widely adopted, well-documented, and come with robust community support. However, developing with CKAN’s Flask-based frontend can feel much more cumbersome.

To start working on CKAN’s default frontend, developers need to spin up Docker containers with services like **PostgreSQL**, **Apache Solr**, **Redis**, and CKAN (Python app) itself. This setup can take up a lot of storage on the developer's machine, especially when you need multiple CKAN instances for different projects. All these moving parts not only slow down the setup process but also increase the chances of running into configuration issues.

With **PortalJS**, the workflow is refreshingly simple. Frontend engineers can clone a project and start development with just two commands:

* npm install  
* npm start

That’s it. In a matter of minutes, developers have a fully functional local environment running, without the need to worry about databases, search engines, or caching systems.

### Efficient Development with Hot Reloading

Another significant advantage of PortalJS is its support for **hot reloading**. As soon as you make changes to your code, the browser automatically refreshes to reflect those updates, creating an instant feedback loop. This drastically improves productivity, allowing developers to see their changes in real-time without having to restart services or manually refresh the page.

CKAN does have hot reloading through its Flask development server, which reloads the application when changes are detected. However, the experience may not be as smooth or fast as the hot reloading tools available in modern JavaScript frameworks like NextJS and React. Flask’s hot reloading works well for small changes but might slow down significantly in larger applications, especially if you’re dealing with Docker setups and various integrated services (like PostgreSQL, Solr, and Redis).

### Simplified Multi-Project Development

When handling multiple CKAN projects, spinning up individual instances for each one can be a heavy burden on your machine. Each CKAN instance requires its own PostgreSQL database, Solr service, and sometimes even Redis, making it a storage and resource hog. In contrast, PortalJS decouples the frontend entirely from CKAN’s backend. You can easily create and switch between different projects with minimal overhead, saving both time and disk space.

By offloading backend complexity and streamlining the frontend, PortalJS enables a smoother, faster, and more enjoyable development experience for engineers, helping them focus on building beautiful interfaces instead of wrestling with infrastructure.

## Conclusion

In the evolving landscape of data portals, delivering an exceptional user experience while ensuring scalability and ease of development is crucial. The **PortalJS** framework, built on the powerful **NextJS**, offers a modern solution that addresses the limitations of CKAN's traditional frontend.

Ultimately, choosing PortalJS as a decoupled frontend engine for data portals allows organizations to harness the best of both worlds—robust, high-performing applications that are easy to develop, scale, and maintain. By embracing this innovative approach, data portals can not only meet the demands of today but also adapt to the challenges of tomorrow.
