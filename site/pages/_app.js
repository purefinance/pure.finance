import '../styles/globals.css'
import React from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'

const getLibrary = (provider) => new Web3(provider)

function App({ Component, pageProps }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Component {...pageProps} />
    </Web3ReactProvider>
  )
}

export default App
