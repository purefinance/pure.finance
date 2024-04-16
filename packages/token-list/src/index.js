'use strict'

const { toChecksumAddress } = require('web3-utils')
const memoize = require('lodash/memoize')
const sushiswapTokens = require('@sushiswap/default-token-list').tokens
const uniswapTokens = require('@uniswap/default-token-list').tokens
const vesperTokens = require('vesper-metadata/src/vesper.tokenlist.json').tokens

const customTokens = require('./token-lists/custom.json').tokens
const hemiTokens = require('./token-lists/hemi.json').tokens
// Source at https://github.com/pangolindex/tokenlists
const pangolindexTokens = require('./token-lists/pangolindex.json').tokens
const zapperTokens = require('./token-lists/zapper.json').tokens

const getTokenListByChain = memoize((chainId = 1) =>
  sushiswapTokens
    .concat(customTokens)
    .concat(hemiTokens)
    .concat(pangolindexTokens)
    .concat(uniswapTokens)
    .concat(vesperTokens)
    .concat(zapperTokens)
    .filter(t => t.chainId === chainId)
    .map(t => ({ ...t, address: toChecksumAddress(t.address) }))
)

const findTokenByAddress = memoize(
  function (_address, chainId) {
    const tokenList = getTokenListByChain(chainId)
    return tokenList.find(
      ({ address }) => address.toLowerCase() === _address.toLowerCase()
    )
  },
  (...args) => JSON.stringify(args)
)

const findTokenBySymbol = memoize(
  function (_symbol, chainId) {
    const tokenList = getTokenListByChain(chainId)
    return (
      tokenList.find(({ symbol }) => symbol === _symbol) ||
      tokenList.find(
        ({ symbol }) => symbol.toLowerCase() === _symbol.toLowerCase()
      )
    )
  },
  (...args) => JSON.stringify(args)
)

module.exports = {
  findTokenByAddress,
  findTokenBySymbol,
  getTokenListByChain
}
