'use strict'

const abi = require('./abis/uniswap-v2-router-02.json')
const address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

const getRouterContract = web3 => new web3.eth.Contract(abi, address)

module.exports = { getRouterContract }
