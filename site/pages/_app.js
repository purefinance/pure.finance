import '../styles/index.css'
import { Web3ReactProvider } from '@web3-react/core'
import Big from 'big.js'
import { useRouter } from 'next/router'
import { NextIntlClientProvider } from 'next-intl'
import Web3 from 'web3'

import { PureContextProvider } from '../components/context/Pure'
import { defaultLocale } from '../navigation'

const getLibrary = provider => new Web3(provider)

// Force Big to round down.
// See https://github.com/MikeMcl/big.js/blob/v5.2.2/big.js#L26
Big.RM = 0

const App = ({ Component, pageProps }) => {
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
