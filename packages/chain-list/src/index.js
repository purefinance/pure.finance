'use strict'
const chainList = require('./chains.json')

const findByChainId = chainId =>
  chainList.find(chain => chain.chainId === chainId) || {}

const findByShortName = shortName =>
  chainList.find(chain => chain.shortName === shortName)

module.exports = {
  chainList,
  findByChainId,
  findByShortName
}
