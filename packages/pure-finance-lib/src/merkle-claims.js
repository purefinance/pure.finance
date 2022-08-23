'use strict'

const createErc20 = require('erc-20-lib')
const createMerkleBox = require('merkle-box-lib')
const debug = require('debug')('purefi:merkle-claims')
const fetch = require('node-fetch')

const parseCookieString = require('../lib/parse-cookie')
const tryParseEvmError = require('../lib/parse-evm-error')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const getClaimData = function (uri, account) {
  debug('Getting claim data from %s', uri)
  return fetch(uri)
    .then(res => res.json())
    .then(res =>
      res.find(
        recipient => recipient.account.toLowerCase() === account.toLowerCase()
      )
    )
}

const createMerkleClaims = function (web3, options) {
  const { from } = options

  debug('Creating Merkle Claims for %s', from || 'read-only')

  const merkleBoxAddress = createMerkleBox.addresses.mainnet
  const merkleBox = createMerkleBox(web3, merkleBoxAddress, options)

  const getHolding = function (claimGroupId) {
    debug('Getting holding ID %s', claimGroupId)
    return merkleBox
      .getHolding(claimGroupId)
      .then(function (holding) {
        const { balance, erc20, memo, owner, withdrawUnlockTime } = holding
        debug('Holding has %s', balance)
        debug('Withdraw time is %s', withdrawUnlockTime)
        if (owner === ZERO_ADDRESS) {
          throw new Error('Invalid claim group ID')
        }
        const uri = parseCookieString(memo).datasetUri
        if (!uri) {
          throw new Error('Could not get balance location')
        }
        return Promise.all([
          createErc20(web3, erc20).getInfo(),
          getClaimData(uri, from).catch(() => null)
        ])
      })
      .then(function ([token, claimData]) {
        if (!claimData) {
          throw new Error('No balance for this account')
        }
        const { amount, proof } = claimData
        debug('Claim data is (%s, %s, %j)', from, amount, proof)
        return Promise.all([
          token,
          amount,
          proof,
          merkleBox.isClaimable(claimGroupId, from, amount, proof)
        ])
      })
      .then(function ([token, amount, proof, isClaimable]) {
        debug('Claim is%s claimable', isClaimable ? '' : ' NOT')
        return {
          token,
          amount,
          proof,
          isClaimable
        }
      })
      .catch(tryParseEvmError)
  }

  const claim = (claimGroupId, amount, proof) =>
    merkleBox
      .getHolding(claimGroupId)
      .then(function ({ owner }) {
        if (owner === ZERO_ADDRESS) {
          throw new Error('Invalid claim group ID')
        }
        return merkleBox.isClaimable(claimGroupId, from, amount, proof)
      })
      .then(function (claimable) {
        if (!claimable) {
          throw new Error('Invalid claim or already claimed')
        }
        return merkleBox.claim(claimGroupId, from, amount, proof)
      })
      .catch(tryParseEvmError)

  return {
    getHolding,
    claim
  }
}

module.exports = createMerkleClaims
