import Head from 'next/head'

const CustomHead = ({ title }) => (
  <Head>
    <title>Pure Finance {title && ` | ${title}`}</title>
    <link rel="icon" href="/favicon.ico" />
  </Head>
)

export default CustomHead
