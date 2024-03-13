import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useRedirectToDefaultLocale = function ({
  defaultLocale,
  locales,
  redirectPage
}) {
  const router = useRouter()

  useEffect(
    function () {
      const [language] = navigator.language.split('-')
      const enabledLanguage = locales.includes(language)
      router.replace(
        `/${enabledLanguage ? language : defaultLocale}${
          redirectPage
            ? redirectPage.startsWith('/')
              ? redirectPage
              : `$/${redirectPage}`
            : ''
        }`
      )
    },
    [defaultLocale, locales, router, redirectPage]
  )
}
