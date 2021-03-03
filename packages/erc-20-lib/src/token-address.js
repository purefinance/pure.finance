'use strict'

const { tokens } = require('@uniswap/default-token-list')

const tokenAddress = function (symbol, extraTokens = []) {
  const tokenData = tokens
    .concat(extraTokens)
    .find((token) => token.symbol === symbol)
  return tokenData && tokenData.address
}

module.exports = tokenAddress
