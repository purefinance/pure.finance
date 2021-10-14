'use strict'

const { getRouterContract } = require('erc-20-lib/src/uniswap')
const debug = require('debug')('sablier')

const { findToken } = require('./token-list')

const abi = require('./abi.json')
const address = '0xA4fc358455Febe425536fd1878bE67FfDBDEC59a'

const createSablier = function (web3, options = {}) {
  const { from, gasFactor = 2 } = options

  debug('Creating Sablier for %s', from || 'read-only')

  const sablier = new web3.eth.Contract(abi, address)

  const safeGas = gas => Math.ceil(gas * gasFactor)

  const estimateGasAndSend = (method, transactionOptions) =>
    Promise.resolve(
      transactionOptions.gas ||
        method.estimateGas(transactionOptions).then(safeGas)
    ).then(gas => method.send({ ...transactionOptions, gas }))

  const getAddress = () => address

  const router = getRouterContract(web3) // This only works for chainId 1
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

  const getPath = token =>
    token === wethAddress
      ? [token, usdcAddress]
      : [token, wethAddress, usdcAddress]

  const getUsdcAmount = (token, amount) =>
    token === usdcAddress
      ? Promise.resolve(amount)
      : router.methods
          .getAmountsOut(amount, getPath(token))
          .call()
          .then(amounts => amounts.slice(-1)[0])

  const getUsdcRate = function (token) {
    debug('Getting USDC rate')
    const decimals = findToken(token)?.decimals || 18
    const oneToken = `1${'0'.repeat(decimals)}`
    return getUsdcAmount(token, oneToken).catch(function (err) {
      debug('Could not get token rate: %s', err.message)
      return '0'
    })
  }

  const getStream = function (streamId) {
    debug('Getting stream %s properties', streamId)
    return sablier.methods
      .getStream(streamId)
      .call()
      .then(stream => Promise.all([stream, getUsdcRate(stream.tokenAddress)]))
      .then(([stream, rate]) => ({ ...stream, rate }))
  }

  const getBalance = function (streamId, who) {
    debug('Getting stream %s balance', streamId)
    return sablier.methods.balanceOf(streamId, who || from).call()
  }

  const calcDeposit = function (startTime, stopTime, amount) {
    const deltaTime = stopTime - startTime
    return Math.ceil(amount / deltaTime) * deltaTime
  }

  const createStream = function (
    recipient,
    deposit,
    tokenAddress,
    startTime,
    stopTime,
    txOps
  ) {
    debug('Creating a stream of %s %s for %s', deposit, tokenAddress, recipient)
    return estimateGasAndSend(
      sablier.methods.createStream(
        recipient,
        deposit,
        tokenAddress,
        startTime,
        stopTime
      ),
      { from, ...txOps }
    )
  }

  const withdrawFromStream = function (streamId, amount, txOps) {
    debug('Initiating withdraw of %s from stream %s', amount, streamId)
    return estimateGasAndSend(
      sablier.methods.withdrawFromStream(streamId, amount),
      { from, ...txOps, gas: 200000 }
    )
  }

  return {
    calcDeposit,
    createStream,
    getAddress,
    getBalance,
    getStream,
    withdrawFromStream
  }
}

module.exports = createSablier
