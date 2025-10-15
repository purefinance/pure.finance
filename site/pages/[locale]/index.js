import { useTranslations } from 'next-intl'

import HomeLayout from '../../components/layout/HomeLayout'
import UtilitiesTabs from '../../components/UtilitiesTabs'

function HomePage() {
  const t = useTranslations()

  return (
    <HomeLayout title={t('tools')}>
      <UtilitiesTabs />
    </HomeLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'
export default HomePage
