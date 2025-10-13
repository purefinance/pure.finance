import { useWeb3React } from '@web3-react/core'
import createDpaLib from 'dp-auctions-lib'
import { createContext, useMemo } from 'react'

import utilsConfig from '../utils/utilsConfig.json'

export const DPAuctionsContext = createContext({})
const DPAuctionsContextProvider = function ({ children }) {
  const { account, active, library, chainId } = useWeb3React()
  const lib = useMemo(
    () =>
      active && library
        ? createDpaLib(library, {
            from: account,
            ...utilsConfig[chainId].dpAuctions
          })
        : undefined,
    [active, library, account, chainId]
  )

  return (
    <DPAuctionsContext.Provider value={lib}>
      {children}
    </DPAuctionsContext.Provider>
  )
}

export default DPAuctionsContextProvider
