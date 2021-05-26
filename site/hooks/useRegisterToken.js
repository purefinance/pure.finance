import { useWeb3React } from '@web3-react/core'
import defaultTokenList from '@uniswap/default-token-list'
import { watchAsset } from '../utils'

export const useRegisterToken = function ({ symbol }) {
  const { account, chainId } = useWeb3React()

  const registerToken = function () {
    const token = defaultTokenList.tokens.find(
      ({ symbol: tokenSymbol, chainId: tokenChainId }) =>
        tokenSymbol === symbol && tokenChainId === chainId
    )
    if (!token) {
      console.warn(
        `Trying to register token ${symbol} but metadata was not found.`
      )
      return
    }
    const { logoURI, ...restOfToken } = token
    watchAsset({
      account,
      chainId,
      token: {
        ...restOfToken,
        image: logoURI
      }
    })
  }

  return registerToken
}
