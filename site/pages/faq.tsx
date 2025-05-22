import { Disclosure, Tab } from '@headlessui/react'
import ReactMarkdown from 'react-markdown'
import { H1 } from 'components/custom/header'
import Layout from '@/components/Layout'
import React from 'react'
import { NextSeo } from 'next-seo'

const questions = [
  {
    category: 'General Questions',
    items: [
      {
        question: 'What is PortalJS Cloud?',
        answer:
          'PortalJS Cloud is a fully managed open data portal solution designed for governments, non-profits, academics and companies of all sizes. It takes the complexity out of hosting, maintaining, and customizing an open data platform so you can focus on sharing data, not managing infrastructure.',
      },
      {
        question: 'Who is PortalJS Cloud for?',
        answer: `PortalJS Cloud is designed for:
- **Government agencies** that need a secure and scalable open data solution.
- **Municipalities** & cities looking for an affordable and compliant data portal.
- **Universities** & research institutions that require structured, easy-to-share datasets.
- **NGOs & nonprofits** seeking an easy-to-use platform without IT overhead.
`,
      },
      {
        question: 'How do I get started with PortalJS Cloud?',
        answer: `You can get started in **minutes** with a **free trial**, or schedule a demo to see how PortalJS Cloud can fit your needs.

 🔥 [Start Free Trial](http://portaljs.com/pricing) | [Schedule a Demo](https://calendar.app.google/sn2PU7ZvzjCPo1ok6)`,
      },
      {
        question:
          'What are the benefits of a managed open data portal versus self-hosting?',
        answer:
          'A managed open data portal like PortalJS Cloud removes the burden of hosting, security, and maintenance. Self-hosting requires in-house technical expertise, infrastructure costs, and ongoing updates. With PortalJS Cloud, we handle everything—ensuring uptime, security, and performance so you can focus on publishing and using data, not maintaining servers.',
      },
    ],
  },
  {
    category: 'Setup & Deployment',
    items: [
      {
        question: 'How long does it take to set up a PortalJS Cloud instance?',
        answer: `Your data portal can be fully deployed in **5 minutes**. No complex configurations, no waiting for IT approvals—just sign up, configure your portal, and start publishing data immediately. With our **AI-assisted metadata generation**, your datasets are automatically enriched with structured, compliant metadata, making them **easier to discover, categorize, and use**.

Metadata is the foundation of any effective data portal, improving searchability, interoperability, and data quality.`,
      },
      {
        question: 'Do I need technical expertise to use PortalJS Cloud?',
        answer:
          'No. PortalJS Cloud is designed for non-technical users. Everything from hosting to security updates is managed for you, allowing you to focus on publishing and sharing data.',
      },
      {
        question:
          'Can I migrate from another data portal platform like Socrata, DKAN, or OpenDataSoft?',
        answer: `Yes! If you're tired of high fees, vendor lock-in, or outdated interfaces, we make migration simple and cost-effective. Our team will help move your datasets, metadata, and configurations with minimal disruption.`,
      },
    ],
  },
  {
    category: 'Features & Functionality',
    items: [
      {
        question: 'How does AI Metadata Generation work?',
        answer:
          'When you upload a dataset, AI automatically generates metadata based on the file contents, ensuring compliance with open data standards while reducing manual effort.',
      },
      {
        question: 'Does PortalJS Cloud support data visualizations?',
        answer:
          'Yes. Our **custom dashboards** add-on allows users to create interactive charts, maps, and reports directly from their datasets—no coding required.',
      },
      {
        question: 'Can I use my own domain name?',
        answer:
          'Yes. You can use a custom domain name for your data portal, ensuring it aligns with your organization’s branding.',
      },
      {
        question: 'Can I publish both public and private datasets?',
        answer:
          'Yes. You can choose to publish datasets publicly or keep them private for internal use. PortalJS Cloud allows controlled access to sensitive or restricted datasets.',
      },
      {
        question:
          'Can datasets be automatically updated from external sources?',
        answer:
          'Yes. Our Harvesting add-on allows you to pull and update datasets automatically from other sources, ensuring your portal always has fresh, up-to-date data. Add-ons are paid features and pricing varies based on individual needs.',
      },
      {
        question: 'What happens if I need a custom feature?',
        answer:
          'We offer **custom development services** for organizations that need additional functionality beyond our standard features. If you need something specific, [let’s talk](https://www.datopian.com/contact).',
      },
    ],
  },
  {
    category: 'Security & Compliance',
    items: [
      {
        question:
          'Does PortalJS Cloud comply with open data policies and regulations?',
        answer:
          'Yes. **PortalJS Cloud is fully compliant** with open data policies, supporting **DCAT**, **Dublin Core**, and **WCAG 2.1 AA standards**. This ensures **interoperability**, **accessibility**, and **compliance** with government and institutional requirements.',
      },
      {
        question: 'How is data privacy handled in PortalJS Cloud?',
        answer:
          'We follow **enterprise-grade security standards**, including **role-based access control (RBAC)**, **SSL encryption**, and **secure authentication**. You control who has access to datasets and can restrict visibility as needed.',
      },
      {
        question: 'Can I control who accesses and edits my datasets?',
        answer:
          'Yes. PortalJS Cloud allows **granular role-based permissions**, enabling you to **control dataset access at the user, team, or organization level**. You decide who can view, edit, or publish datasets.',
      },
    ],
  },
  {
    category: 'Integrations & API',
    items: [
      {
        question: 'Does PortalJS Cloud have a REST API?',
        answer:
          'While PortalJS itself does not provide a standalone REST API, it is built to integrate with backend systems that offer RESTful services, thereby enabling rich data portal functionalities.',
      },
      {
        question:
          'Can I connect my data portal to internal databases or cloud storage?',
        answer:
          'Yes. PortalJS Cloud **supports integrations** with internal databases, cloud storage, and external data pipelines, making it easy to centralize and manage your datasets.',
      },
      {
        question:
          'Can I embed PortalJS Cloud datasets in other websites or applications?',
        answer:
          'Yes. PortalJS Cloud provides **embeddable dataset views** and **API-based access**, allowing you to **integrate datasets into external websites, applications, and dashboards.**',
      },
      {
        question: 'Can I integrate PortalJS Cloud with other platforms?',
        answer: `Yes. PortalJS Cloud allows seamless connections with GIS, BI, and other data tools. You can export spatial data for GIS applications, embed visualizations from BI tools like Tableau, or pull data into external dashboards via API. Whether you're working with mapping, analytics, or public-facing tools, your data stays accessible and interoperable.`,
      },
    ],
  },
  {
    category: 'Technical & Hosting',
    items: [
      {
        question: 'Where is PortalJS Cloud hosted?',
        answer:
          'PortalJS Cloud is **hosted on scalable cloud infrastructure**, ensuring **high availability, security, and performance**. We use leading cloud providers to guarantee **99.99%** uptime.',
      },
      {
        question: 'What happens if my portal receives high traffic?',
        answer:
          'PortalJS Cloud **auto-scales** to handle **high traffic loads**, ensuring performance remains fast and stable even during spikes in usage.',
      },
      {
        question: 'How does PortalJS Cloud ensure uptime and performance?',
        answer:
          'We use **load balancing**, **CDN distribution**, **caching**, and **optimized rendering strategies** like **SSG (Static Site Generation)** and **ISR (Incremental Static Regeneration)** to keep your portal fast and always available.',
      },
      {
        question:
          'Can I move my data if I decide to stop using PortalJS Cloud?',
        answer:
          'Yes. **You always own your data**. If you decide to migrate, you can **export your datasets and metadata** at any time, ensuring **full data portability**.',
      },
    ],
  },
  {
    category: 'Pricing & Plans',
    items: [
      {
        question: 'How much does PortalJS Cloud cost?',
        answer: `Unlike platforms like Socrata that charge six-figure annual fees, PortalJS Cloud offers simple, transparent pricing:

- **Foundation Plan** - $99/month billed annually (ideal for small towns and NGOs)
- **Institution Plan** - $299/month billed annually (for universities & mid-sized cities)
- **Enterprise Plan** - Custom pricing (for large-scale deployments with advanced needs)

See more details on our [pricing page](https://portaljs.com/pricing).`,
      },
      {
        question: 'What is included in each plan?',
        answer:
          'Each plan includes **fully managed hosting**, **unlimited datasets**, **API access**, **role-based permissions**, and **metadata automation**. Higher-tier plans include **custom branding**, **advanced security**, and **additional storage**. See details on our [pricing page](https://portaljs.com/pricing).',
      },
      {
        question: 'Is there a free trial available?',
        answer:
          'Yes. **PortalJS Cloud offers a free trial**, so you can explore its features before committing.',
      },
      {
        question: 'Are there any hidden fees?',
        answer: `No. Our pricing is transparent, and you only pay for the plan that fits your needs. If you need add-ons or additional work, you can [contact us](https://calendar.app.google/sn2PU7ZvzjCPo1ok6) and we'll provide information.`,
      },
      {
        question: 'Can I upgrade or downgrade my plan?',
        answer:
          'Yes. You can scale your plan at any time based on storage needs, user access, and additional features.',
      },
      {
        question: 'Can I add more storage or features later?',
        answer:
          'Yes. **PortalJS Cloud** is scalable—you can add **more storage, user accounts, and advanced features** as your needs grow.',
      },
    ],
  },
  {
    category: 'Support & Maintenance',
    items: [
      {
        question: 'What kind of support does PortalJS Cloud offer?',
        answer:
          'We offer **24/7 technical support**, with priority response times for Institution and Enterprise plans. ',
      },
      {
        question: 'Who maintains the platform?',
        answer: `We do - [Datopian](https://datopian.com), a team of data experts with two decades of pioneering data tools and solutions.

- We know how to build powerful data portals - we built the first open data portals, including data.gov and data.gov.uk;
- We’ve worked with Google, the World Bank, governments, and Fortune 500 companies worldwide;
- We are the creators, co-stewards, and core developers of [CKAN](https://ckan.org) - the world's most trusted open-source data management software and many other open-source products such as: [Datahub.io](https://datahub.io) - A hub for publishing and discovering high-quality datasets; [Frictionless Data](https://frictionlessdata.io) - A framework for effortless data validation and interoperability; [Flowershow](https://flowershow.app) - A modern static site generator for publishing Markdown-based website; [MarkdownDB](https://markdowndb.com) - A lightweight, file-based data store; [Giftless](https://github.com/datopian/giftless) - A content-addressable file storage proxy for efficient data handling; and more.

**PortalJS Cloud is fully managed**, which means we handle hosting, updates, security patches, and performance optimization. You never have to worry about maintaining servers or troubleshooting issues.
`,
      },
      {
        question: 'Can you help us migrate from our existing data portal?',
        answer:
          'Yes. We provide **full migration support**, helping you transition **seamlessly** from other platforms like **CKAN**, **Socrata**, **DKAN**, **OpenDataSoft** or custom data portals.',
      },
    ],
  },
]

