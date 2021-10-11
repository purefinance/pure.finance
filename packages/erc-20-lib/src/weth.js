'use strict'

const tokenAddress = require('./token-address')

const abi = require('./abis/weth9.json')
const address = tokenAddress('WETH')

const getContract = web3 => new web3.eth.Contract(abi, address)

module.exports = { abi, address, getContract }
