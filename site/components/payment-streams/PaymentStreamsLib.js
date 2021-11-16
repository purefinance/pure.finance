import { useWeb3React } from '@web3-react/core'
import { createContext, useEffect, useMemo } from 'react'
import createPaymentStreams from 'pf-payment-streams'

const PaymentStreamsLibContext = createContext({})
const PaymentStreamsLibContextProvider = function ({ children }) {
  const { account, active, library } = useWeb3React()
  const lib = useMemo(
    () =>
      active && library
        ? createPaymentStreams(library, { from: account })
        : undefined,
    [library, account, active]
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

export { PaymentStreamsLibContextProvider }

export default PaymentStreamsLibContext
