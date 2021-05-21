import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { tokens } from '@uniswap/default-token-list'
import { injected } from '../utils/connectors'

export const useRegisterToken = function ({ symbol }) {
  const { account, chainId, connector } = useWeb3React()

  useEffect(
    function () {
      const storageKey = `isTokenRegistered-${symbol}-${account}-${chainId}`
      const { ethereum, localStorage } = window
      const { symbol: tokenSymbol, address, decimals, logoURI } =
        tokens.find(
          ({ symbol: tokenSymbol, chainId: tokenChainId }) =>
            tokenSymbol === symbol && tokenChainId === chainId
        ) ?? {}

      if (
        connector !== injected ||
        !address ||
        localStorage.getItem(storageKey) === 'true'
      ) {
        return
      }

      ethereum
        .request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address, // The address that the token is at.
              symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
              decimals, // The number of decimals in the token
              image: logoURI // A string url of the token logo
            }
          }
        })
        .then(function () {
          window.localStorage.setItem(storageKey, 'true')
          // eslint-disable-next-line no-console
          console.log('Token successfully registered on MetaMask.')
        })
        .catch((err) =>
          // eslint-disable-next-line no-console
          console.warn(err)
        )
    },
    [symbol, account, chainId, connector, injected]
  )
}
