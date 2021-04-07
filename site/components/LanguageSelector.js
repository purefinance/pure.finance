import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import Dropdown from './Dropdown'
import { useRouter } from 'next/router'

const LanguageSelector = function () {
  const { pathname, locale, locales } = useRouter()
  const { t } = useTranslation()
  return (
    <Dropdown
      className="relative z-30 hidden font-semibold md:block dropdown text-cobalt-900"
      selector={
        <button className="flex items-center px-4 py-1 font-semibold focus:outline-none hover:text-cobalt-1000">
          {t(`common:language-${locale}`)}
          <div>
            <svg
              className="w-4 h-4 fill-current text-cobalt-750"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 
            10.828 5.757 6.586 4.343 8z"
              />
            </svg>
          </div>
        </button>
      }
    >
      <div className="absolute z-10">
        <ul className="w-full px-4 py-2">
          {locales.map((localeOption) => (
            <li key={localeOption}>
              <Link href={pathname} locale={localeOption}>
                <a
                  className={`${
                    localeOption === locale
                      ? 'text-gray-300'
                      : 'hover:text-teal-1000'
                  }`}
                >
                  {t(`common:language-${localeOption}`)}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Dropdown>
  )
}

export default LanguageSelector
