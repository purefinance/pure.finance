import '../styles/index.css'
import { Web3ReactProvider } from '@web3-react/core'
import Big from 'big.js'
import { useRouter } from 'next/router'
import { NextIntlClientProvider } from 'next-intl'
import Web3 from 'web3'

import { PureContextProvider } from '../components/context/Pure'
import { defaultLocale } from '../navigation'

// Force Big to round down.
// See https://github.com/MikeMcl/big.js/blob/v5.2.2/big.js#L26
Big.RM = 0

function getLibrary(provider) {
  if (provider.isMetaMask) {
    // To force MetaMask to use market suggested fees, we must intercept the
    // calls to request() with method eth_sendTransaction and clear out all
    // gas-related properties. ¯\_(ツ)_/¯
    // Note: Tested with v1.10.4. Newer versions of web3 may break this patch.
    const request = provider.request.bind(provider)
    const wrappedRequest = function ({ method, params }) {
      if (method === 'eth_sendTransaction') {
        params[0].gasPrice = undefined
        params[0].maxFeePerGas = undefined
        params[0].maxPriorityFeePerGas = undefined
      }
      return request({ method, params })
    }
    provider.request = wrappedRequest
  }
  return new Web3(provider)
}

function App({ Component, pageProps }) {
  const router = useRouter()
  return (
    <NextIntlClientProvider
      locale={router.query.locale || defaultLocale}
      messages={pageProps.messages}
      now={new Date()}
      timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
    >
      <Web3ReactProvider getLibrary={getLibrary}>
        <PureContextProvider>
          <Component {...pageProps} />
        </PureContextProvider>
      </Web3ReactProvider>
    </NextIntlClientProvider>
  )
}

export default App
