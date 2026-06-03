import Document, { Html, Head, Main, NextScript } from 'next/document';

const GA_TRACKING_ID = 'G-NX72GYFHFS';
export default class CustomDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-NX72GYFHFS"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${GA_TRACKING_ID}',{
                page_path: window.location.pathname,
              });
            `,
            }}
          />
        </Head>
        <body>
          <Main />
        </body>
        <NextScript />
      </Html>
    );
  }
}
