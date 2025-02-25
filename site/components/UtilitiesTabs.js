import { useWeb3React } from '@web3-react/core'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useContext } from 'react'

import { Link } from '../navigation'
import utilsConfig from '../utils/utilsConfig.json'

import PureContext from './context/Pure'

function UtilitiesTabs() {
  const { chainId } = useWeb3React()
  const { utilities } = useContext(PureContext)
  const t = useTranslations()
  const pathname = usePathname()

  // Add optional components starting with the last open to keep the array
  // positions constant.
  //
  // Add Descending Price Auctions if Uniswap v2 is supported.
  if (chainId && utilsConfig[chainId]?.dpAuctions?.uniswapV2) {
    utilities.splice(5, 0, {
      href: '/dp-auctions',
      title: t('dp-auctions'),
      selected: pathname === '/dp-auctions'
    })
  }
  // Add Payment Streams if ChainLink is supported.
  if (chainId && utilsConfig[chainId]?.paymentStreams?.chainLink) {
    utilities.splice(3, 0, {
      href: '/payment-streams',
      title: t('payment-streams'),
      selected: pathname === '/payment-streams'
    })
  }
  return (
    <div className="mt-8 flex flex-col justify-center gap-6 lg:flex-row lg:flex-wrap lg:py-8">
      {utilities.map(({ title, text, href, onClick = () => null }) => (
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
