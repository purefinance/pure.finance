import { useRedirectToDefaultLocale } from '../hooks/useRedirectToDefaultLocale'
import { defaultLocale, locales } from '../navigation'

const HomePage = () => {
  useRedirectToDefaultLocale({
    defaultLocale,
    locales,
    redirectPage: '/'
  })

  return null
}

export { getStaticProps } from '../utils/staticProps'
export default HomePage
