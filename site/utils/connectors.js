import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT
const nodeUrl = process.env.NEXT_PUBLIC_NODE_URL
export const injected = new InjectedConnector({
  supportedChainIds: [1, 137, 1337, 31337, 43114]
})
export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: nodeUrl
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 12000
})
export const walletlink = new WalletLinkConnector({
  url: nodeUrl,
  appName: `Vesper App${environment ? ` ${environment}` : ''}`
})
