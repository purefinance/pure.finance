'use strict'

const tokenAddress = require('./token-address')

const abi = require('./abis/weth9.json')

const getContract = (web3, chainId) =>
  new web3.eth.Contract(abi, tokenAddress('WETH', chainId))

module.exports = { abi, getContract }