export default function FAQ() {
  return (
    <Layout>
      <NextSeo
        title="FAQ"
        description="Frequently Asked Questions about PortalJS Cloud."
      />
      <Tab.Group>
        <div className="mx-auto lg:my-20">
          <section className="flex flex-col lg:flex-row gap-10 items-center lg:items-start w-full">
            <div className="flex flex-col items-center lg:items-start shrink-0 ">
              <H1 className="mb-10  text-center lg:text-start font-semibold dark:text-white max-w-sm shrink-0">
                Frequently Asked Questions
              </H1>
              <Tab.List className="grid sm:grid-cols-2  gap-x-3 lg:flex lg:flex-col lg:items-start  lg:space-y-6">
                {questions.map((category, categoryIndex) => (
                  <Tab as={React.Fragment} key={categoryIndex}>
                    {({ selected }) => (
                      <button
                        className={`${
                          selected ? 'text-blue-400' : 'text-gray-500'
                        } transition lg:text-xl font-semibold focus:outline-none`}
                      >
                        {category.category}
                      </button>
                    )}
                  </Tab>
                ))}
              </Tab.List>
            </div>
            <Tab.Panels className="w-full">
              {questions.map((category, categoryIndex) => (
                <Tab.Panel key={categoryIndex} className="mt-6 w-full">
                  {category.items.map((question, questionIndex) => (
                    <Disclosure
                      key={questionIndex}
                      as="div"
                      className="min-w-full w-full"
                    >
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-lg font-medium text-left dark:text-white focus:outline-none focus-visible:ring focus-visible:ring-primary-500 focus-visible:ring-opacity-75 text-2xl p-10 group min-w-full">
                            <span className="group-hover:text-blue-400 transition">
                              {question.question}
                            </span>
                            <svg
                              className={`${
                                open ? 'transform rotate-180' : ''
                              } w-5 h-5 dark:text-white`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 12a1 1 0 01-.7-.29l-4-4a1 1 0 111.42-1.42L10 10.59l3.29-3.3a1 1 0 111.42 1.42l-4 4a1 1 0 01-.71.29z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Disclosure.Button>
                          <Disclosure.Panel className="px-4 pt-3 pb-5 text-base dark:text-gray-300 prose dark:prose-dark dark:prose-invert max-w-none">
                            <ReactMarkdown>{question.answer}</ReactMarkdown>
                          </Disclosure.Panel>
                          {questionIndex < category.items.length - 1 && (
                            <hr className="mt-5 border-t border-gray-200 dark:border-gray-700" />
                          )}
                        </>
                      )}
                    </Disclosure>
                  ))}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </section>
        </div>
      </Tab.Group>
    </Layout>
  )
}
