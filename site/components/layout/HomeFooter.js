import { useTranslations } from 'next-intl'

import Socials from './Socials'

const HomeFooter = function () {
  const t = useTranslations()
  return (
    <div className="border-slate-300/55 mt-8 flex items-center justify-between border-t p-8 text-gray-500">
      <p>{t('copyright')}</p>
      <Socials />
    </div>
  )
}

export default HomeFooter
