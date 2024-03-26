export type ChainId = 1 | 137 | 43114
type DevelopmentChainId = 1337 | 31337
type AnyChainId = number
type Connector = 'injected' | 'walletconnect' | 'walletlink'

interface Chain {
  chainId: ChainId
  explorer: {
    name: string
    url: string
  }
  decimals: number
  gasOverestimation: number
  name: string
  nativeTokenSymbol: string
  rpcUrls: string[]
  shortName: string
  standardName: string
  supportedConnectors: Connector[]
  wrappedToken: {
    address: string
    symbol: string
  }
}

export const findByChainId: (chainId: AnyChainId) => Chain
export const findByShortName: (shortName: string) => Chain
export const chainList: Chain[]
