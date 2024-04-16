import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { defaultLocale, locales } from '../../navigation'
import { homepageRedirect } from '../index'

function HomePage() {
  const router = useRouter()

  useEffect(
    function redirectHomepage() {
      const [language] = navigator.language.split('-')
      const enabledLanguage = locales.includes(language)
      router.replace(
        `/${enabledLanguage ? language : defaultLocale}${homepageRedirect}`
      )
    },
    [router]
  )
  return null
}

export default HomePage
