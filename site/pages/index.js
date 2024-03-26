import { useRedirectToDefaultLocale } from '../hooks/useRedirectToDefaultLocale'
import { defaultLocale, locales } from '../navigation'

function HomePage() {
  useRedirectToDefaultLocale({
    defaultLocale,
    locales,
    redirectPage: '/merkle-claims'
  })
  return null
}

export { getStaticProps } from '../utils/staticProps'
export default HomePage
