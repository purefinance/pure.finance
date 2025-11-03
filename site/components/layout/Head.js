import Head from 'next/head'
import Script from 'next/script'

const CustomHead = ({ title }) => (
  <>
    {process.env.NEXT_PUBLIC_ANALYTICS_ID ? (
      <>
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_ANALYTICS_ID}`}
        />
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_ANALYTICS_ID}');
            `
          }}
          id="gtag-init"
        />
      </>
    ) : (
      ''
    )}
    <Head>
      <title>{`Pure Finance ${title && ` | ${title}`}`}</title>
      <link href="/favicon.ico" rel="icon" />
    </Head>
  </>
)

export default CustomHead
