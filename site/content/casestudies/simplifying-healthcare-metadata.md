---
filetype: 'casestudy'
created: 2025-06-07
title: Simplifying Healthcare Metadata / Making Sensitive Data Usable — Without Changing the Backend
metatitle: PortalJS for OpenMetadata | Simple, Secure Frontend for Healthcare Data
metaDescription: A UK public health agency used PortalJS to build a clean, searchable frontend over OpenMetadata—enabling non-technical researchers to securely discover and request 300+ datasets via Azure.
description: Discover how a UK public health organization transformed complex metadata into a searchable, user-friendly experience. Built with PortalJS over OpenMetadata, this frontend gives non-technical researchers secure access to 300+ datasets — no backend overhaul required.
image: /static/img/showcases/2025-06-05-simplifying-healthcare-metadata/featured-image.jpg
images:
  ["/static/img/showcases/2025-06-05-simplifying-healthcare-metadata/image1.jpg","/static/img/showcases/2025-06-05-simplifying-healthcare-metadata/image2.jpg","/static/img/showcases/2025-06-05-simplifying-healthcare-metadata/image3.jpg","/static/img/showcases/2025-06-05-simplifying-healthcare-metadata/image4.jpg","/static/img/showcases/2025-06-05-simplifying-healthcare-metadata/image5.jpg","/static/img/showcases/2025-06-05-simplifying-healthcare-metadata/image6.jpg","/static/img/showcases/2025-06-05-simplifying-healthcare-metadata/image7.jpg","/static/img/showcases/2025-06-05-simplifying-healthcare-metadata/image8.jpg"]
authors: ['luccasmateus']
keystats:
  [
    '100% Secure/n Entra ID login, Azure-hosted',
    '300+ Datasets/n searchable via PortalJS',
    '60% Fewer Tickets/n metadata-related support requests down',
  ]
faqs:
  - question: 'Does this replace OpenMetadata?'
    answer: 'No — it extends it. PortalJS acts as a frontend layer while OpenMetadata remains the backend.'
  - question: 'Is this secure enough for healthcare data?'
    answer: 'Yes. All access is governed via Microsoft Entra ID. No data is exposed unless authorized.'
  - question: 'Can I deploy this on my own infrastructure?'
    answer: 'Absolutely. The solution is delivered as a Docker container and works seamlessly with Azure-based environments.'
  - question: "What if I'm not in healthcare?"
    answer: 'No problem — PortalJS works across sectors: government, energy, finance, climate, and more.'
problem:
  '### Sensitive healthcare data was locked behind technical barriers

  - **Hidden Catalog**- Researchers couldn’t view or search the full dataset inventory across virtual machines.

  - **Fragmented Access**- Each user only saw a limited slice of the data, causing duplicated work and missed insights.

  - **Technical Interfaces**- OpenMetadata’s UI was built for engineers, not clinicians or public health researchers — resulting in friction and delays.'
solution:
  '### A user-friendly PortalJS frontend over OpenMetadata

  - **PortalJS Interface**- A lightweight, intuitive frontend tailored for non-technical researchers to explore and request data.

  - **OpenMetadata Backbone**- Metadata, access control, and governance handled via robust backend APIs — invisible to end users.

  - **Smart Features**- Secure login with Microsoft Entra ID, built-in glossary, dataset Q&A, and one-click publishing to virtual workspaces.'
results:
  '### Healthcare research workflows — simplified and accelerated

  - **Unified Discovery**- Researchers can now search and filter across the full dataset catalog with ease.

  - **Human-Centric UX**- Q&A threads and glossary terms reduce confusion and support tickets.

  - **Operational Boost**- Faster dataset provisioning, better data reuse, and less friction in onboarding new researchers.'
features:
  [
    ' - **Api-first, backend-agnostic** – Build modern data portals on any backend — from CKAN to OpenMetadata — using a clean, decoupled, API-first architecture.',
    'standards',
    ' - **Modern web stack** – Built with Next.js, TailwindCSS, and React — PortalJS offers a lightweight, maintainable, developer-friendly foundation.',
    'api',
    ' - **Dockerized for speed** – Deploy fast with containerized builds that fit neatly into your DevOps pipelines — on cloud or on-prem.',
    'rocket',
    ' - **Designed for non-technical users** – Make data usable for everyone — researchers, citizens, analysts — with intuitive, clean UI tailored to real-world needs.',
    'presentation-3',
    ' - **Secure by design** - Integrates easily with identity providers like Microsoft Entra ID to ensure secure, role-based access control.',
    'key',
    ' - **Pluggable and extensible** - Adapt and grow your portal with reusable components, custom layouts, and rich integration options — all without vendor lock-in.',
    'puzzle',
  ]
quote:
  [
    'We needed a simple way to bridge usability gaps without rebuilding infrastructure. PortalJS delivered exactly that.',
    '',
    ' Project Stakeholder, Public Health Data Service
',
  ]
portal:
  [
    'The Public Health Data Portal',
    'A clean, Azure-integrated data portal built with researchers in mind.',
  ]
table: healthcare
longRead: false
---