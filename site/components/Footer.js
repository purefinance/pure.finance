import { useTranslations } from 'next-intl'

import LanguageSelector from './LanguageSelector'
import Vesper from './svg/Vesper'

const Footer = function () {
  const t = useTranslations()
  return (
    <div className="mt-20 flex w-full flex-wrap justify-center">
      <div className="w-full">
        <p className="text-vesper text-center text-xs font-semibold opacity-75">
          {t('sponsored-by').toUpperCase()}
        </p>
      </div>
      <div className="mt-2">
        <a href="https://vesper.finance" rel="noreferrer" target="_blank">
          <Vesper />
        </a>
      </div>
      <div className="mt-20 flex w-full justify-between space-x-4 border-t-2 pt-3 text-xs text-gray-500">
        <div className="w-1/2">
          <p>{t('copyright')}</p>
        </div>
        <LanguageSelector />
      </div>
    </div>
  )
}

export default Footer
