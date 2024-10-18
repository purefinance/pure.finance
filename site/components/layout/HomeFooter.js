import { useTranslations } from 'next-intl'

import Socials from './Socials'

const HomeFooter = function () {
  const t = useTranslations()
  return (
    <div className="border-slate-300/55 flex items-center justify-between mt-8 p-8 text-gray-500 border-t">
      <p>{t('copyright')}</p>
      <Socials />
    </div>
  )
}

export default HomeFooter
