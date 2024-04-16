import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

import utilsConfig from './utilsConfig.json'

const supportedChainIds = Object.keys(utilsConfig).map(k => Number.parseInt(k))

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT
const nodeUrl = process.env.NEXT_PUBLIC_NODE_URL
export const injected = new InjectedConnector({
  supportedChainIds
})

export const walletlink = new WalletLinkConnector({
  appName: `Pure Finance${environment ? ` ${environment}` : ''}`,
  supportedChainIds,
  url: nodeUrl
})
