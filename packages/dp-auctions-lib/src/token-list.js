'use strict'

const { tokens: defaultTokens } = require('@uniswap/default-token-list')
const { tokens: vTokens } = require('vesper-metadata/src/vesper.tokenlist.json')

const allTokens = [].concat(defaultTokens, vTokens)

const findToken = (address, chainId = 1) =>
  allTokens.find(
    token => token.address === address && token.chainId === chainId
  )

module.exports = { findToken }
