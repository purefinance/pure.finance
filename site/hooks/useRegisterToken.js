import { tokens } from '@uniswap/default-token-list'
import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'

import watchAsset from 'wallet-watch-asset'

export const useRegisterToken = function () {
  const { account, chainId: _chainId } = useWeb3React()

  // This is required to workaround ganache-cli to mess up with the chain ID.
  const chainId = _chainId === 1337 ? 1 : _chainId

  const registerToken = useCallback(
    function (_token) {
      const token = !_token.address
        ? tokens.find(
            (t) => t.symbol === _token.symbol && t.chainId === chainId
          )
        : { chainId, ..._token }

      if (!token) {
        console.warn(`Metadata not found for ${_token.symbol}:${chainId}.`)
        return
      }

      watchAsset({ account, token })
    },
    [account, chainId]
  )

  return registerToken
}
