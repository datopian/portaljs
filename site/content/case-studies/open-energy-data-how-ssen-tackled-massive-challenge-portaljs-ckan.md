---
filetype: 'casestudy'
created: 2025-01-27
title: Open Energy Data / How SSEN Tackled Massive Energy Data Challenges with PortalJS and CKAN
description: Learn how Scottish & Southern Electricity Networks partnered with us at Datopian to create a user-first open data portal that handles millions of data points daily, enhances energy management, and supports sustainable goals.
image: /images/casestudies/ssen-feature.webp
images: ['/images/casestudies/ssen1.webp','/images/casestudies/ssen2.webp','/images/casestudies/ssen3.webp']
authors: ['popovayoana', 'lucasbispo']
keystats: ['3.8M/n endpoints seamlessly managed','1TB+/n of data processed every day','10K+/n datasets published']
problem: '### Wrangling endless energy data was draining resources

- **Massive Datasets** – SSEN needed to manage and query terabytes of energy data daily, including data from 3.8 million endpoints.

- **Operational Bottlenecks** – Outdated tools struggled with complex data queries, hampering decision-making.

- **Security Risks** – Sensitive data lacked robust access controls, raising concerns for both administrators and users.'
solution: '### A data portal built for efficiency, security, and scale

- **PortalJS Frontend**: A fast, responsive interface designed to make data exploration intuitive.

- **CKAN Backend**: A data powerhouse to organize, store, and share energy datasets with precision.

- **ETL Workflow**: Prefect and BigQuery enable efficient data ingestion and analysis, turning massive data loads into actionable insights.

- **Enhanced Security**: Extensions like ckanext-noanonaccess protect sensitive data while allowing seamless administrative controls.'
results: '### Making energy data work smarter, not harder

- SSEN’s new portal can process and query over 1TB of data daily without breaking a sweat.

- User satisfaction skyrocketed with faster queries and better access to critical insights.

- The portal supports sustainability initiatives, paving the way for net-zero goals.'
features: [
  {
    title: "Lightning-Fast Frontend",
    text: "PortalJS delivers a sleek, intuitive interface that’s built for usability.",
    icon: "favorite",
  },
  {
    title: "Reliable Data Backbone",
    text: "[CKAN](https://www.datopian.com/solutions/ckan) ensures large datasets are stored, organized, and shared efficiently.",
    icon: "database",
  },
  {
    title: "Powerful Add-Ons",
    text: "Extensions like ckanext-dcat and ckanext-scheming boost interoperability and customization.",
    icon: "layers",
  },
  {
    title: "Scalable Infrastructure",
    text: "BigQuery and Prefect make processing and analyzing huge datasets (over 1TB of data) effortless.",
    icon: "cloud-network",
  }
]
quote: ['I would like to take this opportunity to extend my heartfelt gratitude for the outstanding support and collaboration your team has offered over the past year. The agility, technical prowess, and steadfast dedication you have demonstrated are truly commendable. Your efforts have been integral to our successes, and I am deeply appreciative. I am hopeful that there will be opportunities for me to engage with future projects and contribute. Thank you once again for your exemplary contribution and for the positive spirit you bring to our work.', '/images/casestudies/ssen-logo.png', 'Shailesh Kumar, Analytics and Data Architect - SSEN' ]
portal:
  [
   'SSEN Open Data Portal', 'Designed for flexibility and scalability, PortalJS allows the frontend to evolve independently from the backend, ensuring seamless updates and a user-centric experience.','https://data.ssen.co.uk'
  ]
table: ssen
fullCaseStudy: "https://www.datopian.com/showcase/case-studies/empowering-energy-sector-ckan-portaljs-scottish-southern-electricity-networks"
---

### Introduction

