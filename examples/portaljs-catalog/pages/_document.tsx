import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Default PortalJS branding — PLACEHOLDER. Replace the files in `public/`
            (favicon.ico, icon.svg, apple-touch-icon.png, icon-512.png) with your
            own brand marks; these links can stay as-is once the files are swapped. */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="description" content="__DESCRIPTION__" />
        <meta name="theme-color" content="#2563eb" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
