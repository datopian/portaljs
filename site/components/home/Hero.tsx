import { useEffect, useState } from 'react'
import ButtonLink from '../ButtonLink'
import { CheckIcon } from '@heroicons/react/20/solid'
import { H1, H2 } from '../custom/header'
import { HeartIcon } from '@heroicons/react/20/solid'
import { useTheme } from 'next-themes'

export default function Hero() {
  const { theme } = useTheme()
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    // Check screen size and update state
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1280)
    }

    // Initial check
    checkScreenSize()

    // Add resize listener
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  useEffect(() => {
    // Only load globe on large screens (xl: 1280px+) where it's visible
    if (!isLargeScreen) {
      return
    }

    const script = document.createElement('script')
    script.src = 'globe/main.js'
    // script.async = true;

    if (theme === 'dark') {
      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }

    if (theme === 'light') {
      const globe = document.getElementById('globe')
      if (globe) {
        globe.innerHTML = ''
      }
    }
  }, [theme, isLargeScreen])

  return (
    <section className="mx-auto">
      <div className="dark:xl:grid dark:xl:grid-cols-12 xl:gap-8 overflow-hidden dark:mt-[-60px]">
        <div className="text-center md:max-w-2xl md:mx-auto lg:col-span-5 dark:xl:text-left my-16 sm:my-24  lg:my-auto">
          {/* <div className="mb-6">
            <a
              href="https://cloud.portaljs.com/auth/signup"
              className="inline-flex space-x-6 "
            >
              <span className="inline-flex items-center space-x-2 px-3 py-1 text-sm leading-6 text-accent rounded-full dark:bg-slate-500/10 ring-1 ring-inset ring-slate-400/50 dark:ring-slate-500/20">
                <span className="font-bold text-blue-400 ">
                  🔥 PortalJS Cloud (beta) is now available
                </span>
                <ArrowLongRightIcon
                  className="h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
              </span>
            </a>
          </div> */}
          <div className="py-10 dark:py-4">
            {' '}
            <H1 className="-ml-1 text-3xl sm:text-6xl xl:text-7xl bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-clip-text text-transparent pb-3 font-semibold">
              The Data Portals Framework
            </H1>
            <H2 sub={true} className="mt-5 text-base  sm:text-lg xl:text-xl">
              Create data portals people love to use - for internal data management and sharing, research data repositories, and open data portals.
            </H2>
            <div className="mt-5 mt-10 flex justify-center dark:xl:justify-start">
              <div className="mt-3 mt-0 flex gap-4">
                <ButtonLink
                  href="https://cloud.portaljs.com/auth/signup"
                  title="Get started with PortalJS Cloud"
                  className="text-sm"
                  trackConversion={true}
                >
                  Get started free
                </ButtonLink>
                <ButtonLink
                  href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
                  title="Book a demo"
                  style="secondary"
                  className="text-sm"
                >
                  Book a demo
                </ButtonLink>
              </div>
            </div>
            <p className="mt-8 inline-flex items-center font-semibold opacity-75 text-lg gap-1.5">
              Built with <HeartIcon className="h-7 w-7 px-0.5 text-blue-400" />{' '}
              by <a href="https://datopian.com">Datopian</a>
            </p>
          </div>
        </div>
        <div
          className="mt-12 relative sm:max-w-3xl sm:mx-auto lg:mt-0 lg:col-span-7 xl:flex flex items-start justify-start hidden"
          id="globe"
        ></div>
      </div>
    </section>
  )
}
