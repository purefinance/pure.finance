import { notFound } from 'next/navigation'

import { locales } from '../navigation'

async function getMessages(locale) {
  try {
    return (await import(`../messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }
  return undefined
}

export const getStaticProps = async context => ({
  props: {
    ...(context?.params?.locale
      ? { messages: await getMessages(context.params.locale) }
      : {})
  }
})

export const getStaticPaths = async () => ({
  fallback: false,
  paths: locales.map(locale => ({
    params: { locale }
  }))
})
