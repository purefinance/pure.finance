import { MemoizedFunction } from 'lodash'

export type ChainId = 1 | 137 | 43114 | 43111
type DevelopmentChainId = 1337 | 31337 | 743111
export type AnyChainId = number
type Address = string

interface Token {
  chainId: ChainId
  address: Address
  name: string
  symbol: string
  decimals: number
  logoURI: string
}

export const findTokenByAddress: ((
  address: Address,
  chainId?: AnyChainId
) => Token) &
  MemoizedFunction
export const findTokenBySymbol: ((
  symbol: string,
  chainId?: AnyChainId
) => Token) &
  MemoizedFunction
export const getTokenListByChain: ((chainId: AnyChainId) => Token[]) &
  MemoizedFunction
