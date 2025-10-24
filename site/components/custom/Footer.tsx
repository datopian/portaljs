import { HeartIcon } from '@heroicons/react/24/solid'
import { NavbarTitle } from '../Nav'
import { RiDiscordFill } from 'react-icons/ri'

const navigation = {
  resources: [
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Data Portals', href: '/data-portals' },
    { name: 'Learn', href: '/learn' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Open Source', href: '/opensource' },
  ],
  integrations: [
    { name: 'CKAN Integration', href: '/ckan' },
    { name: 'OpenMetadata Integration', href: '/openmetadata' },
    { name: 'Comparison Overview', href: '/compare' },
    { name: 'PortalJS vs OpenDataSoft', href: '/compare/opendatasoft' },
  ],
  companyLegal: [
    { name: 'About Us', href: 'https://www.datopian.com/about' },
    { name: 'Contact', href: 'https://www.datopian.com/contact' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Privacy Policy', href: 'https://www.datopian.com/privacy' },
    { name: 'Terms of Use', href: 'https://www.datopian.com/terms' },
  ],
  social: [
    {
      name: 'Linkedin',
      href: 'https://www.linkedin.com/company/10340373/',
      icon: (props) => (
        <svg
          className="w-6 h-6"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="LinkedInIcon"
          fill="currentColor"
        >
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
        </svg>
      ),
    },
    {
      name: 'X',
      href: 'https://twitter.com/datopian',
      icon: (props) => (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          version="1.1"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: 'https://github.com/datopian',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/@datopian1413',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Discord',
      href: 'https://discord.gg/krmj5HM6He', 
      icon: (props) => (
        <RiDiscordFill size={24} {...props}/>
      ),
    },
  ],
}

export default function Footer() {
  return (
    <footer
      className="bg-background dark:bg-background-dark text-primary dark:text-primary-dark"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-8xl px-8  xl:px-12  pb-8 pt-10 sm:pt-16 lg:pt-24">
        <div className="xl:grid xl:grid-cols-3 xl:gap-24">
          <div className="space-y-8">
            <div className="-mx-1">
              {' '}
              <NavbarTitle />
            </div>

            <p className="text-sm leading-6 opacity-75 max-w-md xl:max-w-none">
              PortalJS Cloud is the simplest way of getting started with Open
              Data for governments, non-profits, academics and companies of all
              sizes.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  className="opacity-75 hover:opacity-100"
                  aria-label={`link to ${item.name}`}
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 xl:col-span-2 xl:mt-0">
            <div className="mt-10 md:mt-0">
              <h3 className="text-sm font-semibold leading-6">Resources</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.resources.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm leading-6 opacity-75 hover:opacity-100"
                      aria-label={`link to ${item.name}`}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 md:mt-0">
              <h3 className="text-sm font-semibold leading-6">Integrations & Comparisons</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.integrations.map((item: any) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target={item.target || '_self'}
                      className="text-sm leading-6 opacity-75 hover:opacity-100"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 md:mt-0">
              <h3 className="text-sm font-semibold leading-6">Company & Legal</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.companyLegal.map((item: any) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target={item.target || '_self'}
                      className="text-sm leading-6 opacity-75 hover:opacity-100"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <a
            className="flex items-center justify-center"
            href="https://datopian.com/"
            title="Datopian Website"
            target="_blank"
            rel="noopener noreferrer"
          >
            Built with <HeartIcon className='w-7 h-7 px-1'/> by{' '}
            <img
              src="/static/img/datopian-logo-white.svg"
              alt="Datopian Logo"
              title="Datopian"
              className="h-20  hidden dark:block"
            />
            <img
              src="/static/img/datopian-logo.png"
              alt="Datopian Logo"
              title="Datopian"
              className="h-8 ml-4 dark:hidden"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
