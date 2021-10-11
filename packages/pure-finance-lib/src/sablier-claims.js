'use strict'

const createErc20 = require('erc-20-lib')
const createSablier = require('sablier-lib')
const debug = require('debug')('purefi:sablier-claims')

const tryParseEvmError = require('../lib/parse-evm-error')

const createSablierClaims = function (web3, options) {
  const { from } = options

  debug('Creating Sablier Claims for %s', from || 'read-only')

  const sablier = createSablier(web3, options)

  const getStream = function (streamId) {
    debug('Getting stream %s data', streamId)
    return Promise.all([
      sablier.getStream(streamId),
      sablier.getBalance(streamId, from)
    ])
      .then(function ([stream, balance]) {
        const { tokenAddress } = stream
        return Promise.all([
          stream,
          balance,
          createErc20(web3, tokenAddress).getInfo()
        ])
      })
      .then(function ([stream, balance, token]) {
        const { recipient, sender, startTime } = stream
        const allowedCallers = [recipient, sender].map(a => a.toLowerCase())
        if (!allowedCallers.includes(from.toLowerCase())) {
          throw new Error('Account is not the sender or recipient')
        }
        if (startTime > Date.now() / 1000) {
          throw new Error('Stream did not start yet')
        }
        if (BigInt(balance) <= 0n) {
          throw new Error('No balance to withdraw')
        }
        return {
          ...stream,
          balance,
          token
        }
      })
      .catch(tryParseEvmError)
  }

  const withdrawFromStream = function (streamId, amount) {
    debug('Starting to claim from stream %s', streamId)
    return Promise.resolve(amount || sablier.getBalance(streamId))
      .then(amountToWithdraw =>
        sablier.withdrawFromStream(streamId, amountToWithdraw)
      )
      .catch(tryParseEvmError)
  }

  return {
    getStream,
    withdrawFromStream
  }
}

module.exports = createSablierClaims
