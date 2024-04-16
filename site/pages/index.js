import { useRedirectToDefaultLocale } from '../hooks/useRedirectToDefaultLocale'
import { defaultLocale, locales } from '../navigation'

export const homepageRedirect = '/merkle-claims'

function HomePage() {
  useRedirectToDefaultLocale({
    defaultLocale,
    locales,
    redirectPage: homepageRedirect
  })
  return null
}

export { getStaticProps } from '../utils/staticProps'
export default HomePage
