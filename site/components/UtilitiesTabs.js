import { useWeb3React } from '@web3-react/core'
import { useTranslations } from 'next-intl'

import { usePathname } from '../navigation'
import utilsConfig from '../utils/utilsConfig.json'

import Tabs from './Tabs'

function UtilitiesTabs() {
  const { chainId } = useWeb3React()
  const t = useTranslations()
  const pathname = usePathname()
  const items = [
    {
      href: '/merkle-claims',
      label: t('merkle-claims'),
      selected: pathname === '/merkle-claims'
    },
    {
      href: '/token-approvals',
      label: t('token-approvals'),
      selected: pathname === '/token-approvals'
    },
    {
      href: '/token-revokes',
      label: t('token-revokes'),
      selected: pathname === '/token-revokes'
    },
    // Payment Streams should go here.
    {
      href: '/wrap-eth',
      label: t('wrap-unwrap'),
      selected: pathname === '/wrap-eth'
    },
    {
      href: '/sign-message',
      label: t('sign-message'),
      selected: pathname === '/sign-message'
    }
    // Descending Price Auctions should go here.
  ]
  // Add optional components starting with the last open to keep the array
  // positions constant.
  //
  // Add Descending Price Auctions if Uniswap v2 is supported.
  if (chainId && utilsConfig[chainId]?.dpAuctions.uniswapV2) {
    items.splice(5, 0, {
      href: '/dp-auctions',
      label: t('dp-auctions'),
      selected: pathname === '/dp-auctions'
    })
  }
  // Add Payment Streams if ChainLink is supported.
  if (chainId && utilsConfig[chainId]?.paymentStreams?.chainLink) {
    items.splice(3, 0, {
      href: '/payment-streams',
      label: t('payment-streams'),
      selected: pathname === '/payment-streams'
    })
  }
  return (
    <div className="flex justify-center">
      <Tabs items={items} />
    </div>
  )
}

export default UtilitiesTabs
