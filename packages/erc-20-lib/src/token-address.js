'use strict'

const { tokens } = require('@uniswap/default-token-list')

const tokenAddress = function (symbol, extraTokens = []) {
  const tokenData = tokens.concat(extraTokens)
  const token =
    tokenData.find(t => t.symbol === symbol) ||
    tokenData.find(t => t.symbol.toLowerCase() === symbol.toLowerCase())
  return token && token.address
}

module.exports = tokenAddress
