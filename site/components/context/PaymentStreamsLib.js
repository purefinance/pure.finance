import { useWeb3React } from '@web3-react/core'
import createPaymentStreams from 'pf-payment-streams'
import { createContext, useMemo } from 'react'

import utilsConfig from '../../utils/utilsConfig.json'

export const PaymentStreamsLibContext = createContext(
  /** @type {object | null} */ (null)
)

const PaymentStreamsLibContextProvider = function ({ children }) {
  const { account, active, chainId, library } = useWeb3React()

  const lib = useMemo(
    function () {
      if (!(active && chainId && library)) {
        return null
      }

      const config = utilsConfig[chainId].paymentStreams
      if (!config) {
        return null
      }

      return createPaymentStreams(library, { from: account, ...config })
    },
    [active, library, account, chainId]
  )

  return (
    <PaymentStreamsLibContext.Provider value={lib}>
      {children}
    </PaymentStreamsLibContext.Provider>
  )
}

export default PaymentStreamsLibContextProvider
