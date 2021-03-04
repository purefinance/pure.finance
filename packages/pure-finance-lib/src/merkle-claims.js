'use strict'

const createErc20 = require('erc-20-lib')
const createMerkleBox = require('merkle-box-lib')
const fetch = require('node-fetch')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const parseMemoString = function (memo) {
  return memo
    .split(';')
    .map((pair) => pair.split('='))
    .map(([key, value]) => ({ [key.trim()]: value.trim() }))
    .reduce((all, val) => ({ ...all, ...val }), {})
}

const getClaimData = function (uri, account) {
  return (
    uri &&
    fetch(uri)
      .then((res) => res.json())
      .then((res) => res.find((recipient) => recipient.account === account))
  )
}

const createMerkleClaims = function (web3, options) {
  const { from } = options

  const merkleBoxAddress = createMerkleBox.addresses.mainnet
  const merkleBox = createMerkleBox(web3, merkleBoxAddress, options)

  const getHolding = function (claimGroupId) {
    return merkleBox
      .getHolding(claimGroupId)
      .then(function ({ erc20, memo, owner }) {
        if (owner === ZERO_ADDRESS) {
          throw new Error('Invalid claim group ID')
        }
        const uri = parseMemoString(memo).datasetUri
        if (!uri) {
          throw new Error('Could not get extra claim data location')
        }
        return Promise.all([
          createErc20({ web3, token: erc20 }).getInfo(),
          getClaimData(uri, from)
        ])
      })
      .then(function ([token, claimData]) {
        if (!claimData) {
          throw new Error('Could not get extra claim data')
        }
        const { amount, proof } = claimData
        return Promise.all([
          token,
          amount,
          proof,
          merkleBox.isClaimable(claimGroupId, from, amount, proof)
        ])
      })
      .then(function ([token, amount, proof, isClaimable]) {
        return {
          token,
          amount,
          proof,
          isClaimable
        }
      })
  }

  const claim = function (claimGroupId, amount, proof) {
    return merkleBox
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
  }

  return {
    getHolding,
    claim
  }
}

module.exports = createMerkleClaims
