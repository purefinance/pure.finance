'use strict'

const createErc20 = require('erc-20-lib')
const createSablier = require('sablier-lib')
const debug = require('debug')('purefi:sablier-claims')

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
          createErc20({ web3, token: tokenAddress }).getInfo()
        ])
      })
      .then(function ([stream, balance, token]) {
        const { recipient, startTime } = stream
        // TODO throw errors
        if (from !== recipient) {
          throw new Error('Account is not the stream recipient')
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
      .catch(function (err) {
        const matches = err.message.match(/"reason": "(.*)"/)
        if (matches) {
          const reason = matches[1]
          throw new Error(
            `${reason.substr(0, 1).toUpperCase()}${reason.substr(1)}`
          )
        }
        throw err
      })
  }

  const withdrawFromStream = function (streamId, amount) {
    debug('Starting to claim from stream %s', streamId)
    return Promise.resolve(amount || sablier.getBalance(streamId)).then(
      function (amountToWithdraw) {
        return sablier.withdrawFromStream(streamId, amountToWithdraw)
      }
    )
  }

  return {
    getStream,
    withdrawFromStream
  }
}

module.exports = createSablierClaims
