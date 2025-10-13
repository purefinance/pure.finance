import { useWeb3React } from '@web3-react/core'
import createPaymentStreams from 'pf-payment-streams'
import { createContext, useEffect, useMemo } from 'react'

import utilsConfig from '../../utils/utilsConfig.json'

export const PaymentStreamsLibContext = createContext({})
const PaymentStreamsLibContextProvider = function ({ children }) {
  const { account, active, library, chainId } = useWeb3React()
  const lib = useMemo(
    () =>
      active && library
        ? createPaymentStreams(library, {
            from: account,
            ...utilsConfig[chainId].paymentStreams
          })
        : undefined,
    [active, library, account, chainId]
  )

  useEffect(
    function () {
      window.paymentStreamsLib = lib
    },
    [lib]
  )

  return (
    <PaymentStreamsLibContext.Provider value={lib}>
      {children}
    </PaymentStreamsLibContext.Provider>
  )
}

export default PaymentStreamsLibContextProvider
