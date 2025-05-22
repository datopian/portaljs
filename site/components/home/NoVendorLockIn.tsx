import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/solid'
import { H2, H3 } from '../custom/header'
import { Player } from '@lottiefiles/react-lottie-player'
import Link from 'next/link'
import { useTheme } from 'next-themes'

export default function NoVendorLockIn() {
  const { theme } = useTheme()
  const items = [
    {
      icon: `/static/icons/${theme}/complete.json`,
      title: 'Sign up for an account',
      description: 'Create your account in minutes.',
      style: 'dark:-rotate-[3deg]',
    },
    {
      icon: `/static/icons/${theme}/data-lake.json`,
      title: 'Upload your datasets',
      description: 'Easily upload your datasets with our intuitive interface.',
      style: 'dark:[1deg]',
    },
    {
      icon: `/static/icons/${theme}/stationery.json`,
      title: 'Customize your portal',
      description: (
        <div className="flex flex-col gap-2 mt-2">
          Tailor the look and feel of your data portal to match your brand —
          logo, fonts, colors, layout, and more.
          <div className="flex items-center gap-2 mt-2">
            <CheckIcon
              width={14}
              height={14}
              className="text-blue-400 shrink-0"
            />{' '}
            <p className="">
              <b>Fully open-source template</b> — fork it, extend it, make it
              yours.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckIcon
              width={14}
              height={14}
              className="text-blue-400 shrink-0 mt-2"
            />
            <p>
              <b>Need help?</b> Our team can handle custom design and
              implementation for you.{' '}
              <a
                href="mailto:portaljs@datopian.com"
                className="text-blue-400 hover:underline"
              >
                <b>Let's talk!</b>
              </a>
            </p>

          </div>
        </div>
      ),
      style: '-rotate-[4deg]',
    },
  ]
  return (
    <div className="relative max-w-none w-full flex justify-center py-24">
      <div className="">
        <div className="flex flex-col lg:flex-row gap-32 lg:justify-between">
          <div className="">
            <H2 className=" mb-4">No Vendor Lock-In</H2>
            <H3 className=" mb-4 max-w-2xl">
              PortalJS Cloud is built on open standards and open-source
              technology. Your data remains yours, and you can export it anytime
              or even self-host if your needs change.
            </H3>{' '}
            <p className="text-lg opacity-75 mb-4 max-w-2xl">
              We believe in giving you flexibility and control over your data
              infrastructure, while providing the convenience of a managed
              service.
            </p>
            <Link
              className="flex items-center gap-1 text-blue-400 hover:text-blue-500 hover:underline"
              href="/blog"
            >
              <p className="max-w-2xl hover:underline transition-all duration-300">
                Learn about our open-source foundation
              </p>
              <ArrowRightIcon
                width={14}
                height={14}
                className="text-blue-400 mt-1"
              />{' '}
            </Link>
          </div>
          <div className="relative w-full max-w-2xl dark:bg-slate-900  flex  rounded-xl shadow-lg overflow-hidden p-8 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all ">
            <div className="grid grid-cols-1 gap-8">
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${index === 2 ? 'items-start' : 'items-center'
                    }`}
                >
                  <div>
                    <Player
                      autoplay
                      loop
                      src={item.icon}
                      className={`w-14 h-14 ${item.style}`}
                    />
                  </div>

                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
