import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

import { Link } from '../navigation'
import { locales } from '../navigation'

const LanguageSelector = function () {
  const {
    asPath,
    query: { locale }
  } = useRouter()
  const t = useTranslations()
  const href = asPath === `/${locale}` ? '/' : asPath.replace(`/${locale}`, '')
  return (
    <ul className="flex text-sm space-x-1">
      {locales.map((localeOption, idx) => (
        <li key={localeOption}>
          <Link
            className={`${
              localeOption === locale ? 'text-gray-300' : 'hover:text-teal-1000'
            }`}
            href={href}
            locale={localeOption}
          >
            {idx > 0 && ' / '}
            {t(`language-${localeOption}`)}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default LanguageSelector
