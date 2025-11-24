import { Disclosure } from '@headlessui/react'
import ReactMarkdown from 'react-markdown'
import ButtonLink from '../ButtonLink'
import { H2 } from '../custom/header'
import { homeFaqQuestions } from '@/lib/homeFaqQuestions'

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
          {homeFaqQuestions.map((question, index) => (
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
                  {index < homeFaqQuestions.length - 1 && (
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
