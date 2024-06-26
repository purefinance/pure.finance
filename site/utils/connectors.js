import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT
const nodeUrl = process.env.NEXT_PUBLIC_NODE_URL
export const injected = new InjectedConnector({
  supportedChainIds: [1, 137, 1337, 31337, 43114]
})

export const walletlink = new WalletLinkConnector({
  url: nodeUrl,
  appName: `Pure Finance${environment ? ` ${environment}` : ''}`
})
