import { Disclosure } from '@headlessui/react'
import ReactMarkdown from 'react-markdown'

export type FAQItem = {
  question: string;
  answer: string;
}

interface FAQProps {
  faqItems: FAQItem[];
}

export function FAQ({ faqItems }: FAQProps) {
  return (
    <div className="py-16 w-full">
      <section className="flex flex-col items-center w-full">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-10 text-center">
          Quick FAQs
        </h2>
        <div className="flex flex-col space-y-6 w-full max-w-3xl mx-auto">
          {faqItems.map((question, index) => (
            <Disclosure key={question.question} as="div">
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-lg font-medium text-left dark:text-white focus:outline-none focus-visible:ring focus-visible:ring-primary-500 focus-visible:ring-opacity-75 p-6 group">
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
                  {index < faqItems.length - 1 && (
                    <hr className="mt-5 border-t border-gray-200 dark:border-gray-700" />
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