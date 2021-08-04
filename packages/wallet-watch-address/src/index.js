/* eslint-env browser */

'use strict'

const debug = require('debug')('watch-asset')

const noop = Function.prototype

/**
 * Helper to let EIP-747 compatible wallets track ERC20 assets.
 *
 * @param {object} params
 * @param {string} params.account The account that that will watch the token.
 * @param {object} params.token The token to watch (Uniswap Token List format).
 * @param {string} params.token.address The address.
 * @param {number} params.token.chainId The chain ID.
 * @param {number} [params.token.decimals] The decimals.
 * @param {string} [params.token.logoURI] The logo URL.
 * @param {string} [params.token.symbol] The symbol.
 * @param {function} [callback] Called with the error on failure.
 */
const watchAsset = function ({ account, token }, callback = noop) {
  const { address, decimals, chainId, logoURI: image, symbol } = token

  // If not running in a browser, error out.
  if (!window) {
    callback(new Error('Only browser environments are supported'))
    return
  }

  // The only wallet known for supporting EIP-747 so far is MetaMask.
  // @ts-ignore ts(2339)
  const { ethereum } = window
  if (!ethereum || !ethereum.isMetaMask) {
    callback(new Error('Wallet not supported'))
    return
  }

  // To prevent showing up the same suggested token multiple times, store a flag
  // in the local storage of the browser.
  const key = `watchingAssets-${account}`
  const tokenId = `${address}:${chainId}|`
  const value = window.localStorage.getItem(key) || ''
  if (value.includes(tokenId)) {
    callback()
    return
  }

  // For retro-compatibility, check the old flag format too. If present, migrate
  // to the new format.
  const oldKey = `isTokenRegistered-${symbol}-${account}-${chainId}`
  if (window.localStorage.getItem(oldKey)) {
    window.localStorage.removeItem(oldKey)
    window.localStorage.setItem(key, value.concat(tokenId))
    callback()
    return
  }

  ethereum
    .request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: { address, symbol, decimals, image }
      }
    })
    .then(function (success) {
      if (!success) {
        throw new Error(`${symbol} not added to the wallet's watch list`)
      }

      window.localStorage.setItem(key, value.concat(tokenId))
      debug("%s added to the wallet's watch list", symbol)
      callback()
    })
    .catch(function (err) {
      debug('Failed: %s', err.message)
      callback(err)
    })
}

module.exports = watchAsset
