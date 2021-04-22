import Link from 'next/link'
import Vesper from './svg/Vesper'
import LanguageSelector from './LanguageSelector'
import useTranslation from 'next-translate/useTranslation'

const Footer = function () {
  const { t } = useTranslation('common')
  return (
    <div className="flex flex-wrap justify-center w-full">
      <div className="w-full">
        <p className="text-xs font-semibold text-center opacity-75 text-vesper">
          {t('sponsored-by').toUpperCase()}
        </p>
      </div>
      <div className="mt-2">
        <Link href="https://vesper.finance">
          <a rel="noreferrer" target="_blank">
            <Vesper />
          </a>
        </Link>
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
