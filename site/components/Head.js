import Head from 'next/head'

const CustomHead = ({ title }) => (
  <Head>
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_ANALYTICS_ID}`}
    ></script>
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_ANALYTICS_ID}');
        `
      }}
    />
    <title>Pure Finance {title && ` | ${title}`}</title>
    <link href="/favicon.ico" rel="icon" />
  </Head>
)

export default CustomHead
