import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

export const injected = new InjectedConnector({ supportedChainIds: [1, 1337] })
export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: process.env.NEXT_PUBLIC_NODE_URL
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 12000
})
