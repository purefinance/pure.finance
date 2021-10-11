import '../styles/index.css'
import { Web3ReactProvider } from '@web3-react/core'
import Big from 'big.js'
import Web3 from 'web3'
import { PureContextProvider } from '../components/context/Pure'

const getLibrary = provider => new Web3(provider)

// Force Big to round down.
// See https://github.com/MikeMcl/big.js/blob/v5.2.2/big.js#L26
Big.RM = 0

const App = ({ Component, pageProps }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <PureContextProvider>
      <Component {...pageProps} />
    </PureContextProvider>
  </Web3ReactProvider>
)

export default App
