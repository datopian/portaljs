import { Disclosure } from '@headlessui/react'
import ReactMarkdown from 'react-markdown'
import ButtonLink from '../ButtonLink'
import { H2 } from '../custom/header'

const questions = [
  {
    question: 'What is PortalJS Cloud?',
    answer:
      'PortalJS Cloud is a fully managed open data portal solution designed for governments, universities, and NGOs. Built on CKAN, it provides a modern, fast, and scalable frontend while eliminating the technical and financial burdens of maintaining an open data portal in-house. It takes the complexity out of hosting, maintaining, and customizing an open data platform so you can focus on sharing data, not managing infrastructure.',
  },
  {
    question: 'Who is PortalJS Cloud for?',
    answer: `PortalJS Cloud is designed for:
  - **Government agencies** that need a secure and scalable open data solution.
  - **Municipalities & cities** looking for an affordable and compliant data portal.
  - **Universities & research institutions** that require structured, easy-to-share datasets.
  - **NGOs & nonprofits** seeking an easy-to-use platform without IT overhead.`,
  },
  {
    question: 'How long does it take to set up a PortalJS Cloud instance?',
    answer: `Your data portal can be fully deployed in 5 minutes. No complex configurations, no waiting for IT approvals—just sign up, configure your portal, and start publishing data immediately. With our AI-assisted metadata generation, your datasets are automatically enriched with structured, compliant metadata, making them easier to discover, categorize, and use.

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
    answer: `Many traditional platforms like Socrata and OpenDataSoft come with high costs, rigid structures, and limited customization. PortalJS Cloud gives you: 
  
  - **No vendor lock-in** - You own your data, your way.
  - **Fully managed hosting** - No IT headaches, no server maintenance.
  - **AI-powered metadata generation** - Upload a dataset, and AI automatically fills in metadata, saving time and ensuring compliance.
  - **Seamless scalability** - Whether you’re a small town or a national agency, PortalJS Cloud grows with you.
  - **Compliance with DCAT, Dublin Core, and WCAG 2.1 AA** - Your data stays structured and accessible.`,
  },
  {
    question: 'How does the AI Metadata Generation feature work?',
    answer:
      'When you upload a dataset, AI automatically generates metadata based on the file contents, ensuring compliance with open data standards while reducing manual effort.',
  },
  {
    question: 'Can I integrate PortalJS Cloud with other platforms?',
    answer: `Yes. PortalJS Cloud supports API access and can integrate with external applications, dashboards, and third-party data systems like ArcGIS, Tableau, and more.`,
  },
  {
    question: 'Does PortalJS Cloud support data visualizations?',
    answer:
      'Yes. Our custom dashboards feature allows users to create interactive charts, maps, and reports directly from their datasets—no coding required.',
  },
  {
    question: 'What happens if I need a custom feature?',
    answer:
      'We offer custom development services for organizations that need additional functionality beyond our standard features. If you need something specific, let’s talk.',
  },
  {
    question: 'How do I get started with PortalJS Cloud?',
    answer: `You can get started in minutes with a free trial, or schedule a demo to see how PortalJS Cloud can fit your needs.
🔥   [Start Free Trial](https://portaljs.com/pricing) | [Schedule a Demo](https://calendar.app.google/sn2PU7ZvzjCPo1ok6)`,
  },
]

export default function FAQ() {
  return (
    <div className="py-24 w-full">
      <section className="flex flex-col lg:flex-row  items-center lg:items-start !justify-between w-full">
        <div className="flex flex-col items-center lg:items-start w-full">
          <H2 className="mb-10  text-center lg:text-start font-semibold dark:text-white max-w-sm shrink-0 leading-[3rem]">
            Frequently Asked Questions
          </H2>
          <ButtonLink
            href="https://portaljs.com/faq"
            title="Explore more FAQs"
            style="secondary"
            className='text-sm mb-12'
          >
            Explore more FAQs
          </ButtonLink>
        </div>
        <div className="  flex flex-col space-y-6 w-full">
          {questions.map((question, index) => (
            <Disclosure key={question.question} as="div" className="max-w-2xl">
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-lg font-medium text-left dark:text-white  focus:outline-none focus-visible:ring focus-visible:ring-primary-500 focus-visible:ring-opacity-75 text-2xl  p-10 group ">
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
                  {index < questions.length - 1 && (
                    <hr className="mt-5 border-t border-gray-200 dark:border-gray-700 " />
                  )}
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </section>
    </div>
  )
}
