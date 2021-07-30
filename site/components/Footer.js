import LanguageSelector from './LanguageSelector'
import Vesper from './svg/Vesper'
import useTranslation from 'next-translate/useTranslation'

const Footer = function () {
  const { t } = useTranslation('common')
  return (
    <div className="flex flex-wrap justify-center w-full mt-20">
      <div className="w-full">
        <p className="text-xs font-semibold text-center opacity-75 text-vesper">
          {t('sponsored-by').toUpperCase()}
        </p>
      </div>
      <div className="mt-2">
        <a href="https://vesper.finance" rel="noreferrer" target="_blank">
          <Vesper />
        </a>
      </div>
      <div className="flex justify-between w-full pt-3 mt-20 text-xs text-gray-500 border-t-2 space-x-4">
        <div className="w-1/2">
          <p>{t('copyright')}</p>
        </div>
        <LanguageSelector />
      </div>
    </div>
  )
}

export default Footer
