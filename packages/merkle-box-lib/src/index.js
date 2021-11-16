'use strict'

const debug = require('debug')('merkle-box')

const abi = require('./abi.json')
const addresses = require('./addresses')
const util = require('./util')

const createMerkleBox = function (web3, address, options = {}) {
  const { from, gasFactor = 2 } = options

  debug('Creating a MerkleBox at %s for %s', address, from || 'read-only')

  const merkleBox = new web3.eth.Contract(abi, address)

  const safeGas = gas => Math.ceil(gas * gasFactor)

  const estimateGasAndSend = (method, transactionOptions) =>
    Promise.resolve(
      transactionOptions.gas ||
        method.estimateGas(transactionOptions).then(safeGas)
    ).then(gas => method.send({ ...transactionOptions, gas }))

  const getHolding = claimGroupId =>
    merkleBox.methods.holdings(claimGroupId).call()

  const isClaimable = (claimGroupId, account, amount, proof) =>
    merkleBox.methods.isClaimable(claimGroupId, account, amount, proof).call()

  const newClaimsGroup = (erc20, amount, root, unlock, memo, txOps) =>
    estimateGasAndSend(
      merkleBox.methods.newClaimsGroup(erc20, amount, root, unlock, memo),
      { from, ...txOps }
    )

  const claim = (claimGroupId, account, amount, proof, txOps) =>
    estimateGasAndSend(
      merkleBox.methods.claim(claimGroupId, account, amount, proof),
      { from, ...txOps }
    )

  return {
    getHolding,
    isClaimable,
    newClaimsGroup,
    claim
  }
}

createMerkleBox.addresses = addresses

createMerkleBox.util = util

module.exports = createMerkleBox
