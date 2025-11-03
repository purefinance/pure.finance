import { useContext } from 'react'

import { Link } from '../navigation'

import PureContext from './context/Pure'

function UtilitiesTabs() {
  const { utilities } = useContext(PureContext)
  return (
    <div className="mt-8 flex flex-col justify-center gap-6 lg:flex-row lg:flex-wrap lg:py-8">
      {utilities.map(({ href, onClick = () => null, text, title }) => (
        <Link href={href} key={title} onClick={onClick}>
          <div
            className="border-grayscale-300/55 hover:bg-grayscale-50 shadow-grayscale-950 flex h-32 w-full flex-col justify-start gap-2 rounded-xl border p-6 shadow-sm lg:w-96"
            key={title}
          >
            <h4 className="text-grayscale-950 text-base">{title}</h4>
            <p className="text-grayscale-500 text-sm">{text}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default UtilitiesTabs
