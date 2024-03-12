import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

const LanguageSelector = function () {
  const { asPath, locale, locales } = useRouter()
  const { t } = useTranslation()

  return (
    <ul className="flex text-sm space-x-1">
      {locales.map((localeOption, idx) => (
        <li key={localeOption}>
          <Link
            className={`${
              localeOption === locale ? 'text-gray-300' : 'hover:text-teal-1000'
            }`}
            href={asPath}
            locale={localeOption}
          >
            {idx > 0 && ' / '}
            {t(`common:language-${localeOption}`)}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default LanguageSelector
