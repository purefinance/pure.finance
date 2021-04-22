import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

const LanguageSelector = function () {
  const { pathname, locale, locales } = useRouter()
  const { t } = useTranslation()
  return (
    <ul className="flex text-sm space-x-1">
      {locales.map((localeOption, idx) => (
        <li key={localeOption}>
          <Link href={pathname} locale={localeOption}>
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
