import '../styles/index.css'
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'
import { PureContextProvider } from '../components/context/Pure'

const getLibrary = (provider) => new Web3(provider)

function App({ Component, pageProps }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <PureContextProvider>
        <Component {...pageProps} />
      </PureContextProvider>
    </Web3ReactProvider>
  )
}

export default App
