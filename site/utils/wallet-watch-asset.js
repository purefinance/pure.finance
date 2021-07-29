'use strict'

const watchAsset = function (params) {
  const { account, chainId, token } = params
  const { address, decimals, image, symbol } = token

  // @ts-ignore ts(2339)
  const { ethereum } = window
  if (!ethereum || !ethereum.isMetaMask) {
    return
  }

  const key = `isTokenRegistered-${symbol}-${account}-${chainId}`
  if (window.localStorage.getItem(key)) {
    return
  }

  ethereum
    .request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address, // The address that the token is at.
          symbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals, // The number of decimals in the token
          image // A string url of the token logo
        }
      }
    })
    .then(function () {
      window.localStorage.setItem(key, 'true')
      console.log('MetaMask now is watching', symbol)
    })
    .catch(console.warn)
}

module.exports = watchAsset
