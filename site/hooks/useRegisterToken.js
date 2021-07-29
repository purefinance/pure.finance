import defaultTokenList from '@uniswap/default-token-list'
import { useWeb3React } from '@web3-react/core'

import { watchAsset } from '../utils'

export const useRegisterToken = function (defaultToken) {
  const { account, chainId } = useWeb3React()

  const registerToken = function (givenToken) {
    const token =
      givenToken ||
      defaultTokenList.tokens.find(
        ({ symbol: tokenSymbol, chainId: tokenChainId }) =>
          tokenSymbol === defaultToken.symbol && tokenChainId === chainId
      )

    if (!token) {
      console.warn(
        `Trying to register token ${defaultToken.symbol} but metadata was not found.`
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
