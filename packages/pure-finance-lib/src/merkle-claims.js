'use strict'

const createErc20 = require('erc-20-lib')
const createMerkleBox = require('merkle-box-lib')
const fetch = require('node-fetch')

const merkleBoxAddress = '0x469c9fB59eBc19E141927c0308d98F2A9C400D2f' // mainnet

const parseMemoString = function (memo) {
  return memo
    .split(';')
    .map((pair) => pair.split('='))
    .map((key, value) => ({ [key]: value }))
    .reduce((all, val) => ({ ...all, val }), {})
}

const getClaimData = function (uri, account) {
  return uri
    ? fetch(uri)
        .then((res) => res.json())
        .then((res) => res[account])
    : Promise.resolve()
}

const createMerkleClaims = function (web3, options) {
  const { from } = options

  const merkleBox = createMerkleBox(web3, merkleBoxAddress, options)

  const getHolding = function (claimGroupId) {
    return merkleBox
      .getHolding(claimGroupId)
      .then(function (holding) {
        const erc20 = createErc20({ web3, token: holding.erc20 })
        return Promise.all([
          holding,
          erc20.getInfo(),
          getClaimData(parseMemoString(holding.memo).datasetUri, from)
        ])
      })
      .then(function ([holding, token, claimData]) {
        return Promise.all([
          holding,
          token,
          claimData || {},
          claimData
            ? merkleBox.isClaimable(
                claimGroupId,
                claimData.amount,
                claimData.proof
              )
            : false
        ])
      })
      .then(function ([holding, token, claimData, isClaimable]) {
        return {
          unlockTime: holding.withdrawUnlockTime,
          token,
          ...claimData,
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
