import { useTranslations } from 'next-intl'
import { useContext } from 'react'

import { Link } from '../../navigation'
import PureContext from '../context/Pure'
import Dropdown from '../Dropdown'
import SvgContainer from '../svg/SvgContainer'

const Breadcrumb = function ({ title }) {
  const t = useTranslations()
  const { utilities } = useContext(PureContext)

  return (
    <div className="flex flex-row gap-2 items-center px-8 py-4 border md:gap-1 md:px-0 md:py-0 md:border-0">
      <Link className="text-slate-600 text-sm" href="/">
        Pure Finance {t('tools')}
      </Link>
      <p className="text-slate-400">/</p>
      <Dropdown
        Selector={({ isOpen }) => (
          <div className="text-orange-950 flex gap-3 items-center px-1 py-2 text-sm rounded-xl">
            {title}
            <SvgContainer
              className={`w-3 text-grayscale-400 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
              name="chevron"
            />
          </div>
        )}
        className="text-gray-600 cursor-pointer"
      >
        <ul className="w-54 absolute z-10 flex flex-col mt-1 p-4 text-left bg-white rounded-xl shadow-lg">
          {utilities.map(({ title, href, selected }) => (
            <Link href={href} key={title}>
              <div className="hover:bg-slate-50 flex items-center justify-between px-3 py-2 rounded-md">
                <li className={selected ? 'text-black' : undefined}>{title}</li>
                {selected && <SvgContainer name="check" width="24" />}
              </div>
            </Link>
          ))}
        </ul>
      </Dropdown>
    </div>
  )
}

export default Breadcrumb
