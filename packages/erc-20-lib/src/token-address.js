'use strict'

const { findTokenBySymbol } = require('token-list')

// TODO remove the default chain id from here
const tokenAddress = function (symbol, chainId = 1) {
  const token =
    findTokenBySymbol(symbol, chainId) ||
    findTokenBySymbol(symbol.toLowerCase(), chainId)
  return token && token.address
}

module.exports = tokenAddress
