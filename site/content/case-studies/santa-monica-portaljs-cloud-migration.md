---
filetype: 'casestudy'
created: 2026-10-23
title: City of Santa Monica / 115 Datasets Moved to Managed PortalJS Cloud Without Breaking a Single Link
metatitle: 'City of Santa Monica: Open Data Portal on PortalJS Cloud'
metaDescription: 'Discover how the City of Santa Monica moved 115 datasets and 6.5M+ records to fully managed PortalJS Cloud, with every link unchanged and its data pipelines still running.'
description: 'The City of Santa Monica moved its open data portal from a self-hosted CKAN instance to fully managed PortalJS Cloud in July 2026. All 115 datasets and over 6.5 million data records moved across with every link and identifier unchanged, the City''s automated pipelines kept running after a configuration change, and hosting and upgrades are now covered by one predictable subscription.'
image: /images/casestudies/santa-monica-featured.webp
images: ['/images/casestudies/santa-monica-homepage.webp', '/images/casestudies/santa-monica-datasets.webp', '/images/casestudies/santa-monica-topics.webp', '/images/casestudies/santa-monica-dataset.webp']
authors: ['joaodemenech']
keystats:
  [
    '115/n datasets migrated',
    '6.5M+/n data records moved',
    'Zero/n pipelines rebuilt',
  ]
problem: '- **A tightly managed budget**: Like many local governments, the City needed its open data commitments to fit a predictable budget, without separate projects for infrastructure and upgrades.

  - **Running the platform in-house**: The City hosted its own CKAN instance, so servers, upgrades and their funding sat with the City, for a portal whose needs were those of a standard open data catalog.

  - **Pipelines that could not break**: Around 15 automated pipelines feed the portal from City systems such as permits and inspections, business licenses, police and fire calls for service, and council agendas.'
solution: '- **Fully managed on [PortalJS Cloud](https://cloud.portaljs.com)**: Hosting, upgrades and security moved to Datopian under one flat subscription.

  - **A new portal in the City''s brand**: Official logo, typeface and colors, with a footer linking back into santamonica.gov. Every page reads live from the catalog.

  - **Full catalog migration, checked end to end**: 115 datasets, public and private, and over 6.5 million records across more than 130 data tables, compared table by table against the original portal.

  - **Same API, same pipelines**: PortalJS Cloud is built on CKAN and offers a CKAN-compatible API, including the DataStore, so the City repointed its pipelines with a configuration change.'
results: '- **[New branded portal live](https://datajs.santamonica.gov/)**: Launched in July 2026 with the full catalog on board, validated and signed off by the City''s team.

  - **No more upgrade projects**: Hosting, upgrades and security are covered by the subscription, so the cost of running the portal is known in advance.

  - **Nothing breaks for data users**: Every dataset link and identifier is unchanged, so the apps, web pages and scripts that use the City''s data keep working.

  - **Pipelines carried over, not rebuilt**: The City''s automated feeds continue after a configuration change.'
features: [
  {
    title: "Fully Managed Service",
    text: "PortalJS Cloud handles hosting, upgrades and security, so keeping the portal running no longer depends on the City finding internal budget and staff time for infrastructure work.",
    icon: "server"
  },
  {
    title: "Predictable Subscription",
    text: "One flat subscription covers hosting, upgrades, security and support, giving the City a known budget line for its open data portal.",
    icon: "ewallet"
  },
  {
    title: "CKAN-Compatible API",
    text: "PortalJS Cloud is built on CKAN and exposes a CKAN-compatible API, including the DataStore. The City's ~15 automated pipelines kept working after a configuration change.",
    icon: "api"
  },
  {
    title: "Complete, Validated Migration",
    text: "115 datasets, public and private, and over 6.5 million records were migrated with visibility, links and identifiers preserved, then checked against the original portal.",
    icon: "database"
  },
  {
    title: "City-Branded Portal",
    text: "A new PortalJS frontend in the City's official logo, typeface and colors, reading live from the catalog so what departments publish appears immediately.",
    icon: "paint-roller"
  },
  {
    title: "Search, Filter and Preview",
    text: "Visitors search 82 public datasets across 11 topics, filter by topic, format and tag, share any filtered view, and preview data in the browser before downloading.",
    icon: "magnify"
  }
]
portal:
  [
    'Santa Monica Open Data',
    'The City of Santa Monica''s open data portal, publishing 82 public datasets across 11 topics, from sustainability and permits to public safety and council business.',
    'https://datajs.santamonica.gov/',
  ]
faqs:
  - question: 'Does moving to PortalJS Cloud mean leaving CKAN behind?'
    answer: 'No. PortalJS Cloud is built on CKAN and exposes a CKAN-compatible API, including the DataStore, so existing integrations and data pipelines keep working. For the City of Santa Monica, around 15 automated pipelines were pointed at PortalJS Cloud with a configuration change rather than rebuilt. What changes is who runs the platform.'
  - question: 'Will existing dataset links still work after migrating to PortalJS Cloud?'
    answer: 'Yes. In the Santa Monica migration, every dataset link and identifier was kept unchanged, so apps, web pages and bookmarks that use the City''s data continue to work. The new and existing portals also ran side by side until the City was satisfied, keeping the switch-over low-risk.'
  - question: 'Can private datasets and large data tables be migrated to PortalJS Cloud?'
    answer: 'Yes. Datopian moved Santa Monica''s full catalog of 115 datasets, public and private, with their visibility preserved, plus over 6.5 million data records across more than 130 data tables. Every table and every dataset''s details were compared against the original portal, and the City''s team confirmed nothing was missing.'
  - question: 'Is PortalJS Cloud a good fit for organizations with tight budgets?'
    answer: 'Yes. That is who it is designed for. PortalJS Cloud runs as a managed service on one predictable subscription, so open data publishing continues without an internal platform team or separate upgrade projects. Organizations that need deep customization or full control over their own infrastructure may still be better served by self-hosted CKAN.'
narrative: |
  Santa Monica is a coastal city of about 90,000 people in Los Angeles County. Its open data portal publishes City data on sustainability, permits and development, public safety, business licensing, finance and council business, and sustainability alone accounts for 49 of its 82 public datasets. Many datasets are refreshed automatically from City systems every day.

  The partnership with Datopian goes back to 2022, when Datopian [moved the City's portal from Socrata to CKAN](https://www.datopian.com/showcase/case-studies/from-socrata-to-ckan-seamless-migration-city-of-santa-monica) within 30 days and then supported its CKAN instance. In 2023, the City first raised the idea of handing the platform to Datopian to run on a subscription. In 2026, with its support contract up for renewal, it made that move.

  The decision was not about which catalog technology to use, but who should run it. Because [PortalJS Cloud](https://cloud.portaljs.com) is built on CKAN, the City kept the data model, pipelines and links it had built over four years, and handed hosting, upgrades and security to Datopian on one predictable subscription.
longReadLink: 'https://www.datopian.com/showcase/case-studies/santa-monica-portaljs-cloud-migration'
longReadTitle: 'How the City of Santa Monica Moved 115 Datasets to PortalJS Cloud Without Breaking a Single Link'
longReadSummary: 'The full story, from the partnership timeline and criteria to a walkthrough of the new portal and how the pipelines carried over.'
---