[Scottish and Southern Electricity Networks (SSEN)](https://www.ssen.co.uk/), a key player in the UK’s energy landscape, serves over 3.8 million homes and businesses across central southern England and northern Scotland. Their responsibilities range from maintaining infrastructure and integrating renewable energy to addressing regulations and delivering emergency responses. As a forward-thinking Distribution Network Operator (DNO), [SSEN](https://www.ssen.co.uk/) has embraced the challenge of fostering sustainable energy practices while leveraging the power of digital transformation.

To advance their strategic goals of innovation, partnership, and a sustainable energy future, [SSEN](https://www.ssen.co.uk/) collaborated with [Datopian](https://datopian.com) to create a next-generation Data Portal—a hub designed to transform how energy data is accessed, managed, and shared.

### The Problem: A Data-Driven Bottleneck

[SSEN](https://www.ssen.co.uk/)’s operations hinge on managing massive datasets, from geospatial information to performance metrics. However, their existing systems struggled to efficiently share and analyze this data across a diverse network of stakeholders—local governments, energy suppliers, and sustainability advocates. The lack of a centralized platform created inefficiencies, stifled collaboration, and hindered innovation. Simply put, they needed a modern solution to turn a fragmented data ecosystem into a seamless, collaborative network.

### The Need: Transparency Meets Functionality

In an increasingly data-reliant energy sector, [SSEN](https://www.ssen.co.uk/) identified the critical need for a unified Data Portal. This platform wouldn’t just manage data—it would democratize it. By providing transparent, easy-to-access information, the portal would empower users to make informed decisions and foster partnerships that drive innovation. Beyond public access, [SSEN](https://www.ssen.co.uk/) envisioned future capabilities like user identification and personalized experiences to cater to varied needs.

From enabling net-zero carbon initiatives to supporting low-carbon energy solutions, the portal needed to address the evolving requirements of its diverse audience while aligning with [SSEN](https://www.ssen.co.uk/)’s Digital Action Plan for 2023.

### The Solution: Building the Future, One Dataset at a Time

[Datopian](https://datopian.com) brought [SSEN](https://www.ssen.co.uk/)’s vision to life with a state-of-the-art Data Portal powered by [CKAN](https://www.datopian.com/solutions/ckan) and PortalJS. This decoupled architecture combined a responsive frontend with a robust backend, ensuring optimal performance and scalability. Let’s break it down:

1. **PortalJS for the Frontend**:
   The frontend, built on PortalJS and NextJS, delivers a sleek, intuitive user experience. By decoupling the frontend from the backend, [Datopian](https://datopian.com) ensured the platform could evolve independently, adapting to [SSEN](https://www.ssen.co.uk/)’s changing needs. With geospatial data visualizations, clean navigation, and a polished design aligned with [SSEN](https://www.ssen.co.uk/)’s branding, the portal offers a user-centric interface that’s as functional as it is visually engaging.

2. **CKAN for the Backend**:
   As the backbone of the platform, CKAN v2.10 manages datasets with unparalleled efficiency. The administrative interface allows seamless data storage, retrieval, and role-based access management. Custom extensions like:

   - **ckanext-dcat** for metadata standards (DCAT and Dublin Core) to ensure interoperability
   - **ckanext-showcase** to highlight high-value datasets
   - **ckanext-googleanalytics** for in-depth user insights
   - **ckanext-noanonaccess** to enhance security  
     ...further elevate the portal’s capabilities.

3. **ETL Workflow for Data Ingestion**:
   Handling [SSEN](https://www.ssen.co.uk/)’s vast datasets—including daily smart meter uploads exceeding 1 TB—required robust processing. [Datopian](https://datopian.com) implemented a Prefect-based ETL pipeline integrated with BigQuery. This workflow enables efficient data ingestion, transforming raw CSV uploads into actionable insights.

4. **Geospatial Data Support**:
   [SSEN](https://www.ssen.co.uk/)’s reliance on location-based datasets like GeoJSON and Shapefiles meant that geospatial capabilities were non-negotiable. The portal’s architecture ensures these datasets are accessible and precise, offering stakeholders valuable spatial insights into network assets and performance.

### Features That Make the Difference

#### Homepage Highlights:

The portal’s homepage is designed for quick navigation. With sections like ‘Most Visited Data Assets’ and ‘Recently Added,’ users can access high-priority information instantly. The ‘Highlights’ section showcases critical reports, aligning with [SSEN](https://www.ssen.co.uk/)’s strategic goals.

#### Showcases Page:

This dedicated section features curated data assets with real-world applications. Think dashboards, Power BI reports, and articles—all designed to bridge the gap between raw data and actionable insights.

#### Collections Page:

Organized by topic, the ‘Collections’ section groups related datasets into vibrant, intuitive folders. This structure simplifies navigation for users exploring specific areas of interest.

#### Administrative Interface:

Built on [CKAN](https://www.datopian.com/solutions/ckan), the admin dashboard empowers [SSEN](https://www.ssen.co.uk/) to manage user roles, organize datasets, and maintain data integrity with ease.

### Results: A Portal That Delivers

The [SSEN](https://www.ssen.co.uk/) Data Portal represents a significant leap forward in the energy sector’s digital transformation. By marrying CKAN’s backend capabilities with PortalJS’s responsive frontend, [Datopian](https://datopian.com) delivered a platform that achieves:

1. **Streamlined Data Sharing**:
   Public and stakeholder access to key datasets is now frictionless, promoting transparency and collaboration.

2. **Operational Efficiency**:
   From ETL workflows to geospatial data integration, the portal optimizes data handling and reduces administrative burdens.

3. **Stakeholder Engagement**:
   With its intuitive design and user-friendly features, the portal fosters deeper connections across [SSEN](https://www.ssen.co.uk/)’s diverse audience.

#### Smart Metering and Beyond

We helped [SSEN](https://www.ssen.co.uk/) integrate smart metering statistics into the portal. With over 1.8 million meters generating 170 million daily readings, this feature redefines data accessibility. Aggregated insights from 84,000 Low Voltage feeders and 36,000 substations power new levels of analysis, from energy consumption modeling to renewable resource integration.

This ambitious step not only aligns with the UK’s net-zero goals but also cements [SSEN](https://www.ssen.co.uk/)’s role as an industry pioneer. As the portal scales to accommodate billions of rows of data, it stands as a beacon of what’s possible when innovation meets purpose.

### Conclusion: Setting a New Standard

[The SSEN Data Portal](https://data.ssen.co.uk/) isn’t just a technological achievement; it’s a testament to what’s achievable when organizations embrace data as a strategic asset. By addressing challenges head-on and delivering a platform built for the future, [SSEN](https://www.ssen.co.uk/) and [Datopian](https://datopian.com) have set a new benchmark for the energy sector. This isn’t just about managing data—it’s about empowering progress, fostering innovation, and building a sustainable future.

The SSEN Data Portal isn’t just another digital tool—it’s a catalyst for progress in the energy sector. By seamlessly integrating advanced technologies like [CKAN](https://www.datopian.com/solutions/ckan) and PortalJS, it transforms complex data into actionable insights, enabling smarter decisions and stronger collaborations. This platform reflects [SSEN](https://www.ssen.co.uk/’s unwavering commitment to innovation, sustainability, and transparency. With smart metering on the horizon and an ever-expanding dataset, SSEN is poised to redefine how data powers a greener, smarter, and more connected energy ecosystem. This is more than a project. It’s a blueprint for the future of energy management.

For more details check these case sudies:
https://www.datopian.com/showcase/case-studies/empowering-energy-sector-ckan-portaljs-scottish-southern-electricity-networks

https://www.datopian.com/showcase/case-studies/enhancing-energy-efficiency-scottish-southern-electricity-networks

**[Get started with PortalJS Cloud today](https://cloud.portaljs.com)** and discover the fastest, most efficient way to launch your **open data portal solution**.
