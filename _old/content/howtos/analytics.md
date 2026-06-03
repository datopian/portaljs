---
title: How to add Google Analytics?
description: Learn how to implement Google Analytics on PortalJS data portals
---

>[!todo] Prerequisites
>- [Google Analytics account](https://support.google.com/analytics/answer/9304153?hl=en)
>- [Google tag ID](https://support.google.com/analytics/answer/12270356?hl=en#:~:text=A%20Measurement%20ID%20is%20an,same%20as%20your%20destination%20ID.)

The following piece of code adds pageview tracking functionality to the custom Next.js App in `/pages/_app.tsx`, but you can use it only in specific pages if you want.

```tsx
// /pages/_app.tsx
import { useRouter } from "next/router";
import { useEffect } from "react";
import Script from "next/script";

// Step 0:
// Add your Google tag ID to your local .env.local file, e.g. under GA_TRACKING_ID

// Step 1: create the following pageview function
const pageview = ({
    url,
    analyticsID,
}: {
    url: string;
    analyticsID: string;
}) => {
    if (typeof window.gtag !== undefined) {
        window.gtag("config", analyticsID, {
            page_path: url,
        });
    }
};

export default function MyApp({ Component, pageProps }) {
	const router = useRouter();

    // ... your code

    // Step 3: Add the following useEffect to trigger pageview on each route change
    useEffect(() => {
        const handleRouteChange = (url) => {
            pageview(url, GA_TRACKING_ID);
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
        };
    }, [router.events]);

    return (
		{/* Step 4: Install Google Analytics tag */}
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
                }}
            />
            <Component {...pageProps} />
        </>
    );
};
```

>[!info]
> For more info on measuring pageviews with Google Analytics see [Google Analytics documentation](https://developers.google.com/analytics/devguides/collection/gtagjs/pages).
