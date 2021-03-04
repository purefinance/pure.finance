'use strict'

const createErc20 = require('erc-20-lib')
const createMerkleBox = require('merkle-box-lib')
const fetch = require('node-fetch')

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
      .then(function ({ erc20, memo }) {
        return Promise.all([
          createErc20({ web3, token: erc20 }).getInfo(),
          getClaimData(parseMemoString(memo).datasetUri, from)
        ])
      })
      .then(function ([token, { amount, proof } = {}]) {
        return Promise.all([
          token,
          amount,
          proof,
          amount && proof
            ? merkleBox.isClaimable(claimGroupId, amount, proof)
            : false
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

  const claim = merkleBox.claim

  return {
    getHolding,
    claim
  }
}

module.exports = createMerkleClaims
