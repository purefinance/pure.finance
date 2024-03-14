import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { defaultLocale, locales } from '../../../navigation'

function DpAuctionsIndex() {
  const router = useRouter()

  useEffect(
    function () {
      const [language] = navigator.language.split('-')
      const enabledLanguage = locales.includes(language)
      router.replace(
        `/${
          enabledLanguage ? language : defaultLocale
        }/dp-auctions/collections?id=${
          process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID
        }`
      )
    },
    [router]
  )

  return null
}

export default DpAuctionsIndex
