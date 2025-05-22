import '../styles/globals.css';
import '../styles/tailwind.css';
import '../styles/sib-form.css';

import Script from 'next/script';

import { DefaultSeo } from 'next-seo';

import { NavGroup, NavItem, pageview, ThemeProvider } from '@portaljs/core';
import { siteConfig } from '../config/siteConfig';
import { useEffect } from 'react';
import { useRouter } from 'next/dist/client/router';

export interface CustomAppProps {
  meta: {
    showToc: boolean;
    showEditLink: boolean;
    showSidebar: boolean;
    showComments: boolean;
    urlPath: string; // not sure what's this for
    editUrl?: string;
    [key: string]: any;
  };
  siteMap?: Array<NavItem | NavGroup>;
  [key: string]: any;
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (siteConfig.analytics) {
      const handleRouteChange = (url) => {
        pageview(url);
      };
      router.events.on('routeChangeComplete', handleRouteChange);
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }
  }, [router.events]);

  return (
    <ThemeProvider
      disableTransitionOnChange
      attribute="class"
      defaultTheme={siteConfig.theme.default}
      forcedTheme={siteConfig.theme.default ? null : 'light'}
    >
      <DefaultSeo
        defaultTitle={siteConfig.title}
        description={siteConfig.description}
        titleTemplate="DataHub PortalJS - %s"
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

      {/* Umami Analytics */}
      <Script
        async
        defer
        data-website-id="061e14c1-6157-4a93-820c-777c7a937c12"
        src="https://analytics.datopian.com/umami.js"
      />

      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
