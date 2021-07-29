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
          <Link href={asPath} locale={localeOption}>
            <a
              className={`${
                localeOption === locale
                  ? 'text-gray-300'
                  : 'hover:text-teal-1000'
              }`}
            >
              {idx > 0 && ' / '}
              {t(`common:language-${localeOption}`)}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default LanguageSelector
