import { Disclosure } from '@headlessui/react'
import ReactMarkdown from 'react-markdown'
import { H2 } from '../custom/header'

const questions = [
  {
    question: 'How does the migration process work?',
    answer:
      'Our streamlined CKAN migration ensures a secure and smooth transition from your self-hosted setup to a fully managed PortalJS Cloud platform. We start with a brief consultation to assess your current environment, then develop a customized migration plan that includes data transfer, validation, and testing—all designed to minimize downtime and disruption. Whether you’re moving from AWS or another hosting solution, our process ensures a seamless switch to a scalable, hassle-free open data portal.',
  },
  {
    question: 'What’s included in the managed service?',
    answer:
      'Our fully managed open data platform takes care of everything so you don’t have to. This includes secure hosting, routine maintenance, performance monitoring, and regular security updates. Whether you’re on the Foundation, Institution, or Enterprise plan, your team can focus on data transparency and engagement without worrying about the tech. For detailed features and options, visit our Pricing Page.',
  },
  {
    question: 'What level of customization is possible?',
    answer:
      'With PortalJS Cloud, the customization possibilities are endless! On the Foundation Plan, you can tweak the basics—logos, fonts, and colors—so it feels like your own. Need something more personalized? The Institution Plan gives you advanced branding and custom dashboard options. And if you are looking for something truly unique, our Enterprise Plan offers fully bespoke development—basically, if you can imagine it, we can build it! Your portal will be 100% tailored to your needs and vision.',
  },
  {
    question: 'How quickly can I launch my open data portal?',
    answer:
      'With PortalJS Cloud, you can launch a fully functional, scalable open data portal in just 5 minutes—faster than any other platform. This rapid open data portal setup means you can immediately start sharing your datasets and engaging your community without delays.',
  },
  {
    question: 'How does PortalJS Cloud compare to a self-hosted CKAN solution?',
    answer:
      'Unlike self-hosted CKAN, PortalJS Cloud is a fully managed solution that reduces operational complexity, slashes AWS costs, and improves security and performance. It lets your team focus on data curation and civic engagement rather than technical maintenance.',
  },
  {
    question: 'What support options are available?',
    answer:
      'We offer comprehensive support tailored to your chosen plan—from standard support with a 48-hour response time on the Foundation plan to priority assistance with a 24-hour response time on the Institution plan. Enterprise clients also benefit from dedicated account management and bespoke support options.',
  },
  {
    question: 'What pricing tiers are available for PortalJS Cloud?',
    answer: `PortalJS Cloud offers a range of pricing tiers to suit different needs and budgets.

- Forever Free (Open Source): Self-hosted, community-supported version for those who want to build it their way.

- Foundation Plan: A fully managed solution at $99/month with essential features and basic branding.

- Institution Plan: At $299/month, it adds advanced branding, increased storage, and priority support for growing organizations.
    
- Enterprise Plan: Custom-priced for organizations needing dedicated instances, bespoke development, advanced security, and comprehensive SLAs.
    
Please see our [Pricing Page](https://www.portaljs.com/pricing) for more details or contact us at [portaljs@datopian.com](mailto:portaljs@datopian.com). `,
  },
  {
    question: 'Are there any discounts for annual billing?',
    answer:
      'Yes, if you choose annual billing, you can save 16%—effectively getting 2 months free compared to monthly payments.',
  },
]

const questions2 = [
  {
    question: 'Can PortalJS handle large datasets?',
    answer:
      'Absolutely. With BigQuery and Prefect integrated, PortalJS can process terabytes of data daily, ensuring swift queries and analysis.',
  },
  {
    question: 'How does the portal support secure data sharing?',
    answer:
      'CKAN extensions like ckanext-noanonaccess enforce secure, authenticated access while keeping sensitive data protected.',
  },
  {
    question: 'Is customization an option?',
    answer:
      '100%. From layout tweaks to advanced data visualizations, we’ll make your portal match your unique needs.',
  },
  {
    question: 'What makes PortalJS + CKAN better than other solutions?',
    answer:
      'Together, they combine speed, reliability, scalability, and customization, giving you a powerful, future-ready platform for data management.',
  },
]

export default function FAQ() {
  return (
    <section>
      <H2 className="py-16  text-4xl font-bold text-center dark:text-white">
        Frequently Asked Questions
      </H2>
      <div className=" mx-auto max-w-8xl px-4 sm:px-8 xl:px-12 flex flex-col space-y-6">
        {(Math.random() > 0.5 ? questions : questions2).map((question) => (
          <Disclosure key={question.question} as="div" className="">
            {({ open }) => (
              <>
                <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-lg font-medium text-left dark:text-white bg-primary-600 rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-primary-500 focus-visible:ring-opacity-75 text-2xl ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl p-10 bg-zinc-50 dark:bg-slate-800/75 ">
                  <span>{question.question}</span>
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
                <Disclosure.Panel className="px-4 pt-3 pb-5 text-base dark:text-gray-300 prose dark:prose-dark max-w-none dark:prose-invert">
                  <ReactMarkdown>{question.answer}</ReactMarkdown>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
      </div>
    </section>
  )
}
