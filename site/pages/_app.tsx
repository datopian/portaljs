import '@/styles/global.css';
import '@/styles/prism.css';
import '@/styles/docsearch.css';
import Script from 'next/script';
import { generateDefaultSeo } from 'next-seo/pages';
import Head from 'next/head';
import { NavGroup, NavItem, pageview, ThemeProvider } from '@portaljs/core';
import siteConfig from '../config/siteConfig';
import { useEffect } from 'react';
import { useRouter } from 'next/dist/client/router';
import { Noto_Sans as Roboto_Condensed } from 'next/font/google';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { createBotFilter } from '../lib/analyticsBotFilter';

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

const RobotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'], // Include all desired weights
  variable: '--font-roco',
});

// PostHog is initialised at MODULE scope, not from _app's useEffect (po-6el).
//
// React runs effects bottom-up: a page's own useEffect fires BEFORE its parent
// _app's. Initialising here from an effect therefore lost every capture a page
// made on first commit. /build measured the damage: it captures build_viewed
// from a useEffect gated on router.isReady, and on a cold load with no query
// string isReady is already true at first commit, so the capture ran against an
// uninitialised SDK and was dropped. In PostHog, 8 of 8 /build loads carrying
// ?prompt= produced a build_viewed (the query string forces a second render, by
// which time _app's effect had run) against 38 of 56 without one — a third of
// the funnel's denominator, silently missing.
//
// Module scope runs at import, before any component renders, so the SDK is ready
// for the first capture any page makes. This is also the pattern PostHog
// documents for the Next.js pages router.
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2025-11-30',
    // Drop events from automated clients before they leave the browser (po-ywf).
    before_send: createBotFilter(),
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}
function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (siteConfig.analytics) {
      const handleRouteChange = (url) => {
        if (typeof window.gtag === 'function') {
          window.gtag('config', siteConfig.analytics, {
            page_path: url,
          });
        } else {
          console.warn('gtag function is not available');
        }
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
      // defaultTheme={siteConfig.theme.default}
      // forcedTheme={siteConfig.theme.default ? null : 'light'}
      defaultTheme="light"
      forcedTheme="light"
    >
      <Head>
        {generateDefaultSeo({
          defaultTitle: siteConfig.title,
          titleTemplate: '%s | ' + siteConfig.title,
          description: siteConfig.description,
          additionalMetaTags: [
          { name: 'author', content: siteConfig.author },
          { name: 'publisher', content: siteConfig.author },
        ],
          ...siteConfig.nextSeo,
        })}
      </Head>

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
      <PostHogProvider client={posthog}>
        <main className={`${RobotoCondensed.variable} font-sans`}>
          <Component {...pageProps} />
        </main>
      </PostHogProvider>
    </ThemeProvider>
  );
}

export default MyApp;
