import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { CheckIcon } from '@heroicons/react/24/solid'

export const WhatYouGet = () => {
  const features = [
    {
      title: 'Core Features',
      description: [
        'Modern, responsive data portal',
        'Customizable branding and design',
        'Powerful search functionality',
        'Data visualization tools',
        'User analytics dashboard',
      ],
      style: '',
    },
    {
      title: 'Security and Compliance',
      description: [
        'Role-based access control (RBAC)',
        'Regular security updates',
        'Optional audit logs for all activities',
        'Compliance with open data standards',
        'SSL by default',
      ],
      style: '',
    },
    {
      title: 'Support & Maintenance',
      description: [
        '24/7 infrastructure monitoring',
        'Technical support via email and chat',
        'Comprehensive documentation',
        'Training resources and webinars',
        'Regular feature updates',
      ],
      style: '',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center mb-4">What You Get with PortalJS Cloud</H2>
        <H3 className="opacity-75 text-center mb-4">
          A complete solution for publishing and managing your data portal.
        </H3>
        <div className="mt-16 grid grid-cols-1 gap-y-12  sm:gap-x-12 lg:grid-cols-3 lg:gap-x-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative flex flex-col rounded-xl dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 p-7 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="">
                <h3 className="text-lg font-medium mb-6">{feature.title}</h3>
                <div className="flex flex-col gap-3">
                  {feature.description.map((desc, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <CheckIcon className="text-white bg-blue-400 h-6 w-6 p-1 rounded-full shrink-0" />
                      <span className="text-sm ">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="italic text-center mt-8 text-slate-400">
          Looking for advanced features? Many are available with higher-tier
          plans or as add-ons.{' '}
          <a
            target="_blank"
            href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1-eNAN55dVh2DQrAnDDaHkrLz7el8-NOwW85cWoRj6ckEApcoESISKQ-iKSKbMOH1O21uP94Y_"
            className="underline transition-all"
          >
            Let's talk!
          </a>
        </p>
      </div>
    </div>
  )
}
