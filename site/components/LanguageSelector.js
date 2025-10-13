import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

import { Link, locales, usePathname } from '../navigation'

const LanguageSelector = function () {
  const {
    query: { locale }
  } = useRouter()
  const pathname = usePathname()
  const t = useTranslations()
  return (
    <ul className="flex space-x-1 text-sm">
      {locales.map((localeOption, idx) => (
        <li key={localeOption}>
          <Link
            className={`${
              localeOption === locale ? 'text-gray-300' : 'hover:text-teal-1000'
            }`}
            href={pathname}
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
