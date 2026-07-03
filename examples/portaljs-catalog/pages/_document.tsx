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
        <meta name="theme-color" content="#f6f2e9" />
        {/* Editorial type system (Claude Design import): Newsreader (serif),
            Work Sans (sans), IBM Plex Mono (SQL editor). Loaded via <link> — no
            build-time fetch, so the scaffold builds offline and ships no font
            binaries. Referenced by the font-serif/sans/mono Tailwind utilities. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
