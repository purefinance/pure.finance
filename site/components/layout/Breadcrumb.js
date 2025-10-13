import { useContext } from 'react'

import { Link } from '../../navigation'
import PureContext from '../context/Pure'
import Dropdown from '../Dropdown'
import SvgContainer from '../svg/SvgContainer'

const Breadcrumb = function ({ title }) {
  const { utilities } = useContext(PureContext)

  return (
    <div className="flex flex-row items-center gap-2 border px-8 py-4 md:gap-1 md:border-0 md:px-0 md:py-0">
      <Dropdown
        Selector={({ isOpen }) => (
          <div className="text-grayscale-950 flex items-center gap-3 rounded-xl px-1 py-2 text-sm">
            {title}
            <SvgContainer
              className={`text-grayscale-400 w-3 ${
                isOpen ? 'rotate-180 transform' : ''
              }`}
              name="chevron"
            />
          </div>
        )}
        className="cursor-pointer text-gray-600"
      >
        <ul className="w-54 absolute z-10 mt-1 flex flex-col rounded-xl bg-white p-4 text-left shadow-lg">
          {utilities.map(({ title, href, selected }) => (
            <Link href={href} key={title}>
              <div className="hover:bg-slate-50 flex items-center justify-between rounded-md px-3 py-2">
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
