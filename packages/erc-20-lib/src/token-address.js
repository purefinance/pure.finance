'use strict'

const { findTokenBySymbol } = require('token-list')

const tokenAddress = function (symbol, chainId) {
  const token = findTokenBySymbol(symbol, chainId)
  return token?.address
}

module.exports = tokenAddress
