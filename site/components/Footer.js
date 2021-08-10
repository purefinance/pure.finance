import LanguageSelector from './LanguageSelector'
import Vesper from './svg/Vesper'
import useTranslation from 'next-translate/useTranslation'

const Footer = function () {
  const { t } = useTranslation('common')
  return (
    <div className="flex flex-wrap justify-center mt-20 w-full">
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
      <div className="flex justify-between mt-20 pt-3 w-full text-gray-500 text-xs border-t-2 space-x-4">
        <div className="w-1/2">
          <p>{t('copyright')}</p>
        </div>
        <LanguageSelector />
      </div>
    </div>
  )
}

export default Footer
