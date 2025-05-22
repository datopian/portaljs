import '@/styles/global.css'
import '@/styles/prism.css'
import '@/styles/docsearch.css'
import 'tailwindcss/tailwind.css'
import Script from 'next/script'
import { DefaultSeo } from 'next-seo'
import { NavGroup, NavItem, pageview, ThemeProvider } from '@portaljs/core'
import siteConfig from '../config/siteConfig'
import { useEffect } from 'react'
import { useRouter } from 'next/dist/client/router'
import { Noto_Sans as Roboto_Condensed } from 'next/font/google'

export interface CustomAppProps {
  meta: {
    showToc: boolean
    showEditLink: boolean
    showSidebar: boolean
    showComments: boolean
    urlPath: string // not sure what's this for
    editUrl?: string
    [key: string]: any
  }
  siteMap?: Array<NavItem | NavGroup>
  [key: string]: any
}

const RobotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'], // Include all desired weights
  variable: '--font-roco',
})
function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    if (siteConfig.analytics) {
      const handleRouteChange = (url) => {
        if (typeof window.gtag === 'function') {
          window.gtag('config', siteConfig.analytics, {
            page_path: url,
          })
        } else {
          console.warn('gtag function is not available')
        }
      }

      router.events.on('routeChangeComplete', handleRouteChange)
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }
  }, [router.events])

  return (
    <ThemeProvider
      disableTransitionOnChange
      attribute="class"
      // defaultTheme={siteConfig.theme.default}
      // forcedTheme={siteConfig.theme.default ? null : 'light'}
      defaultTheme="dark"
      forcedTheme="dark"
    >
      <DefaultSeo
        defaultTitle={siteConfig.title}
        titleTemplate={'%s | ' + siteConfig.title}
        description={siteConfig.description}
        //titleTemplate="PortalJS - %s"
        additionalMetaTags={[
          { name: 'author', content: siteConfig.author },
          { name: 'publisher', content: siteConfig.author },
        ]}
        {...siteConfig.nextSeo}
      />

      {/* Global Site Tag (gtag.js) - Google Analytics */}
      {siteConfig.analytics && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.analytics}`}
          />
          <Script
            id="gtag-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${siteConfig.analytics}', {
            page_path: window.location.pathname,
          });
        `,
            }}
          />
        </>
      )}
      <main className={` font-sans`}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  )
}

export default MyApp
