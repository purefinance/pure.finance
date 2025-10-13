import { useWeb3React } from '@web3-react/core'
import createErc20 from 'erc-20-lib'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { merkle as createMerkle } from 'pure-finance-lib'
import createTokenApprovals from 'pure-finance-lib/src/token-approvals'
import { createContext, useEffect, useState } from 'react'

import utilsConfig from '../../utils/utilsConfig.json'

/**
 * This component must be a child of <App> to have access to the appropriate
 * context
 */

const PureContext = createContext()

export const PureContextProvider = function ({ children }) {
  const { active, library, account, chainId } = useWeb3React()
  const [merkle, setMerkle] = useState({})
  const [tokenApprovals, setTokenApprovals] = useState(null)
  const [erc20, setErc20] = useState()

  const t = useTranslations()
  const tUtilitiesText = useTranslations('utilities-text')
  const pathname = usePathname()

  const utilities = [
    {
      href: '/merkle-claims',
      title: t('merkle-claims'),
      text: tUtilitiesText('merkle-claims'),
      selected: pathname.includes('/merkle-claims')
    },
    {
      href: '/token-approvals',
      title: t('token-approvals'),
      text: tUtilitiesText('token-approvals'),
      selected: pathname.includes('/token-approvals')
    },
    {
      href: '/token-revokes',
      title: t('token-revokes'),
      text: tUtilitiesText('token-revokes'),
      selected: pathname.includes('/token-revokes')
    },
    // Payment Streams should go here.
    {
      href: '/wrap-eth',
      title: t('wrap-unwrap'),
      text: tUtilitiesText('wrap-unwrap'),
      selected: pathname.includes('/wrap-eth')
    },
    {
      href: '/sign-message',
      title: t('sign-message'),
      text: tUtilitiesText('sign-message'),
      selected: pathname.includes('/sign-message')
    }
    // Descending Price Auctions should go here.
  ]

  useEffect(
    function () {
      if (active) {
        setMerkle(
          createMerkle(library, {
            from: account,
            ...utilsConfig[chainId].merkleClaim
          })
        )
        setTokenApprovals(createTokenApprovals(library, { from: account }))
        setErc20(
          () => address => createErc20(library, address, { from: account })
        )
      }
    },
    [active, library, account, chainId]
  )

  return (
    <PureContext.Provider value={{ erc20, merkle, tokenApprovals, utilities }}>
      {children}
    </PureContext.Provider>
  )
}

export default PureContext
